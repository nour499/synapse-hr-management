import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Consomme GET /api/analytics/dashboard (analytics-service).
 * Renvoie les KPIs globaux (admin/RH) ou filtrés sur le département
 * du chef connecté — calculés côté backend Oracle.
 */
export interface DashboardSummary {
  totalDemandes: number;
  demandesEnAttente: number;
  demandesValidees: number;
  demandesRejetees: number;
  demandesAnnulees: number;

  demandesParType: Record<string, number>;
  demandesParStatut: Record<string, number>;
  demandesParMois: Record<string, number>;

  tauxAcceptation: number;
  tauxRejet: number;

  absentsAujourdhui: number;
  tauxAbsenteismeMoisCourant: number;
  projetsActifs: number;
  tachesOuvertes: number;
}

@Injectable({ providedIn: 'root' })
export class AnalyticsDashboardService {
  private http = inject(HttpClient);

  getDashboard(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>('/api/analytics/dashboard');
  }
}
