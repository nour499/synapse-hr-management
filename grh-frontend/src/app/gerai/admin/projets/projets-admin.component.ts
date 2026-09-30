import {
  Component, OnInit, inject,
  ChangeDetectorRef, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { catchError, of } from 'rxjs';

import { Projet, StatutProjet } from 'src/app/gerai/models/projet.model';
import { Employe } from 'src/app/theme/shared/interfaces/employe';

export interface WorkloadEntry {
  employe : Employe;
  projets : Projet[];
  overload: boolean;   // assigned to 2+ active projects
}

const STATUT_LABELS: Record<StatutProjet, string> = {
  EN_COURS  : 'En cours',
  EN_PAUSE  : 'En attente',
  TERMINE   : 'Terminé',
  EN_RETARD : 'En retard',
};

const STATUT_COLORS: Record<StatutProjet, string> = {
  EN_COURS  : '#6366F1',
  EN_PAUSE  : '#F59E0B',
  TERMINE   : '#10B981',
  EN_RETARD : '#EF4444',
};

@Component({
  selector   : 'app-projets-admin',
  standalone : true,
  imports    : [CommonModule],
  templateUrl: './projets-admin.component.html',
  styleUrls  : ['./projets-admin.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjetsAdminComponent implements OnInit {

  private http   = inject(HttpClient);
  private router = inject(Router);
  private cdr    = inject(ChangeDetectorRef);

  projets   : Projet[]  = [];
  employes  : Employe[] = [];
  loading   = true;

  activeTab   : 'projets' | 'workload' = 'projets';
  filterStatut: string = '';
  searchTerm  : string = '';

  readonly statutLabels = STATUT_LABELS;
  readonly statutColors = STATUT_COLORS;
  readonly statutProjet = StatutProjet;

  readonly filterOptions = [
    { value: '',           label: 'Tous les statuts' },
    { value: 'EN_COURS',  label: 'En cours'  },
    { value: 'EN_PAUSE',  label: 'En attente' },
    { value: 'EN_RETARD', label: 'En retard'  },
    { value: 'TERMINE',   label: 'Terminés'   },
  ];

  ngOnInit(): void {
    forkJoin({
      projets : this.http.get<Projet[]>('/api/admin/projets').pipe(catchError(() => of([]))),
      employes: this.http.get<Employe[]>('/api/employes').pipe(catchError(() => of([])))
    }).subscribe(({ projets, employes }) => {
      this.projets  = projets;
      this.employes = employes;
      this.loading  = false;
      this.cdr.markForCheck();
    });
  }

  // ── Computed ─────────────────────────────────────────
  get filtered(): Projet[] {
    let list = this.projets;
    if (this.filterStatut) list = list.filter(p => p.statut === this.filterStatut);
    if (this.searchTerm) {
      const q = this.searchTerm.toLowerCase();
      list = list.filter(p =>
        p.nom.toLowerCase().includes(q) ||
        (p.description ?? '').toLowerCase().includes(q) ||
        (p.chefProjet ?? '').toLowerCase().includes(q)
      );
    }
    return list;
  }

  calcProgression(p: Projet): number {
    if (!p.totalTaches || p.totalTaches === 0) return 0;
    return Math.round((p.tachesCompletees / p.totalTaches) * 100);
  }

  get stats() {
    return {
      total    : this.projets.length,
      enCours  : this.projets.filter(p => p.statut === StatutProjet.EN_COURS).length,
      enRetard : this.projets.filter(p => p.statut === StatutProjet.EN_RETARD).length,
      termines : this.projets.filter(p => p.statut === StatutProjet.TERMINE).length,
      avgProg  : this.projets.length
        ? Math.round(this.projets.reduce((s, p) => s + this.calcProgression(p), 0) / this.projets.length)
        : 0
    };
  }

  // Workload: map each employee to the active projects they're in
  get workload(): WorkloadEntry[] {
    const activeStatuts: StatutProjet[] = [StatutProjet.EN_COURS, StatutProjet.EN_RETARD, StatutProjet.EN_PAUSE];
    const activeProjets = this.projets.filter(p => activeStatuts.includes(p.statut));

    return this.employes
      .map(emp => {
        const empProjets = activeProjets.filter(p =>
          (p.membres ?? []).some((m: any) => m.id === emp.id) ||
          (p.equipe  ?? []).some((m: any) => m.id === emp.id)
        );
        return {
          employe : emp,
          projets : empProjets,
          overload: empProjets.filter(p => p.statut === StatutProjet.EN_COURS || p.statut === StatutProjet.EN_RETARD).length >= 2
        };
      })
      .filter(e => e.projets.length > 0)
      .sort((a, b) => b.projets.length - a.projets.length);
  }

  get overloadedCount(): number {
    return this.workload.filter(w => w.overload).length;
  }

  // ── Helpers ──────────────────────────────────────────
  progressClass(p: number): string {
    if (p >= 80) return 'prog-green';
    if (p >= 50) return 'prog-blue';
    if (p >= 25) return 'prog-yellow';
    return 'prog-red';
  }

  initiales(e: Employe): string {
    return ((e.prenom?.[0] ?? '') + (e.nom?.[0] ?? '')).toUpperCase();
  }

  teamSize(p: Projet): number {
    return p.equipe?.length ?? p.membres?.length ?? 0;
  }

  onSearch(v: string)  : void { this.searchTerm   = v; this.cdr.markForCheck(); }
  onFilter(v: string)  : void { this.filterStatut = v; this.cdr.markForCheck(); }
  setTab(t: 'projets' | 'workload'): void { this.activeTab = t; this.cdr.markForCheck(); }
  goChef(): void { this.router.navigate(['/chef/projets']); }
}
