import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { Candidate, CandidateStatut, CANDIDATE_STATUT_LABELS, PIPELINE_STAGES } from '../../../models/candidate.model';
import { RecruitmentStateService } from '../recruitment-state.service';

@Component({
  selector: 'app-shortlist-admin',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './shortlist-admin.component.html',
  styleUrls: ['./shortlist-admin.component.scss']
})
export class ShortlistAdminComponent implements OnInit, OnDestroy {
  candidates: Candidate[] = [];
  loading = true;
  selected: Candidate | null = null;

  readonly stages       = PIPELINE_STAGES;
  readonly statutLabels = CANDIDATE_STATUT_LABELS;
  readonly stars        = [1,2,3,4,5];

  private destroy$ = new Subject<void>();

  get byDepartement(): { dept: string; list: Candidate[] }[] {
    const map = new Map<string, Candidate[]>();
    this.candidates.forEach(c => {
      if (!map.has(c.departement)) map.set(c.departement, []);
      map.get(c.departement)!.push(c);
    });
    return Array.from(map.entries()).map(([dept, list]) => ({ dept, list }));
  }

  constructor(private state: RecruitmentStateService, private cd: ChangeDetectorRef) {}

  ngOnInit() {
    // Use shared candidates stream, filter locally — stays in sync with all other views
    this.state.candidates$.pipe(takeUntil(this.destroy$)).subscribe(data => {
      this.candidates = data
        .filter(c => c.statut === 'SHORTLISTE')
        .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
      if (this.selected) {
        this.selected = data.find(c => c.id === this.selected!.id) ?? null;
      }
      this.cd.detectChanges();
    });
    this.state.loadCandidates().subscribe(() => {
      this.loading = false;
      this.cd.detectChanges();
    });
  }

  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }

  removeFromShortlist(c: Candidate) {
    this.state.moveCandidat(c.id, 'EN_REVUE').subscribe(updated => {
      if (updated && this.selected?.id === c.id) this.selected = null;
    });
  }

  promoteToOffer(c: Candidate) {
    this.state.moveCandidat(c.id, 'OFFRE_ENVOYEE').subscribe(updated => {
      if (updated && this.selected?.id === c.id) this.selected = updated;
    });
  }

  openDetail(c: Candidate) { this.selected = c; this.cd.markForCheck(); }
  closeDetail() { this.selected = null; this.cd.markForCheck(); }

  statutColor(s: CandidateStatut) { return this.stages.find(st => st.statut === s)?.color ?? '#64748B'; }
  initials(c: Candidate) { return `${c.prenom[0]}${c.nom[0]}`.toUpperCase(); }
  scoreClass(score?: number) {
    if (!score) return '';
    return score >= 80 ? 'score-high' : score >= 60 ? 'score-mid' : 'score-low';
  }
}
