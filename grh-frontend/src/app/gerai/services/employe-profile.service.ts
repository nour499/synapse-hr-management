import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import Keycloak from 'keycloak-js';

import {
    ProfilEmploye,
    DocumentEmploye,
    ActiviteEmploye,
    StatistiquesEmploye,
    PerformanceEmploye,
    UpdateProfilDTO,
    ProfilComplet
} from 'src/app/gerai/models/employe-profile.model';

@Injectable({
    providedIn: 'root'
})
export class ProfilEmployeService {

    private http = inject(HttpClient);
    private keycloak = inject(Keycloak);
    private baseUrl = '/api/employe';

    /* ════════════════════════════════════════════
       👤 PROFIL (Fusion token Keycloak + Backend)
    ════════════════════════════════════════════ */

    /**
     * Creates the employee DB record from the current JWT token if one doesn't exist yet.
     * Idempotent — safe to call on every profile page load.
     */
    syncProfil(): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/sync`, {}).pipe(
            catchError(() => of(null))
        );
    }

    /**
     * Returns the authenticated user's numeric DB id and their manager's DB id.
     * These are the ids used by formations, evaluations, and actifs APIs.
     */
    getDbProfile(): Observable<{ dbId: number; managerId: number | null }> {
        return this.http.get<{ dbId: number; managerId: number | null }>(`${this.baseUrl}/profil`).pipe(
            map(p => ({ dbId: p.dbId ?? 0, managerId: p.managerId ?? null })),
            catchError(() => of({ dbId: 0, managerId: null }))
        );
    }

    getProfil(): Observable<ProfilEmploye> {
        // Extract identity directly from the parsed JWT — synchronous, no round-trip needed
        const token = this.keycloak.tokenParsed as Record<string, any> | undefined;

        const id        = token?.['sub']              ?? '';
        const prenom    = token?.['given_name']       ?? token?.['preferred_username'] ?? '';
        const nom       = token?.['family_name']      ?? '';
        const nomComplet= token?.['name']             ?? `${prenom} ${nom}`.trim();
        const email     = token?.['email']            ?? '';

        return this.http.get<ProfilEmploye>(`${this.baseUrl}/profil`).pipe(
            map(profilBackend => ({
                ...profilBackend,
                // Token values always win over backend for identity fields
                id,
                nom:           nom        || profilBackend.nom,
                prenom:        prenom     || profilBackend.prenom,
                nomComplet:    nomComplet || profilBackend.nomComplet,
                email:         email      || profilBackend.email,
                // Ensure arrays are never undefined (backend may omit them)
                competences:   profilBackend.competences    ?? [],
                langues:       profilBackend.langues        ?? [],
                certifications:profilBackend.certifications ?? []
            }))
        );
    }

    getProfilComplet(): Observable<ProfilComplet> {
        return forkJoin({
            profil: this.getProfil(),
            documents: this.getDocuments(),
            activites: this.getActivites(),
            statistiques: this.getStatistiques()
        });
    }

    updateProfil(updates: UpdateProfilDTO): Observable<ProfilEmploye> {
        return this.http.put<ProfilEmploye>(`${this.baseUrl}/profil`, updates);
    }

    uploadPhoto(formData: FormData): Observable<{ photoUrl: string }> {
        return this.http.post<{ photoUrl: string }>(`${this.baseUrl}/profil/photo`, formData);
    }

    getPhotoBlobUrl(serverUrl: string): Observable<string> {
        return this.http.get(serverUrl, { responseType: 'blob' }).pipe(
            map(blob => URL.createObjectURL(blob))
        );
    }

    /* ════════════════════════════════════════════
       📂 DOCUMENTS
    ════════════════════════════════════════════ */

    getDocuments(): Observable<DocumentEmploye[]> {
        return this.http.get<DocumentEmploye[]>(`${this.baseUrl}/documents`);
    }

    uploadDocument(formData: FormData): Observable<DocumentEmploye> {
        return this.http.post<DocumentEmploye>(
            `${this.baseUrl}/documents`,
            formData
        );
    }

    deleteDocument(id: number): Observable<void> {
        return this.http.delete<void>(
            `${this.baseUrl}/documents/${id}`
        );
    }

    downloadDocument(
        id: number,
        action: 'view' | 'download' = 'download'
    ): Observable<Blob> {
        return this.http.get(
            `${this.baseUrl}/documents/${id}/${action}`,
            { responseType: 'blob' }
        );
    }

    viewDocument(id: number): void {
        this.downloadDocument(id, 'view').subscribe(blob => {
            const fileURL = URL.createObjectURL(blob);
            window.open(fileURL, '_blank');
        });
    }

    forceDownload(id: number, filename?: string): void {
        this.downloadDocument(id, 'download').subscribe(blob => {
            const objectUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = objectUrl;
            a.download = filename || `Document_${id}.pdf`;
            a.click();
            URL.revokeObjectURL(objectUrl);
        });
    }

    /* ════════════════════════════════════════════
       📊 ACTIVITÉS & STATS
    ════════════════════════════════════════════ */

    getActivites(): Observable<ActiviteEmploye[]> {
        return this.http.get<ActiviteEmploye[]>(
            `${this.baseUrl}/activites`
        );
    }

    getStatistiques(): Observable<StatistiquesEmploye> {
        return this.http.get<StatistiquesEmploye>(
            `${this.baseUrl}/statistiques`
        );
    }

    getPerformance(): Observable<PerformanceEmploye> {
        return this.http.get<PerformanceEmploye>(
            `${this.baseUrl}/performance`
        );
    }

}