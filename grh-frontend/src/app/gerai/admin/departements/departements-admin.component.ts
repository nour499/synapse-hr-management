import {
  Component, OnInit, inject,
  ChangeDetectorRef, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';

import { Departement } from 'src/app/gerai/models/departement.model';
import { ConfirmModalComponent } from 'src/app/theme/shared/components/confirm-modal/confirm-modal.component';
import { PaginatorComponent } from 'src/app/theme/shared/components/paginator/paginator.component';
import { SkeletonRowsComponent } from 'src/app/theme/shared/components/skeleton-rows/skeleton-rows.component';

@Component({
  selector   : 'app-departements-admin',
  standalone : true,
  imports    : [CommonModule, ReactiveFormsModule, ConfirmModalComponent, PaginatorComponent, SkeletonRowsComponent],
  templateUrl: './departements-admin.component.html',
  styleUrls  : ['./departements-admin.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DepartementsAdminComponent implements OnInit {

  private http = inject(HttpClient);
  private fb   = inject(FormBuilder);
  private cdr  = inject(ChangeDetectorRef);

  departements : Departement[] = [];
  loading      = true;
  saving       = false;
  errorMsg     : string | null = null;

  search = '';

  editItem    : Departement | null = null;
  deleteTarget: Departement | null = null;
  isCreating   = false;

  form = this.fb.group({
    nom            : ['', [Validators.required, Validators.minLength(2)]],
    code           : ['', [Validators.required, Validators.minLength(2), Validators.maxLength(20)]],
    responsable    : ['', Validators.required],
    telephone      : ['', Validators.required],
    email          : ['', [Validators.required, Validators.email]],
    capacite       : [1,  [Validators.required, Validators.min(1)]],
    anneeCreation  : [new Date().getFullYear(), [Validators.required, Validators.min(1900)]],
    totalEmployes  : [0,  [Validators.required, Validators.min(0)]],
    description    : ['']
  });

  ngOnInit(): void {
    this.http.get<Departement[]>('/api/admin/departements')
      .pipe(catchError(() => of([])))
      .subscribe(list => {
        this.departements = list;
        this.loading = false;
        this.cdr.markForCheck();
      });
  }

  // ── Computed ─────────────────────────────────────
  page     = 1;
  readonly pageSize = 10;

  get paginated(): Departement[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filtered.slice(start, start + this.pageSize);
  }

  get filtered(): Departement[] {
    const q = this.search.toLowerCase().trim();
    if (!q) return this.departements;
    return this.departements.filter(d =>
      d.nom.toLowerCase().includes(q) ||
      (d.code ?? '').toLowerCase().includes(q) ||
      (d.responsable ?? '').toLowerCase().includes(q) ||
      (d.description ?? '').toLowerCase().includes(q)
    );
  }

  get kpi() {
    return {
      total        : this.departements.length,
      totalEmployes: this.departements.reduce((s, d) => s + d.totalEmployes, 0),
      capaciteTotal: this.departements.reduce((s, d) => s + d.capacite, 0),
      tauxOccupation: this.departements.length
        ? Math.round(
            this.departements.reduce((s, d) => s + d.totalEmployes, 0) /
            this.departements.reduce((s, d) => s + d.capacite, 0) * 100
          )
        : 0
    };
  }

  capacitePercent(d: Departement): number {
    if (!d.capacite) return 0;
    return Math.min(100, Math.round((d.totalEmployes / d.capacite) * 100));
  }

  initiales(nom: string | null | undefined): string {
    if (!nom) return '?';
    const p = nom.split(' ');
    return ((p[0]?.[0] ?? '') + (p[1]?.[0] ?? '')).toUpperCase();
  }

  // ── Create ───────────────────────────────────────
  openCreate(): void {
    this.isCreating = true;
    this.editItem   = null;
    this.errorMsg   = null;
    this.form.reset({
      nom: '', code: '', responsable: '', telephone: '', email: '',
      capacite: 1, anneeCreation: new Date().getFullYear(),
      totalEmployes: 0, description: ''
    });
    this.cdr.markForCheck();
  }

  // ── Edit ─────────────────────────────────────────
  openEdit(d: Departement): void {
    this.editItem   = d;
    this.isCreating = false;
    this.errorMsg   = null;
    this.form.patchValue({
      nom          : d.nom,
      code         : d.code,
      responsable  : d.responsable,
      telephone    : d.telephone,
      email        : d.email,
      capacite     : d.capacite,
      anneeCreation: d.anneeCreation,
      totalEmployes: d.totalEmployes,
      description  : d.description ?? ''
    });
    this.cdr.markForCheck();
  }

  closeForm(): void {
    this.editItem   = null;
    this.isCreating = false;
    this.cdr.markForCheck();
  }

  submitForm(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving   = true;
    this.errorMsg = null;

    const val = this.form.value;
    const payload: Partial<Departement> = {
      nom          : val.nom!,
      code         : val.code!,
      responsable  : val.responsable!,
      telephone    : val.telephone!,
      email        : val.email!,
      capacite     : Number(val.capacite),
      anneeCreation: Number(val.anneeCreation),
      totalEmployes: Number(val.totalEmployes),
      description  : val.description || undefined
    };

    if (this.isCreating) {
      this.http.post<Departement>('/api/admin/departements', payload)
        .pipe(catchError(() => of(null)))
        .subscribe(result => {
          if (!result) { this.errorMsg = 'Erreur lors de la création.'; this.saving = false; this.cdr.markForCheck(); return; }
          this.departements = [...this.departements, result];
          this.saving = false; this.isCreating = false;
          this.cdr.markForCheck();
        });
    } else {
      this.http.put<Departement>(`/api/admin/departements/${this.editItem!.id}`, payload)
        .pipe(catchError(() => of(null)))
        .subscribe(result => {
          if (!result) { this.errorMsg = 'Erreur lors de la sauvegarde.'; this.saving = false; this.cdr.markForCheck(); return; }
          const idx = this.departements.findIndex(d => d.id === this.editItem!.id);
          if (idx !== -1) this.departements = [...this.departements.slice(0, idx), result, ...this.departements.slice(idx + 1)];
          this.saving = false; this.editItem = null;
          this.cdr.markForCheck();
        });
    }
  }

  // ── Delete ───────────────────────────────────────
  askDelete(d: Departement): void { this.deleteTarget = d; this.cdr.markForCheck(); }
  cancelDelete(): void            { this.deleteTarget = null; this.cdr.markForCheck(); }

  confirmDelete(): void {
    if (!this.deleteTarget) return;
    const id = this.deleteTarget.id;
    this.deleteTarget = null;
    this.http.delete(`/api/admin/departements/${id}`)
      .pipe(catchError(() => of(null)))
      .subscribe(() => {
        this.departements = this.departements.filter(d => d.id !== id);
        this.cdr.markForCheck();
      });
  }

  get deleteMessage(): string {
    if (!this.deleteTarget) return '';
    const n = this.deleteTarget.totalEmployes ?? 0;
    return `Le département "${this.deleteTarget.nom}" (${n} employé${n > 1 ? 's' : ''}) sera supprimé définitivement.`;
  }

  setSearch(q: string): void { this.search = q; this.page = 1; this.cdr.markForCheck(); }

  hasError(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && c?.touched);
  }
}
