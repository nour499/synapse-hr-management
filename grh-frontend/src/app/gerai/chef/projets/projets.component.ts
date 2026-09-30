import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe }    from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { catchError, forkJoin, of } from 'rxjs';
// Project imports
import { SharedModule }        from 'src/app/theme/shared/shared.module';
import { CardComponent }       from 'src/app/theme/shared/components/card/card.component';
import { BreadcrumbComponent } from 'src/app/theme/shared/components/breadcrumbs/breadcrumbs.component';
import { Employe }             from 'src/app/theme/shared/interfaces/employe';
import { ProjetService } from '../../services/projet-chef.service';
import { ProfilEmployeService } from '../../services/employe-profile.service';
import { Projet }              from '../../models/projet.model';
import { StatutProjet }        from '../../models/projet.model';

@Component({
  selector   : 'app-projets',
  standalone : true,
  imports    : [
    CommonModule,
    DatePipe,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    CardComponent,
    BreadcrumbComponent
  ],
  templateUrl: './projets.component.html',
  styleUrls  : ['./projets.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjetsComponent implements OnInit {

  constructor(private cd: ChangeDetectorRef) {}

  private fb             = inject(FormBuilder);
  private projetService  = inject(ProjetService);
  private profilService  = inject(ProfilEmployeService);

  // ── Stats ──────────────────────────────────────────────
  totalProjets    = 0;
  projetsEnCours  = 0;
  projetsTermines = 0;
  projetsEnAttente = 0;
  projetsEnRetard  = 0;
  tauxReussite     = 0;

  // ── Data ───────────────────────────────────────────────
  projets        : Projet[]  = [];
  filteredProjets: Projet[]  = [];
  employes       : Employe[] = [];
  selectedMembres: Employe[] = [];
  selectedProjet : Projet | null = null;
  
  // ── Filters ────────────────────────────────────────────
  searchTerm = '';
  statusFilter: StatutProjet | '' = '';
  StatutProjet = StatutProjet;

  // ── Modal state ────────────────────────────────────────
  showModal       = false;
  showDetailModal = false;
  isEditMode      = false;
  isSaving        = false;

  // ── Member picker filters ───────────────────────────────
  membreSearch = '';
  membreDept   = '';

  get departments(): string[] {
    return [...new Set(this.employes.map(e => e.departement ?? '').filter(Boolean))].sort();
  }

  get filteredEmployesForPicker(): Employe[] {
    let list = this.employes.filter(e =>
      !(e.poste ?? '').toLowerCase().includes('chef')
    );
    if (this.membreSearch) {
      const q = this.membreSearch.toLowerCase();
      list = list.filter(e =>
        e.nom.toLowerCase().includes(q) ||
        e.prenom.toLowerCase().includes(q) ||
        (e.poste ?? '').toLowerCase().includes(q)
      );
    }
    if (this.membreDept) {
      list = list.filter(e => e.departement === this.membreDept);
    }
    return list;
  }

  projetForm!: FormGroup;

  currentUserDbId = 0;



  // ── Lifecycle ──────────────────────────────────────────
  ngOnInit(): void {
    this.initForm();
    this.loadData();
  }

  // ── Form ───────────────────────────────────────────────
  initForm(): void {
    this.projetForm = this.fb.group({
      nom         : ['', Validators.required],
      description : [''],
      dateDebut   : ['', Validators.required],
      dateFin     : [''],
      statut      : [StatutProjet.EN_PAUSE],
      totalTaches : [0, [Validators.required, Validators.min(0)]]
    });
  }

  // ── Progression calculée depuis les tâches ─────────────
  calcProgression(p: Projet): number {
    if (!p.totalTaches || p.totalTaches === 0) return p.progression ?? 0;
    return Math.round((p.tachesCompletees / p.totalTaches) * 100);
  }

  // ── Load data ──────────────────────────────────────────
  loadData(): void {
    forkJoin({
      projets : this.projetService.getProjets().pipe(catchError(() => of([]))),
      employes: this.projetService.getEmployes().pipe(catchError(() => of([]))),
      profil  : this.profilService.getDbProfile()
    }).subscribe(({ projets, employes, profil }) => {
      this.currentUserDbId = profil.dbId;
      this.projets         = projets.map(p => this._stripChef(p));
      this.employes        = employes;
      this.filteredProjets = [...this.projets];
      this.computeStats();
      this.cd.markForCheck();
    });
  }

  private _stripChef(p: Projet): Projet {
    return { ...p, equipe: (p.equipe ?? []).filter(m => m.id !== this.currentUserDbId) };
  }



  // ── Stats ──────────────────────────────────────────────
 computeStats(): void {
    this.totalProjets     = this.projets.length;
    this.projetsEnCours   = this.projets.filter(p => p.statut === StatutProjet.EN_COURS).length;
    this.projetsTermines  = this.projets.filter(p => p.statut === StatutProjet.TERMINE).length;
    this.projetsEnAttente = this.projets.filter(p => p.statut === StatutProjet.EN_PAUSE).length;
    this.projetsEnRetard  = this.projets.filter(p => p.statut === StatutProjet.EN_RETARD).length;

    this.tauxReussite = this.totalProjets
      ? Math.round((this.projetsTermines / this.totalProjets) * 100)
      : 0;
 }


  // ── Filter ─────────────────────────────────────────────
  filterProjets(): void {
    this.filteredProjets = this.projets.filter(p => {
      const matchSearch =
        !this.searchTerm ||
        p.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (p.description ?? '').toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchStatus =
        !this.statusFilter || p.statut === this.statusFilter;

      return matchSearch && matchStatus;
    });
  }


  // ── Modal helpers ──────────────────────────────────────
  openCreateModal(): void {
    this.isEditMode      = false;
    this.selectedMembres = [];
    this.membreSearch    = '';
    this.membreDept      = '';
    this.projetForm.reset({ statut: StatutProjet.EN_PAUSE, progression: 0 });
    this.showModal = true;
  }

  editProjet(projet: Projet): void {
    this.isEditMode      = true;
    this.selectedProjet  = projet;
    this.selectedMembres = [...(projet.membres ?? [])];
    this.membreSearch    = '';
    this.membreDept      = '';
    this.projetForm.patchValue({
      nom        : projet.nom,
      description: projet.description ?? '',
      dateDebut  : projet.dateDebut,
      dateFin    : projet.dateFin ?? '',
      statut     : projet.statut,
      totalTaches: projet.totalTaches ?? 0
    });
    this.showModal = true;
  }

  viewProjet(projet: Projet): void {
    this.selectedProjet  = projet;
    this.showDetailModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.projetForm.reset();
    this.selectedMembres = [];
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedProjet  = null;
  }




  // ── Membres ────────────────────────────────────────────
  isMembre(emp: Employe): boolean {
    return this.selectedMembres.some(m => m.id === emp.id);
  }

  /** True when the employee is already assigned to a DIFFERENT project */
  isAssignedElsewhere(emp: Employe): boolean {
    if (!emp.projetId) return false;
    const currentId = this.selectedProjet?.id;
    return emp.projetId !== currentId;
  }

  toggleMembre(emp: Employe): void {
    if (this.isAssignedElsewhere(emp)) return;
    const idx = this.selectedMembres.findIndex(m => m.id === emp.id);
    if (idx === -1) {
      this.selectedMembres.push(emp);
    } else {
      this.selectedMembres.splice(idx, 1);
    }
  }

  

  // ── CRUD (via service, MSW intercepts) ─────────────────
  saveProjet(): void {
    if (this.projetForm.invalid) return;
    this.isSaving = true;
    const formVal = this.projetForm.value;

    if (this.isEditMode && this.selectedProjet) {
      const tachesCompletees = this.selectedProjet.tachesCompletees ?? 0;
      const totalTaches      = formVal.totalTaches ?? 0;
      const progression      = totalTaches > 0 ? Math.round((tachesCompletees / totalTaches) * 100) : 0;

      this.projetService.updateProjet(this.selectedProjet.id, {
        nom:         formVal.nom,
        description: formVal.description,
        dateDebut:   formVal.dateDebut,
        dateFin:     formVal.dateFin || undefined,
        statut:      formVal.statut,
        progression,
        membreIds:   this.selectedMembres.map(m => m.id)
      }).subscribe({
        next: updated => {
          const idx = this.projets.findIndex(p => p.id === updated.id);
          if (idx >= 0) this.projets[idx] = this._stripChef({ ...updated, progression });
          this.refreshAfterSave();
        },
        error: err => {
          console.error('Erreur mise à jour projet:', err);
          this.isSaving = false;
        }
      });
    } else {
      this.projetService.createProjet({
        nom:         formVal.nom,
        description: formVal.description,
        dateDebut:   formVal.dateDebut,
        dateFin:     formVal.dateFin || undefined,
        statut:      formVal.statut,
        progression: 0,
        membreIds:   this.selectedMembres.map(m => m.id)
      }).subscribe({
        next: created => {
          this.projets.push(this._stripChef(created));
          this.refreshAfterSave();
        },
        error: err => {
          console.error('Erreur création projet:', err);
          this.isSaving = false;
        }
      });
    }
  }

  private refreshAfterSave(): void {
    this.filteredProjets = [...this.projets];
    this.computeStats();
    this.isSaving = false;
    this.closeModal();
    this.cd.markForCheck();
  }

  deleteProjet(projet: Projet): void {
    if (!confirm(`Supprimer le projet "${projet.nom}" ?`)) return;
    this.projetService.deleteProjet(projet.id).subscribe(() => {
      this.projets = this.projets.filter(p => p.id !== projet.id);
      this.filteredProjets = [...this.projets];
      this.computeStats();
      this.cd.markForCheck();
    });
  }

  // ── UI helpers ─────────────────────────────────────────
 getStatusBadgeClass(statut: StatutProjet): string {
  const map: Record<StatutProjet, string> = {
    [StatutProjet.EN_COURS]: 'badge-primary',
    [StatutProjet.TERMINE]: 'badge-success',
    [StatutProjet.EN_PAUSE]: 'badge-warning',
    [StatutProjet.EN_RETARD]: 'badge-danger'
  };
  return map[statut] ?? 'badge-secondary';
}

getStatusLabel(statut: StatutProjet): string {
  const map: Record<StatutProjet, string> = {
    [StatutProjet.EN_COURS]: 'En cours',
    [StatutProjet.TERMINE]: 'Terminé',
    [StatutProjet.EN_PAUSE]: 'En attente',
    [StatutProjet.EN_RETARD]: 'En retard'
  };
  return map[statut] ?? statut;
}


  getProgressClass(p: Projet): string {
    const prog = this.calcProgression(p);
    if (prog >= 80) return 'bg-success';
    if (prog >= 50) return 'bg-primary';
    if (prog >= 25) return 'bg-warning';
    return 'bg-danger';
  }
}