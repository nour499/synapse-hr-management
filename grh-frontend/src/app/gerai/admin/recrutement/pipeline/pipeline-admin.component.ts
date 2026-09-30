import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { Candidate, CandidateStatut, CANDIDATE_STATUT_LABELS, PIPELINE_STAGES } from '../../../models/candidate.model';
import { RecruitmentStateService } from '../recruitment-state.service';

@Component({
  selector: 'app-pipeline-admin',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pipeline-admin.component.html',
  styleUrls: ['./pipeline-admin.component.scss']
})
export class PipelineAdminComponent implements OnInit, OnDestroy {
  candidates: Candidate[] = [];
  loading = true;

  readonly stages       = PIPELINE_STAGES;
  readonly statutLabels = CANDIDATE_STATUT_LABELS;

  selected: Candidate | null = null;

  private destroy$ = new Subject<void>();

  constructor(private state: RecruitmentStateService, private cd: ChangeDetectorRef) {}

  ngOnInit() {
    this.state.candidates$.pipe(takeUntil(this.destroy$)).subscribe(data => {
      this.candidates = data;
      this.cd.detectChanges();
    });
    this.state.loadCandidates().subscribe(() => {
      this.loading = false;
      this.cd.detectChanges();
    });
  }

  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }

  candidatesInStage(statut: CandidateStatut): Candidate[] {
    return this.candidates.filter(c => c.statut === statut);
  }

  moveTo(c: Candidate, statut: CandidateStatut) {
    this.state.moveCandidat(c.id, statut).subscribe();
  }

  openDetail(c: Candidate) { this.selected = c; this.cd.markForCheck(); }
  closeDetail() { this.selected = null; this.cd.markForCheck(); }

  stageColor(statut: CandidateStatut): string {
    const color = this.stages.find(s => s.statut === statut)?.color ?? '#6366F1';
    return `linear-gradient(135deg, ${color} 0%, ${color}aa 100%)`;
  }

  scoreClass(score?: number): string {
    if (!score) return '';
    return score >= 80 ? 'score-high' : score >= 60 ? 'score-mid' : 'score-low';
  }

  prevStage(statut: CandidateStatut): CandidateStatut | null {
    const idx = this.stages.findIndex(s => s.statut === statut);
    return idx > 0 ? this.stages[idx - 1].statut : null;
  }

  nextStage(statut: CandidateStatut): CandidateStatut | null {
    const idx = this.stages.findIndex(s => s.statut === statut);
    return idx < this.stages.length - 1 ? this.stages[idx + 1].statut : null;
  }

  initials(c: Candidate) { return `${c.prenom[0]}${c.nom[0]}`.toUpperCase(); }
}
