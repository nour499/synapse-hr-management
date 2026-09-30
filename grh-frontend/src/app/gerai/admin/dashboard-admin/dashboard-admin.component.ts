import {
  Component, OnInit, inject,
  ChangeDetectorRef, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule }   from '@angular/common';
import { Router }         from '@angular/router';
import { HttpClient }     from '@angular/common/http';
import { forkJoin }       from 'rxjs';
import { catchError, of } from 'rxjs';
import { AuthService }    from 'src/app/gerai/services/auth.service';

import { DemandeService } from 'src/app/gerai/services/demande.service';
import { AnalyticsDashboardService, DashboardSummary }
  from 'src/app/gerai/services/analytics-dashboard.service';

import { Demande, TypeDemande } from 'src/app/gerai/models/demande.model';
import { Projet, StatutProjet } from 'src/app/gerai/models/projet.model';
import { Employe }              from 'src/app/theme/shared/interfaces/employe';

// ── Support interfaces ────────────────────────────────
export interface DeptStat {
  nom: string; count: number; pct: number; color: string;
}
export interface TypeStat {
  label: string; count: number; pct: number; color: string;
}
export interface ActivityItem {
  texte: string; sous: string; icon: string;
  iconBg: string; date: string; statut: string;
}

const DEPT_COLORS: Record<string, string> = {
  'Informatique': '#3B82F6',
  'Data'        : '#8B5CF6',
  'Management'  : '#10B981',
  'Design'      : '#F59E0B',
  'Qualité'     : '#EF4444',
  'RH'          : '#EC4899',
  'Finance'     : '#06B6D4',
  'Marketing'   : '#F97316',
};

