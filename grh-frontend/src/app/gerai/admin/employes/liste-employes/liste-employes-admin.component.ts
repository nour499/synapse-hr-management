import {
  Component, OnInit, inject,
  ChangeDetectorRef, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }  from '@angular/forms';
import { Router }       from '@angular/router';
import { HttpClient }   from '@angular/common/http';

import { Employe } from 'src/app/theme/shared/interfaces/employe';
import { ConfirmModalComponent } from 'src/app/theme/shared/components/confirm-modal/confirm-modal.component';
import { PaginatorComponent } from 'src/app/theme/shared/components/paginator/paginator.component';

const DEPT_COLORS: Record<string, string> = {
  'Informatique': '#3B82F6',
  'Data'        : '#8B5CF6',
  'Management'  : '#10B981',
  'Design'      : '#F59E0B',
  'Qualité'     : '#EF4444',
  'RH'          : '#EC4899',
  'Finance'     : '#06B6D4',
  'Marketing'   : '#F97316',
};

@Component({
  selector   : 'app-liste-employes-admin',
  standalone : true,
  imports    : [CommonModule, FormsModule, ConfirmModalComponent, PaginatorComponent],
  templateUrl: './liste-employes-admin.component.html',
  styleUrls  : ['./liste-employes-admin.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListeEmployesAdminComponent implements OnInit {

  private http    = inject(HttpClient);
  private router  = inject(Router);
  private cdr     = inject(ChangeDetectorRef);

  employes    : Employe[] = [];
  departments : string[]  = [];
  loading     = true;
  searchQuery  = '';
  filterDept   = '';
  deletingId   : number | null = null;
  deleteTarget : Employe | null = null;

  page     = 1;
  readonly pageSize = 10;

  get paginated(): Employe[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filtered.slice(start, start + this.pageSize);
  }

  ngOnInit(): void {
    this.loadEmployes();
    this.loadDepartments();
  }

  loadEmployes(): void {
    this.loading = true;
    this.http.get<Employe[]>('/api/employes').subscribe({
      next: data => {
        this.employes = data ?? [];
        this.loading  = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  loadDepartments(): void {
    this.http.get<{ id: number; name: string }[]>('/api/employes/departements').subscribe({
      next: data => {
        this.departments = (data ?? []).map(d => d.name).filter(Boolean);
        this.cdr.markForCheck();
      },
      error: () => {}
    });
  }

  // ── Filtering ───────────────────────────────────────────
  get filtered(): Employe[] {
    const q = this.searchQuery.toLowerCase().trim();
    return this.employes.filter(e => {
      const nom    = (e.nom    ?? '').toLowerCase();
      const prenom = (e.prenom ?? '').toLowerCase();
      const matchQ = !q ||
        nom.includes(q) ||
        prenom.includes(q) ||
        (e.email ?? '').toLowerCase().includes(q) ||
        (e.poste ?? '').toLowerCase().includes(q);
      const matchD = !this.filterDept || (e.departement ?? '') === this.filterDept;
      return matchQ && matchD;
    });
  }

  // ── Navigation ──────────────────────────────────────────
  addEmploye():             void { this.router.navigate(['/admin/employes/ajouter']); }
  editEmploye(id: number):  void { this.router.navigate(['/admin/employes', id, 'modifier']); }
  viewProfile(id: number):  void { this.router.navigate(['/admin/employes', id]); }

  // ── Delete ──────────────────────────────────────────────
  askDelete(e: Employe): void { this.deleteTarget = e; this.cdr.markForCheck(); }
  cancelDelete(): void        { this.deleteTarget = null; this.cdr.markForCheck(); }

  confirmDelete(): void {
    if (!this.deleteTarget) return;
    const id = this.deleteTarget.id;
    this.deletingId  = id;
    this.deleteTarget = null;
    this.cdr.markForCheck();

    this.http.delete(`/api/employes/${id}`).subscribe({
      next : () => { this.employes = this.employes.filter(e => e.id !== id); this.deletingId = null; this.cdr.markForCheck(); },
      error: () => { this.deletingId = null; this.cdr.markForCheck(); }
    });
  }

  get deleteMessage(): string {
    return this.deleteTarget
      ? `Voulez-vous vraiment supprimer ${this.deleteTarget.prenom} ${this.deleteTarget.nom} ? Cette action est irréversible.`
      : '';
  }

  // ── Helpers ─────────────────────────────────────────────
  deptColor(dept?: string): string {
    return DEPT_COLORS[dept ?? ''] ?? '#64748B';
  }

  initiales(e: Employe): string {
    return (((e.prenom ?? '')[0] ?? '') + ((e.nom ?? '')[0] ?? '')).toUpperCase();
  }

  trackById(_: number, e: Employe): number { return e.id; }
}
