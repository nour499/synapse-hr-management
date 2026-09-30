import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { CardComponent } from 'src/app/theme/shared/components/card/card.component';
import { EmployeService } from '../../services/employe.service';
import { ProjetService, UpdateProjetPayload } from '../../services/projet-chef.service';
import { MembreEquipe } from '../../models/equipe.model';
import { Employe } from 'src/app/theme/shared/interfaces/employe';
import { Projet }  from 'src/app/gerai/models/projet.model';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-equipe',
  standalone: true,
  imports: [CommonModule, SharedModule, CardComponent, FormsModule],
  templateUrl: './equipe.component.html',
  styleUrls: ['./equipe.component.scss']
})
export class EquipeComponent implements OnInit, OnDestroy {

  constructor(private cd: ChangeDetectorRef) {}

  private router         = inject(Router);
  private employeService = inject(EmployeService);
  private projetService  = inject(ProjetService);
  private toast          = inject(ToastService);

  // ── Data ─────────────────────────────────────────────
  projets:  Projet[]       = [];
  membres:  MembreEquipe[] = [];
  projetsByMembreId = new Map<number, Projet[]>();
  loading = false;
  error: string | null = null;

  // ── Profil modal ─────────────────────────────────────
  showProfilModal    = false;
  membreSelectionne: MembreEquipe | null = null;

  // ── Add modal ────────────────────────────────────────
  showModal      = false;
  modalEtape: 'no-project' | 'select-project' | 'search' | 'confirm' = 'select-project';
  selectedProjet: Projet | null = null;
  searchQuery    = '';
  searchResults: Employe[] = [];
  searching      = false;
  employeChoisi: Employe | null = null;
  statutAjouter: 'ACTIF' | 'CONGE' | 'INACTIF' = 'ACTIF';
  ajoutError: string | null = null;
  saving         = false;

  private searchSubject = new Subject<string>();
  private searchSub!: Subscription;

