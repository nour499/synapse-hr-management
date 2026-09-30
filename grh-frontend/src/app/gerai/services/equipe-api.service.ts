import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MembreEquipe, CreateMembreDTO, UpdateMembreDTO } from '../models/equipe.model';

@Injectable({ providedIn: 'root' })
export class EquipeApiService {
    private http = inject(HttpClient);
    private baseUrl = '/api/equipe';

    getMembres(): Observable<MembreEquipe[]> {
        return this.http.get<MembreEquipe[]>(`${this.baseUrl}/membres`);
    }

    getMembreById(id: number): Observable<MembreEquipe> {
        return this.http.get<MembreEquipe>(`${this.baseUrl}/membres/${id}`);
    }

    ajouterMembre(data: CreateMembreDTO): Observable<MembreEquipe> {
        return this.http.post<MembreEquipe>(`${this.baseUrl}/membres`, data);
    }

    modifierMembre(id: number, data: UpdateMembreDTO): Observable<MembreEquipe> {
        return this.http.patch<MembreEquipe>(`${this.baseUrl}/membres/${id}`, data);
    }

    supprimerMembre(id: number): Observable<{ success: boolean }> {
        return this.http.delete<{ success: boolean }>(`${this.baseUrl}/membres/${id}`);
    }
}
