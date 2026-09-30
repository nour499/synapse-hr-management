import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Projet, Membre } from 'src/app/gerai/models/projet.model';
import { Employe } from 'src/app/theme/shared/interfaces/employe';

/** Payload sent to POST /api/affectation/projets */
export interface CreateProjetPayload {
  nom:          string;
  description?: string;
  code?:        string;
  dateDebut?:   string;
  dateFin?:     string;
  statut?:      string;
  priority?:    string;
  progression?: number;
  membreIds?:   number[];
}

/** Payload sent to PUT /api/affectation/projets/:id */
export interface UpdateProjetPayload {
  nom?:         string;
  description?: string;
  dateDebut?:   string;
  dateFin?:     string;
  statut?:      string;
  progression?: number;
  membreIds?:   number[];
}

@Injectable({
    providedIn: 'root'
})
export class ProjetService {
    private http = inject(HttpClient);
    private readonly API_URL = '/api/affectation';

    // --- PROJETS ---
    getProjets(): Observable<Projet[]> {
        return this.http.get<any[]>(`${this.API_URL}/projets`).pipe(
            map(list => list.map(p => this.mapProjet(p)))
        );
    }

    createProjet(payload: CreateProjetPayload): Observable<Projet> {
        return this.http.post<any>(`${this.API_URL}/projets`, payload).pipe(
            map(p => this.mapProjet(p))
        );
    }

    updateProjet(id: number, payload: UpdateProjetPayload): Observable<Projet> {
        return this.http.put<any>(`${this.API_URL}/projets/${id}`, payload).pipe(
            map(p => this.mapProjet(p))
        );
    }

    private mapProjet(p: any): Projet {
        const taches: any[] = p.taches ?? [];
        const totalTaches = taches.length;
        const tachesCompletees = taches.filter(t => t.terminee || t.statut === 'TERMINE').length;
        const progression = totalTaches > 0
            ? Math.round((tachesCompletees / totalTaches) * 100)
            : (p.progression ?? 0);
        return {
            ...p,
            totalTaches,
            tachesCompletees,
            progression,
            membres: p.membres ?? [],
            equipe: (p.membres ?? []).map((m: any): Membre => ({
                id:        m.id,
                nom:       m.nomComplet ?? `${m.prenom ?? ''} ${m.nom ?? ''}`.trim(),
                initiales: m.initiales  ?? ((m.prenom?.[0] ?? '') + (m.nom?.[0] ?? '')).toUpperCase(),
                photo:     m.photo ?? undefined
            }))
        } as Projet;
    }

    deleteProjet(id: number): Observable<void> {
        return this.http.delete<void>(`${this.API_URL}/projets/${id}`);
    }

    // --- RÉFÉRENTIELS ---
    getEmployes(): Observable<Employe[]> {
        return this.http.get<Employe[]>(`${this.API_URL}/employes`);
    }
}
