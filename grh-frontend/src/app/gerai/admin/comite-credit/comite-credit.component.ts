import {
  Component, OnInit, inject,
  ChangeDetectorRef, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin, catchError, of, map } from 'rxjs';
import { DemandeService } from 'src/app/gerai/services/demande.service';
import { Demande, ComiteVoteInfo } from 'src/app/gerai/models/demande.model';

type Tab = 'pending' | 'history' | 'stats';

@Component({
  selector: 'app-comite-credit',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './comite-credit.component.html',
  styleUrls: ['./comite-credit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComiteCreditComponent implements OnInit {

  private svc = inject(DemandeService);
  private fb  = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  // ── Data ─────────────────────────────────────────
  pending : Demande[] = [];
  history : Demande[] = [];
  loading  = true;

  // ── UI state ─────────────────────────────────────
  activeTab  : Tab    = 'pending';
  searchPend = '';
  searchHist = '';
  filterHist = '';

  // ── Detail drawer ────────────────────────────────
  detailItem  : Demande | null = null;
  detailVotes : ComiteVoteInfo[] = [];
  loadingVotes = false;

  // ── Vote drawer ──────────────────────────────────
  voteItem   : Demande | null = null;
  isApproving = true;
  saving      = false;
  errorMsg    : string | null = null;

  voteApproveForm = this.fb.group({
    montantSuggere    : [null as number | null, [Validators.required, Validators.min(1)]],
    nbTranchesSuggeres: [12,                    [Validators.required, Validators.min(1), Validators.max(120)]],
    commentaire       : ['']
  });

  voteRejectForm = this.fb.group({
    commentaire: ['', [Validators.required, Validators.minLength(5)]]
  });

  // ── Lifecycle ────────────────────────────────────
  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading = true;
    forkJoin({
      pending: this.svc.getComitePending().pipe(catchError(() => of([]))),
      all    : this.svc.getComiteAll().pipe(catchError(() => of([])))
    }).subscribe(({ pending, all }) => {
      this.history = all.filter(d =>
        d.statut === 'VALIDEE_COMMISSION' || d.statut === 'VALIDEE_DG' ||
        d.statut === 'VALIDEE_RH'         || d.statut === 'REJETEE'
      );

      if (pending.length === 0) {
        this.pending = [];
        this.loading = false;
        this.cdr.markForCheck();
        return;
      }

      // Load votes for every pending loan in parallel so tally badges are accurate from the start
      forkJoin(
        pending.map(d =>
          this.svc.getComiteVotes(d.id).pipe(
            map(votes => ({ ...d, votes })),
            catchError(() => of(d))
          )
        )
      ).subscribe(pendingWithVotes => {
        this.pending = pendingWithVotes;
        this.loading = false;
        this.cdr.markForCheck();
      });
    });
  }

  // ── KPI ──────────────────────────────────────────
  get kpi() {
    const approved = this.history.filter(d =>
      d.statut === 'VALIDEE_COMMISSION' || d.statut === 'VALIDEE_DG' ||
      d.statut === 'VALIDEE_RH'            );
    const rejected = this.history.filter(d => d.statut === 'REJETEE');
    const decided  = approved.length + rejected.length;
    return {
      enAttente      : this.pending.length,
      montantAttente : this.pending.reduce((s, d) => s + (d.amount ?? 0), 0),
      montantApprouve: approved.reduce((s, d) => s + (d.montantApprouve ?? d.amount ?? 0), 0),
      tauxApprobation: decided ? Math.round((approved.length / decided) * 100) : null,
      totalApproved  : approved.length,
      totalRejected  : rejected.length
    };
  }

  // ── Filtered lists ───────────────────────────────
  get filteredPending(): Demande[] {
    const q = this.searchPend.toLowerCase().trim();
    return this.pending.filter(d =>
      !q
      || `${d.employePrenom} ${d.employeNom}`.toLowerCase().includes(q)
      || (d.description ?? '').toLowerCase().includes(q)
    );
  }

  get filteredHistory(): Demande[] {
    const q = this.searchHist.toLowerCase().trim();
    return this.history.filter(d => {
      const matchQ = !q
        || `${d.employePrenom} ${d.employeNom}`.toLowerCase().includes(q)
        || (d.description ?? '').toLowerCase().includes(q);
      const matchS = !this.filterHist || d.statut === this.filterHist;
      return matchQ && matchS;
    });
  }

  // ── Stats ────────────────────────────────────────
  get statsByMotif(): { motif: string; count: number; pct: number }[] {
    const all = [...this.pending, ...this.history];
    const map = new Map<string, number>();
    all.forEach(d => {
      const m = this.motifLabel(d.description ?? '');
      map.set(m, (map.get(m) ?? 0) + 1);
    });
    const total = all.length || 1;
    return [...map.entries()]
      .map(([motif, count]) => ({ motif, count, pct: Math.round((count / total) * 100) }))
      .sort((a, b) => b.count - a.count);
  }

  get statsMonthly(): { label: string; approved: number; rejected: number }[] {
    const months = new Map<string, { approved: number; rejected: number }>();
    this.history.forEach(d => {
      const key = (d.dateValidationDg ?? d.dateCreation ?? '').slice(0, 7);
      if (!key) return;
      const m = months.get(key) ?? { approved: 0, rejected: 0 };
      const isApproved = d.statut === 'VALIDEE_COMMISSION' || d.statut === 'VALIDEE_DG' ||
                         d.statut === 'VALIDEE_RH';
      if (isApproved) m.approved++; else m.rejected++;
      months.set(key, m);
    });
    return [...months.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([key, v]) => ({ label: this.monthLabel(key), ...v }));
  }

  get statsMaxMonth(): number {
    return Math.max(1, ...this.statsMonthly.map(m => m.approved + m.rejected));
  }

  // ── Vote tally helpers ───────────────────────────
  approveCount(d: Demande): number {
    return (d.votes ?? []).filter(v => v.vote === 'FAVORABLE').length;
  }

  rejectCount(d: Demande): number {
    return (d.votes ?? []).filter(v => v.vote === 'DEFAVORABLE').length;
  }

  hasVoted(d: Demande): boolean {
    return (d.votes ?? []).length > 0;
  }

  // ── Detail drawer ────────────────────────────────
  openDetail(d: Demande): void {
    this.detailItem  = d;
    this.detailVotes = d.votes ?? [];
    this.loadingVotes = true;
    this.cdr.markForCheck();

    this.svc.getComiteVotes(d.id).subscribe({
      next: votes => {
        this.detailVotes  = votes;
        this.loadingVotes = false;
        // attach votes to item so tally badges update
        const idx = this.pending.findIndex(x => x.id === d.id);
        if (idx >= 0) this.pending[idx] = { ...this.pending[idx], votes };
        this.cdr.markForCheck();
      },
      error: () => { this.loadingVotes = false; this.cdr.markForCheck(); }
    });
  }

  closeDetail(): void { this.detailItem = null; this.detailVotes = []; this.cdr.markForCheck(); }

  get installmentRows(): { num: number; montant: number }[] {
    const item = this.detailItem;
    if (!item) return [];
    const m = item.montantApprouve ?? item.amount ?? 0;
    const n = item.nbTranches ?? item.durationMonths ?? 0;
    if (!m || !n) return [];
    const monthly = Math.round((m / n) * 100) / 100;
    return Array.from({ length: Math.min(n, 6) }, (_, i) => ({ num: i + 1, montant: monthly }));
  }

  // ── Vote drawer ──────────────────────────────────
  openVoteApprove(d: Demande, ev: Event): void {
    ev.stopPropagation();
    this.voteItem   = d;
    this.isApproving = true;
    this.errorMsg   = null;
    this.voteApproveForm.reset({ montantSuggere: d.amount ?? null, nbTranchesSuggeres: 12, commentaire: '' });
    this.cdr.markForCheck();
  }

  openVoteReject(d: Demande, ev: Event): void {
    ev.stopPropagation();
    this.voteItem   = d;
    this.isApproving = false;
    this.errorMsg   = null;
    this.voteRejectForm.reset();
    this.cdr.markForCheck();
  }

  closeVote(): void { this.voteItem = null; this.errorMsg = null; this.cdr.markForCheck(); }

  get suggestedTranche(): number {
    const m = this.voteApproveForm.get('montantSuggere')?.value;
    const n = this.voteApproveForm.get('nbTranchesSuggeres')?.value;
    if (!m || !n || n <= 0) return 0;
    return Math.round((m / n) * 100) / 100;
  }

  submitApprove(): void {
    if (this.voteApproveForm.invalid || !this.voteItem) { this.voteApproveForm.markAllAsTouched(); return; }
    const id  = this.voteItem.id;
    const val = this.voteApproveForm.value;
    this.saving = true; this.errorMsg = null;

    this.svc.castCommissionVote(id, {
      vote              : 'FAVORABLE',
      montantSuggere    : val.montantSuggere!,
      nbTranchesSuggeres: val.nbTranchesSuggeres!,
      commentaire       : val.commentaire || undefined
    }).subscribe({
      next: () => { this.saving = false; this.voteItem = null; this.load(); },
      error: (err: any) => {
        this.errorMsg = err?.error?.message || 'Erreur lors du vote.';
        this.saving = false;
        this.cdr.markForCheck();
      }
    });
  }

  submitReject(): void {
    if (this.voteRejectForm.invalid || !this.voteItem) { this.voteRejectForm.markAllAsTouched(); return; }
    const id  = this.voteItem.id;
    const val = this.voteRejectForm.value;
    this.saving = true; this.errorMsg = null;

    this.svc.castCommissionVote(id, {
      vote       : 'DEFAVORABLE',
      commentaire: val.commentaire!
    }).subscribe({
      next: () => { this.saving = false; this.voteItem = null; this.load(); },
      error: (err: any) => {
        this.errorMsg = err?.error?.message || 'Erreur lors du vote.';
        this.saving = false;
        this.cdr.markForCheck();
      }
    });
  }

  hasErr(form: 'approve' | 'reject', field: string): boolean {
    const fg: FormGroup = form === 'approve' ? this.voteApproveForm : this.voteRejectForm;
    const c = fg.get(field);
    return !!(c?.invalid && c?.touched);
  }

  // ── Helpers ──────────────────────────────────────
  setTab(t: Tab): void { this.activeTab = t; this.cdr.markForCheck(); }

  initials(d: Demande): string {
    return d.employeInitiales || `${(d.employePrenom?.[0] ?? '')}${(d.employeNom?.[0] ?? '')}`.toUpperCase();
  }

  motifLabel(desc: string): string {
    if (!desc) return 'Autre';
    const d = desc.toLowerCase();
    if (d.includes('médical') || d.includes('sante') || d.includes('santé')) return 'Médical';
    if (d.includes('immobilier') || d.includes('logement'))                  return 'Immobilier';
    if (d.includes('véhicule') || d.includes('vehicule') || d.includes('voiture')) return 'Véhicule';
    if (d.includes('éducation') || d.includes('education') || d.includes('scolarité')) return 'Éducation';
    if (d.includes('familial') || d.includes('famille'))                     return 'Familial';
    return 'Autre';
  }

  monthLabel(key: string): string {
    const [y, m] = key.split('-');
    const names = ['Jan','Fév','Mar','Avr','Mai','Jui','Jul','Aoû','Sep','Oct','Nov','Déc'];
    return `${names[parseInt(m, 10) - 1]} ${y}`;
  }

  motifColor(motif: string): string {
    const m: Record<string, string> = {
      'Médical':    '#EF4444', 'Immobilier': '#3B82F6',
      'Véhicule':   '#F59E0B', 'Éducation':  '#10B981',
      'Familial':   '#8B5CF6', 'Autre':      '#94A3B8'
    };
    return m[motif] ?? '#94A3B8';
  }

  fmtAmount(n?: number): string {
    if (n == null) return '—';
    return new Intl.NumberFormat('fr-TN', { minimumFractionDigits: 0 }).format(n) + ' TND';
  }
}
