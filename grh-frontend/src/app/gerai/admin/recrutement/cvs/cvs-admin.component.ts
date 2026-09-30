import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule }   from '@angular/common';
import { FormsModule }    from '@angular/forms';
import { HttpClient }     from '@angular/common/http';
import { Subject, takeUntil, catchError, of } from 'rxjs';
import { Candidate, CandidateStatut, CANDIDATE_STATUT_LABELS, PIPELINE_STAGES } from '../../../models/candidate.model';
import { RecruitmentStateService } from '../recruitment-state.service';

export interface CvScoreResult {
  score               : number;
  niveau              : 'EXCELLENT' | 'BON' | 'PASSABLE' | 'INSUFFISANT';
  competencesMatchees : string[];
  competencesManquantes: string[];
  pointsForts         : string[];
  recommandation      : string;
}

@Component({
  selector: 'app-cvs-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './cvs-admin.component.html',
  styleUrls: ['./cvs-admin.component.scss']
})
export class CvsAdminComponent implements OnInit, OnDestroy {
  candidates: Candidate[] = [];
  filtered  : Candidate[] = [];
  loading = true;

  uploading : number | null = null;
  scoringId : number | null = null;
  scoreModal: { candidate: Candidate; result: CvScoreResult } | null = null;

  batchScoring   = false;
  shortlisting   = false;
  batchResult    : { scored: number; errors: number; total: number } | null = null;
  shortlistResult: { promoted: number } | null = null;
  shortlistThreshold = 70;

  search     = '';
  filterDept = '';

  readonly stages       = PIPELINE_STAGES;
  readonly statutLabels = CANDIDATE_STATUT_LABELS;

  private destroy$ = new Subject<void>();

  get departements(): string[] {
    return [...new Set(this.candidates.map(c => c.departement))].sort();
  }

  get hasCv()       { return this.filtered.filter(c => c.cvUrl).length; }
  get hasLinkedIn() { return this.filtered.filter(c => c.linkedin).length; }

  constructor(
    private state: RecruitmentStateService,
    private http : HttpClient,
    private cd   : ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.state.candidates$.pipe(takeUntil(this.destroy$)).subscribe(data => {
      this.candidates = data;
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
    if (this.search)     res = res.filter(c => `${c.nom} ${c.prenom} ${c.jobTitre}`.toLowerCase().includes(this.search.toLowerCase()));
    if (this.filterDept) res = res.filter(c => c.departement === this.filterDept);
    this.filtered = res;
  }

  // Normalise stored value: handle both full URL and bare path
  linkedinUrl(raw: string): string {
    if (!raw) return '';
    return raw.startsWith('http') ? raw : `https://${raw}`;
  }

  uploadCv(c: Candidate, event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploading = c.id;
    this.cd.markForCheck();

    const form = new FormData();
    form.append('file', file);

    this.http.post<{ url: string }>(`/api/admin/candidates/${c.id}/cv`, form)
      .pipe(catchError(() => of(null)))
      .subscribe(res => {
        this.uploading = null;
        if (res?.url) {
          // patch candidate in shared state so all views see the new cvUrl
          const updated = { ...c, cvUrl: res.url } as Candidate;
          (this.state as any)['_patchCandidate']?.(updated);
        }
        this.cd.detectChanges();
      });
  }

  statutColor(s: CandidateStatut) { return this.stages.find(st => st.statut === s)?.color ?? '#64748B'; }
  initials(c: Candidate) { return `${c.prenom[0]}${c.nom[0]}`.toUpperCase(); }
  scoreClass(score?: number) {
    if (score == null) return '';
    return score >= 80 ? 'score-high' : score >= 60 ? 'score-mid' : 'score-low';
  }

  niveauClass(niveau: string): string {
    const map: Record<string, string> = {
      EXCELLENT: 'score-high',
      BON:       'score-mid',
      PASSABLE:  'score-low',
      INSUFFISANT: 'score-low'
    };
    return map[niveau] ?? '';
  }

  scoreCandidate(c: Candidate): void {
    if (this.scoringId === c.id) return;
    this.scoringId = c.id;
    this.cd.markForCheck();

    this.http.post<CvScoreResult>(`/api/admin/candidates/${c.id}/ai-score`, {})
      .pipe(catchError(() => of(null)))
      .subscribe(result => {
        this.scoringId = null;
        if (result) {
          this.state.patchCandidate({ ...c, score: result.score });
          this.scoreModal = { candidate: c, result };
        }
        this.cd.detectChanges();
      });
  }

  closeScoreModal(): void {
    this.scoreModal = null;
    this.cd.markForCheck();
  }

  batchScore(): void {
    if (this.batchScoring) return;
    this.batchScoring = true;
    this.batchResult  = null;
    this.cd.markForCheck();
    this.http.post<{ scored: number; errors: number; total: number; updatedIds: number[] }>(
      '/api/admin/candidates/ai-score-batch', {}
    ).pipe(catchError(() => of(null)))
      .subscribe(res => {
        this.batchScoring = false;
        if (res) {
          this.batchResult = { scored: res.scored, errors: res.errors, total: res.total };
          this.state.loadCandidates().subscribe();
        }
        this.cd.detectChanges();
      });
  }

  autoShortlist(): void {
    if (this.shortlisting) return;
    this.shortlisting    = true;
    this.shortlistResult = null;
    this.cd.markForCheck();
    this.http.post<{ promoted: number; threshold: number }>(
      `/api/admin/candidates/auto-shortlist?threshold=${this.shortlistThreshold}`, {}
    ).pipe(catchError(() => of(null)))
      .subscribe(res => {
        this.shortlisting = false;
        if (res) {
          this.shortlistResult = { promoted: res.promoted };
          this.state.loadCandidates().subscribe();
        }
        this.cd.detectChanges();
      });
  }
}
