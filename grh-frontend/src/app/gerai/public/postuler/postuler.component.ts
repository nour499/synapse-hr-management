import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }  from '@angular/forms';
import { HttpClient }   from '@angular/common/http';
import { catchError, of } from 'rxjs';

interface PublicJob {
  id: number; titre: string; statut: string;
  datePublication: string; role: string; postes: number;
  departement: string; typeContrat: string; lieu?: string; description?: string;
}
interface KillerQuestion   { id: number; question: string; displayOrder: number; }
interface ScreeningQuestion {
  id: number; question: string; type: string;
  options: string[]; weight: number; displayOrder: number;
}

type Step = 'jobs' | 'killer' | 'screening' | 'form' | 'success' | 'rejected';

@Component({
  selector: 'app-postuler',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './postuler.component.html',
  styleUrls: ['./postuler.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PostulerComponent implements OnInit {

  jobs: PublicJob[] = [];
  loading = true;
  step: Step = 'jobs';
  selectedJob: PublicJob | null = null;
  submitting     = false;
  killerValidating = false;
  errorMsg: string | null = null;
  expandedId: number | null = null;

  // Screening state
  killerQuestions:   KillerQuestion[]   = [];
  screeningQuestions: ScreeningQuestion[] = [];
  killerAnswers:   Record<number, string> = {};
  screeningAnswers: Record<number, string> = {};
  killerError: string | null = null;

  form = {
    prenom: '', nom: '', email: '', telephone: '',
    experience: 0, competences: '', linkedin: '', localisation: ''
  };
  cvFile: File | null = null;

  constructor(private http: HttpClient, private cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.http.get<PublicJob[]>('/api/public/jobs')
      .pipe(catchError(() => of([])))
      .subscribe(jobs => {
        this.jobs    = jobs.sort((a, b) => b.datePublication.localeCompare(a.datePublication));
        this.loading = false;
        this.cd.markForCheck();
      });
  }

  openForm(job: PublicJob): void {
    this.selectedJob     = job;
    this.errorMsg        = null;
    this.killerError     = null;
    this.cvFile          = null;
    this.killerAnswers   = {};
    this.screeningAnswers = {};
    this.form = { prenom: '', nom: '', email: '', telephone: '', experience: 0, competences: '', linkedin: '', localisation: '' };

    // Fetch screening questions for this job
    this.http.get<{ killerQuestions: KillerQuestion[]; screeningQuestions: ScreeningQuestion[] }>(
      `/api/public/jobs/${job.id}/screening`
    ).pipe(catchError(() => of({ killerQuestions: [], screeningQuestions: [] })))
    .subscribe(data => {
      this.killerQuestions    = data.killerQuestions;
      this.screeningQuestions = data.screeningQuestions;
      // Navigate to first relevant step
      if (this.killerQuestions.length > 0) {
        this.step = 'killer';
      } else if (this.screeningQuestions.length > 0) {
        this.step = 'screening';
      } else {
        this.step = 'form';
      }
      this.cd.markForCheck();
    });
  }

  // ── Killer step ──────────────────────────────────────────────────────

  submitKillerAnswers(): void {
    // Make sure all questions are answered
    const unanswered = this.killerQuestions.find(kq => !this.killerAnswers[kq.id]);
    if (unanswered) {
      this.killerError = 'Veuillez répondre à toutes les questions.';
      this.cd.markForCheck();
      return;
    }

    this.killerValidating = true;
    this.killerError      = null;
    this.cd.markForCheck();

    // Convert Record<number,string> to Map<number,string> for POST body
    const body: Record<string, string> = {};
    Object.entries(this.killerAnswers).forEach(([k, v]) => body[k] = v);

    this.http.post<{ passed: boolean; failedQuestion?: string }>(
      `/api/public/jobs/${this.selectedJob!.id}/validate-killer`, body
    ).pipe(catchError(() => of({ passed: false }))).subscribe(res => {
      this.killerValidating = false;
      if (res.passed) {
        this.step = this.screeningQuestions.length > 0 ? 'screening' : 'form';
      } else {
        this.step = 'rejected';
      }
      this.cd.markForCheck();
    });
  }

  // ── Screening step ───────────────────────────────────────────────────

  submitScreeningAnswers(): void {
    this.step = 'form';
    this.cd.markForCheck();
  }

  // ── Form step ────────────────────────────────────────────────────────

  backToJobs(): void  { this.step = 'jobs'; this.selectedJob = null; this.cd.markForCheck(); }
  backToList(): void  { this.step = 'jobs'; this.selectedJob = null; this.cd.markForCheck(); }

  backFromKiller(): void    { this.step = 'jobs'; this.selectedJob = null; this.cd.markForCheck(); }
  backFromScreening(): void { this.step = this.killerQuestions.length > 0 ? 'killer' : 'jobs'; this.cd.markForCheck(); }
  backFromForm(): void {
    if (this.screeningQuestions.length > 0) this.step = 'screening';
    else if (this.killerQuestions.length > 0) this.step = 'killer';
    else this.step = 'jobs';
    this.cd.markForCheck();
  }

  onCvChange(event: Event): void {
    this.cvFile = (event.target as HTMLInputElement).files?.[0] ?? null;
  }

  toggleDesc(id: number): void {
    this.expandedId = this.expandedId === id ? null : id;
    this.cd.markForCheck();
  }

  submit(): void {
    if (!this.selectedJob) return;
    if (!this.form.prenom || !this.form.nom || !this.form.email) {
      this.errorMsg = 'Prénom, nom et email sont obligatoires.';
      this.cd.markForCheck(); return;
    }
    this.submitting = true;
    this.errorMsg   = null;
    this.cd.markForCheck();

    const fd = new FormData();
    fd.append('nom',    this.form.nom);
    fd.append('prenom', this.form.prenom);
    fd.append('email',  this.form.email);
    fd.append('jobId',  String(this.selectedJob.id));
    if (this.form.telephone)    fd.append('telephone',    this.form.telephone);
    if (this.form.experience)   fd.append('experience',   String(this.form.experience));
    if (this.form.competences)  fd.append('competences',  this.form.competences);
    if (this.form.linkedin)     fd.append('linkedin',     this.form.linkedin);
    if (this.form.localisation) fd.append('localisation', this.form.localisation);
    if (this.cvFile)            fd.append('cv', this.cvFile);

    // Attach answers
    if (Object.keys(this.killerAnswers).length)
      fd.append('killerAnswers', JSON.stringify(this.killerAnswers));
    if (Object.keys(this.screeningAnswers).length)
      fd.append('screeningAnswers', JSON.stringify(this.screeningAnswers));

    this.http.post('/api/public/apply', fd)
      .pipe(catchError(err => {
        const msg = err?.error ?? 'Une erreur est survenue. Veuillez réessayer.';
        this.errorMsg  = typeof msg === 'string' ? msg : JSON.stringify(msg);
        this.submitting = false;
        this.cd.detectChanges();
        return of(null);
      }))
      .subscribe(res => {
        if (res) { this.step = 'success'; }
        this.submitting = false;
        this.cd.detectChanges();
      });
  }

  // ── Step progress ────────────────────────────────────────────────────

  get stepNumber(): number {
    const hasKiller    = this.killerQuestions.length > 0;
    const hasScreening = this.screeningQuestions.length > 0;
    if (this.step === 'killer')   return 1;
    if (this.step === 'screening') return hasKiller ? 2 : 1;
    if (this.step === 'form') {
      if (hasKiller && hasScreening) return 3;
      if (hasKiller || hasScreening) return 2;
      return 1;
    }
    return 1;
  }

  get totalSteps(): number {
    let t = 1; // form always
    if (this.killerQuestions.length > 0)    t++;
    if (this.screeningQuestions.length > 0) t++;
    return t;
  }

  // ── Labels ───────────────────────────────────────────────────────────

  typeLabel(t: string): string {
    const map: Record<string, string> = { CDI: 'CDI', CDD: 'CDD', STAGE: 'Stage', FREELANCE: 'Freelance', ALTERNANCE: 'Alternance' };
    return map[t] ?? t;
  }

  roleLabel(r: string): string {
    const map: Record<string, string> = { JUNIOR: 'Junior', SENIOR: 'Senior', LEAD: 'Lead', MANAGER: 'Manager', DIRECTEUR: 'Directeur', STAGIAIRE: 'Stagiaire' };
    return map[r] ?? r;
  }
}
