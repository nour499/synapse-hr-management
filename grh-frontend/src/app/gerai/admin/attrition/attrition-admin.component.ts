import {
  Component, OnInit, inject,
  ChangeDetectorRef, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { catchError, of } from 'rxjs';
import { AttritionService } from 'src/app/gerai/services/attrition.service';
import { ToastService } from 'src/app/gerai/services/toast.service';
import {
  AttritionPrediction, AttritionSummary, RiskLevel
} from 'src/app/gerai/models/attrition.model';

@Component({
  selector: 'app-attrition-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './attrition-admin.component.html',
  styleUrls: ['./attrition-admin.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AttritionAdminComponent implements OnInit {

  private svc   = inject(AttritionService);
  private toast = inject(ToastService);
  private cdr   = inject(ChangeDetectorRef);

  summary    : AttritionSummary | null = null;
  predictions: AttritionPrediction[]   = [];
  filtered   : AttritionPrediction[]   = [];
  selected   : AttritionPrediction | null = null;

  loading    = true;
  refreshing = false;

  filterRisk    = '';
  filterDept    = '';
  searchQuery   = '';
  sortField     = 'riskScore';
  sortDir: 'asc' | 'desc' = 'desc';

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    forkJoin({
      summary    : this.svc.getSummary().pipe(catchError(() => of(null))),
      predictions: this.svc.getPredictions().pipe(catchError(() => of([])))
    }).subscribe({
      next: ({ summary, predictions }) => {
        this.summary     = summary;
        this.predictions = predictions;
        this.applyFilters();
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  applyFilters(): void {
    let list = [...this.predictions];

    if (this.filterRisk) {
      list = list.filter(p => p.riskLevel === this.filterRisk);
    }
    if (this.filterDept) {
      list = list.filter(p => p.departement === this.filterDept);
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(p =>
        p.nom.toLowerCase().includes(q) || p.prenom.toLowerCase().includes(q) || p.poste.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      const va = (a as any)[this.sortField];
      const vb = (b as any)[this.sortField];
      const cmp = typeof va === 'string' ? va.localeCompare(vb) : (va as number) - (vb as number);
      return this.sortDir === 'asc' ? cmp : -cmp;
    });

    this.filtered = list;
  }

  toggleSort(field: string): void {
    if (this.sortField === field) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDir   = 'desc';
    }
    this.applyFilters();
  }

  openDetail(p: AttritionPrediction): void {
    this.selected = p;
  }

  closeDetail(): void {
    this.selected = null;
  }

  onRefresh(): void {
    this.refreshing = true;
    this.svc.refresh().subscribe({
      next: () => {
        this.toast.success('Scores recalculés avec succès.');
        this.load();
        this.refreshing = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.toast.error('Erreur lors du recalcul des scores.');
        this.refreshing = false;
        this.cdr.markForCheck();
      }
    });
  }

  get departments(): string[] {
    return [...new Set(this.predictions.map(p => p.departement))].sort();
  }

  riskClass(level: RiskLevel): string {
    return level === 'ELEVE' ? 'risk-high' : level === 'MOYEN' ? 'risk-mid' : 'risk-low';
  }

  riskLabel(level: RiskLevel): string {
    return level === 'ELEVE' ? 'Élevé' : level === 'MOYEN' ? 'Moyen' : 'Faible';
  }

  gaugeGradient(score: number): string {
    const pct = Math.min(score, 100);
    const color = score >= 70 ? '#EF4444' : score >= 40 ? '#F59E0B' : '#22C55E';
    return `conic-gradient(${color} 0% ${pct}%, #E2E8F0 ${pct}% 100%)`;
  }

  sortIcon(field: string): string {
    if (this.sortField !== field) return 'ti ti-arrows-sort';
    return this.sortDir === 'asc' ? 'ti ti-sort-ascending' : 'ti ti-sort-descending';
  }
}
