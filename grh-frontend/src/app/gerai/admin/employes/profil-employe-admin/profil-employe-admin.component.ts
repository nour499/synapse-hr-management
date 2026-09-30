import {
  Component, OnInit, inject,
  ChangeDetectorRef, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { catchError, of } from 'rxjs';

import { Employe } from 'src/app/theme/shared/interfaces/employe';
import { StatistiquesEmploye } from 'src/app/theme/shared/interfaces/statistiques-employe';
import { Actif, ALL_TYPE_LABELS, ALL_TYPE_ICONS, StatutActif } from 'src/app/gerai/models/actif.model';
import { KeycloakAccessComponent } from '../keycloak-access/keycloak-access.component';

const DEPT_COLORS: Record<string, string> = {
  'Informatique': '#3B82F6', 'Data': '#8B5CF6', 'Management': '#10B981',
  'Design': '#F59E0B', 'Qualité': '#EF4444', 'RH': '#EC4899',
  'Finance': '#06B6D4', 'Marketing': '#F97316',
};

@Component({
  selector   : 'app-profil-employe-admin',
  standalone : true,
  imports    : [CommonModule, KeycloakAccessComponent],
  templateUrl: './profil-employe-admin.component.html',
  styleUrls  : ['./profil-employe-admin.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfilEmployeAdminComponent implements OnInit {

  private router = inject(Router);
  private route  = inject(ActivatedRoute);
  private http   = inject(HttpClient);
  private cdr    = inject(ChangeDetectorRef);

  employe  : Employe | null = null;
  stats    : StatistiquesEmploye | null = null;
  actifs   : Actif[] = [];
  loading  = true;
  notFound = false;

  activeTab: 'info' | 'actifs' | 'acces' = 'info';

  readonly typeLabels = ALL_TYPE_LABELS;
  readonly typeIcons  = ALL_TYPE_ICONS;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    forkJoin({
      employe: this.http.get<Employe>(`/api/employes/${id}`).pipe(catchError(() => of(null))),
      stats  : this.http.get<StatistiquesEmploye>(`/api/employes/${id}/stats`).pipe(catchError(() => of(null))),
      actifs : this.http.get<Actif[]>(`/api/actifs?employeId=${id}`).pipe(catchError(() => of([])))
    }).subscribe(({ employe, stats, actifs }) => {
      if (!employe) { this.notFound = true; }
      else { this.employe = employe; this.stats = stats; this.actifs = actifs ?? []; }
      this.loading = false;
      this.cdr.markForCheck();
    });
  }

  // ── Tab ──────────────────────────────────────────────
  setTab(t: 'info' | 'actifs' | 'acces'): void { this.activeTab = t; this.cdr.markForCheck(); }

  get actifsTangibles(): Actif[]  { return this.actifs.filter(a => a.categorie === 'TANGIBLE');  }
  get actifsNumeriques(): Actif[] { return this.actifs.filter(a => a.categorie === 'NUMERIQUE'); }

  // ── Helpers ──────────────────────────────────────────
  initiales(): string {
    if (!this.employe) return '';
    return ((this.employe.prenom[0] ?? '') + (this.employe.nom[0] ?? '')).toUpperCase();
  }

  deptColor(): string {
    return DEPT_COLORS[this.employe?.departement ?? ''] ?? '#64748B';
  }

  get anciennete(): string {
    if (!this.employe?.dateEmbauche) return '—';
    const d     = new Date(this.employe.dateEmbauche);
    const now   = new Date();
    const total = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
    if (total < 12) return `${total} mois`;
    return `${Math.floor(total / 12)} an${Math.floor(total / 12) > 1 ? 's' : ''}`;
  }

  get presenceRingCss(): string {
    const val = this.stats?.tauxPresence ?? 0;
    const deg = val * 3.6;
    const col = val >= 90 ? '#10B981' : val >= 75 ? '#F59E0B' : '#EF4444';
    return `conic-gradient(${col} 0deg ${deg}deg, #E2E8F0 ${deg}deg 360deg)`;
  }

  statutActifLabel(s: StatutActif): string {
    return ({ ATTRIBUE: 'Attribué', DISPONIBLE: 'Disponible', EN_MAINTENANCE: 'Maintenance', HORS_SERVICE: 'Hors service' })[s] ?? s;
  }

  isExpired(a: Actif): boolean {
    return !!a.dateExpiration && new Date(a.dateExpiration) < new Date();
  }

  isExpiringSoon(a: Actif): boolean {
    if (!a.dateExpiration) return false;
    const days = (new Date(a.dateExpiration).getTime() - Date.now()) / 86_400_000;
    return days >= 0 && days <= 30;
  }

  goBack():      void { this.router.navigate(['/admin/employes']); }
  editEmploye(): void { this.router.navigate(['/admin/employes', this.employe!.id, 'modifier']); }
  addActif():    void { this.router.navigate(['/admin/actifs/ajouter']); }
}
