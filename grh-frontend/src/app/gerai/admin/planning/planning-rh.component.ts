import {
  Component, OnInit, inject,
  ChangeDetectorRef, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';

import {
  DemandeCongeAdmin, TypeConge,
  TYPE_CONGE_COLORS, TYPE_CONGE_LABELS, TYPE_CONGE_ICONS
} from 'src/app/gerai/models/conge-admin.model';

export interface CellInfo {
  leave   : DemandeCongeAdmin;
  isStart : boolean;
  isEnd   : boolean;
  color   : string;
}

export interface EmployeeRow {
  id    : number;
  nom   : string;
  photo?: string;
  dept ?: string;
}

@Component({
  selector   : 'app-planning-rh',
  standalone : true,
  imports    : [CommonModule],
  templateUrl: './planning-rh.component.html',
  styleUrls  : ['./planning-rh.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlanningRhComponent implements OnInit {

  private http = inject(HttpClient);
  private cdr  = inject(ChangeDetectorRef);

  conges  : DemandeCongeAdmin[] = [];
  loading  = true;

  viewMode  : 'week' | 'month' = 'week';
  anchorDate = new Date();

  readonly typeColors = TYPE_CONGE_COLORS;
  readonly typeLabels = TYPE_CONGE_LABELS;
  readonly typeIcons  = TYPE_CONGE_ICONS;

  readonly allTypes: TypeConge[] = [
    'ANNUEL','MALADIE','RTT','SANS_SOLDE','MATERNITE','PATERNITE','EXCEPTIONNEL'
  ];

  ngOnInit(): void {
    this.http.get<DemandeCongeAdmin[]>('/api/conges/admin')
      .pipe(catchError(() => of([])))
      .subscribe(list => {
        this.conges  = list;
        this.loading = false;
        this.autoNavigateToLeaves();
        this.cdr.markForCheck();
      });
  }

  private autoNavigateToLeaves(): void {
    const today    = this.str(new Date());
    const approved = this.conges.filter(c => c.statut === 'APPROUVE');
    if (!approved.length) return;

    // If there's already an approved leave overlapping today, stay on today
    const hasLeaveToday = approved.some(c => c.dateDebut <= today && c.dateFin >= today);
    if (hasLeaveToday) return;

    // Prefer the nearest upcoming leave; fall back to the most recent past leave
    const upcoming = approved
      .filter(c => c.dateDebut >= today)
      .sort((a, b) => a.dateDebut.localeCompare(b.dateDebut));

    const past = approved
      .filter(c => c.dateFin < today)
      .sort((a, b) => b.dateFin.localeCompare(a.dateFin));

    const target = upcoming[0] ?? past[0];
    if (!target) return;

    this.anchorDate = new Date(target.dateDebut);
    this.viewMode   = 'month'; // month gives more context when navigating away from today
  }

  // ── View range ────────────────────────────────────
  get days(): Date[] {
    if (this.viewMode === 'week') {
      const start = this.weekStart(this.anchorDate);
      return Array.from({ length: 7 }, (_, i) => this.addDays(start, i));
    }
    const y = this.anchorDate.getFullYear();
    const m = this.anchorDate.getMonth();
    const count = new Date(y, m + 1, 0).getDate();
    return Array.from({ length: count }, (_, i) => new Date(y, m, i + 1));
  }

  get periodLabel(): string {
    const d = this.days;
    if (this.viewMode === 'week') {
      const s = d[0]; const e = d[6];
      if (s.getMonth() === e.getMonth())
        return `${s.getDate()} – ${e.getDate()} ${this.mois(s)} ${s.getFullYear()}`;
      return `${s.getDate()} ${this.mois(s)} – ${e.getDate()} ${this.mois(e)} ${e.getFullYear()}`;
    }
    return `${this.mois(this.anchorDate)} ${this.anchorDate.getFullYear()}`;
  }

  navigate(dir: -1 | 1): void {
    if (this.viewMode === 'week') {
      this.anchorDate = this.addDays(this.anchorDate, dir * 7);
    } else {
      const d = new Date(this.anchorDate);
      d.setMonth(d.getMonth() + dir);
      this.anchorDate = d;
    }
    this.cdr.markForCheck();
  }

  goToday(): void { this.anchorDate = new Date(); this.cdr.markForCheck(); }

  setViewMode(m: 'week' | 'month'): void { this.viewMode = m; this.cdr.markForCheck(); }

  // ── Employees ─────────────────────────────────────
  get employees(): EmployeeRow[] {
    const map = new Map<number, EmployeeRow>();
    // Only show employees who have at least one approved leave
    for (const c of this.conges.filter(c => c.statut === 'APPROUVE')) {
      if (!map.has(c.employeId))
        map.set(c.employeId, { id: c.employeId, nom: c.employeNom, photo: c.employePhoto, dept: c.departement });
    }
    return [...map.values()].sort((a, b) => a.nom.localeCompare(b.nom));
  }

  get hasLeavesInPeriod(): boolean {
    const ds = this.days;
    const s  = this.str(ds[0]);
    const e  = this.str(ds[ds.length - 1]);
    return this.conges.some(c => c.statut === 'APPROUVE' && c.dateDebut <= e && c.dateFin >= s);
  }

  // ── Cell ─────────────────────────────────────────
  getCellInfo(emp: EmployeeRow, day: Date): CellInfo | null {
    const ds = this.str(day);
    const leave = this.conges.find(c =>
      c.employeId === emp.id &&
      c.statut    === 'APPROUVE' &&
      c.dateDebut <= ds && c.dateFin >= ds
    );
    if (!leave) return null;
    return {
      leave,
      isStart: leave.dateDebut === ds,
      isEnd  : leave.dateFin   === ds,
      color  : this.typeColors[leave.typeConge]
    };
  }

  hasAnyLeave(emp: EmployeeRow): boolean {
    const days = this.days;
    const start = this.str(days[0]);
    const end   = this.str(days[days.length - 1]);
    return this.conges.some(c =>
      c.employeId === emp.id && c.statut === 'APPROUVE' &&
      c.dateDebut <= end && c.dateFin >= start
    );
  }

  // ── KPI ──────────────────────────────────────────
  get kpi() {
    const today = this.str(new Date());
    const ds = this.days;
    const s   = this.str(ds[0]);
    const e   = this.str(ds[ds.length - 1]);
    const approved = this.conges.filter(c => c.statut === 'APPROUVE');

    const absentToday = new Set(
      approved.filter(c => c.dateDebut <= today && c.dateFin >= today).map(c => c.employeId)
    ).size;

    const absentPeriod = new Set(
      approved.filter(c => c.dateDebut <= e && c.dateFin >= s).map(c => c.employeId)
    ).size;

    const enAttente = this.conges.filter(c => c.statut === 'EN_ATTENTE').length;

    return { absentToday, absentPeriod, enAttente, total: approved.length };
  }

  // ── Helpers ──────────────────────────────────────
  isToday(d: Date)   : boolean { return this.str(d) === this.str(new Date()); }
  isWeekend(d: Date) : boolean { return d.getDay() === 0 || d.getDay() === 6; }

  initiales(nom: string): string {
    const p = nom.split(' ');
    return ((p[0]?.[0] ?? '') + (p[1]?.[0] ?? '')).toUpperCase();
  }

  dayNum(d: Date)  : number { return d.getDate(); }
  dayName(d: Date) : string { return d.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', ''); }

  private weekStart(d: Date): Date {
    const r   = new Date(d);
    const dow = r.getDay();
    r.setDate(r.getDate() - (dow === 0 ? 6 : dow - 1));
    return r;
  }

  private addDays(d: Date, n: number): Date {
    const r = new Date(d); r.setDate(r.getDate() + n); return r;
  }

  private str(d: Date): string { return d.toISOString().split('T')[0]; }

  private mois(d: Date): string {
    return d.toLocaleDateString('fr-FR', { month: 'long' });
  }
}
