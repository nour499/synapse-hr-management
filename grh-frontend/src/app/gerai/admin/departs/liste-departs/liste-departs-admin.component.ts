import {
  Component, OnInit, inject,
  ChangeDetectorRef, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';

import {
  DepartEmploye, TypeDepart, StatutDepart,
  TYPE_DEPART_LABELS, TYPE_DEPART_ICONS, TYPE_DEPART_COLORS
} from 'src/app/gerai/models/depart.model';
import { Employe } from 'src/app/theme/shared/interfaces/employe';
import { ConfirmModalComponent } from 'src/app/theme/shared/components/confirm-modal/confirm-modal.component';
import { PaginatorComponent } from 'src/app/theme/shared/components/paginator/paginator.component';
import { SkeletonRowsComponent } from 'src/app/theme/shared/components/skeleton-rows/skeleton-rows.component';

@Component({
  selector   : 'app-liste-departs-admin',
  standalone : true,
  imports    : [CommonModule, ReactiveFormsModule, ConfirmModalComponent, PaginatorComponent, SkeletonRowsComponent],
  templateUrl: './liste-departs-admin.component.html',
  styleUrls  : ['./liste-departs-admin.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListeDepartsAdminComponent implements OnInit {

  private http   = inject(HttpClient);
  private router = inject(Router);
  private route  = inject(ActivatedRoute);
  private fb     = inject(FormBuilder);
  private cdr    = inject(ChangeDetectorRef);

  departs  : DepartEmploye[] = [];
  employes : Employe[]       = [];
  loading  = true;
  saving   = false;
  errorMsg : string | null   = null;

  // ── filters ────────────────────────────────────────
  filterStatut : StatutDepart | '' = '';
  filterType   : TypeDepart   | '' = '';
  search = '';

  // ── modal ───────────────────────────────────────────
  showModal   = false;
  isEditMode  = false;
  editId      : number | null = null;
  deleteTarget: DepartEmploye | null = null;

  // ── lookup maps ─────────────────────────────────────
  readonly typeLabels = TYPE_DEPART_LABELS;
  readonly typeIcons  = TYPE_DEPART_ICONS;
  readonly typeColors = TYPE_DEPART_COLORS;

  readonly allTypes: TypeDepart[]   = ['DEMISSION','LICENCIEMENT','RETRAITE','FIN_CONTRAT','MUTATION','DECES'];
  readonly allStatuts: StatutDepart[] = ['EN_COURS','VALIDE','ANNULE'];

  readonly statutLabels: Record<StatutDepart, string> = {
    EN_COURS: 'En cours', VALIDE: 'Validé', ANNULE: 'Annulé'
  };

  // ── form ────────────────────────────────────────────
  form = this.fb.group({
    employeId  : [null as number | null, Validators.required],
    dateDepart : ['', Validators.required],
    typeDepart : ['' as TypeDepart | '', Validators.required],
    raison     : ['', [Validators.required, Validators.minLength(5)]],
    statut     : ['EN_COURS' as StatutDepart, Validators.required],
    notes      : ['']
  });

  ngOnInit(): void {
    this.http.get<DepartEmploye[]>('/api/departs')
      .pipe(catchError(() => of([])))
      .subscribe(list => {
        this.departs = list;
        this.loading = false;
        // open edit modal if returning from detail page with ?edit=id
        const editId = this.route.snapshot.queryParamMap.get('edit');
        if (editId) {
          const target = list.find(d => d.id === Number(editId));
          if (target) this.openEdit(target);
          this.router.navigate([], { replaceUrl: true });
        }
        this.cdr.detectChanges();
      });

    this.http.get<Employe[]>('/api/employes')
      .pipe(catchError(() => of([])))
      .subscribe(list => { this.employes = list; this.cdr.markForCheck(); });
  }

  // ── computed list ────────────────────────────────────
  page     = 1;
  readonly pageSize = 10;

  get paginated(): DepartEmploye[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filtered.slice(start, start + this.pageSize);
  }

  get filtered(): DepartEmploye[] {
    const q = this.search.toLowerCase().trim();
    return this.departs.filter(d => {
      const matchSearch  = !q || d.employeNom.toLowerCase().includes(q) || d.raison.toLowerCase().includes(q);
      const matchStatut  = !this.filterStatut || d.statut === this.filterStatut;
      const matchType    = !this.filterType   || d.typeDepart === this.filterType;
      return matchSearch && matchStatut && matchType;
    });
  }

  get countByStatut() {
    return {
      EN_COURS: this.departs.filter(d => d.statut === 'EN_COURS').length,
      VALIDE  : this.departs.filter(d => d.statut === 'VALIDE').length,
      ANNULE  : this.departs.filter(d => d.statut === 'ANNULE').length
    };
  }

  // ── CRUD ────────────────────────────────────────────
  openCreate(): void {
    this.isEditMode = false;
    this.editId     = null;
    this.errorMsg   = null;
    this.form.reset({ statut: 'EN_COURS', typeDepart: '', employeId: null, dateDepart: '', raison: '', notes: '' });
    this.showModal  = true;
    this.cdr.markForCheck();
  }

  openEdit(d: DepartEmploye): void {
    this.isEditMode = true;
    this.editId     = d.id;
    this.errorMsg   = null;
    this.form.patchValue({
      employeId : d.employeId,
      dateDepart: d.dateDepart,
      typeDepart: d.typeDepart,
      raison    : d.raison,
      statut    : d.statut,
      notes     : d.notes ?? ''
    });
    this.showModal = true;
    this.cdr.markForCheck();
  }

  closeModal(): void { this.showModal = false; this.cdr.markForCheck(); }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving   = true;
    this.errorMsg = null;

    const val = this.form.value;
    const emp = this.employes.find(e => e.id === Number(val.employeId));
    const payload: Partial<DepartEmploye> = {
      employeId   : Number(val.employeId),
      employeNom  : emp ? `${emp.prenom} ${emp.nom}` : '',
      employePoste: emp?.poste,
      employePhoto: emp?.photo,
      employeDept : emp?.departement,
      dateDepart  : val.dateDepart!,
      typeDepart  : val.typeDepart as TypeDepart,
      raison      : val.raison!,
      statut      : val.statut as StatutDepart,
      notes       : val.notes ?? ''
    };

    const req = this.isEditMode
      ? this.http.put<DepartEmploye>(`/api/departs/${this.editId}`, payload)
      : this.http.post<DepartEmploye>('/api/departs', payload);

    req.pipe(catchError(() => of(null))).subscribe(result => {
      if (!result) {
        this.errorMsg = 'Erreur lors de l\'enregistrement.';
        this.saving   = false;
        this.cdr.markForCheck();
        return;
      }
      if (this.isEditMode) {
        const idx = this.departs.findIndex(d => d.id === this.editId);
        if (idx !== -1) this.departs[idx] = result;
      } else {
        this.departs = [result, ...this.departs];
      }
      this.saving    = false;
      this.showModal = false;
      this.cdr.markForCheck();
    });
  }

  askDelete(d: DepartEmploye): void { this.deleteTarget = d; this.cdr.markForCheck(); }
  cancelDelete(): void { this.deleteTarget = null; this.cdr.markForCheck(); }

  confirmDelete(): void {
    if (!this.deleteTarget) return;
    const id = this.deleteTarget.id;
    this.deleteTarget = null;
    this.http.delete(`/api/departs/${id}`)
      .pipe(catchError(() => of(null)))
      .subscribe(() => {
        this.departs = this.departs.filter(d => d.id !== id);
        this.cdr.markForCheck();
      });
  }

  get deleteMessage(): string {
    return this.deleteTarget
      ? `Vous êtes sur le point de supprimer le départ de ${this.deleteTarget.employeNom}. Cette action est irréversible.`
      : '';
  }

  // ── helpers ─────────────────────────────────────────
  hasError(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && c?.touched);
  }

  setFilterStatut(s: StatutDepart | ''): void { this.filterStatut = s; this.page = 1; this.cdr.markForCheck(); }
  setFilterType(t: TypeDepart | ''): void     { this.filterType   = t; this.page = 1; this.cdr.markForCheck(); }
  setSearch(q: string): void                  { this.search = q;        this.page = 1; this.cdr.markForCheck(); }

  initiales(nom: string): string {
    const parts = nom.split(' ');
    return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase();
  }
}
