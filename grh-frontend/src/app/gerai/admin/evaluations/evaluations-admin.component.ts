import {
  Component, OnInit, inject,
  ChangeDetectorRef, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { catchError, of } from 'rxjs';
import { AuthService } from 'src/app/gerai/services/auth.service';
import { ToastService } from 'src/app/gerai/services/toast.service';

import {
  Evaluation, CampagneEvaluation, Periode, MentionPerformance,
  STATUT_EVAL_LABELS, STATUT_EVAL_COLORS,
  MENTION_LABELS, MENTION_COLORS,
  RECOMMANDATION_LABELS, RECOMMANDATION_COLORS,
  PERIODE_LABELS, calculerScore
} from 'src/app/gerai/models/evaluation.model';

interface DeptStat { dept: string; avg: number; count: number; }

@Component({
  selector   : 'app-evaluations-admin',
  standalone : true,
  imports    : [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './evaluations-admin.component.html',
  styleUrls  : ['./evaluations-admin.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EvaluationsAdminComponent implements OnInit {

  private http = inject(HttpClient);
  private auth  = inject(AuthService);
  private fb    = inject(FormBuilder);
  private toast = inject(ToastService);
  cdr  = inject(ChangeDetectorRef);

  campagnes   : CampagneEvaluation[] = [];
  evaluations : Evaluation[]         = [];
  loading     = true;
  saving      = false;

  activeTab   : 'campagnes' | 'evaluations' | 'analytics' = 'campagnes';
  selectedCampagne  : CampagneEvaluation | null = null;
  selectedEval      : Evaluation | null = null;
  showCampagneForm  = false;
  showRhModal       = false;
  filterStatut      = '';
  filterCampagne    = '';

  readonly statutLabels = STATUT_EVAL_LABELS;
  readonly statutColors = STATUT_EVAL_COLORS;
  readonly mentionLabels = MENTION_LABELS;
  readonly mentionColors = MENTION_COLORS;
  readonly recommandationLabels = RECOMMANDATION_LABELS;
  readonly recommandationColors = RECOMMANDATION_COLORS;
  readonly periodeLabels = PERIODE_LABELS;

  readonly periodes: Periode[] = ['T1','T2','T3','T4','ANNUEL'];

  campagneForm = this.fb.group({
    titre      : ['', Validators.required],
    periode    : ['ANNUEL' as Periode, Validators.required],
    annee      : [new Date().getFullYear(), Validators.required],
    dateDebut  : ['', Validators.required],
    dateFin    : ['', Validators.required],
    description: [''],
  });

  rhForm = this.fb.group({
    commentaireRh: [''],
    scoreAjuste  : [null as number | null],
  });

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    forkJoin({
      campagnes  : this.http.get<CampagneEvaluation[]>('/api/evaluations/campagnes').pipe(catchError(() => of([]))),
      evaluations: this.http.get<Evaluation[]>('/api/evaluations').pipe(catchError(() => of([])))
    }).subscribe(({ campagnes, evaluations }) => {
      this.campagnes   = campagnes;
      this.evaluations = evaluations;
      this.loading = false;
      this.cdr.detectChanges();
    });
  }

  // ── Campagnes ────────────────────────────────────────
  createCampagne(): void {
    if (this.campagneForm.invalid) { this.campagneForm.markAllAsTouched(); return; }
    this.saving = true;
    const v = this.campagneForm.value;
    this.http.post<CampagneEvaluation>('/api/evaluations/campagnes', { ...v, creePar: this.auth.fullName })
      .pipe(catchError(() => of(null)))
      .subscribe(c => {
        this.saving = false;
        if (c) {
          this.campagnes.push(c);
          this.showCampagneForm = false;
          this.campagneForm.reset({ periode: 'ANNUEL', annee: new Date().getFullYear() });
          this.toast.success('Campagne créée avec succès.');
        } else {
          this.toast.error('Erreur lors de la création de la campagne.');
        }
        this.cdr.detectChanges();
      });
  }

  activerCampagne(c: CampagneEvaluation): void {
    this.http.put<CampagneEvaluation>(`/api/evaluations/campagnes/${c.id}/activer`, {})
      .pipe(catchError(() => of(null)))
      .subscribe(updated => {
        if (updated) {
          this.replaceCampagne(updated);
          this.toast.success(`Campagne "${c.titre}" activée.`);
        } else {
          this.toast.error('Erreur lors de l\'activation.');
        }
        this.cdr.detectChanges();
      });
  }

  cloturerCampagne(c: CampagneEvaluation): void {
    if (!confirm(`Clôturer la campagne "${c.titre}" ?`)) return;
    this.http.put<CampagneEvaluation>(`/api/evaluations/campagnes/${c.id}/cloturer`, {})
      .pipe(catchError(() => of(null)))
      .subscribe(updated => {
        if (updated) {
          this.replaceCampagne(updated);
          this.toast.success(`Campagne "${c.titre}" clôturée.`);
        } else {
          this.toast.error('Erreur lors de la clôture.');
        }
        this.cdr.detectChanges();
      });
  }

  supprimerCampagne(c: CampagneEvaluation): void {
    if (!confirm(`Supprimer "${c.titre}" ?`)) return;
    this.http.delete(`/api/evaluations/campagnes/${c.id}`)
      .pipe(catchError(() => of(null)))
      .subscribe(() => {
        this.campagnes = this.campagnes.filter(x => x.id !== c.id);
        this.toast.success(`Campagne "${c.titre}" supprimée.`);
        this.cdr.detectChanges();
      });
  }

  private replaceCampagne(updated: CampagneEvaluation): void {
    const idx = this.campagnes.findIndex(c => c.id === updated.id);
    if (idx >= 0) this.campagnes[idx] = updated;
  }

  // ── Évaluations ──────────────────────────────────────
  get filteredEvals(): Evaluation[] {
    let list = this.evaluations;
    if (this.filterStatut)   list = list.filter(e => e.statut     === this.filterStatut);
    if (this.filterCampagne) list = list.filter(e => e.campagneId === Number(this.filterCampagne));
    return list;
  }

  openRhModal(e: Evaluation): void {
    this.selectedEval = e;
    this.rhForm.reset({ commentaireRh: '', scoreAjuste: null });
    this.showRhModal = true;
    this.cdr.markForCheck();
  }

  closeRhModal(): void { this.showRhModal = false; this.selectedEval = null; this.cdr.markForCheck(); }

  validerRh(): void {
    if (!this.selectedEval) return;
    this.saving = true;
    const v = this.rhForm.value;
    this.http.put<Evaluation>(`/api/evaluations/${this.selectedEval.id}/valider-rh`, {
      commentaireRh: v.commentaireRh || undefined,
      scoreAjuste  : v.scoreAjuste   || undefined,
      valideeParRh : 'Admin RH'
    }).pipe(catchError(() => of(null)))
      .subscribe(updated => {
        this.saving = false;
        if (updated) {
          const idx = this.evaluations.findIndex(e => e.id === updated.id);
          if (idx >= 0) this.evaluations[idx] = updated;
          this.toast.success('Évaluation validée par RH.');
        } else {
          this.toast.error('Erreur lors de la validation RH.');
        }
        this.closeRhModal();
        this.cdr.detectChanges();
      });
  }

  cloturerEval(e: Evaluation): void {
    this.http.put<Evaluation>(`/api/evaluations/${e.id}/cloturer`, {})
      .pipe(catchError(() => of(null)))
      .subscribe(updated => {
        if (updated) {
          const idx = this.evaluations.findIndex(x => x.id === updated.id);
          if (idx >= 0) this.evaluations[idx] = updated;
          this.toast.success('Évaluation clôturée.');
        } else {
          this.toast.error('Erreur lors de la clôture.');
        }
        this.cdr.detectChanges();
      });
  }

  openEvalDetail(e: Evaluation): void {
    this.selectedEval = e;
    this.cdr.markForCheck();
  }
  closeEvalDetail(): void { this.selectedEval = null; this.cdr.markForCheck(); }

  // ── Analytics ────────────────────────────────────────
  get evalAvecScore(): Evaluation[] {
    return this.evaluations.filter(e => e.scoreFinal !== undefined);
  }

  get avgScore(): number {
    if (!this.evalAvecScore.length) return 0;
    return Math.round(this.evalAvecScore.reduce((s, e) => s + (e.scoreFinal ?? 0), 0) / this.evalAvecScore.length);
  }

  get mentionDistrib(): { mention: MentionPerformance; count: number; pct: number; color: string }[] {
    const mentions: MentionPerformance[] = ['EXCELLENT','BIEN','SATISFAISANT','A_AMELIORER','INSUFFISANT'];
    const total = this.evalAvecScore.length || 1;
    return mentions.map(m => ({
      mention: m,
      count  : this.evalAvecScore.filter(e => e.mention === m).length,
      pct    : Math.round(this.evalAvecScore.filter(e => e.mention === m).length / total * 100),
      color  : MENTION_COLORS[m]
    })).filter(x => x.count > 0);
  }

  get deptStats(): DeptStat[] {
    const map = new Map<string, number[]>();
    this.evalAvecScore.forEach(e => {
      if (!map.has(e.departement)) map.set(e.departement, []);
      map.get(e.departement)!.push(e.scoreFinal ?? 0);
    });
    return Array.from(map.entries()).map(([dept, scores]) => ({
      dept,
      avg  : Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      count: scores.length
    })).sort((a, b) => b.avg - a.avg);
  }

  get recommandationDistrib(): { label: string; count: number; color: string }[] {
    const evals = this.evaluations.filter(e => e.recommandation);
    const map = new Map<string, number>();
    evals.forEach(e => {
      const k = e.recommandation!;
      map.set(k, (map.get(k) ?? 0) + 1);
    });
    return Array.from(map.entries()).map(([k, count]) => ({
      label: RECOMMANDATION_LABELS[k as keyof typeof RECOMMANDATION_LABELS],
      count,
      color: RECOMMANDATION_COLORS[k as keyof typeof RECOMMANDATION_COLORS]
    })).sort((a, b) => b.count - a.count);
  }

  campagneEvalsCount(campagneId: number): number {
    return this.evaluations.filter(e => e.campagneId === campagneId).length;
  }
  campagneCompletedCount(campagneId: number): number {
    return this.evaluations.filter(e => e.campagneId === campagneId && ['VALIDEE_RH','CLOTUREE'].includes(e.statut)).length;
  }

  canValiderRh(e: Evaluation): boolean  { return e.statut === 'VALIDEE_CHEF'; }
  canCloturer(e: Evaluation): boolean   { return e.statut === 'VALIDEE_RH'; }

  stars(n: number): number[] { return Array.from({ length: Math.round(n) }); }
  empty(n: number): number[] { return Array.from({ length: 5 - Math.round(n) }); }
  setTab(t: 'campagnes' | 'evaluations' | 'analytics'): void { this.activeTab = t; this.cdr.markForCheck(); }
}
