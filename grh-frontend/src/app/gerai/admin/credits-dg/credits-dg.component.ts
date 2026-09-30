import {
  Component, OnInit, inject,
  ChangeDetectorRef, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { catchError, of } from 'rxjs';
import { DemandeService } from 'src/app/gerai/services/demande.service';
import { Demande } from 'src/app/gerai/models/demande.model';

type Tab = 'pending' | 'history' | 'stats';

@Component({
  selector: 'app-credits-dg',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './credits-dg.component.html',
  styleUrls: ['./credits-dg.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreditsDgComponent implements OnInit {

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
  filterHist = '';        // '' | 'VALIDEE_RH' | 'REJETEE'

  // ── Detail drawer ────────────────────────────────
  detailItem: Demande | null = null;

  // ── Decision drawer ──────────────────────────────
  decisionItem : Demande | null = null;
  isApproving  = true;
  saving       = false;
  errorMsg     : string | null = null;

  approveForm = this.fb.group({
    montantApprouve: [null as number | null, [Validators.required, Validators.min(1)]],
    nbTranches     : [12,                    [Validators.required, Validators.min(1), Validators.max(120)]],
    commentaire    : ['']
  });

  rejectForm = this.fb.group({
    commentaire: ['', [Validators.required, Validators.minLength(5)]]
  });

  // ── Lifecycle ────────────────────────────────────
  ngOnInit(): void {
    forkJoin({
      pending: this.svc.getPretsEnAttenteDirection().pipe(catchError(() => of([]))),
      history: this.svc.getAllCredits().pipe(catchError(() => of([])))
    }).subscribe(({ pending, history }) => {
      this.pending = pending;
      this.history = history.filter(d =>
        d.statut === 'VALIDEE_RH' || d.statut === 'REJETEE'
      );
      this.loading = false;
      this.cdr.markForCheck();
    });
  }

  // ── KPI ──────────────────────────────────────────
  get kpi() {
    const approved  = this.history.filter(d => d.statut === 'VALIDEE_RH');
    const rejected  = this.history.filter(d => d.statut === 'REJETEE');
    const decided   = approved.length + rejected.length;
    return {
      enAttente    : this.pending.length,
      montantAttente: this.pending.reduce((s, d) => s + (d.amount ?? 0), 0),
      montantApprouve: approved.reduce((s, d) => s + (d.montantApprouve ?? d.amount ?? 0), 0),
      tauxApprobation: decided ? Math.round((approved.length / decided) * 100) : null,
      totalApproved: approved.length,
      totalRejected: rejected.length
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
    }).sort((a, b) => (b.dateValidationDg ?? '').localeCompare(a.dateValidationDg ?? ''));
  }

  // ── Stats ────────────────────────────────────────
  get statsByMotif(): { motif: string; count: number; pct: number }[] {
    const all  = [...this.pending, ...this.history];
    const map  = new Map<string, number>();
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
      const key = (d.dateValidationDg ?? d.dateCreation ?? '').slice(0, 7); // YYYY-MM
      if (!key) return;
      const m = months.get(key) ?? { approved: 0, rejected: 0 };
      if (d.statut === 'VALIDEE_RH') m.approved++;
      else m.rejected++;
      months.set(key, m);
    });
    return [...months.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([key, v]) => ({
        label: this.monthLabel(key),
        ...v
      }));
  }

  get statsMaxMonth(): number {
    return Math.max(1, ...this.statsMonthly.map(m => m.approved + m.rejected));
  }

  // ── Detail drawer ────────────────────────────────
  openDetail(d: Demande): void   { this.detailItem = d; this.cdr.markForCheck(); }
  closeDetail(): void             { this.detailItem = null; this.cdr.markForCheck(); }

  get installmentRows(): { num: number; montant: number }[] {
    const item = this.detailItem;
    if (!item) return [];
    const m = item.montantApprouve ?? item.amount ?? 0;
    const n = item.nbTranches ?? item.durationMonths ?? 0;
    if (!m || !n) return [];
    const monthly = Math.round((m / n) * 100) / 100;
    return Array.from({ length: Math.min(n, 6) }, (_, i) => ({ num: i + 1, montant: monthly }));
  }

  // ── Decision drawer ──────────────────────────────
  openApprove(d: Demande, ev: Event): void {
    ev.stopPropagation();
    this.decisionItem = d;
    this.isApproving  = true;
    this.errorMsg     = null;
    this.approveForm.reset({ montantApprouve: d.amount ?? null, nbTranches: 12, commentaire: '' });
    this.cdr.markForCheck();
  }

  openReject(d: Demande, ev: Event): void {
    ev.stopPropagation();
    this.decisionItem = d;
    this.isApproving  = false;
    this.errorMsg     = null;
    this.rejectForm.reset();
    this.cdr.markForCheck();
  }

  closeDecision(): void { this.decisionItem = null; this.errorMsg = null; this.cdr.markForCheck(); }


  get montantTranche(): number {
    const m = this.approveForm.get('montantApprouve')?.value;
    const n = this.approveForm.get('nbTranches')?.value;
    if (!m || !n || n <= 0) return 0;
    return Math.round((m / n) * 100) / 100;
  }

  confirmApprove(): void {
    if (this.approveForm.invalid || !this.decisionItem) { this.approveForm.markAllAsTouched(); return; }
    const id  = this.decisionItem.id;
    const val = this.approveForm.value;
    this.saving = true; this.errorMsg = null;
    this.svc.directionDecision(id, {
      approuve       : true,
      montantApprouve: val.montantApprouve!,
      nbTranches     : val.nbTranches!,
      commentaire    : val.commentaire || undefined
    }).subscribe({
      next: updated => {
        this.pending  = this.pending.filter(d => d.id !== id);
        this.history  = [updated, ...this.history];
        this.decisionItem = null;
        this.saving   = false;
        this.cdr.markForCheck();
      },
      error: () => { this.errorMsg = 'Erreur lors de la validation.'; this.saving = false; this.cdr.markForCheck(); }
    });
  }

  confirmReject(): void {
    if (this.rejectForm.invalid || !this.decisionItem) { this.rejectForm.markAllAsTouched(); return; }
    const id  = this.decisionItem.id;
    const val = this.rejectForm.value;
    this.saving = true; this.errorMsg = null;
    this.svc.directionDecision(id, { approuve: false, commentaire: val.commentaire! })
      .subscribe({
        next: updated => {
          this.pending  = this.pending.filter(d => d.id !== id);
          this.history  = [updated, ...this.history];
          this.decisionItem = null;
          this.saving   = false;
          this.cdr.markForCheck();
        },
        error: () => { this.errorMsg = 'Erreur lors du refus.'; this.saving = false; this.cdr.markForCheck(); }
      });
  }

  hasErr(form: 'approve' | 'reject', field: string): boolean {
    const fg: FormGroup = form === 'approve' ? this.approveForm : this.rejectForm;
    const c = fg.get(field);
    return !!(c?.invalid && c?.touched);
  }

  // ── Helpers ──────────────────────────────────────
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
    const map: Record<string, string> = {
      'Médical':    '#EF4444', 'Immobilier': '#3B82F6',
      'Véhicule':   '#F59E0B', 'Éducation':  '#10B981',
      'Familial':   '#8B5CF6', 'Autre':      '#94A3B8'
    };
    return map[motif] ?? '#94A3B8';
  }

  setTab(t: Tab): void { this.activeTab = t; this.cdr.markForCheck(); }
}
