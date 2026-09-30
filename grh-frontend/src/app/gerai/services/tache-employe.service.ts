import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { TacheKanban } from 'src/app/gerai/models/tache.model';
import { ProjetService } from './projet-employe.service';

@Injectable({ providedIn: 'root' })
export class TacheService {
    private http          = inject(HttpClient);
    private projetService = inject(ProjetService);
    private API = '/api/taches';

    getTaches(): Observable<TacheKanban[]> {
        return forkJoin({
            taches: this.http.get<TacheKanban[]>(this.API),
            projets: this.projetService.getProjets().pipe(catchError(() => of([])))
        }).pipe(
            map(({ taches, projets }) => {
                const projetMap = new Map<number, string>(
                    projets.map(p => [p.id, p.nom] as [number, string])
                );
                return taches.map(t => ({
                    ...t,
                    // Le backend renvoie déjà `projet` (nom) et `projetId`.
                    // On garde le nom du backend, sinon fallback via projets.
                    projet: (t.projet || projetMap.get(t.projetId!) || '—') as string,
                    // Sécurise les champs toujours présents côté template.
                    progression: t.progression ?? 0,
                    priorite: (t.priorite || 'Moyenne') as TacheKanban['priorite']
                }));
            })
        );
    }

    updateTache(id: number, changes: Partial<TacheKanban>): Observable<TacheKanban> {
        return this.http.patch<TacheKanban>(`${this.API}/${id}`, changes);
    }
}
