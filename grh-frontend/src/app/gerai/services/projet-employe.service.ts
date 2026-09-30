import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Projet, TacheProjet } from '../models/projet.model';

@Injectable({ providedIn: 'root' })
export class ProjetService {
    private http = inject(HttpClient);
    private API = '/api/projets';

    getProjets(): Observable<Projet[]> {
        return this.http.get<Projet[]>(this.API);
    }

    getMesTachesRecentes(): Observable<TacheProjet[]> {
        return this.http.get<TacheProjet[]>(`${this.API}/mes-taches`);
    }

    toggleTacheStatus(tacheId: number): Observable<TacheProjet> {
        return this.http.patch<TacheProjet>(`${this.API}/taches/${tacheId}/toggle`, {});
    }
}