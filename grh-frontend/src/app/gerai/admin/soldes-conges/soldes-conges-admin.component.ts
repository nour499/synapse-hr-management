import {
  Component, OnInit, inject,
  ChangeDetectorRef, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';

import { SoldeCongeAdmin } from 'src/app/gerai/models/solde-conge-admin.model';
import { Employe } from 'src/app/theme/shared/interfaces/employe';
import { ConfirmModalComponent } from 'src/app/theme/shared/components/confirm-modal/confirm-modal.component';
import { PaginatorComponent } from 'src/app/theme/shared/components/paginator/paginator.component';
import { SkeletonRowsComponent } from 'src/app/theme/shared/components/skeleton-rows/skeleton-rows.component';

@Component({
  selector   : 'app-soldes-conges-admin',
  standalone : true,
  imports    : [CommonModule, ReactiveFormsModule, ConfirmModalComponent, PaginatorComponent, SkeletonRowsComponent],
  templateUrl: './soldes-conges-admin.component.html',
  styleUrls  : ['./soldes-conges-admin.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SoldesCongesAdminComponent implements OnInit {

  private http = inject(HttpClient);
  private fb   = inject(FormBuilder);
  private cdr  = inject(ChangeDetectorRef);

  soldes   : SoldeCongeAdmin[] = [];
  employes : Employe[] = [];
  loading  = true;
  saving   = false;
  errorMsg : string | null = null;

  search = '';

  editItem     : SoldeCongeAdmin | null = null;
  deleteTarget : SoldeCongeAdmin | null = null;
  showAddModal = false;
  addSaving    = false;
  addErrorMsg  : string | null = null;

  form = this.fb.group({
    soldePrecedent : [0, [Validators.required, Validators.min(0)]],
    soldeTotal     : [0, [Validators.required, Validators.min(0)]],
    reportSolde    : [0, [Validators.required, Validators.min(0)]],
    soldeActuel    : [0, [Validators.required, Validators.min(0)]],
    congesUtilises : [0, [Validators.required, Validators.min(0)]],
    congesAcceptes : [0, [Validators.required, Validators.min(0)]],
    congesRejetes  : [0, [Validators.required, Validators.min(0)]],
    congesExpires  : [0, [Validators.required, Validators.min(0)]]
  });

  addForm = this.fb.group({
    employeId     : [null as number | null, Validators.required],
    soldePrecedent: [0,  [Validators.required, Validators.min(0)]],
    soldeTotal    : [30, [Validators.required, Validators.min(0)]],
    reportSolde   : [0,  [Validators.required, Validators.min(0)]],
    soldeActuel   : [30, [Validators.required, Validators.min(0)]],
    congesUtilises: [0,  [Validators.required, Validators.min(0)]],
    congesAcceptes: [0,  [Validators.required, Validators.min(0)]],
    congesRejetes : [0,  [Validators.required, Validators.min(0)]],
    congesExpires : [0,  [Validators.required, Validators.min(0)]]
  });

  ngOnInit(): void {
    this.http.get<SoldeCongeAdmin[]>('/api/admin/soldes-conges')
      .pipe(catchError(() => of([])))
      .subscribe(list => { this.soldes = list; this.loading = false; this.cdr.markForCheck(); });

    this.http.get<Employe[]>('/api/employes')
      .pipe(catchError(() => of([])))
      .subscribe(list => { this.employes = list; this.cdr.markForCheck(); });
  }

  page     = 1;
  readonly pageSize = 10;

  get paginated(): SoldeCongeAdmin[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filtered.slice(start, start + this.pageSize);
  }

  get filtered(): SoldeCongeAdmin[] {
    const q = this.search.toLowerCase().trim();
    if (!q) return this.soldes;
    return this.soldes.filter(s =>
      s.employeNom.toLowerCase().includes(q) ||
      (s.departement ?? '').toLowerCase().includes(q) ||
      (s.poste ?? '').toLowerCase().includes(q)
    );
  }

  get totals() {
    return {
      soldeActuel   : this.soldes.reduce((a, s) => a + s.soldeActuel,    0),
      congesUtilises: this.soldes.reduce((a, s) => a + s.congesUtilises, 0),
      congesAcceptes: this.soldes.reduce((a, s) => a + s.congesAcceptes, 0),
      congesRejetes : this.soldes.reduce((a, s) => a + s.congesRejetes,  0),
      congesExpires : this.soldes.reduce((a, s) => a + s.congesExpires,  0)
    };
  }

  openEdit(s: SoldeCongeAdmin): void {
    this.editItem = s;
    this.errorMsg = null;
    this.form.patchValue({
      soldePrecedent : s.soldePrecedent,
      soldeTotal     : s.soldeTotal,
      reportSolde    : s.reportSolde,
      soldeActuel    : s.soldeActuel,
      congesUtilises : s.congesUtilises,
      congesAcceptes : s.congesAcceptes,
      congesRejetes  : s.congesRejetes,
      congesExpires  : s.congesExpires
    });
    this.cdr.markForCheck();
  }

  closeEdit(): void { this.editItem = null; this.cdr.markForCheck(); }

  submitEdit(): void {
    if (this.form.invalid || !this.editItem) { this.form.markAllAsTouched(); return; }
    this.saving   = true;
    this.errorMsg = null;

    const val     = this.form.value;
    const payload : Partial<SoldeCongeAdmin> = {
      soldePrecedent : Number(val.soldePrecedent),
      soldeTotal     : Number(val.soldeTotal),
      reportSolde    : Number(val.reportSolde),
      soldeActuel    : Number(val.soldeActuel),
      congesUtilises : Number(val.congesUtilises),
      congesAcceptes : Number(val.congesAcceptes),
      congesRejetes  : Number(val.congesRejetes),
      congesExpires  : Number(val.congesExpires)
    };

    this.http.put<SoldeCongeAdmin>(
      `/api/admin/soldes-conges/${this.editItem.id}`, payload
    ).pipe(catchError(() => of(null))).subscribe(result => {
      if (!result) {
        this.errorMsg = 'Erreur lors de la sauvegarde.';
        this.saving   = false;
        this.cdr.markForCheck();
        return;
      }
      const idx = this.soldes.findIndex(s => s.id === this.editItem!.id);
      if (idx !== -1) this.soldes[idx] = result;
      this.saving   = false;
      this.editItem = null;
      this.cdr.markForCheck();
    });
  }

  askDelete(s: SoldeCongeAdmin): void { this.deleteTarget = s; this.cdr.markForCheck(); }
  cancelDelete(): void               { this.deleteTarget = null; this.cdr.markForCheck(); }

  confirmDelete(): void {
    if (!this.deleteTarget) return;
    const id = this.deleteTarget.id;
    this.deleteTarget = null;
    this.http.delete(`/api/admin/soldes-conges/${id}`)
      .pipe(catchError(() => of(null)))
      .subscribe(() => { this.soldes = this.soldes.filter(s => s.id !== id); this.cdr.markForCheck(); });
  }

  get deleteMessage(): string {
    return this.deleteTarget
      ? `Vous êtes sur le point de supprimer le solde de congé de ${this.deleteTarget.employeNom}. Cette action est irréversible.`
      : '';
  }

  setSearch(q: string): void { this.search = q; this.page = 1; this.cdr.markForCheck(); }

  hasError(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && c?.touched);
  }

  hasAddError(field: string): boolean {
    const c = this.addForm.get(field);
    return !!(c?.invalid && c?.touched);
  }

  openAdd(): void {
    this.showAddModal = true;
    this.addErrorMsg  = null;
    this.addForm.reset({
      employeId: null, soldePrecedent: 0, soldeTotal: 30,
      reportSolde: 0,  soldeActuel: 30,  congesUtilises: 0,
      congesAcceptes: 0, congesRejetes: 0, congesExpires: 0
    });
    this.cdr.markForCheck();
  }

  closeAdd(): void { this.showAddModal = false; this.cdr.markForCheck(); }

  submitAdd(): void {
    if (this.addForm.invalid) { this.addForm.markAllAsTouched(); return; }
    const val = this.addForm.value;
    const emp = this.employes.find(e => e.id === Number(val.employeId));
    if (!emp) return;

    const payload = {
      employeNom    : `${emp.prenom} ${emp.nom}`.trim(),
      departement   : emp.departement ?? null,
      poste         : emp.poste ?? null,
      soldePrecedent: Number(val.soldePrecedent),
      soldeTotal    : Number(val.soldeTotal),
      reportSolde   : Number(val.reportSolde),
      soldeActuel   : Number(val.soldeActuel),
      congesUtilises: Number(val.congesUtilises),
      congesAcceptes: Number(val.congesAcceptes),
      congesRejetes : Number(val.congesRejetes),
      congesExpires : Number(val.congesExpires)
    };

    this.addSaving = true;
    this.http.post<SoldeCongeAdmin>('/api/admin/soldes-conges', payload)
      .pipe(catchError(() => of(null)))
      .subscribe(result => {
        this.addSaving = false;
        if (!result) {
          this.addErrorMsg = 'Erreur lors de la création.';
          this.cdr.markForCheck();
          return;
        }
        this.soldes      = [...this.soldes, result];
        this.showAddModal = false;
        this.cdr.markForCheck();
      });
  }

  initiales(nom: string): string {
    const p = nom.split(' ');
    return ((p[0]?.[0] ?? '') + (p[1]?.[0] ?? '')).toUpperCase();
  }

  usagePercent(s: SoldeCongeAdmin): number {
    if (!s.soldeTotal) return 0;
    return Math.min(100, Math.round((s.congesUtilises / s.soldeTotal) * 100));
  }
}
