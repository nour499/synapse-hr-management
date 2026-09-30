import {
  Component, OnInit, inject,
  ChangeDetectorRef, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { catchError, of, switchMap } from 'rxjs';
import { ProfilEmployeService } from 'src/app/gerai/services/employe-profile.service';
import { ToastService } from 'src/app/gerai/services/toast.service';

import {
  Evaluation, AutoEvaluation, EvaluationStatut,
  STATUT_EVAL_LABELS, STATUT_EVAL_COLORS,
  MENTION_LABELS, MENTION_COLORS,
  RECOMMANDATION_LABELS, RECOMMANDATION_COLORS,
  PERIODE_LABELS, calculerScore
} from 'src/app/gerai/models/evaluation.model';

@Component({
  selector   : 'app-evaluations-employe',
  standalone : true,
  imports    : [CommonModule, ReactiveFormsModule],
  templateUrl: './evaluations-employe.component.html',
  styleUrls  : ['./evaluations-employe.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EvaluationsEmployeComponent implements OnInit {

  private http          = inject(HttpClient);
  private fb            = inject(FormBuilder);
  private cdr           = inject(ChangeDetectorRef);
  private profilService = inject(ProfilEmployeService);
  private toast         = inject(ToastService);

  private employeId = 0;

  evaluations  : Evaluation[] = [];
  loading      = true;
  saving       = false;

  selected     : Evaluation | null = null;
  view         : 'liste' | 'form' | 'resultat' = 'liste';

  readonly statutLabels = STATUT_EVAL_LABELS;
  readonly statutColors = STATUT_EVAL_COLORS;
  readonly mentionLabels = MENTION_LABELS;
  readonly mentionColors = MENTION_COLORS;
  readonly recommandationLabels = RECOMMANDATION_LABELS;
  readonly periodeLabels = PERIODE_LABELS;

  readonly criteres = [
    { key: 'realisationObjectifs', label: 'Réalisation des objectifs' },
    { key: 'qualiteTravail',       label: 'Qualité du travail' },
    { key: 'respectDelais',        label: 'Respect des délais' },
    { key: 'communication',        label: 'Communication' },
    { key: 'autonomie',            label: 'Autonomie & initiative' },
    { key: 'collaboration',        label: 'Collaboration équipe' },
    { key: 'adaptabilite',         label: 'Adaptabilité' },
  ];

  form = this.fb.group({
    realisationObjectifs : [3, [Validators.required, Validators.min(1), Validators.max(5)]],
    qualiteTravail       : [3, [Validators.required, Validators.min(1), Validators.max(5)]],
    respectDelais        : [3, [Validators.required, Validators.min(1), Validators.max(5)]],
    communication        : [3, [Validators.required, Validators.min(1), Validators.max(5)]],
    autonomie            : [3, [Validators.required, Validators.min(1), Validators.max(5)]],
    collaboration        : [3, [Validators.required, Validators.min(1), Validators.max(5)]],
    adaptabilite         : [3, [Validators.required, Validators.min(1), Validators.max(5)]],
    formationsCompletees : [0],
    nouvellesCompetences : [''],
    reussitesPeriode     : ['', Validators.required],
    defisRencontres      : ['', Validators.required],
    objectifsSuivante    : ['', Validators.required],
    commentaireLibre     : [''],
  });

  ngOnInit(): void {
    this.profilService.getDbProfile()
      .pipe(switchMap(profile => {
        this.employeId = profile.dbId;
        return this.http.get<Evaluation[]>(`/api/evaluations?employeId=${this.employeId}`)
          .pipe(catchError(() => of([])));
      }))
      .subscribe(data => {
        this.evaluations = data;
        this.loading = false;
        this.cdr.markForCheck();
      });
  }

  load(): void {
    this.loading = true;
    this.http.get<Evaluation[]>(`/api/evaluations?employeId=${this.employeId}`)
      .pipe(catchError(() => of([])))
      .subscribe(data => {
        this.evaluations = data;
        this.loading = false;
        this.cdr.markForCheck();
      });
  }

  get active(): Evaluation[] {
    return this.evaluations.filter(e => !['CLOTUREE'].includes(e.statut));
  }
  get archived(): Evaluation[] {
    return this.evaluations.filter(e => e.statut === 'CLOTUREE');
  }

  canFillAutoEval(e: Evaluation): boolean {
    return e.statut === 'EN_ATTENTE';
  }

  openForm(e: Evaluation): void {
    this.selected = e;
    this.form.reset({
      realisationObjectifs: 3, qualiteTravail: 3, respectDelais: 3,
      communication: 3, autonomie: 3, collaboration: 3, adaptabilite: 3,
      formationsCompletees: e.formationsRealisees ?? 0,
      nouvellesCompetences: '', reussitesPeriode: '',
      defisRencontres: '', objectifsSuivante: '', commentaireLibre: ''
    });
    this.view = 'form';
    this.cdr.markForCheck();
  }

  openResult(e: Evaluation): void {
    this.selected = e;
    this.view = 'resultat';
    this.cdr.markForCheck();
  }

  back(): void { this.view = 'liste'; this.selected = null; this.cdr.markForCheck(); }

  submit(): void {
    if (!this.selected || this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    const payload = this.form.value as AutoEvaluation;

    this.http.put<Evaluation>(`/api/evaluations/${this.selected.id}/auto-evaluation`, payload)
      .pipe(catchError(() => of(null)))
      .subscribe(updated => {
        this.saving = false;
        if (updated) {
          const idx = this.evaluations.findIndex(e => e.id === updated.id);
          if (idx >= 0) this.evaluations[idx] = updated;
          this.view = 'liste';
          this.selected = null;
          this.toast.success('Auto-évaluation soumise avec succès.');
        } else {
          this.toast.error('Erreur lors de la soumission. Veuillez réessayer.');
        }
        this.cdr.markForCheck();
      });
  }

  setNote(field: string, val: number): void {
    this.form.patchValue({ [field]: val });
    this.cdr.markForCheck();
  }

  stars(n: number): number[] { return Array.from({ length: n }); }

  scoreBar(score: number, max: number): number {
    return Math.round((score / max) * 100);
  }

  getMentionColor(e: Evaluation): string {
    return e.mention ? this.mentionColors[e.mention] : '#64748B';
  }

  scoreFinal(e: Evaluation): number { return e.scoreFinal ?? 0; }

  getBreakdown(e: Evaluation): { scoreObjectifs: number; scoreCompetences: number; scoreFormations: number; scorePresence: number } {
    if (e.scoreObjectifs != null) {
      return {
        scoreObjectifs  : e.scoreObjectifs,
        scoreCompetences: e.scoreCompetences ?? 0,
        scoreFormations : e.scoreFormations  ?? 0,
        scorePresence   : e.scorePresence    ?? 0,
      };
    }
    const c = calculerScore(e);
    return {
      scoreObjectifs  : c.scoreObjectifs,
      scoreCompetences: c.scoreCompetences,
      scoreFormations : c.scoreFormations,
      scorePresence   : c.scorePresence,
    };
  }
}
