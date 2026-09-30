import {
  Component, OnInit, inject,
  ChangeDetectorRef, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }  from '@angular/forms';
import { Router }       from '@angular/router';
import { HttpClient }   from '@angular/common/http';

import {
  Actif, CategorieActif, StatutActif, DemandeActif,
  ALL_TYPE_LABELS, ALL_TYPE_ICONS,
  STATUT_DEMANDE_ACTIF_LABELS, STATUT_DEMANDE_ACTIF_COLORS, StatutDemandeActif
} from 'src/app/gerai/models/actif.model';
import { forkJoin, catchError, of } from 'rxjs';
import { ConfirmModalComponent } from 'src/app/theme/shared/components/confirm-modal/confirm-modal.component';
import { PaginatorComponent } from 'src/app/theme/shared/components/paginator/paginator.component';

@Component({
  selector   : 'app-liste-actifs-admin',
  standalone : true,
  imports    : [CommonModule, FormsModule, ConfirmModalComponent, PaginatorComponent],
  templateUrl: './liste-actifs-admin.component.html',
  styleUrls  : ['./liste-actifs-admin.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListeActifsAdminComponent implements OnInit {

  private http   = inject(HttpClient);
  private router = inject(Router);
  private cdr    = inject(ChangeDetectorRef);

  readonly typeLabels = ALL_TYPE_LABELS;
  readonly typeIcons  = ALL_TYPE_ICONS;

  actifs       : Actif[]        = [];
  demandes     : DemandeActif[] = [];
  loading      = true;
  activeTab    : 'TANGIBLE' | 'NUMERIQUE' | 'DEMANDES' = 'TANGIBLE';

  readonly statutDemandeLabels = STATUT_DEMANDE_ACTIF_LABELS;
  readonly statutDemandeColors = STATUT_DEMANDE_ACTIF_COLORS;
  searchQuery  = '';
  filterStatut = '';
  deletingId   : number | null = null;
  deleteTarget : Actif | null = null;

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    forkJoin({
      actifs  : this.http.get<Actif[]>('/api/actifs').pipe(catchError(() => of([]))),
      demandes: this.http.get<DemandeActif[]>('/api/actifs/demandes').pipe(catchError(() => of([])))
    }).subscribe(({ actifs, demandes }) => {
      this.actifs   = actifs;
      this.demandes = demandes;
      this.loading  = false;
      this.cdr.markForCheck();
    });
  }

  // ── Tabs ────────────────────────────────────────────────
  page     = 1;
  readonly pageSize = 10;

  get paginated(): Actif[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filtered.slice(start, start + this.pageSize);
  }

  get paginatedDemandes(): DemandeActif[] {
    const start = (this.page - 1) * this.pageSize;
    return this.demandes.slice(start, start + this.pageSize);
  }

  setTab(t: 'TANGIBLE' | 'NUMERIQUE' | 'DEMANDES'): void {
    this.activeTab    = t;
    this.searchQuery  = '';
    this.filterStatut = '';
    this.page         = 1;
    this.cdr.markForCheck();
  }

  // ── Counts ──────────────────────────────────────────────
  get tangibleCount(): number  { return this.actifs.filter(a => a.categorie === 'TANGIBLE').length;  }
  get numeriqueCount(): number { return this.actifs.filter(a => a.categorie === 'NUMERIQUE').length; }
  get demandesCount(): number  { return this.demandes.filter(d => ['EN_ATTENTE','EN_COURS'].includes(d.statut)).length; }

  // ── Filtered list ────────────────────────────────────────
  get filtered(): Actif[] {
    const q = this.searchQuery.toLowerCase().trim();
    return this.actifs.filter(a => {
      if (a.categorie !== this.activeTab && this.activeTab !== 'DEMANDES') return false;
      if (this.activeTab === 'DEMANDES') return false;
      const matchQ = !q ||
        a.nom.toLowerCase().includes(q) ||
        (a.marque ?? '').toLowerCase().includes(q) ||
        (a.modele ?? '').toLowerCase().includes(q) ||
        (a.employeNom ?? '').toLowerCase().includes(q) ||
        (a.numeroSerie ?? '').toLowerCase().includes(q);
      const matchS = !this.filterStatut || a.statut === this.filterStatut;
      return matchQ && matchS;
    });
  }

  // ── KPIs ────────────────────────────────────────────────
  get totalAttribues(): number   { return this.actifs.filter(a => a.statut === 'ATTRIBUE').length; }
  get totalDisponibles(): number { return this.actifs.filter(a => a.statut === 'DISPONIBLE').length; }
  get totalMaintenance(): number { return this.actifs.filter(a => a.statut === 'EN_MAINTENANCE').length; }

  // ── Helpers ─────────────────────────────────────────────
  statutLabel(s: StatutActif): string {
    return ({ ATTRIBUE: 'Attribué', DISPONIBLE: 'Disponible',
              EN_MAINTENANCE: 'Maintenance', HORS_SERVICE: 'Hors service' })[s] ?? s;
  }

  isExpiringSoon(a: Actif): boolean {
    if (!a.dateExpiration) return false;
    const days = (new Date(a.dateExpiration).getTime() - Date.now()) / 86_400_000;
    return days >= 0 && days <= 30;
  }

  isExpired(a: Actif): boolean {
    if (!a.dateExpiration) return false;
    return new Date(a.dateExpiration) < new Date();
  }

  // ── Navigation ──────────────────────────────────────────
  addActif():           void { this.router.navigate(['/admin/actifs/ajouter']); }
  editActif(id: number): void { this.router.navigate(['/admin/actifs', id, 'modifier']); }

  // ── Delete ──────────────────────────────────────────────
  askDelete(a: Actif): void { this.deleteTarget = a; this.cdr.markForCheck(); }
  cancelDelete(): void      { this.deleteTarget = null; this.cdr.markForCheck(); }

  confirmDelete(): void {
    if (!this.deleteTarget) return;
    const id = this.deleteTarget.id;
    this.deletingId  = id;
    this.deleteTarget = null;
    this.cdr.markForCheck();

    this.http.delete(`/api/actifs/${id}`).subscribe({
      next : () => { this.actifs = this.actifs.filter(a => a.id !== id); this.deletingId = null; this.cdr.markForCheck(); },
      error: () => { this.deletingId = null; this.cdr.markForCheck(); }
    });
  }

  get deleteMessage(): string {
    return this.deleteTarget
      ? `Voulez-vous vraiment supprimer "${this.deleteTarget.nom}" ? Cette action est irréversible.`
      : '';
  }

  // ── Demandes ────────────────────────────────────────────
  updateDemande(d: DemandeActif, statut: StatutDemandeActif, commentaire?: string): void {
    this.http.put<DemandeActif>(`/api/actifs/demandes/${d.id}`, { statut, commentaireAdmin: commentaire ?? d.commentaireAdmin })
      .pipe(catchError(() => of(null)))
      .subscribe(updated => {
        if (updated) {
          const idx = this.demandes.findIndex(x => x.id === updated.id);
          if (idx >= 0) this.demandes[idx] = updated;
          this.demandes = [...this.demandes];
        }
        this.cdr.markForCheck();
      });
  }

  trackById(_: number, a: Actif): number { return a.id; }
}