  // ── Lifecycle ─────────────────────────────────────────
  ngOnInit(): void {
    this.chargerDonnees();

    this.searchSub = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(q => {
        if (q.trim().length < 2) { this.searchResults = []; this.searching = false; return of([]); }
        this.searching = true;
        return this.employeService.searchEmployes(q).pipe(
          catchError(() => { this.searching = false; return of([]); })
        );
      })
    ).subscribe(results => {
      this.searchResults = results;
      this.searching = false;
      this.cd.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
  }

  // ── Data loading ──────────────────────────────────────
  chargerDonnees(): void {
    this.loading = true;
    this.error   = null;
    this.projetService.getProjets().subscribe({
      next: projets => {
        this.projets = projets;
        this.buildMembresFromProjets();
        this.loading = false;
        this.cd.detectChanges();
      },
      error: () => {
        this.error   = 'Erreur lors du chargement des données';
        this.loading = false;
        this.cd.detectChanges();
      }
    });
  }

  private buildMembresFromProjets(): void {
    const seen = new Set<number>();
    const result: MembreEquipe[] = [];
    const byId = new Map<number, Projet[]>();

    for (const p of this.projets) {
      for (const m of (p.membres ?? [])) {
        if ((m as any).role === 'CHEF') continue;
        if (!seen.has(m.id)) {
          seen.add(m.id);
          result.push({
            id:           m.id,
            nom:          m.nom          ?? '',
            prenom:       m.prenom       ?? '',
            poste:        m.poste        ?? '',
            email:        m.email        ?? '',
            photo:        m.photo,
            statut:       m.statut       ?? 'ACTIF',
            dateEmbauche: m.dateEmbauche ?? '',
            departement:  m.departement,
            telephone:    m.telephone
          });
        }
        const list = byId.get(m.id) ?? [];
        if (!list.includes(p)) list.push(p);
        byId.set(m.id, list);
      }
    }
    this.membres = result;
    this.projetsByMembreId = byId;
  }

  projetsDeMembre(membre: MembreEquipe): Projet[] {
    return this.projetsByMembreId.get(membre.id) ?? [];
  }

  // ── Add modal ─────────────────────────────────────────
  ouvrirModal(): void {
    this.showModal      = true;
    this.employeChoisi  = null;
    this.selectedProjet = null;
    this.searchQuery    = '';
    this.searchResults  = [];
    this.statutAjouter  = 'ACTIF';
    this.ajoutError     = null;
    this.saving         = false;
    this.modalEtape = this.projets.length === 0 ? 'no-project' : 'search';
  }

  fermerModal(): void {
    this.showModal      = false;
    this.employeChoisi  = null;
    this.selectedProjet = null;
    this.searchQuery    = '';
    this.searchResults  = [];
    this.ajoutError     = null;
    this.saving         = false;
  }

  selectionnerProjet(p: Projet): void {
    this.selectedProjet = p;
    this.modalEtape     = 'confirm';
  }

  retourSelectionProjet(): void {
    this.selectedProjet = null;
    this.employeChoisi  = null;
    this.searchQuery    = '';
    this.searchResults  = [];
    this.modalEtape     = 'search';
  }

  retourConfirm(): void {
    this.selectedProjet = null;
    this.modalEtape     = 'select-project';
  }

  projetsDisponiblesPourEmploye(): Projet[] {
    if (!this.employeChoisi) return this.projets;
    return this.projets.filter(p =>
      !(p.membres ?? []).some((m: any) => m.id === this.employeChoisi!.id)
    );
  }

  onSearchChange(): void {
    this.employeChoisi = null;
    this.searchSubject.next(this.searchQuery);
  }

  selectionnerEmploye(e: Employe): void {
    this.employeChoisi = e;
    this.searchQuery   = `${e.prenom} ${e.nom}`;
    this.searchResults = [];
    this.modalEtape    = 'select-project';
  }

  reinitialiserRecherche(): void {
    this.employeChoisi  = null;
    this.selectedProjet = null;
    this.searchQuery    = '';
    this.searchResults  = [];
    this.modalEtape     = 'search';
  }

  confirmerAjout(): void {
    if (!this.employeChoisi || !this.selectedProjet) return;
    this.saving     = true;
    this.ajoutError = null;

    const e = this.employeChoisi;
    const p = this.selectedProjet;

    // Collect existing member IDs + the new one, deduplicated
    const existingIds = (p.membres ?? []).map((m: any) => m.id as number);
    const membreIds   = [...new Set([...existingIds, e.id])];

    const payload: UpdateProjetPayload = { membreIds };

    this.projetService.updateProjet(p.id, payload).subscribe({
      next: updatedProjet => {
        const idx = this.projets.findIndex(x => x.id === p.id);
        if (idx !== -1) {
          this.projets[idx] = updatedProjet;
        }
        this.projets = [...this.projets];      // new reference — Angular sees the change
        this.buildMembresFromProjets();
        this.saving = false;
        this.toast.success(`${e.prenom} ${e.nom} ajouté(e) au projet "${p.nom}".`);
        this.fermerModal();
        this.cd.detectChanges();
      },
      error: () => {
        this.ajoutError = 'Erreur lors de l\'ajout. Veuillez réessayer.';
        this.saving = false;
        this.cd.detectChanges();
      }
    });
  }

  naviguerVersProjets(): void {
    this.fermerModal();
    this.router.navigate(['/chef/projets']);
  }

  // ── Profil modal ──────────────────────────────────────
  ouvrirProfilModal(membre: MembreEquipe): void {
    this.membreSelectionne = membre;
    this.showProfilModal   = true;
  }

  fermerProfilModal(): void {
    this.showProfilModal   = false;
    this.membreSelectionne = null;
  }

  // ── Navigation ────────────────────────────────────────
  voirDemandes(membre: MembreEquipe): void {
    this.router.navigate(['/chef/demandes'], {
      queryParams: { employeId: membre.keycloakId ?? membre.id }
    });
  }

  evaluerMembre(membre: MembreEquipe): void {
    this.router.navigate(['/chef/evaluations'], {
      queryParams: {
        initier: 1,
        employeId: membre.id,
        nom: membre.nom,
        prenom: membre.prenom
      }
    });
  }
}
