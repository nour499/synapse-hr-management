import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }  from '@angular/forms';
import { HttpClient }   from '@angular/common/http';
import { Subject, takeUntil, catchError, of } from 'rxjs';
import { Candidate, CandidateStatut, CANDIDATE_STATUT_LABELS, PIPELINE_STAGES } from '../../../models/candidate.model';
import { Interview, InterviewType, INTERVIEW_TYPE_LABELS } from '../../../models/interview.model';
import { RecruitmentStateService } from '../recruitment-state.service';

export interface InterviewQuestion { categorie: string; question: string; }
export interface EmailDraft        { objet: string; corps: string; }

@Component({
  selector: 'app-candidats-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './candidats-admin.component.html',
  styleUrls: ['./candidats-admin.component.scss']
})
export class CandidatsAdminComponent implements OnInit, OnDestroy {
  candidates: Candidate[] = [];
  filtered  : Candidate[] = [];
  loading = true;

  search        = '';
  filterStatut  = '';
  filterDept    = '';

  selected  : Candidate | null = null;
  noteEdit  = '';
  editNote  = false;

  scheduleModal     = false;
  scheduleCandidate : Candidate | null = null;
  scheduling        = false;
  scheduleError     : string | null = null;
  invitationSent    = false;
  scheduleForm = {
    type       : 'RH' as InterviewType,
    date       : '',
    heureDebut : '09:00',
    heureFin   : '10:00',
    intervieweur: '',
    lieu       : '',
    lienVisio  : ''
  };
  readonly interviewTypes: InterviewType[] = ['RH', 'TECHNIQUE', 'TELEPHONIQUE', 'VISIO', 'PRESENTIEL'];
  readonly typeLabels = INTERVIEW_TYPE_LABELS;

  generatingQuestions = false;
  questionsModal: { candidate: Candidate; questions: InterviewQuestion[] } | null = null;

  generatingEmail  = false;
  emailType        : 'REJET' | 'OFFRE' = 'REJET';
  offreDateDebut   = '';
  offreDateError   = false;
  emailModal: { candidate: Candidate; draft: EmailDraft } | null = null;
  emailCopied    = false;
  sendingEmail   = false;
  emailSent      = false;
  emailSendError : string | null = null;

  readonly statutLabels = CANDIDATE_STATUT_LABELS;
  readonly stages       = PIPELINE_STAGES;
  readonly statuts: CandidateStatut[] = ['NOUVEAU','EN_REVUE','SHORTLISTE','INTERVIEWE','OFFRE_ENVOYEE','EMBAUCHE','REJETE'];

  private destroy$ = new Subject<void>();

  get departements(): string[] {
    return [...new Set(this.candidates.map(c => c.departement))].sort();
  }

  get kpiTotal()      { return this.candidates.length; }
  get kpiShortlist()  { return this.candidates.filter(c => c.statut === 'SHORTLISTE').length; }
  get kpiInterviewe() { return this.candidates.filter(c => c.statut === 'INTERVIEWE').length; }
  get kpiEmbauche()   { return this.candidates.filter(c => c.statut === 'EMBAUCHE').length; }

