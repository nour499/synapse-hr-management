import {
  Component, OnInit, inject,
  ChangeDetectorRef, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import { TeamAbsence } from 'src/app/gerai/models/conge.model';

interface DayHeader {
  day: number;
  dayName: string;
  isWeekend: boolean;
  isToday: boolean;
}

interface GanttBar {
  type: TeamAbsence['type'];
  colStart: number;
  span: number;
  tooltip: string;
  rawStart: string;
  rawEnd: string;
}

interface GanttRow {
  employeId: string;
  nom: string;
  prenom: string;
  bars: GanttBar[];
}

const MONTH_NAMES = [
  'Janvier','Février','Mars','Avril','Mai','Juin',
  'Juillet','Août','Septembre','Octobre','Novembre','Décembre'
];

const DAY_SHORT = ['Di','Lu','Ma','Me','Je','Ve','Sa'];

const TYPE_META: Record<string, { label: string; color: string; light: string }> = {
  ANNUEL:     { label: 'Congé annuel',  color: '#3B82F6', light: 'rgba(59,130,246,.15)' },
  MALADIE:    { label: 'Maladie',       color: '#EF4444', light: 'rgba(239,68,68,.15)'  },
  RTT:        { label: 'RTT',           color: '#F59E0B', light: 'rgba(245,158,11,.15)' },
  SANS_SOLDE: { label: 'Sans solde',    color: '#6B7280', light: 'rgba(107,114,128,.15)'}
};

@Component({
  selector: 'app-planning-conges',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './planning-conges.component.html',
  styleUrls: ['./planning-conges.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlanningCongesComponent implements OnInit {

  private http = inject(HttpClient);
  private cdr  = inject(ChangeDetectorRef);

  year  = new Date().getFullYear();
  month = new Date().getMonth() + 1;

  loading    = true;
  dayHeaders : DayHeader[] = [];
  rows       : GanttRow[]  = [];

  readonly CELL = 36;
  readonly typeMeta = TYPE_META;
  readonly typeKeys = Object.keys(TYPE_META);

  ngOnInit(): void { this.load(); }

  // ── Navigation ──────────────────────────────────────
  prevMonth(): void {
    if (this.month === 1) { this.month = 12; this.year--; }
    else this.month--;
    this.load();
  }

  nextMonth(): void {
    if (this.month === 12) { this.month = 1; this.year++; }
    else this.month++;
    this.load();
  }

  // ── Data ────────────────────────────────────────────
  load(): void {
    this.loading = true;
    const daysInMonth = new Date(this.year, this.month, 0).getDate();
    const pad   = (n: number) => String(n).padStart(2, '0');
    const start = `${this.year}-${pad(this.month)}-01`;
    const end   = `${this.year}-${pad(this.month)}-${pad(daysInMonth)}`;

    this.dayHeaders = this.buildHeaders(daysInMonth);

    this.http.get<TeamAbsence[]>(
      `/api/conges/equipe?dateDebut=${start}&dateFin=${end}`
    )
    .pipe(catchError(() => of([])))
    .subscribe(absences => {
      this.rows    = this.buildRows(absences, daysInMonth);
      this.loading = false;
      this.cdr.markForCheck();
    });
  }

  private buildHeaders(daysInMonth: number): DayHeader[] {
    const today = new Date();
    return Array.from({ length: daysInMonth }, (_, i) => {
      const d   = new Date(this.year, this.month - 1, i + 1);
      const dow = d.getDay();
      return {
        day: i + 1,
        dayName: DAY_SHORT[dow],
        isWeekend: dow === 0 || dow === 6,
        isToday: d.getFullYear() === today.getFullYear()
               && d.getMonth()    === today.getMonth()
               && d.getDate()     === today.getDate()
      };
    });
  }

  private buildRows(absences: TeamAbsence[], daysInMonth: number): GanttRow[] {
    const monthStart = new Date(this.year, this.month - 1, 1);
    const monthEnd   = new Date(this.year, this.month - 1, daysInMonth);

    const map = new Map<string, GanttRow>();

    for (const a of absences) {
      const absStart = new Date(a.dateDebut);
      const absEnd   = new Date(a.dateFin);

      const cs = absStart < monthStart ? monthStart : absStart;
      const ce = absEnd   > monthEnd   ? monthEnd   : absEnd;
      if (cs > monthEnd || ce < monthStart) continue;

      if (!map.has(a.employeId)) {
        map.set(a.employeId, { employeId: a.employeId, nom: a.nom, prenom: a.prenom, bars: [] });
      }

      const colStart = cs.getDate() - 1;
      const span     = ce.getDate() - cs.getDate() + 1;
      const fmt      = (s: string) => new Date(s).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });

      map.get(a.employeId)!.bars.push({
        type: a.type, colStart, span,
        tooltip: `${a.prenom} ${a.nom} — ${TYPE_META[a.type]?.label ?? a.type} (${fmt(a.dateDebut)} → ${fmt(a.dateFin)})`,
        rawStart: a.dateDebut, rawEnd: a.dateFin
      });
    }

    return Array.from(map.values()).sort((a, b) => a.nom.localeCompare(b.nom));
  }

  // ── Template helpers ────────────────────────────────
  get monthLabel(): string { return `${MONTH_NAMES[this.month - 1]} ${this.year}`; }
  get totalWidth(): string { return `${this.dayHeaders.length * this.CELL}px`; }

  barLeft(bar: GanttBar):  string { return `${bar.colStart * this.CELL + 2}px`; }
  barWidth(bar: GanttBar): string { return `${bar.span * this.CELL - 6}px`;     }
  barColor(type: string):  string { return TYPE_META[type]?.color ?? '#6B7280'; }

  absenceCount(): number { return this.rows.reduce((s, r) => s + r.bars.length, 0); }
  peakDay(): number {
    const counts = new Array(this.dayHeaders.length).fill(0);
    for (const row of this.rows) {
      for (const bar of row.bars) {
        for (let i = bar.colStart; i < bar.colStart + bar.span; i++) {
          if (i < counts.length) counts[i]++;
        }
      }
    }
    return Math.max(...counts);
  }
}
