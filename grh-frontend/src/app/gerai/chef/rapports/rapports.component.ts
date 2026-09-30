import { Component, OnInit, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { SharedModule }        from 'src/app/theme/shared/shared.module';
import { BreadcrumbComponent } from 'src/app/theme/shared/components/breadcrumbs/breadcrumbs.component';
import { RapportService }      from 'src/app/gerai/services/rapport-chef.service';
import { StatCard, RapportRow, RapportData } from 'src/app/theme/shared/interfaces/rapport';

type TabType   = 'CONGES' | 'FORMATIONS' | 'PROJETS' | 'PERFORMANCE';
type FormatType = 'PDF' | 'EXCEL';

@Component({
  selector: 'app-rapports',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule, BreadcrumbComponent],
  templateUrl: './rapports.component.html',
  styleUrls: ['./rapports.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RapportsComponent implements OnInit {

  private rapportService = inject(RapportService);
  private http           = inject(HttpClient);
  private cdr            = inject(ChangeDetectorRef);

  activeTab  : TabType = 'CONGES';
  loading    = false;
  error      : string | null = null;
  isExporting = false;

  // ── Form state ────────────────────────────────────
  formType  : TabType    = 'CONGES';
  formFormat: FormatType = 'PDF';

  stats : StatCard[]   = [];
  rows  : RapportRow[] = [];

  tabs = [
    { value: 'CONGES',      label: 'Congés',      icon: 'ti ti-calendar-off' },
    { value: 'FORMATIONS',  label: 'Formations',  icon: 'ti ti-school'        },
    { value: 'PROJETS',     label: 'Projets',     icon: 'ti ti-layout-kanban' },
    { value: 'PERFORMANCE', label: 'Performance', icon: 'ti ti-chart-bar'     }
  ];

  private readonly columnsMap: Record<TabType, string[]> = {
    CONGES:      ['employe', 'type', 'debut', 'fin', 'jours', 'statut'],
    FORMATIONS:  ['employe', 'formation', 'duree', 'cout', 'statut'],
    PROJETS:     ['projet', 'priorite', 'debut', 'fin', 'equipe', 'taches', 'progression', 'statut'],
    PERFORMANCE: ['employe', 'departement', 'absences', 'score', 'appreciation']
  };

  readonly columnLabels: Record<string, string> = {
    employe: 'Employé', type: 'Type', debut: 'Début', fin: 'Fin',
    jours: 'Jours', statut: 'Statut', formation: 'Formation',
    duree: 'Durée', cout: 'Coût', departement: 'Département',
    projet: 'Projet', priorite: 'Priorité', equipe: 'Équipe',
    taches: 'Tâches', progression: 'Progression',
    absences: 'Absences', score: 'Score', appreciation: 'Appréciation'
  };

  ngOnInit(): void {
    this.loadTab(this.activeTab);
  }

  // ── Form actions ──────────────────────────────────
  generateReport(): void {
    this.activeTab = this.formType;
    this.loadTab(this.formType);
  }

  exportReport(): void {
    if (this.formFormat === 'PDF') {
      this.exportPdf();
    } else {
      this.exportExcel();
    }
  }

  resetForm(): void {
    this.formType   = 'CONGES';
    this.formFormat = 'PDF';
    this.activeTab  = 'CONGES';
    this.loadTab('CONGES');
  }

  // ── Tab switch ────────────────────────────────────
  switchTab(tab: TabType): void {
    if (tab === this.activeTab) return;
    this.activeTab = tab;
    this.formType  = tab;
    this.loadTab(tab);
  }

  // ── Data loading ──────────────────────────────────
  private loadTab(tab: TabType): void {
    this.loading = true;
    this.error   = null;
    this.stats   = [];
    this.rows    = [];

    this.rapportService.getRapport(tab).subscribe({
      next: (data: RapportData) => {
        this.stats   = data.stats;
        this.rows    = data.rows;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.error   = 'Erreur lors du chargement du rapport.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  // ── Computed ──────────────────────────────────────
  get currentColumns(): string[] {
    return this.columnsMap[this.activeTab];
  }

  get currentTabLabel(): string {
    return this.tabs.find(t => t.value === this.activeTab)?.label ?? '';
  }

  // ── Export PDF ────────────────────────────────────
  exportPdf(): void {
    this.isExporting = true;
    const tab = this.activeTab.toLowerCase();
    this.http.get(`/api/rapports/export/${tab}`, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const url  = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href     = url;
        link.download = `rapport-${tab}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.isExporting = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.error       = 'Export PDF indisponible.';
        this.isExporting = false;
        this.cdr.markForCheck();
      }
    });
  }

  // ── Export Excel (JasperReports) ─────────────────
  exportExcel(): void {
    this.isExporting = true;
    const tab = this.activeTab.toLowerCase();
    this.http.get(`/api/rapports/export-excel/${tab}`, { responseType: 'blob' }).subscribe({
      next: blob => {
        const url  = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url; link.download = `rapport-${tab}.xlsx`;
        link.click(); window.URL.revokeObjectURL(url);
        this.isExporting = false; this.cdr.markForCheck();
      },
      error: () => {
        this.error = 'Export Excel indisponible pour ce type de rapport.';
        this.isExporting = false; this.cdr.markForCheck();
      }
    });
  }

  // ── Display helpers ───────────────────────────────
  statutClass(val: string | number | undefined): string {
    const s = String(val ?? '');
    if (['Validé', 'Approuvé', 'Complétée', 'Terminé', 'Excellent'].includes(s)) return 'badge-success';
    if (['En cours', 'Approuvé chef', 'Validé chef', 'Planifié', 'Très bien', 'Normale', 'Faible'].includes(s)) return 'badge-primary';
    if (['En attente', 'En pause', 'Bien', 'Haute'].includes(s)) return 'badge-warning';
    if (['Refusé', 'Annulé', 'En retard', 'Critique'].includes(s)) return 'badge-danger';
    return '';
  }
}
