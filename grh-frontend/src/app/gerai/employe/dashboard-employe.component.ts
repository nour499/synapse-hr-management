import { Component, OnInit, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { catchError, of } from 'rxjs';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { AuthService } from '../services/auth.service';
import { ProfilEmployeService } from '../services/employe-profile.service';
import { DemandeService } from '../services/demande.service';
import { TacheService } from '../services/tache-employe.service';
import { ProjetService } from '../services/projet-employe.service';
import { Demande } from '../models/demande.model';
import { TacheKanban } from '../models/tache.model';
import { Projet, StatutProjet } from '../models/projet.model';
import { StatistiquesEmploye } from '../models/employe-profile.model';


@Component({
  selector: 'app-dashboard-employe',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './dashboard-employe.component.html',
  styleUrls: ['./dashboard-employe.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardEmployeComponent implements OnInit {

  private auth           = inject(AuthService);
  private router         = inject(Router);
  private cdr            = inject(ChangeDetectorRef);
  private profilService  = inject(ProfilEmployeService);
  private demandeService = inject(DemandeService);
  private tacheService   = inject(TacheService);
  private projetService  = inject(ProjetService);

  // ── Auth ──────────────────────────────────────────────
  get userName()  { return this.auth.fullName; }
  get userEmail() { return this.auth.email;    }

  // ── KPIs ─────────────────────────────────────────────
  congesRestants   = 0;
  congesTotal      = 0;
  tachesActives    = 0;
  tauxPresence     = 0;

  // ── Demandes stats ────────────────────────────────────
  demandesEnAttente= 0;
  demandesValidees = 0;
  demandesRefusees = 0;

  // ── Formation stats (from statistiques) ──────────────
  formationsSuivies = 0;
  formationsTotal   = 0;

  // ── Task stats (computed from live data) ──────────────
  tachesTermineesCount = 0;
  tachesEnRetardCount  = 0;

  // ── Recent lists & project data ──────────────────────
  demandesRecentes    : Demande[]     = [];
  tachesRecentes      : TacheKanban[] = [];
  projetsEnCours      : Projet[]      = [];   // for circular chart (all EN_COURS)
  totalProjetsAssignes = 0;                   // KPI: all projects assigned

  readonly currentYear = new Date().getFullYear();

  loading = true;
  error   = false;

  ngOnInit(): void {
    this.loadData();
  }

  // ── Backend data ────────────────────────���────────────
  private loadData(): void {
    const emptyStats = {
      tauxPresence: 0, objectifsAtteints: 0, formationsSuivies: 0, formationsTotal: 0,
      tachesCompletes: 0, tachesTotal: 0, congesRestants: 0, congesTotal: 30
    };
    forkJoin({
      stats      : this.profilService.getStatistiques().pipe(catchError(() => of(emptyStats))),
      demandes   : this.demandeService.getDemandes().pipe(catchError(() => of([]))),
      taches  : this.tacheService.getTaches().pipe(catchError(() => of([]))),
      projets : this.projetService.getProjets().pipe(catchError(() => of([])))
    }).subscribe({
      next: ({ stats, demandes, taches, projets }) => {
        this.applyStats(stats);
        this.applyDemandes(demandes);
        this.applyTaches(taches);
        this.applyProjets(projets);
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.error   = true;
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  private applyStats(stats: StatistiquesEmploye): void {
    this.congesRestants    = stats.congesRestants;
    this.congesTotal       = stats.congesTotal ?? 30;
    this.tauxPresence      = stats.tauxPresence;
    this.tachesActives     = stats.tachesTotal - stats.tachesCompletes;
    this.formationsSuivies = stats.formationsSuivies ?? 0;
    this.formationsTotal   = stats.formationsTotal   ?? 0;
  }

  private applyDemandes(demandes: Demande[]): void {
    this.demandesEnAttente = demandes.filter(d => d.statut === 'EN_ATTENTE').length;
    this.demandesValidees  = demandes.filter(d => ['VALIDEE', 'VALIDEE_CHEF', 'VALIDEE_RH'].includes(d.statut)).length;
    this.demandesRefusees  = demandes.filter(d => d.statut === 'REJETEE').length;
    // Most recent 3
    this.demandesRecentes = [...demandes]
      .sort((a, b) => new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime())
      .slice(0, 3);
  }

  private applyTaches(taches: TacheKanban[]): void {
    const now = new Date();
    this.tachesTermineesCount = taches.filter(t => t.statut === 'TERMINEE').length;
    this.tachesEnRetardCount  = taches.filter(t => t.statut !== 'TERMINEE' && new Date(t.echeance) < now).length;
    this.tachesActives        = taches.filter(t => t.statut !== 'TERMINEE').length;
    this.tachesRecentes = taches
      .filter(t => t.statut !== 'TERMINEE')
      .sort((a, b) => new Date(a.echeance).getTime() - new Date(b.echeance).getTime())
      .slice(0, 3);
  }

  private applyProjets(projets: Projet[]): void {
    this.totalProjetsAssignes = projets.length;
    this.projetsEnCours = projets.filter(p => p.statut === StatutProjet.EN_COURS);
  }

  // ── Computed getters ─────────────────────────────────
  get tachesTotales(): number      { return this.tachesActives + this.tachesTermineesCount; }
  get formationsPct(): number      { return this.formationsTotal > 0 ? Math.round((this.formationsSuivies / this.formationsTotal) * 100) : 0; }
  get tauxCompletionTaches(): number { return this.tachesTotales > 0 ? Math.round((this.tachesTermineesCount / this.tachesTotales) * 100) : 0; }

  get congesPris(): number { return this.congesTotal - this.congesRestants; }

  get congesPct(): number {
    return this.congesTotal > 0 ? Math.round((this.congesRestants / this.congesTotal) * 100) : 0;
  }

  get prochaineTache(): TacheKanban | null {
    return this.tachesRecentes[0] ?? null;
  }

  get joursAvantEcheance(): number | null {
    const t = this.prochaineTache;
    if (!t) return null;
    const diff = new Date(t.echeance).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  // ── Template helpers ──────────────────────────────────
  statutColor(statut: string): string {
    const map: Record<string, string> = {
      'EN_ATTENTE': 'text-warning', 'VALIDEE_CHEF': 'text-success',
      'VALIDEE_RH': 'text-success',  'VALIDEE': 'text-success',
      'REJETEE': 'text-danger'
    };
    return map[statut] ?? 'text-secondary';
  }

  statutBg(statut: string): string {
    const map: Record<string, string> = {
      'EN_ATTENTE': 'bg-light-warning', 'VALIDEE_CHEF': 'bg-light-success',
      'VALIDEE_RH': 'bg-light-success',  'VALIDEE': 'bg-light-success',
      'REJETEE': 'bg-light-danger'
    };
    return map[statut] ?? 'bg-light';
  }

  statutLabel(statut: string): string {
    const map: Record<string, string> = {
      'EN_ATTENTE': 'En attente', 'VALIDEE_CHEF': 'Validée chef',
      'VALIDEE_RH': 'Validée RH', 'VALIDEE': 'Validée',
      'REJETEE': 'Rejetée'
    };
    return map[statut] ?? statut;
  }

  typeIcon(type: string): string {
    const map: Record<string, string> = {
      'CONGE': 'ti-beach', 'FORMATION': 'ti-school',
      'DOCUMENT_ADMINISTRATIF': 'ti-file-text',
      'PRET': 'ti-coin', 'AUTRE': 'ti-dots'
    };
    return map[type] ?? 'ti-file';
  }

  getRoleLabel(role: string): string {
    const map: Record<string, string> = {
      employe: 'Employé', manager: 'Manager',
      rh: 'Ressources Humaines', admin: 'Administrateur', chef: 'Chef de Projet'
    };
    return map[role.toLowerCase()] ?? role;
  }

  isLate(echeance: string): boolean {
    return new Date(echeance) < new Date();
  }

  // ── Navigation ─────────────────��──────────────────────
  naviguerVers(route: string): void { this.router.navigate([route]); }
  voirDemande(id: number): void     { this.router.navigate(['/employe/demandes', id]); }

  logout(): void { this.auth.logout(); }
}
