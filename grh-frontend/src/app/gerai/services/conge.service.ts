import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import {
    SoldeConge,
    DemandeConge,
    StatistiquesConges,
    CongesComplet,
    CreateDemandeDTO
} from '../models/conge.model';

/**
 * Service pour la gestion des congés
 * Communique avec le backend (ou MSW en développement)
 */
@Injectable({
    providedIn: 'root'
})
export class CongesService {
    private http = inject(HttpClient);
    private baseUrl = '/api/conges';

    /* ══════════════════════════════════════════════════════════════
       📡 RÉCUPÉRATION DES DONNÉES
       ══════════════════════════════════════════════════════════════ */

    /**
     * Récupère le solde de congés
     */
    getSolde(): Observable<SoldeConge> {
        return this.http.get<SoldeConge>(`${this.baseUrl}/solde`);
    }

    /**
     * Récupère les demandes de congés
     */
    getMesDemandes(): Observable<DemandeConge[]> {
        return this.http.get<any[]>(`${this.baseUrl}/mes-demandes`)
            .pipe(map(list => (list ?? []).map(d => this.mapDemandeConge(d))));
    }

    /**
     * Récupère les statistiques
     */
    getStatistiques(): Observable<StatistiquesConges> {
        return this.http.get<StatistiquesConges>(`${this.baseUrl}/statistiques`);
    }

    /**
     * ✨ OPTIMISATION: Récupère toutes les données en une seule requête
     * Utilise un endpoint dédié côté backend
     */
    getCongesComplet(): Observable<CongesComplet> {
        return this.http.get<any>(`${this.baseUrl}/complet`)
            .pipe(map(data => ({
                solde: data?.solde ?? {} as SoldeConge,
                statistiques: data?.statistiques ?? {} as StatistiquesConges,
                demandes: (data?.demandes ?? []).map((d: any) => this.mapDemandeConge(d))
            })));
    }

    /**
     * Alternative: Charge tout en parallèle avec forkJoin
     * (si le backend n'a pas d'endpoint /complet)
     */
    getCongesCompletParallele(): Observable<CongesComplet> {
        return forkJoin({
            solde: this.getSolde(),
            demandes: this.getMesDemandes(),
            statistiques: this.getStatistiques()
        });
    }

    /* ══════════════════════════════════════════════════════════════
       ✏️ ACTIONS
       ══════════════════════════════════════════════════════════════ */

    /**
     * Crée une nouvelle demande de congé
     */
    creerDemande(demande: CreateDemandeDTO): Observable<DemandeConge> {
        return this.http.post<DemandeConge>(`${this.baseUrl}/demander`, demande);
    }

    /**
     * Annule une demande en attente
     */
    annulerDemande(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${id}`);
    }

    /**
     * Mappe une DemandeResponse (backend) vers le modèle DemandeConge (frontend).
     */
    private mapDemandeConge(d: any): DemandeConge {
        const backendStatut: string = d?.statut ?? 'EN_ATTENTE';
        const statut: DemandeConge['statut'] =
            backendStatut.startsWith('VALIDEE') ? 'APPROUVE'
                : backendStatut === 'REJETEE' || backendStatut === 'ANNULEE' ? 'REJETE'
                : 'EN_ATTENTE';

        const type: DemandeConge['type'] =
            (d?.leaveTypeName as DemandeConge['type']) ?? 'ANNUEL';

        return {
            id: d?.id ?? d?.requestId,
            employeId: String(d?.employeId ?? d?.employeeId ?? ''),
            type,
            dateDebut: d?.dateDebut ?? d?.startDate ?? '',
            dateFin: d?.dateFin ?? d?.endDate ?? '',
            jours: d?.joursOuvres ?? d?.daysCount ?? d?.jours ?? 0,
            joursOuvres: d?.joursOuvres ?? d?.daysCount ?? 0,
            statut,
            motif: d?.reason ?? d?.description ?? '',
            commentaireRefus: d?.commentaireRh ?? d?.rejectionReason ?? '',
            dateDemande: d?.dateCreation ?? d?.createdAt ?? '',
            dateReponse: d?.dateValidation ?? '',
            validePar: d?.validePar ?? '',
            validateurNom: d?.validateurNom ?? ''
        } as DemandeConge;
    }
}