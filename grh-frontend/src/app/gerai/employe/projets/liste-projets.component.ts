import { Component, OnInit, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { SharedModule } from 'src/app/theme/shared/shared.module';
import { CardComponent } from 'src/app/theme/shared/components/card/card.component';
import { ProjetService } from 'src/app/gerai/services/projet-employe.service';
import { Projet, TacheProjet, StatutProjet } from 'src/app/gerai/models/projet.model';

@Component({
  selector: 'app-liste-projets',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule, CardComponent],
  templateUrl: './liste-projets.component.html',
  styleUrls: ['./liste-projets.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListeProjetsComponent implements OnInit {

  private cdr           = inject(ChangeDetectorRef);
  private projetService = inject(ProjetService);
  private router        = inject(Router);

  viewMode: 'grid' | 'list' = 'grid';
  sortBy: 'deadline' | 'progression' | 'nom' = 'deadline';

  projets         : Projet[]      = [];
  projetsFiltres  : Projet[]      = [];
  mesTachesRecentes: TacheProjet[] = [];

  totalProjets  = 0;
  projetsEnCours= 0;
  totalTaches   = 0;
  tauxCompletion= 0;

  searchTerm     = '';
  selectedStatut = '';
  loading        = true;
  error          = false;

  ngOnInit(): void {
    forkJoin({
      projets: this.projetService.getProjets(),
      taches : this.projetService.getMesTachesRecentes()
    }).subscribe({
      next: ({ projets, taches }) => {
        this.projets          = projets;
        this.mesTachesRecentes = taches;
        this.calculateStats();
        this.filterProjets();
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.error   = true;
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  calculateStats(): void {
    this.totalProjets   = this.projets.length;
    this.projetsEnCours = this.projets.filter(p => p.statut === StatutProjet.EN_COURS).length;
    this.totalTaches    = this.projets.reduce((s, p) => s + (p.totalTaches || 0), 0);
    const sum           = this.projets.reduce((s, p) => s + (p.progression || 0), 0);
    this.tauxCompletion = this.projets.length > 0 ? Math.round(sum / this.projets.length) : 0;
  }

  filterProjets(): void {
    const filtered = this.projets.filter(p => {
      const matchSearch = !this.searchTerm ||
        p.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchStatut = !this.selectedStatut || p.statut === this.selectedStatut;
      return matchSearch && matchStatut;
    });
    this.projetsFiltres = this.sortProjets(filtered);
  }

  private sortProjets(list: Projet[]): Projet[] {
    return [...list].sort((a, b) => {
      switch (this.sortBy) {
        case 'nom':         return a.nom.localeCompare(b.nom);
        case 'progression': return b.progression - a.progression;
        case 'deadline': {
          const da = a.dateEcheance ? new Date(a.dateEcheance).getTime() : Infinity;
          const db = b.dateEcheance ? new Date(b.dateEcheance).getTime() : Infinity;
          return da - db;
        }
        default: return 0;
      }
    });
  }

  resetFilters(): void {
    this.searchTerm     = '';
    this.selectedStatut = '';
    this.sortBy         = 'deadline';
    this.filterProjets();
  }

  // ── Deadline urgency ──────────────────────────────
  daysLeft(dateStr: string | undefined): number {
    if (!dateStr) return Infinity;
    return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86_400_000);
  }

  urgencyClass(projet: Projet): string {
    if (projet.statut === 'TERMINE') return '';
    const d = this.daysLeft(projet.dateEcheance);
    if (d < 0)  return 'card-overdue';
    if (d <= 3) return 'card-urgent';
    if (d <= 7) return 'card-warning';
    return '';
  }

  urgencyLabel(projet: Projet): string {
    if (projet.statut === 'TERMINE') return '';
    const d = this.daysLeft(projet.dateEcheance);
    if (d < 0)   return `En retard de ${Math.abs(d)}j`;
    if (d === 0) return "Aujourd'hui !";
    if (d === 1) return 'Demain !';
    if (d <= 7)  return `J-${d}`;
    return '';
  }

  // ── Navigation ───────────────────────────────────
  goToTaches(projet: Projet): void {
    this.router.navigate(['/employe/taches'], { queryParams: { projet: projet.nom } });
  }

  toggleTache(tacheId: number): void {
    this.projetService.toggleTacheStatus(tacheId).subscribe({
      next: updated => {
        const idx = this.mesTachesRecentes.findIndex(t => t.id === tacheId);
        if (idx !== -1) {
          this.mesTachesRecentes = [
            ...this.mesTachesRecentes.slice(0, idx),
            updated,
            ...this.mesTachesRecentes.slice(idx + 1)
          ];
          this.cdr.markForCheck();
        }
      }
    });
  }

  getStatutLabel(statut: string): string {
    const map: Record<string, string> = {
      EN_COURS: 'En cours', EN_PAUSE: 'En pause', TERMINE: 'Terminé', EN_RETARD: 'En retard'
    };
    return map[statut] ?? statut;
  }

  getStatutClass(statut: string): string {
    const map: Record<string, string> = {
      EN_COURS: 'badge-encours', EN_PAUSE: 'badge-pause',
      TERMINE: 'badge-termine',  EN_RETARD: 'badge-retard'
    };
    return map[statut] ?? '';
  }

  isLate(echeance: string): boolean {
    return new Date(echeance) < new Date();
  }

  chefInitials(name: string | undefined): string {
    if (!name) return '?';
    return name.split(' ').slice(0, 2).map(w => w[0] ?? '').join('').toUpperCase();
  }
}
