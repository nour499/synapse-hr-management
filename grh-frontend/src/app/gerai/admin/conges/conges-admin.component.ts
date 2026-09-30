import {
  Component, OnInit, inject,
  ChangeDetectorRef, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';

import {
  DemandeCongeAdmin, TypeConge, StatutCongeAdmin, DureeType,
  TYPE_CONGE_LABELS, TYPE_CONGE_ICONS, TYPE_CONGE_COLORS,
  DUREE_TYPE_LABELS, TYPE_CONGE_GROUPS, HALF_SALARY_TYPES
} from 'src/app/gerai/models/conge-admin.model';
import { ConfirmModalComponent } from 'src/app/theme/shared/components/confirm-modal/confirm-modal.component';
import { PaginatorComponent } from 'src/app/theme/shared/components/paginator/paginator.component';
import { SkeletonRowsComponent } from 'src/app/theme/shared/components/skeleton-rows/skeleton-rows.component';

@Component({
  selector   : 'app-conges-admin',
  standalone : true,
  imports    : [CommonModule, ReactiveFormsModule, ConfirmModalComponent, PaginatorComponent, SkeletonRowsComponent],
  templateUrl: './conges-admin.component.html',
  styleUrls  : ['./conges-admin.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CongesAdminComponent implements OnInit {

  private http = inject(HttpClient);
  private fb   = inject(FormBuilder);
  private cdr  = inject(ChangeDetectorRef);

  demandes : DemandeCongeAdmin[] = [];
  loading  = true;
  saving   = false;
  errorMsg : string | null = null;

  // ── Filters ──────────────────────────────────────
  search      = '';
  filterStatut: StatutCongeAdmin | '' = '';
  filterType  : TypeConge        | '' = '';

  // ── Panels ───────────────────────────────────────
  detailItem     : DemandeCongeAdmin | null = null;
  editItem       : DemandeCongeAdmin | null = null;
  deleteTarget   : DemandeCongeAdmin | null = null;
  medDecisionItem: DemandeCongeAdmin | null = null;
  medDecisionApprove = true;

  // ── Lookup maps ──────────────────────────────────
  readonly typeLabels      = TYPE_CONGE_LABELS;
  readonly typeIcons       = TYPE_CONGE_ICONS;
  readonly typeColors      = TYPE_CONGE_COLORS;
  readonly dureeLabels     = DUREE_TYPE_LABELS;
  readonly typeGroups      = TYPE_CONGE_GROUPS;
  readonly halfSalaryTypes = HALF_SALARY_TYPES;

  readonly allTypes   : TypeConge[]        = TYPE_CONGE_GROUPS.flatMap(g => g.types);
  readonly allStatuts : StatutCongeAdmin[]  = ['EN_ATTENTE', 'EN_ETUDE_MEDICALE', 'APPROUVE', 'REJETE', 'ANNULE'];
  readonly allDurees  : DureeType[]         = ['JOURNEE_COMPLETE', 'DEMI_JOURNEE'];

  readonly statutLabels: Record<StatutCongeAdmin, string> = {
    EN_ATTENTE       : 'En attente',
    EN_ETUDE_MEDICALE: 'Comité médical',
    APPROUVE         : 'Approuvé',
    REJETE           : 'Rejeté',
    ANNULE           : 'Annulé'
  };

  // ── Edit form ─────────────────────────────────────
  form = this.fb.group({
    typeConge  : ['' as TypeConge | '', Validators.required],
    dateDebut  : ['', Validators.required],
    dateFin    : ['', Validators.required],
    nombreJours: [1, [Validators.required, Validators.min(1)]],
    dureeType  : ['JOURNEE_COMPLETE' as DureeType, Validators.required],
    statut     : ['EN_ATTENTE' as StatutCongeAdmin, Validators.required],
    raison     : ['', [Validators.required, Validators.minLength(3)]],
    approvePar : [''],
    commentaire: ['']
  });

  ngOnInit(): void {
    this.http.get<DemandeCongeAdmin[]>('/api/conges/admin')
      .pipe(catchError(() => of([])))
      .subscribe(list => { this.demandes = list; this.loading = false; this.cdr.markForCheck(); });
  }

  // ── Computed ─────────────────────────────────────
  page     = 1;
  readonly pageSize = 10;

  get paginated(): DemandeCongeAdmin[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filtered.slice(start, start + this.pageSize);
  }

  get filtered(): DemandeCongeAdmin[] {
    const q = this.search.toLowerCase().trim();
    const STATUS_ORDER: Record<StatutCongeAdmin, number> = {
      EN_ATTENTE: 0, EN_ETUDE_MEDICALE: 0, APPROUVE: 1, REJETE: 2, ANNULE: 3
    };
    return this.demandes
      .filter(d => {
        const matchSearch = !q
          || d.employeNom.toLowerCase().includes(q)
          || (d.departement ?? '').toLowerCase().includes(q)
          || d.raison.toLowerCase().includes(q);
        const matchStatut = !this.filterStatut || d.statut === this.filterStatut;
        const matchType   = !this.filterType   || d.typeConge === this.filterType;
        return matchSearch && matchStatut && matchType;
      })
      .sort((a, b) => STATUS_ORDER[a.statut] - STATUS_ORDER[b.statut]);
  }

  get kpi() {
    return {
      total    : this.demandes.length,
      enAttente: this.demandes.filter(d => d.statut === 'EN_ATTENTE').length,
      medical  : this.demandes.filter(d => d.statut === 'EN_ETUDE_MEDICALE').length,
      approuve : this.demandes.filter(d => d.statut === 'APPROUVE').length,
      rejete   : this.demandes.filter(d => d.statut === 'REJETE').length
    };
  }

  // ── Detail panel ─────────────────────────────────
  openDetail(d: DemandeCongeAdmin): void {
    this.detailItem = d;
    this.editItem   = null;
    this.cdr.markForCheck();
  }
  closeDetail(): void { this.detailItem = null; this.cdr.markForCheck(); }

  // ── Edit modal ───────────────────────────────────
  openEdit(d: DemandeCongeAdmin): void {
    this.editItem   = d;
    this.detailItem = null;
    this.errorMsg   = null;
    this.form.patchValue({
      typeConge  : d.typeConge,
      dateDebut  : d.dateDebut,
      dateFin    : d.dateFin,
      nombreJours: d.nombreJours,
      dureeType  : d.dureeType,
      statut     : d.statut,
      raison     : d.raison,
      approvePar : d.approvePar   ?? '',
      commentaire: d.commentaire  ?? ''
    });
    this.cdr.markForCheck();
  }
  closeEdit(): void { this.editItem = null; this.cdr.markForCheck(); }

  submitEdit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    if (!this.editItem) return;
    this.saving   = true;
    this.errorMsg = null;

    const val     = this.form.value;
    const payload : Partial<DemandeCongeAdmin> = {
      typeConge  : val.typeConge   as TypeConge,
      dateDebut  : val.dateDebut!,
      dateFin    : val.dateFin!,
      nombreJours: Number(val.nombreJours),
      dureeType  : val.dureeType   as DureeType,
      statut     : val.statut      as StatutCongeAdmin,
      raison     : val.raison!,
      approvePar : val.approvePar  || undefined,
      commentaire: val.commentaire || undefined,
      dateApprobation: (val.statut === 'APPROUVE' || val.statut === 'REJETE')
        ? (this.editItem.dateApprobation ?? new Date().toISOString().split('T')[0])
        : undefined
    };

    this.http.put<DemandeCongeAdmin>(
      `/api/conges/admin/${this.editItem.id}`, payload
    ).pipe(catchError(() => of(null))).subscribe(result => {
      if (!result) {
        this.errorMsg = 'Erreur lors de la sauvegarde.';
        this.saving   = false;
        this.cdr.markForCheck();
        return;
      }
      const idx = this.demandes.findIndex(d => d.id === this.editItem!.id);
      if (idx !== -1) this.demandes[idx] = result;
      this.saving   = false;
      this.editItem = null;
      this.cdr.markForCheck();
    });
  }

  // ── Delete ───────────────────────────────────────
  askDelete(d: DemandeCongeAdmin): void { this.deleteTarget = d; this.cdr.markForCheck(); }
  cancelDelete(): void                  { this.deleteTarget = null; this.cdr.markForCheck(); }

  confirmDelete(): void {
    if (!this.deleteTarget) return;
    const id = this.deleteTarget.id;
    this.deleteTarget = null;
    this.demandes = this.demandes.filter(d => d.id !== id);
    this.cdr.markForCheck();
  }

  get deleteMessage(): string {
    if (!this.deleteTarget) return '';
    const label = this.typeLabels[this.deleteTarget.typeConge] ?? this.deleteTarget.typeConge;
    return `Vous êtes sur le point de supprimer la demande de congé de ${this.deleteTarget.employeNom} (${label}). Cette action est irréversible.`;
  }

  // ── Medical committee decision ────────────────────
  openMedicalDecision(d: DemandeCongeAdmin, approve: boolean): void {
    this.medDecisionItem    = d;
    this.medDecisionApprove = approve;
    this.detailItem         = null;
    this.cdr.markForCheck();
  }
  cancelMedicalDecision(): void { this.medDecisionItem = null; this.cdr.markForCheck(); }

  confirmMedicalDecision(): void {
    if (!this.medDecisionItem) return;
    const id      = this.medDecisionItem.id;
    const approve = this.medDecisionApprove;
    this.saving          = true;
    this.medDecisionItem = null;
    this.cdr.markForCheck();
    this.http.put<DemandeCongeAdmin>(`/api/conges/${id}/decision-medicale`, {
      approuve   : approve,
      commentaire: approve ? 'Approuvé par le comité médical' : 'Refusé par le comité médical'
    }).pipe(catchError(() => of(null))).subscribe(result => {
      if (result) {
        const idx = this.demandes.findIndex(d => d.id === id);
        if (idx !== -1) this.demandes = [...this.demandes.slice(0, idx), result, ...this.demandes.slice(idx + 1)];
      }
      this.saving = false;
      this.cdr.markForCheck();
    });
  }

  get medDecisionMessage(): string {
    if (!this.medDecisionItem) return '';
    const type = this.typeLabels[this.medDecisionItem.typeConge] ?? this.medDecisionItem.typeConge;
    return this.medDecisionApprove
      ? `Confirmer l'approbation du comité médical pour la demande de ${this.medDecisionItem.employeNom} (${type}) ?`
      : `Refuser la demande de ${this.medDecisionItem.employeNom} (${type}) au nom du comité médical ? La demande sera définitivement rejetée.`;
  }

  // ── Helpers ──────────────────────────────────────
  setSearch(q: string)               : void { this.search       = q; this.page = 1; this.cdr.markForCheck(); }
  setStatut(s: StatutCongeAdmin | ''): void  { this.filterStatut = s; this.page = 1; this.cdr.markForCheck(); }
  setType(t: TypeConge | '')         : void  { this.filterType   = t; this.page = 1; this.cdr.markForCheck(); }

  hasError(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && c?.touched);
  }

  initiales(nom: string): string {
    const p = nom.split(' ');
    return ((p[0]?.[0] ?? '') + (p[1]?.[0] ?? '')).toUpperCase();
  }
}