@Component({
  selector  : 'app-dashboard-admin',
  standalone: true,
  imports   : [CommonModule],
  templateUrl: './dashboard-admin.component.html',
  styleUrls  : ['./dashboard-admin.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardAdminComponent implements OnInit {

  private auth           = inject(AuthService);
  private router         = inject(Router);
  private cdr            = inject(ChangeDetectorRef);
  private http           = inject(HttpClient);
  private demandeService = inject(DemandeService);
  private analytics      = inject(AnalyticsDashboardService);

  /** KPIs agrégés par l'analytics-service (source de vérité). */
  summary: DashboardSummary | null = null;

  // ── Auth ─────────────────────────────────────────────
  get userName()  { return this.auth.fullName; }
  get userEmail() { return this.auth.email;    }
  readonly currentDate = new Date();

  // ── Raw data ─────────────────────────────────────────
  allEmployes : Employe[] = [];
  allDemandes : Demande[] = [];
  projets     : Projet[]  = [];

  // ── Computed (set in _compute) ────────────────────────
  deptStats     : DeptStat[]      = [];
  typeStats     : TypeStat[]      = [];
  projetsActifs : Projet[]        = [];
  timeline      : ActivityItem[]  = [];

  loading = true;

  private readonly _now = new Date();

  // ── Lifecycle ────────────────────────────────────────
  ngOnInit(): void {
    forkJoin({
      employes: this.http.get<Employe[]>('/api/employes').pipe(catchError(() => of([]))),
      demandes: this.demandeService.getDemandes().pipe(catchError(() => of([]))),
      projets : this.http.get<Projet[]>('/api/admin/projets').pipe(catchError(() => of([]))),
      dashboard: this.analytics.getDashboard().pipe(catchError(() => of(null)))
    }).subscribe(({ employes, demandes, projets, dashboard }) => {
      this.allEmployes = employes;
      this.allDemandes = demandes;
      this.projets     = projets;
      this.summary     = dashboard;
      this._compute();
      this.loading = false;
      this.cdr.markForCheck();
    });
  }

  // ── Compute ──────────────────────────────────────────
  private _compute(): void {
    // Department distribution
    const deptMap = new Map<string, number>();
    this.allEmployes.forEach(e => {
      const d = e.departement ?? 'Autre';
      deptMap.set(d, (deptMap.get(d) ?? 0) + 1);
    });
    const maxDept = Math.max(...Array.from(deptMap.values()), 1);
    this.deptStats = Array.from(deptMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([nom, count]) => ({
        nom, count,
        pct  : Math.round((count / maxDept) * 100),
        color: DEPT_COLORS[nom] ?? '#64748B'
      }));

    // Demande type distribution
    const typeCfg: { key: string; label: string; color: string }[] = [
      { key: 'CONGE',                  label: 'Congé annuel',   color: '#3B82F6' },
      { key: 'MALADIE',                label: 'Congé maladie',  color: '#EF4444' },
      { key: 'FORMATION',              label: 'Formation',      color: '#10B981' },
      { key: 'DOCUMENT_ADMINISTRATIF', label: 'Document',       color: '#8B5CF6' },
      { key: 'CREDIT',                 label: 'Crédit',         color: '#F59E0B' },
      { key: 'PRET',                   label: 'Crédit',         color: '#F59E0B' },
      { key: 'AUTRE',                  label: 'Autre',          color: '#64748B' },
    ];
    const total = this.allDemandes.length || 1;
    // Préférer la répartition par type calculée côté analytics (source de vérité).
    // Normalise les codes Oracle (PRET/DOCUMENT/AUTORISATION) vers les clés frontend.
    const TYPE_NORMALIZE: Record<string, string> = {
      PRET: 'CREDIT', DOCUMENT: 'DOCUMENT_ADMINISTRATIF', AUTORISATION: 'AUTRE'
    };
    if (this.summary?.demandesParType) {
      const normalized: Record<string, number> = {};
      for (const [k, v] of Object.entries(this.summary.demandesParType)) {
        const key = TYPE_NORMALIZE[k] ?? k;
        normalized[key] = (normalized[key] ?? 0) + (v ?? 0);
      }
      const sum = Object.values(normalized).reduce((a, b) => a + b, 0) || 1;
      this.typeStats = typeCfg
        .map(c => ({
          label: c.label,
          count: (normalized[c.key] ?? 0),
          pct  : 0, color: c.color
        }))
        .filter(x => x.count > 0)
        .map(x => ({ ...x, pct: Math.round((x.count / sum) * 100) }));
    } else {
      this.typeStats = typeCfg
        .map(c => ({
          label: c.label,
          count: this.allDemandes.filter(d => d.type === c.key).length,
          pct  : 0, color: c.color
        }))
        .filter(x => x.count > 0)
        .map(x => ({ ...x, pct: Math.round((x.count / total) * 100) }));
    }

    // Active projects
    this.projetsActifs = this.projets
      .filter(p => p.statut === StatutProjet.EN_COURS || p.statut === StatutProjet.EN_RETARD)
      .sort((a, b) => (a.progression ?? 0) - (b.progression ?? 0))
      .slice(0, 5);

    // Activity timeline from demandes
    this.timeline = [...this.allDemandes]
      .sort((a, b) => new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime())
      .slice(0, 7)
      .map(d => ({
        texte  : `${d.employePrenom} ${d.employeNom}`,
        sous   : `Demande ${this._typeLabel(d.type)}`,
        icon   : this._typeIcon(d.type),
        iconBg : this._typeColor(d.type),
        date   : d.dateCreation,
        statut : d.statut
      }));
  }

  // ── Computed getters ─────────────────────────────────

  get totalEmployes(): number { return this.allEmployes.length; }

  /** Total des demandes pour le donut (analytics si dispo). */
  get donutTotal(): number {
    return this.summary?.totalDemandes ?? this.allDemandes.length;
  }

  get membresActifs(): number { return this.allEmployes.filter(e => e.statut === 'ACTIF').length; }
  get membresConge(): number  { return this.allEmployes.filter(e => e.statut === 'CONGE').length; }

  get demandesEnAttente(): number {
    // Source de vérité : analytics (compte tous les types de demandes).
    if (this.summary) return this.summary.demandesEnAttente;
    return this.allDemandes.filter(d => d.statut === 'EN_ATTENTE').length;
  }

  get projetsEnCoursCount(): number {
    if (this.summary) return this.summary.projetsActifs;
    return this.projets.filter(p => p.statut === StatutProjet.EN_COURS).length;
  }

  get tauxPresence(): number {
    if (!this.allEmployes.length) return 0;
    return Math.round((this.membresActifs / this.allEmployes.length) * 100);
  }

  /** CSS for presence ring (conic-gradient). */
  get presenceRingCss(): string {
    const deg = this.tauxPresence * 3.6;
    const col = this.tauxPresence >= 80 ? '#10B981' : this.tauxPresence >= 60 ? '#F59E0B' : '#EF4444';
    return `conic-gradient(${col} 0deg ${deg}deg, #E2E8F0 ${deg}deg 360deg)`;
  }

  /** CSS for the demandes donut (conic-gradient). */
  get demandesDonutCss(): string {
    let cur = 0;
    const parts = this.typeStats.map(t => {
      const deg = t.pct * 3.6;
      const seg = `${t.color} ${cur}deg ${cur + deg}deg`;
      cur += deg;
      return seg;
    });
    if (cur < 360) parts.push(`#E2E8F0 ${cur}deg 360deg`);
    return `conic-gradient(${parts.join(', ')})`;
  }

  get statutLabel(): Record<string, string> {
    return {
      EN_ATTENTE: 'En attente', VALIDEE_CHEF: 'Validée Chef',
      VALIDEE_RH: 'Validée RH', REJETEE: 'Rejetée', VALIDEE: 'Validée'
    };
  }

  statutClass(s: string): string {
    const m: Record<string, string> = {
      EN_ATTENTE: 'st-attente', VALIDEE: 'st-validee',
      VALIDEE_CHEF: 'st-validee', VALIDEE_RH: 'st-validee', REJETEE: 'st-rejetee'
    };
    return m[s] ?? '';
  }

  calcProgression(p: Projet): number {
    if (p.totalTaches && p.totalTaches > 0) {
      return Math.round((p.tachesCompletees / p.totalTaches) * 100);
    }
    return p.progression ?? 0;
  }

  projetStatutLabel(s: StatutProjet): string {
    return { EN_COURS: 'En cours', EN_RETARD: 'En retard', TERMINE: 'Terminé', EN_PAUSE: 'En pause' }[s] ?? s;
  }

  projetStatutClass(s: StatutProjet): string {
    return { EN_COURS: 'ps-cours', EN_RETARD: 'ps-retard', TERMINE: 'ps-termine', EN_PAUSE: 'ps-pause' }[s] ?? '';
  }

  // ── Private helpers ───────────────────────────────────
  private _typeLabel(t: TypeDemande): string {
    return ({
      CONGE: 'congé', MALADIE: 'maladie', FORMATION: 'formation',
      DOCUMENT_ADMINISTRATIF: 'document', CREDIT: 'crédit', PRET: 'crédit', AUTRE: 'demande'
    } as any)[t] ?? 'demande';
  }

  private _typeIcon(t: TypeDemande): string {
    return ({
      CONGE: 'ti-beach', MALADIE: 'ti-stethoscope', FORMATION: 'ti-school',
      DOCUMENT_ADMINISTRATIF: 'ti-file-text', CREDIT: 'ti-coin', PRET: 'ti-coin', AUTRE: 'ti-dots'
    } as any)[t] ?? 'ti-clipboard';
  }

  private _typeColor(t: TypeDemande): string {
    return ({
      CONGE: '#3B82F6', MALADIE: '#EF4444', FORMATION: '#10B981',
      DOCUMENT_ADMINISTRATIF: '#8B5CF6', CREDIT: '#F59E0B', PRET: '#F59E0B', AUTRE: '#64748B'
    } as any)[t] ?? '#64748B';
  }

  deptColor(dept?: string): string {
    return DEPT_COLORS[dept ?? ''] ?? '#64748B';
  }

  // ── Navigation ───────────────────────────────────────
  go(path: string): void { this.router.navigate([path]); }

  logout(): void { this.auth.logout(); }
}
