import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Tache } from 'src/app/gerai/models/tache.model';

/**
 * Service des tâches côté Chef.
 *
 * Consomme le microservice dédié taches-service (port 8088) exposé en dev
 * derrière le proxy /api/taches-chef.
 *
 * Endpoints alignés sur AffectationController (taches-service) :
 *   GET    /api/taches-chef/taches            → toutes les tâches du chef
 *   GET    /api/taches-chef/taches?projet=X   → tâches d'un projet
 *   POST   /api/taches-chef/taches            → créer une tâche
 *   PUT    /api/taches-chef/taches/{id}       → modifier une tâche
 *   DELETE /api/taches-chef/taches/{id}       → supprimer une tâche
 *
 * Le format de requête attendu par taches-service (TacheRequest) utilise
 * `priorite` (et non `prioritize`), `projet`/`projetId`, `assigneA`/`assigneId`.
 */
export interface CreateTachePayload {
  projetId?: number;
  projet?: string;
  titre: string;
  description?: string;
  assigneId?: number;
  assigneA?: string;
  priorite?: string;
  statut?: string;
  echeance?: string;
  progression?: number;
  estimatedHours?: number;
}

@Injectable({
  providedIn: 'root'
})
export class TacheService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/taches-chef';

  getTaches(): Observable<Tache[]> {
    return this.http.get<any[]>(`${this.API_URL}/taches`).pipe(
      map(list => list.map(dto => this.toTache(dto)))
    );
  }

  getTachesByProjet(projetNom: string): Observable<Tache[]> {
    return this.http.get<any[]>(`${this.API_URL}/taches?projet=${encodeURIComponent(projetNom)}`).pipe(
      map(list => list.map(dto => this.toTache(dto)))
    );
  }

  createTache(payload: CreateTachePayload): Observable<Tache> {
    return this.http.post<any>(`${this.API_URL}/taches`, payload).pipe(
      map(dto => this.toTache(dto))
    );
  }

  updateTache(id: number, payload: CreateTachePayload): Observable<Tache> {
    return this.http.put<any>(`${this.API_URL}/taches/${id}`, payload).pipe(
      map(dto => this.toTache(dto))
    );
  }

  deleteTache(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/taches/${id}`);
  }

  private toTache(dto: any): Tache {
    const priorite     = this.normalizePriorite(dto.priorite);
    const prioriteColor = dto.prioriteColor
      ?? this.prioriteColorMap[priorite]
      ?? '#3B82F6';
    return {
      id:           dto.id,
      titre:        dto.titre ?? '',
      projet:       dto.projet ?? '',
      priorite,
      prioriteColor,
      statut:       dto.statut ?? 'A_FAIRE',
      echeance:     dto.echeance ?? '',
      dateDebut:    dto.dateDebut,
      description:  dto.description,
      assigneA:     dto.assigneA ?? '',
      assignedTo:   dto.assigneId ?? dto.assignedTo ?? undefined,
      effortEstime: undefined,
      progression:  dto.progression ?? undefined
    };
  }

  private readonly prioriteColorMap: Record<string, string> = {
    Haute:   '#ff5370',
    Moyenne: '#FFB64D',
    Basse:   '#2ed8b6'
  };

  private normalizePriorite(raw: string | null | undefined): 'Haute' | 'Moyenne' | 'Basse' {
    const map: Record<string, 'Haute' | 'Moyenne' | 'Basse'> = {
      haute: 'Haute', high: 'Haute', critique: 'Haute', critical: 'Haute',
      moyenne: 'Moyenne', medium: 'Moyenne', normale: 'Moyenne', normal: 'Moyenne',
      basse: 'Basse', low: 'Basse', faible: 'Basse'
    };
    return map[(raw ?? '').toLowerCase()] ?? 'Moyenne';
  }
}
