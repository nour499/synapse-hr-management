import { Component, OnInit, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

import { SharedModule } from 'src/app/theme/shared/shared.module';
import { CardComponent } from 'src/app/theme/shared/components/card/card.component';
import { TacheService } from 'src/app/gerai/services/tache-employe.service';
import { TacheKanban } from 'src/app/gerai/models/tache.model';

@Component({
  selector: 'app-liste-taches',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule, CardComponent, DragDropModule],
  templateUrl: './liste-taches.component.html',
  styleUrls: ['./liste-taches.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListeTachesComponent implements OnInit {

  private cdr          = inject(ChangeDetectorRef);
  private tacheService = inject(TacheService);
  private route        = inject(ActivatedRoute);

  viewMode: 'kanban' | 'list' = 'kanban';

  taches        : TacheKanban[] = [];
  tachesFiltrees: TacheKanban[] = [];

  // Stable column arrays — CDK tracks these by reference across CD cycles
  columnAFaire  : TacheKanban[] = [];
  columnEnCours : TacheKanban[] = [];
  columnTerminee: TacheKanban[] = [];

  totalTaches   = 0;
  tachesAFaire  = 0;
  tachesEnCours = 0;
  tachesTerminees = 0;

  searchTerm      = '';
  selectedProjet  = '';
  selectedPriorite= '';

  loading = true;
  error   = false;

  // ── Lifecycle ────────────────────────────────────
  ngOnInit(): void {
    const prefilter = this.route.snapshot.queryParamMap.get('projet');
    if (prefilter) this.selectedProjet = prefilter;

    this.tacheService.getTaches().subscribe({
      next: taches => {
        this.taches = taches;
        this.calculateStats();
        this.filterTaches();
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
    this.totalTaches    = this.taches.length;
    this.tachesAFaire   = this.taches.filter(t => t.statut === 'A_FAIRE').length;
    this.tachesEnCours  = this.taches.filter(t => t.statut === 'EN_COURS').length;
    this.tachesTerminees= this.taches.filter(t => t.statut === 'TERMINEE').length;
  }

  private buildColumns(): void {
    this.columnAFaire   = this.tachesFiltrees.filter(t => t.statut === 'A_FAIRE');
    this.columnEnCours  = this.tachesFiltrees.filter(t => t.statut === 'EN_COURS');
    this.columnTerminee = this.tachesFiltrees.filter(t => t.statut === 'TERMINEE');
  }

  // ── Drag & Drop ─────────────────────────────────
  onDrop(event: CdkDragDrop<TacheKanban[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      this.cdr.markForCheck();
      return;
    }

    const tache      = event.previousContainer.data[event.previousIndex];
    const newStatut  = this.statutFromData(event.container.data);
    const newProgression =
      newStatut === 'A_FAIRE'  ? 0 :
      newStatut === 'EN_COURS' ? Math.max(tache.progression, 1) : 100;

    // Mutate the stable column arrays directly — CDK references stay valid
    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );

    // Keep the model in sync for list view and stats
    tache.statut      = newStatut;
    tache.progression = newProgression;
    this.calculateStats();
    this.cdr.markForCheck();

    this.tacheService.updateTache(tache.id, { statut: newStatut, progression: newProgression })
      .subscribe();
  }

  // Compare by reference against stable column arrays — CDK auto-generates IDs like
  // "cdk-drop-list-0" so string-based matching on container.id is unreliable.
  private statutFromData(data: TacheKanban[]): TacheKanban['statut'] {
    if (data === this.columnAFaire)  return 'A_FAIRE';
    if (data === this.columnEnCours) return 'EN_COURS';
    return 'TERMINEE';
  }

  // ── Filters ──────────────────────────────────────
  filterTaches(): void {
    this.tachesFiltrees = this.taches.filter(t => {
      const matchSearch   = !this.searchTerm ||
        t.titre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        t.projet.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchProjet   = !this.selectedProjet   || t.projet   === this.selectedProjet;
      const matchPriorite = !this.selectedPriorite || t.priorite === this.selectedPriorite;
      return matchSearch && matchProjet && matchPriorite;
    });
    this.buildColumns();
    this.calculateStats();
  }

  resetFilters(): void {
    this.searchTerm       = '';
    this.selectedProjet   = '';
    this.selectedPriorite = '';
    this.filterTaches();
  }

  get projetsUniques(): string[] {
    return [...new Set(this.taches.map(t => t.projet))];
  }

  // ── List view status change ───────────────────────
  changeStatut(tache: TacheKanban, newStatut: TacheKanban['statut']): void {
    if (tache.statut === newStatut) return;

    const oldStatut      = tache.statut;
    const oldProgression = tache.progression;
    const newProgression =
      newStatut === 'A_FAIRE'  ? 0 :
      newStatut === 'EN_COURS' ? Math.max(tache.progression, 1) : 100;

    tache.statut      = newStatut;
    tache.progression = newProgression;
    this.buildColumns();
    this.calculateStats();
    this.cdr.markForCheck();

    this.tacheService.updateTache(tache.id, { statut: newStatut, progression: newProgression })
      .subscribe({
        error: () => {
          tache.statut      = oldStatut;
          tache.progression = oldProgression;
          this.buildColumns();
          this.calculateStats();
          this.cdr.markForCheck();
        }
      });
  }

  // ── Progress slider (list view) ──────────────────
  liveProgressUpdate(tache: TacheKanban, value: number): void {
    tache.progression = value;
    this.cdr.markForCheck();
  }

  updateProgression(tache: TacheKanban, value: number): void {
    const oldProgression = tache.progression;
    const oldStatut      = tache.statut;

    tache.progression = value;

    if (value === 100 && tache.statut !== 'TERMINEE') {
      tache.statut = 'TERMINEE';
    } else if (value === 0 && tache.statut !== 'A_FAIRE') {
      tache.statut = 'A_FAIRE';
    } else if (value > 0 && value < 100 && tache.statut === 'A_FAIRE') {
      tache.statut = 'EN_COURS';
    }

    this.buildColumns();
    this.calculateStats();
    this.cdr.markForCheck();

    this.tacheService.updateTache(tache.id, { statut: tache.statut, progression: value })
      .subscribe({
        error: () => {
          tache.progression = oldProgression;
          tache.statut      = oldStatut;
          this.buildColumns();
          this.calculateStats();
          this.cdr.markForCheck();
        }
      });
  }

  getStatutLabel(statut: string): string {
    const map: Record<string, string> = {
      A_FAIRE: 'À faire', EN_COURS: 'En cours', TERMINEE: 'Terminée'
    };
    return map[statut] ?? statut;
  }

  isLate(echeance: string): boolean {
    return new Date(echeance) < new Date();
  }
}
