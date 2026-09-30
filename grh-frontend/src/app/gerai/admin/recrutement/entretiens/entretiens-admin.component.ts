import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }  from '@angular/forms';
import { HttpClient }   from '@angular/common/http';
import { Subject, takeUntil, catchError, of } from 'rxjs';
import { Interview, InterviewStatut, InterviewDecision, INTERVIEW_TYPE_LABELS, INTERVIEW_STATUT_LABELS, INTERVIEW_DECISION_LABELS } from '../../../models/interview.model';
import { RecruitmentStateService } from '../recruitment-state.service';

@Component({
  selector: 'app-entretiens-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './entretiens-admin.component.html',
  styleUrls: ['./entretiens-admin.component.scss']
})
export class EntretiensAdminComponent implements OnInit, OnDestroy {
  interviews: Interview[] = [];
  filtered  : Interview[] = [];
  loading = true;

  filterStatut = '';
  filterDate   = '';

  selected        : Interview | null = null;
  showDecisionForm  = false;
  decisionVal      : InterviewDecision = 'EN_ATTENTE';
  noteGlobale      = 0;
  commentaire      = '';

  sendingInvitation  = false;
  invitationSent     = false;
  invitationError    : string | null = null;
  changingStatut     = false;

  offreDateDebut  = '';
  offreDateError  = false;

  readonly typeLabels    = INTERVIEW_TYPE_LABELS;
  readonly statutLabels  = INTERVIEW_STATUT_LABELS;
  readonly decisionLabels= INTERVIEW_DECISION_LABELS;
  readonly statuts: InterviewStatut[]    = ['PLANIFIE','EN_COURS','TERMINE','ANNULE','REPORTE'];
  readonly decisions: InterviewDecision[] = ['EN_ATTENTE','RETENU','REJETE'];
  readonly stars = [1,2,3,4,5];

  private destroy$ = new Subject<void>();

  get kpiPlanifie()  { return this.interviews.filter(i => i.statut === 'PLANIFIE').length; }
  get kpiTermine()   { return this.interviews.filter(i => i.statut === 'TERMINE').length; }
  get kpiRetenu()    { return this.interviews.filter(i => i.decision === 'RETENU').length; }
  get kpiAujourdhui() {
    const today = new Date().toISOString().slice(0, 10);
    return this.interviews.filter(i => i.date === today).length;
  }

  constructor(
    private state: RecruitmentStateService,
    private http : HttpClient,
    private cd   : ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.state.interviews$.pipe(takeUntil(this.destroy$)).subscribe(data => {
      this.interviews = data;
      // keep selected in sync
      if (this.selected) {
        this.selected = data.find(i => i.id === this.selected!.id) ?? this.selected;
      }
      this.applyFilter();
      this.cd.detectChanges();
    });
    this.state.loadInterviews().subscribe(() => {
      this.loading = false;
      this.cd.detectChanges();
    });
  }

  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }

  applyFilter() {
    let res = [...this.interviews];
    if (this.filterStatut) res = res.filter(i => i.statut === this.filterStatut);
    if (this.filterDate)   res = res.filter(i => i.date   === this.filterDate);
    this.filtered = res;
  }

  openDetail(i: Interview) {
    this.selected          = i;
    this.showDecisionForm  = false;
    this.decisionVal       = i.decision;
    this.noteGlobale       = i.noteGlobale ?? 0;
    this.commentaire       = i.commentaire ?? '';
    this.invitationSent    = false;
    this.invitationError   = null;
    this.sendingInvitation = false;
    this.offreDateDebut    = '';
    this.offreDateError    = false;
    this.cd.markForCheck();
  }

  closeDetail() { this.selected = null; this.cd.markForCheck(); }

  changeStatut(i: Interview, statut: string): void {
    if (this.changingStatut) return;
    this.changingStatut = true;
    this.cd.markForCheck();
    this.state.updateInterviewStatut(i.id, statut).subscribe(updated => {
      this.changingStatut = false;
      if (updated && updated.statut === 'TERMINE') this.showDecisionForm = false;
      this.cd.detectChanges();
    });
  }

  sendInvitation(i: Interview): void {
    if (this.sendingInvitation) return;
    this.sendingInvitation = true;
    this.invitationError   = null;
    this.invitationSent    = false;
    this.cd.markForCheck();
    this.http.post<{ sent: boolean; to: string }>(`/api/admin/interviews/${i.id}/send-invitation`, {})
      .pipe(catchError(err => {
        this.invitationError   = err?.error?.error ?? 'Erreur lors de l\'envoi de l\'invitation.';
        this.sendingInvitation = false;
        this.cd.detectChanges();
        return of(null);
      }))
      .subscribe(res => {
        this.sendingInvitation = false;
        if (res?.sent) this.invitationSent = true;
        this.cd.detectChanges();
      });
  }

  saveDecision() {
    if (!this.selected) return;
    if (this.decisionVal === 'RETENU' && !this.offreDateDebut) {
      this.offreDateError = true;
      this.cd.markForCheck();
      return;
    }
    this.offreDateError = false;
    this.state.saveInterviewDecision(this.selected.id, {
      decision   : this.decisionVal,
      noteGlobale: this.noteGlobale,
      commentaire: this.commentaire,
      dateDebut  : this.decisionVal === 'RETENU' ? this.offreDateDebut : undefined
    }).subscribe(updated => {
      if (updated) {
        this.showDecisionForm = false;
        this.cd.detectChanges();
      }
    });
  }

  statutClass(s: InterviewStatut): string {
    const map: Record<InterviewStatut, string> = {
      PLANIFIE: 'badge-blue', EN_COURS: 'badge-amber', TERMINE: 'badge-green',
      ANNULE: 'badge-red', REPORTE: 'badge-gray'
    };
    return map[s];
  }

  decisionClass(d: InterviewDecision): string {
    const map: Record<InterviewDecision, string> = { EN_ATTENTE: 'badge-gray', RETENU: 'badge-green', REJETE: 'badge-red' };
    return map[d];
  }

  isToday(date: string): boolean {
    return date === new Date().toISOString().slice(0, 10);
  }
}