  constructor(
    private state: RecruitmentStateService,
    private http : HttpClient,
    private cd   : ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.state.candidates$.pipe(takeUntil(this.destroy$)).subscribe(data => {
      this.candidates = data;
      // keep selected in sync
      if (this.selected) {
        this.selected = data.find(c => c.id === this.selected!.id) ?? this.selected;
      }
      this.applyFilter();
      this.cd.detectChanges();
    });
    this.state.loadCandidates().subscribe(() => {
      this.loading = false;
      this.cd.detectChanges();
    });
  }

  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }

  applyFilter() {
    let res = [...this.candidates];
    if (this.search)       res = res.filter(c => `${c.nom} ${c.prenom} ${c.email} ${c.jobTitre}`.toLowerCase().includes(this.search.toLowerCase()));
    if (this.filterStatut) res = res.filter(c => c.statut === this.filterStatut);
    if (this.filterDept)   res = res.filter(c => c.departement === this.filterDept);
    this.filtered = res;
  }

  openDetail(c: Candidate) {
    this.selected = c;
    this.noteEdit = c.noteRecruteur ?? '';
    this.editNote = false;
    this.cd.markForCheck();
  }

  closeDetail() { this.selected = null; this.cd.markForCheck(); }

  changeStatut(c: Candidate, statut: string) {
    this.state.moveCandidat(c.id, statut).subscribe();
  }

  saveNote() {
    if (!this.selected) return;
    this.state.saveNote(this.selected.id, this.noteEdit).subscribe(updated => {
      if (updated) {
        this.editNote = false;
        this.cd.detectChanges();
      }
    });
  }

  isShortlisted(c: Candidate): boolean { return c.statut === 'SHORTLISTE'; }

  toggleShortlist(c: Candidate) {
    const next = c.statut === 'SHORTLISTE' ? 'EN_REVUE' : 'SHORTLISTE';
    this.state.moveCandidat(c.id, next).subscribe();
  }

  deleteCandidate(c: Candidate, event: MouseEvent): void {
    event.stopPropagation();
    if (!confirm(`Supprimer la candidature de ${c.prenom} ${c.nom} ? Cette action est irréversible.`)) return;
    this.http.delete(`/api/admin/candidates/${c.id}`).subscribe({
      next: () => {
        this.state.removeCandidate(c.id);
        if (this.selected?.id === c.id) this.closeDetail();
        this.cd.detectChanges();
      }
    });
  }

  statutColor(s: CandidateStatut): string {
    return this.stages.find(st => st.statut === s)?.color ?? '#64748B';
  }

  scoreClass(score?: number): string {
    if (!score) return '';
    if (score >= 80) return 'score-high';
    if (score >= 60) return 'score-mid';
    return 'score-low';
  }

  initials(c: Candidate) { return `${c.prenom[0]}${c.nom[0]}`.toUpperCase(); }

  planifierEntretien(c: Candidate): void {
    this.scheduleCandidate = c;
    this.scheduleModal     = true;
    this.scheduleError     = null;
    this.invitationSent    = false;
    this.scheduleForm = {
      type       : 'RH',
      date       : '',
      heureDebut : '09:00',
      heureFin   : '10:00',
      intervieweur: '',
      lieu       : '',
      lienVisio  : ''
    };
    this.cd.markForCheck();
  }

  closeScheduleModal(): void {
    this.scheduleModal     = false;
    this.scheduleCandidate = null;
    this.scheduleError     = null;
    this.invitationSent    = false;
    this.scheduling        = false;
    this.cd.markForCheck();
  }

  submitSchedule(): void {
    if (!this.scheduleCandidate || this.scheduling) return;
    if (!this.scheduleForm.date) { this.scheduleError = 'La date est obligatoire.'; this.cd.markForCheck(); return; }
    if (!this.scheduleForm.heureDebut) { this.scheduleError = 'L\'heure de début est obligatoire.'; this.cd.markForCheck(); return; }
    if (!this.scheduleForm.intervieweur) { this.scheduleError = 'Le nom de l\'intervieweur est obligatoire.'; this.cd.markForCheck(); return; }

    const c = this.scheduleCandidate;
    const payload: Partial<Interview> = {
      candidatId    : c.id,
      candidatNom   : c.nom,
      candidatPrenom: c.prenom,
      candidatPhoto : c.photo,
      jobId         : c.jobId,
      jobTitre      : c.jobTitre,
      departement   : c.departement,
      type          : this.scheduleForm.type,
      date          : this.scheduleForm.date,
      heureDebut    : this.scheduleForm.heureDebut,
      heureFin      : this.scheduleForm.heureFin,
      intervieweur  : this.scheduleForm.intervieweur,
      lieu          : this.scheduleForm.lieu || undefined,
      lienVisio     : this.scheduleForm.lienVisio || undefined
    };

    this.scheduling   = true;
    this.scheduleError = null;
    this.invitationSent = false;
    this.cd.markForCheck();

    this.state.createInterview(payload).subscribe(created => {
      if (!created) {
        this.scheduleError = 'Erreur lors de la création de l\'entretien.';
        this.scheduling    = false;
        this.cd.detectChanges();
        return;
      }
      this.http.post<{ sent: boolean; to: string; error?: string }>(
        `/api/admin/interviews/${created.id}/send-invitation`, {}
      ).pipe(catchError(err => {
        const msg = err?.error?.error ?? 'Erreur réseau lors de l\'envoi de l\'invitation.';
        return of({ sent: false as const, to: '', error: msg });
      })).subscribe(res => {
        this.scheduling = false;
        if (res?.sent) {
          this.invitationSent = true;
        } else {
          this.scheduleError = `Entretien créé ✓, mais l'email n'a pas pu être envoyé : ${res?.error ?? 'erreur inconnue'}. Vous pouvez renvoyer l'invitation depuis l'onglet Entretiens.`;
        }
        this.cd.detectChanges();
      });
    });
  }

  generateInterviewQuestions(c: Candidate): void {
    if (this.generatingQuestions) return;
    this.generatingQuestions = true;
    this.cd.markForCheck();
    this.http.post<{ questions: InterviewQuestion[] }>(`/api/admin/candidates/${c.id}/interview-questions`, {})
      .pipe(catchError(() => of(null)))
      .subscribe(res => {
        this.generatingQuestions = false;
        if (res?.questions) this.questionsModal = { candidate: c, questions: res.questions };
        this.cd.detectChanges();
      });
  }

  closeQuestionsModal(): void { this.questionsModal = null; this.cd.markForCheck(); }

  generateEmail(c: Candidate): void {
    if (this.generatingEmail) return;
    if (this.emailType === 'OFFRE' && !this.offreDateDebut) {
      this.offreDateError = true;
      this.cd.markForCheck();
      return;
    }
    this.offreDateError = false;
    this.generatingEmail = true;
    this.cd.markForCheck();
    const body: Record<string, string> = { type: this.emailType };
    if (this.emailType === 'OFFRE' && this.offreDateDebut) body['dateDebut'] = this.offreDateDebut;
    this.http.post<EmailDraft>(`/api/admin/candidates/${c.id}/email-draft`, body)
      .pipe(catchError(() => of(null)))
      .subscribe(res => {
        this.generatingEmail = false;
        if (res) this.emailModal = { candidate: c, draft: res };
        this.cd.detectChanges();
      });
  }

  closeEmailModal(): void {
    this.emailModal     = null;
    this.emailCopied    = false;
    this.emailSent      = false;
    this.emailSendError = null;
    this.offreDateDebut = '';
    this.offreDateError = false;
    this.cd.markForCheck();
  }

  sendEmail(): void {
    if (!this.emailModal || this.sendingEmail) return;
    this.sendingEmail = true;
    this.emailSendError = null;
    this.emailSent = false;
    this.cd.markForCheck();
    this.http.post<{ sent: boolean; to: string; statut: string }>(
      `/api/admin/candidates/${this.emailModal.candidate.id}/send-email`,
      {
        type:  this.emailType,
        objet: this.emailModal.draft.objet,
        corps: this.emailModal.draft.corps
      }
    ).pipe(catchError(err => {
      this.emailSendError = err?.error?.error ?? 'Erreur lors de l\'envoi.';
      this.sendingEmail = false;
      this.cd.detectChanges();
      return of(null);
    })).subscribe(res => {
      this.sendingEmail = false;
      if (res?.sent) {
        this.emailSent = true;
        this.state.loadCandidates().subscribe();
      }
      this.cd.detectChanges();
    });
  }

  copyEmail(): void {
    if (!this.emailModal) return;
    const text = `Objet: ${this.emailModal.draft.objet}\n\n${this.emailModal.draft.corps}`;
    navigator.clipboard.writeText(text).then(() => {
      this.emailCopied = true;
      this.cd.markForCheck();
      setTimeout(() => { this.emailCopied = false; this.cd.markForCheck(); }, 2000);
    });
  }

  categoryIcon(cat: string): string {
    const map: Record<string, string> = {
      Technique: 'ti-code', Comportementale: 'ti-heart', Situationnelle: 'ti-bulb', Motivation: 'ti-flame'
    };
    return map[cat] ?? 'ti-help';
  }
}
