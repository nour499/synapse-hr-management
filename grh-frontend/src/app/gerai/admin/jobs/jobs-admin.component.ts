import {
  Component, OnInit, inject,
  ChangeDetectorRef, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';

import {
  Job, JobStatus, JobType, JobRole,
  JOB_STATUS_LABELS, JOB_TYPE_LABELS, JOB_ROLE_LABELS
} from 'src/app/gerai/models/job.model';

interface KillerQuestion   { id: number; jobId: number; question: string; expectedAnswer: string; displayOrder: number; }
interface ScreeningQuestion { id: number; jobId: number; question: string; type: string; options: string[]; correctAnswer: string; weight: number; displayOrder: number; }
import { ConfirmModalComponent } from 'src/app/theme/shared/components/confirm-modal/confirm-modal.component';
import { PaginatorComponent } from 'src/app/theme/shared/components/paginator/paginator.component';
import { SkeletonRowsComponent } from 'src/app/theme/shared/components/skeleton-rows/skeleton-rows.component';

@Component({
  selector   : 'app-jobs-admin',
  standalone : true,
  imports    : [CommonModule, ReactiveFormsModule, FormsModule, ConfirmModalComponent, PaginatorComponent, SkeletonRowsComponent],
  templateUrl: './jobs-admin.component.html',
  styleUrls  : ['./jobs-admin.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class JobsAdminComponent implements OnInit {

  private http = inject(HttpClient);
  private fb   = inject(FormBuilder);
  private cdr  = inject(ChangeDetectorRef);

  jobs     : Job[] = [];
  loading   = true;
  saving    = false;
  errorMsg      : string | null = null;
  generatingDesc = false;

  search       = '';
  filterStatut : JobStatus | '' = '';
  filterType   : JobType   | '' = '';

  editItem    : Job | null = null;
  deleteTarget: Job | null = null;
  isCreating   = false;

  // ── Screening questions panel ─────────────────────
  questionsJob      : Job | null = null;
  killerQuestions   : KillerQuestion[]    = [];
  screeningQuestions: ScreeningQuestion[] = [];
  loadingQuestions  = false;
  savingQuestion    = false;
  questionError     : string | null = null;

  newKiller   = { question: '', expectedAnswer: 'OUI' as 'OUI' | 'NON' };
  newScreening = { question: '', type: 'YES_NO', options: '', correctAnswer: '', weight: 5 };

  readonly sqTypes = [
    { value: 'YES_NO',        label: 'Oui / Non' },
    { value: 'SINGLE_CHOICE', label: 'Choix unique' },
    { value: 'NUMBER_SCALE',  label: 'Nombre / Échelle' }
  ];

  readonly statusLabels = JOB_STATUS_LABELS;
  readonly typeLabels   = JOB_TYPE_LABELS;
  readonly roleLabels   = JOB_ROLE_LABELS;

  readonly allStatuts : JobStatus[] = ['OUVERT','EN_COURS','FERME','EN_ATTENTE'];
  readonly allTypes   : JobType[]   = ['CDI','CDD','STAGE','FREELANCE','ALTERNANCE'];
  readonly allRoles   : JobRole[]   = ['JUNIOR','SENIOR','LEAD','MANAGER','DIRECTEUR','STAGIAIRE'];

  form = this.fb.group({
    titre          : ['', [Validators.required, Validators.minLength(3)]],
    statut         : ['OUVERT' as JobStatus, Validators.required],
    datePublication: ['', Validators.required],
    role           : ['JUNIOR' as JobRole, Validators.required],
    postes         : [1, [Validators.required, Validators.min(1)]],
    departement    : ['', Validators.required],
    typeContrat    : ['CDI' as JobType, Validators.required],
    lieu           : [''],
    description    : ['']
  });

  ngOnInit(): void {
    this.http.get<Job[]>('/api/admin/jobs')
      .pipe(catchError(() => of([])))
      .subscribe(list => {
        this.jobs    = list;
        this.loading = false;
        this.cdr.markForCheck();
      });
  }

  // ── Computed ─────────────────────────────────────
  page     = 1;
  readonly pageSize = 10;

  get paginated(): Job[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filtered.slice(start, start + this.pageSize);
  }

  get filtered(): Job[] {
    const q = this.search.toLowerCase().trim();
    return this.jobs
      .filter(j => {
        const matchQ = !q
          || j.titre.toLowerCase().includes(q)
          || j.departement.toLowerCase().includes(q)
          || (j.lieu ?? '').toLowerCase().includes(q);
        const matchS = !this.filterStatut || j.statut === this.filterStatut;
        const matchT = !this.filterType   || j.typeContrat === this.filterType;
        return matchQ && matchS && matchT;
      })
      .sort((a, b) => b.datePublication.localeCompare(a.datePublication));
  }

  get kpi() {
    return {
      total    : this.jobs.length,
      ouverts  : this.jobs.filter(j => j.statut === 'OUVERT').length,
      enCours  : this.jobs.filter(j => j.statut === 'EN_COURS').length,
      fermes   : this.jobs.filter(j => j.statut === 'FERME').length,
      postes   : this.jobs.reduce((s, j) => s + j.postes, 0)
    };
  }

  // ── Create ───────────────────────────────────────
  openCreate(): void {
    this.isCreating = true;
    this.editItem   = null;
    this.errorMsg   = null;
    this.form.reset({
      titre: '', statut: 'OUVERT',
      datePublication: new Date().toISOString().split('T')[0],
      role: 'JUNIOR', postes: 1,
      departement: '', typeContrat: 'CDI', lieu: '', description: ''
    });
    this.cdr.markForCheck();
  }

  // ── Edit ─────────────────────────────────────────
  openEdit(j: Job): void {
    this.editItem   = j;
    this.isCreating = false;
    this.errorMsg   = null;
    this.form.patchValue({
      titre          : j.titre,
      statut         : j.statut,
      datePublication: j.datePublication,
      role           : j.role,
      postes         : j.postes,
      departement    : j.departement,
      typeContrat    : j.typeContrat,
      lieu           : j.lieu ?? '',
      description    : j.description ?? ''
    });
    this.cdr.markForCheck();
  }

  closeForm(): void { this.editItem = null; this.isCreating = false; this.cdr.markForCheck(); }

  submitForm(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true; this.errorMsg = null;

    const v = this.form.value;
    const payload: Partial<Job> = {
      titre          : v.titre!,
      statut         : v.statut as JobStatus,
      datePublication: v.datePublication!,
      role           : v.role as JobRole,
      postes         : Number(v.postes),
      departement    : v.departement!,
      typeContrat    : v.typeContrat as JobType,
      lieu           : v.lieu || undefined,
      description    : v.description || undefined
    };

    if (this.isCreating) {
      this.http.post<Job>('/api/admin/jobs', payload)
        .pipe(catchError(() => of(null)))
        .subscribe(r => {
          if (!r) { this.errorMsg = 'Erreur lors de la création.'; this.saving = false; this.cdr.markForCheck(); return; }
          this.jobs = [r, ...this.jobs];
          this.saving = false; this.isCreating = false; this.cdr.markForCheck();
        });
    } else {
      this.http.put<Job>(`/api/admin/jobs/${this.editItem!.id}`, payload)
        .pipe(catchError(() => of(null)))
        .subscribe(r => {
          if (!r) { this.errorMsg = 'Erreur lors de la sauvegarde.'; this.saving = false; this.cdr.markForCheck(); return; }
          const idx = this.jobs.findIndex(j => j.id === this.editItem!.id);
          if (idx !== -1) this.jobs = [...this.jobs.slice(0, idx), r, ...this.jobs.slice(idx + 1)];
          this.saving = false; this.editItem = null; this.cdr.markForCheck();
        });
    }
  }

  // ── Delete ───────────────────────────────────────
  askDelete(j: Job): void { this.deleteTarget = j; this.cdr.markForCheck(); }
  cancelDelete(): void    { this.deleteTarget = null; this.cdr.markForCheck(); }

  confirmDelete(): void {
    if (!this.deleteTarget) return;
    const id = this.deleteTarget.id;
    this.deleteTarget = null;
    this.http.delete(`/api/admin/jobs/${id}`)
      .pipe(catchError(() => of(null)))
      .subscribe(() => { this.jobs = this.jobs.filter(j => j.id !== id); this.cdr.markForCheck(); });
  }

  generateDescription(): void {
    const v = this.form.value;
    if (!v.titre) { this.errorMsg = 'Saisissez le titre du poste avant de générer.'; return; }
    this.generatingDesc = true;
    this.errorMsg = null;
    this.http.post<{ description: string }>('/api/admin/jobs/ai-description', {
      titre:       v.titre,
      departement: v.departement || '',
      role:        v.role || 'JUNIOR',
      typeContrat: v.typeContrat || 'CDI'
    }).pipe(catchError(() => of(null)))
      .subscribe(res => {
        this.generatingDesc = false;
        if (res?.description) this.form.patchValue({ description: res.description });
        else this.errorMsg = 'Erreur lors de la génération. Vérifiez la configuration Groq.';
        this.cdr.markForCheck();
      });
  }

  get deleteMessage(): string {
    return this.deleteTarget
      ? `L'offre "${this.deleteTarget.titre}" sera supprimée définitivement. Cette action est irréversible.`
      : '';
  }

  // ── Questions panel ──────────────────────────────
  openQuestions(j: Job): void {
    this.questionsJob   = j;
    this.questionError  = null;
    this.loadingQuestions = true;
    this.killerQuestions   = [];
    this.screeningQuestions = [];
    this.resetNewKiller();
    this.resetNewScreening();
    this.cdr.markForCheck();

    this.http.get<{ killerQuestions: KillerQuestion[]; screeningQuestions: ScreeningQuestion[] }>(
      `/api/admin/jobs/${j.id}/screening`
    ).pipe(catchError(() => of({ killerQuestions: [], screeningQuestions: [] })))
    .subscribe(data => {
      this.killerQuestions    = data.killerQuestions;
      this.screeningQuestions = data.screeningQuestions;
      this.loadingQuestions   = false;
      this.cdr.markForCheck();
    });
  }

  closeQuestions(): void { this.questionsJob = null; this.cdr.markForCheck(); }

  addKillerQuestion(): void {
    if (!this.newKiller.question.trim()) { this.questionError = 'La question est requise.'; this.cdr.markForCheck(); return; }
    this.savingQuestion = true; this.questionError = null;
    const payload = { question: this.newKiller.question.trim(), expectedAnswer: this.newKiller.expectedAnswer };
    this.http.post<KillerQuestion>(`/api/admin/jobs/${this.questionsJob!.id}/killer-questions`, payload)
      .pipe(catchError(() => of(null)))
      .subscribe(r => {
        this.savingQuestion = false;
        if (!r) { this.questionError = 'Erreur lors de l\'ajout.'; this.cdr.markForCheck(); return; }
        this.killerQuestions = [...this.killerQuestions, r];
        this.resetNewKiller();
        this.cdr.markForCheck();
      });
  }

  deleteKillerQuestion(id: number): void {
    this.http.delete(`/api/admin/jobs/${this.questionsJob!.id}/killer-questions/${id}`)
      .pipe(catchError(() => of(null)))
      .subscribe(() => { this.killerQuestions = this.killerQuestions.filter(q => q.id !== id); this.cdr.markForCheck(); });
  }

  addScreeningQuestion(): void {
    if (!this.newScreening.question.trim()) { this.questionError = 'La question est requise.'; this.cdr.markForCheck(); return; }
    if (this.newScreening.type === 'SINGLE_CHOICE' && !this.newScreening.options.trim()) {
      this.questionError = 'Ajoutez au moins une option.'; this.cdr.markForCheck(); return;
    }
    this.savingQuestion = true; this.questionError = null;
    const options = this.newScreening.type === 'SINGLE_CHOICE'
      ? this.newScreening.options.split(',').map(s => s.trim()).filter(Boolean)
      : [];
    const payload = {
      question: this.newScreening.question.trim(),
      type: this.newScreening.type,
      options,
      correctAnswer: String(this.newScreening.correctAnswer ?? '').trim() || null,
      weight: Number(this.newScreening.weight) || 5
    };
    this.http.post<ScreeningQuestion>(`/api/admin/jobs/${this.questionsJob!.id}/screening-questions`, payload)
      .pipe(catchError(() => of(null)))
      .subscribe(r => {
        this.savingQuestion = false;
        if (!r) { this.questionError = 'Erreur lors de l\'ajout.'; this.cdr.markForCheck(); return; }
        this.screeningQuestions = [...this.screeningQuestions, r];
        this.resetNewScreening();
        this.cdr.markForCheck();
      });
  }

  deleteScreeningQuestion(id: number): void {
    this.http.delete(`/api/admin/jobs/${this.questionsJob!.id}/screening-questions/${id}`)
      .pipe(catchError(() => of(null)))
      .subscribe(() => { this.screeningQuestions = this.screeningQuestions.filter(q => q.id !== id); this.cdr.markForCheck(); });
  }

  private resetNewKiller():   void { this.newKiller    = { question: '', expectedAnswer: 'OUI' }; }
  private resetNewScreening():void { this.newScreening = { question: '', type: 'YES_NO', options: '', correctAnswer: '', weight: 5 }; }

  sqTypeLabel(type: string): string {
    return this.sqTypes.find(t => t.value === type)?.label ?? type;
  }

  // ── Helpers ──────────────────────────────────────
  setSearch(q: string): void              { this.search       = q; this.page = 1; this.cdr.markForCheck(); }
  setStatut(s: JobStatus | ''): void      { this.filterStatut = s; this.page = 1; this.cdr.markForCheck(); }
  setType(t: JobType | ''): void          { this.filterType   = t; this.page = 1; this.cdr.markForCheck(); }

  hasError(f: string): boolean {
    const c = this.form.get(f);
    return !!(c?.invalid && c?.touched);
  }
}
