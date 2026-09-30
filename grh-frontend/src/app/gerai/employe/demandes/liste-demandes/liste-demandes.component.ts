import { Component, OnInit, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { SharedModule } from 'src/app/theme/shared/shared.module';
import { CardComponent } from 'src/app/theme/shared/components/card/card.component';
import { DemandeService } from 'src/app/gerai/services/demande.service';
import { Demande, TYPES_DEMANDE_CONFIG } from 'src/app/gerai/models/demande.model';

interface CalendarDay {
  date: string | null;
  dayNum: number;
  absences: { nom: string; type: string; statut: string }[];
  isToday: boolean;
  isWeekend: boolean;
}

@Component({
  selector: 'app-liste-demandes',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule, CardComponent],
  templateUrl: './liste-demandes.component.html',
  styleUrls: ['./liste-demandes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListeDemandesComponent implements OnInit {

  private router         = inject(Router);
  private cdr            = inject(ChangeDetectorRef);
  private demandeService = inject(DemandeService);

  activeTab: 'demandes' | 'calendrier' = 'demandes';

  demandes        : Demande[] = [];
  demandesFiltrees: Demande[] = [];

  // ── Calendar ───────────────────────────────────────
  calYear  = new Date().getFullYear();
  calMonth = new Date().getMonth(); // 0-indexed
  calDays  : CalendarDay[] = [];

  readonly MONTH_NAMES = ['Janvier','Février','Mars','Avril','Mai','Juin',
                          'Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
  readonly DAY_LABELS = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];

  loading = true;
  error   = false;

  // ── Stats ──────────────────────────────────────────
  totalDemandes = 0;
  enAttente     = 0;
  validees      = 0;
  refusees      = 0;

  // ── Filters ────────────────────────────────────────
  searchTerm     = '';
  selectedType   = '';
  selectedStatut = '';

  // ── Sort ───────────────────────────────────────────
  sortColumn    = 'dateCreation';
  sortDirection : 'asc' | 'desc' = 'desc';

  // ── Pagination ─────────────────────────────────────
  currentPage = 1;
  pageSize    = 5;
  totalPages  = 1;

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading = true;
    this.demandeService.getDemandes().subscribe({
      next: demandes => {
        this.demandes = demandes;
        this.calculateStats();
        this.filterDemandes();
        this.loading = false;
        this.buildCalendarDays();
        this.cdr.markForCheck();
      },
      error: () => {
        this.error   = true;
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  calculateStats(): void {
    this.totalDemandes = this.demandes.length;
    this.enAttente     = this.demandes.filter(d => d.statut === 'EN_ATTENTE').length;
    this.validees      = this.demandes.filter(d =>
      d.statut === 'VALIDEE' || d.statut === 'VALIDEE_CHEF' || d.statut === 'VALIDEE_RH'
    ).length;
    this.refusees      = this.demandes.filter(d => d.statut === 'REJETEE').length;
  }

  filterDemandes(): void {
    this.demandesFiltrees = this.demandes.filter(d => {
      const matchSearch  = !this.searchTerm   ||
        (d.typeLabel ?? d.type).toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        d.id.toString().includes(this.searchTerm);
      const matchType    = !this.selectedType   || d.type   === this.selectedType;
      const matchStatut  = !this.selectedStatut || d.statut === this.selectedStatut;
      return matchSearch && matchType && matchStatut;
    });
    this.sortBy(this.sortColumn, false);
    this.updatePagination();
  }

  resetFilters(): void {
    this.searchTerm     = '';
    this.selectedType   = '';
    this.selectedStatut = '';
    this.filterDemandes();
  }

  refresh(): void {
    this.load();
  }

  sortBy(column: string, toggle = true): void {
    if (toggle) {
      this.sortDirection = this.sortColumn === column && this.sortDirection === 'asc' ? 'desc' : 'asc';
    }
    this.sortColumn = column;
    this.demandesFiltrees.sort((a, b) => {
      const va = (a as any)[column] ?? '';
      const vb = (b as any)[column] ?? '';
      if (va < vb) return this.sortDirection === 'asc' ? -1 :  1;
      if (va > vb) return this.sortDirection === 'asc' ?  1 : -1;
      return 0;
    });
  }

  nouvelleDemande(): void { this.router.navigate(['/employe/demandes/deposer']); }

  // ── Calendar ────────────────────────────────────────
  loadCalendar(): void {
    this.buildCalendarDays();
    this.cdr.markForCheck();
  }

  buildCalendarDays(): void {
    const today    = new Date();
    const firstDay = new Date(this.calYear, this.calMonth, 1);
    const lastDay  = new Date(this.calYear, this.calMonth + 1, 0);
    const days: CalendarDay[] = [];

    // Demandes with dates that overlap the displayed month
    const myLeaves = this.demandes.filter(d =>
      d.dateDebut && d.dateFin &&
      (d.type === 'CONGE' || d.type === 'MALADIE') &&
      d.statut !== 'REJETEE'
    );

    // Leading empty cells (Mon=0 start)
    let startDow = firstDay.getDay();
    startDow = startDow === 0 ? 6 : startDow - 1;
    for (let i = 0; i < startDow; i++) {
      days.push({ date: null, dayNum: 0, absences: [], isToday: false, isWeekend: false });
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dateStr = `${this.calYear}-${String(this.calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dow = new Date(this.calYear, this.calMonth, d).getDay();
      const isToday = today.getFullYear() === this.calYear && today.getMonth() === this.calMonth && today.getDate() === d;
      days.push({
        date: dateStr,
        dayNum: d,
        absences: myLeaves
          .filter(a => a.dateDebut! <= dateStr && a.dateFin! >= dateStr)
          .map(a => ({ nom: 'Moi', type: a.type, statut: a.statut })),
        isToday,
        isWeekend: dow === 0 || dow === 6
      });
    }
    this.calDays = days;
  }

  prevMonth(): void {
    if (this.calMonth === 0) { this.calMonth = 11; this.calYear--; }
    else this.calMonth--;
    this.buildCalendarDays();
    this.cdr.markForCheck();
  }

  nextMonth(): void {
    if (this.calMonth === 11) { this.calMonth = 0; this.calYear++; }
    else this.calMonth++;
    this.buildCalendarDays();
    this.cdr.markForCheck();
  }

  setTab(tab: 'demandes' | 'calendrier'): void {
    this.activeTab = tab;
    this.cdr.markForCheck();
  }

  voirDetail(id: number): void { this.router.navigate(['/employe/demandes', id]); }

  annulerDemande(id: number): void {
    if (!confirm('Voulez-vous vraiment annuler cette demande ?')) return;
    this.demandeService.annulerDemande(id).subscribe({
      next: () => {
        this.demandes = this.demandes.filter(d => d.id !== id);
        this.calculateStats();
        this.filterDemandes();
        this.cdr.markForCheck();
      },
      error: () => { /* handler already returns 400 if not cancellable */ }
    });
  }

  updatePagination(): void {
    this.totalPages  = Math.ceil(this.demandesFiltrees.length / this.pageSize) || 1;
    this.currentPage = 1;
  }

  get demandesPage(): Demande[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.demandesFiltrees.slice(start, start + this.pageSize);
  }

  nextPage(): void { if (this.currentPage < this.totalPages) this.currentPage++; }
  prevPage(): void { if (this.currentPage > 1) this.currentPage--; }
  goToPage(p: number): void { if (p >= 1 && p <= this.totalPages) this.currentPage = p; }

  // ── Display helpers ────────────────────────────────
  typeLabel(type: string): string {
    return TYPES_DEMANDE_CONFIG.find(c => c.type === type)?.label ?? type;
  }

  typeIcon(type: string): string {
    return TYPES_DEMANDE_CONFIG.find(c => c.type === type)?.icon ?? 'ti ti-file';
  }

  typeColor(type: string): string {
    return TYPES_DEMANDE_CONFIG.find(c => c.type === type)?.color ?? '#64748B';
  }

  private static readonly CHIP_MAP: Record<string, {cls: string; icon: string; label: string}> = {
    EN_ATTENTE   : { cls: 'sc-pending',   icon: 'ti ti-clock',        label: 'En attente' },
    VALIDEE_CHEF : { cls: 'sc-chef',      icon: 'ti ti-circle-check', label: 'Validée chef' },
    VALIDEE_RH   : { cls: 'sc-approved',  icon: 'ti ti-checks',       label: 'Approuvée RH' },
    VALIDEE      : { cls: 'sc-approved',  icon: 'ti ti-checks',       label: 'Validée' },
    REJETEE      : { cls: 'sc-rejected',  icon: 'ti ti-circle-x',     label: 'Rejetée' },
    ANNULEE      : { cls: 'sc-cancelled', icon: 'ti ti-ban',          label: 'Annulée' },
  };

  statutChip(statut: string) {
    return ListeDemandesComponent.CHIP_MAP[statut]
      ?? { cls: 'sc-cancelled', icon: 'ti ti-dots', label: statut };
  }

  canCancel(d: Demande): boolean { return d.statut === 'EN_ATTENTE'; }
}
