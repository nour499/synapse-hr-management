import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Demande, TypeDemande, ComiteVoteInfo } from 'src/app/gerai/models/demande.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class DemandeService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private readonly API_URL = '/api/demandes';

  private get listPath(): string {
    const role = this.auth.role;
    if (role === 'admin')  return '/toutes';
    if (role === 'chef')   return '/equipe';
    return '/mes-demandes';
  }

  private typeSegment(type: TypeDemande): string {
    const map: Record<string, string> = {
      CONGE: 'conge', MALADIE: 'conge', ANNUEL: 'conge', RTT: 'conge', SANS_SOLDE: 'conge',
      FAMILIAL: 'conge', HAJJ: 'conge', MATERNITE: 'conge', POSTNATAL: 'conge',
      ALLAITEMENT: 'conge', LONGUE_MALADIE: 'conge', NAISSANCE_PERE: 'conge',
      CREATION_ENTREPRISE: 'conge', OBLIGATIONS_LEGALES: 'conge',
      FORMATION: 'formation',
      PRET: 'pret', CREDIT: 'pret',
      DOCUMENT: 'document', DOCUMENT_ADMINISTRATIF: 'document',
      AUTORISATION: 'autorisation', AUTRE: 'autorisation'
    };
    return map[type as string] ?? 'conge';
  }

  getDemandes(): Observable<Demande[]> {
    return this.http.get<Demande[]>(`${this.API_URL}${this.listPath}`)
      .pipe(map(list => list.map(d => this.enrich(d))));
  }

  getDemandesRecentes(limit: number = 5): Observable<Demande[]> {
    return this.http.get<Demande[]>(`${this.API_URL}${this.listPath}?limit=${limit}`)
      .pipe(map(list => list.map(d => this.enrich(d))));
  }

  createDemande(demande: Partial<Demande>): Observable<Demande> {
    return this.http.post<Demande>(this.API_URL, demande);
  }

  validerDemande(id: number, type?: TypeDemande): Observable<Demande> {
    const statut = this.auth.role === 'admin' ? 'VALIDEE_RH' : 'VALIDEE_CHEF';
    return this.http.put<Demande>(`${this.API_URL}/${id}/valider`, { nouveauStatut: statut })
      .pipe(map(d => this.enrich(d)));
  }

  refuserDemande(id: number, type?: TypeDemande, motif: string = ''): Observable<Demande> {
    return this.http.put<Demande>(`${this.API_URL}/${id}/refuser`, { nouveauStatut: 'REJETEE', commentaire: motif })
      .pipe(map(d => this.enrich(d)));
  }

  getDemandeById(id: number): Observable<Demande> {
    return this.http.get<Demande>(`${this.API_URL}/${id}`)
      .pipe(map(d => this.enrich(d)));
  }

  annulerDemande(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  // ── Direction RH — décision finale sur un prêt ───────────────────────────

  /** Décision finale de la Direction RH (approuver/refuser avec montant et tranches). */
  directionDecision(id: number, body: { approuve: boolean; montantApprouve?: number; nbTranches?: number; commentaire?: string }): Observable<Demande> {
    return this.http.put<Demande>(`${this.API_URL}/credit/${id}/decision-dg`, body);
  }

  /** Alias legacy — préférer directionDecision(). */
  dgDecision(id: number, body: { approuve: boolean; montantApprouve?: number; nbTranches?: number; commentaire?: string }): Observable<Demande> {
    return this.directionDecision(id, body);
  }

  /** Prêts ayant reçu l'avis favorable de la commission et en attente de décision Direction RH. */
  getPretsEnAttenteDirection(): Observable<Demande[]> {
    return this.http.get<Demande[]>(`${this.API_URL}/credit/en-attente-dg`)
      .pipe(map(list => list.map(d => this.enrich(d))));
  }

  /** Alias legacy — préférer getPretsEnAttenteDirection(). */
  getCreditsEnAttenteDg(): Observable<Demande[]> {
    return this.getPretsEnAttenteDirection();
  }

  /** Tous les prêts (historique Direction RH). */
  getAllCredits(): Observable<Demande[]> {
    return this.http.get<Demande[]>(`${this.API_URL}/credit/all`)
      .pipe(map(list => list.map(d => this.enrich(d))));
  }

  // ── Commission de prêt ────────────────────────────────────────────────────

  /** Prêts en attente d'avis de la commission (EN_ETUDE_COMMISSION / EN_ETUDE_DG). */
  getCommissionPending(): Observable<Demande[]> {
    return this.http.get<Demande[]>(`${this.API_URL}/comite/pending`)
      .pipe(map(list => list.map(d => this.enrich(d))));
  }

  /** Alias legacy — préférer getCommissionPending(). */
  getComitePending(): Observable<Demande[]> {
    return this.getCommissionPending();
  }

  /** Tous les prêts (vue commission). */
  getCommissionAll(): Observable<Demande[]> {
    return this.http.get<Demande[]>(`${this.API_URL}/comite/all`)
      .pipe(map(list => list.map(d => this.enrich(d))));
  }

  /** Alias legacy — préférer getCommissionAll(). */
  getComiteAll(): Observable<Demande[]> {
    return this.getCommissionAll();
  }

  /** Avis existants de la commission pour un prêt. */
  getCommissionVotes(loanId: number): Observable<ComiteVoteInfo[]> {
    return this.http.get<ComiteVoteInfo[]>(`${this.API_URL}/comite/${loanId}/votes`);
  }

  /** Alias legacy — préférer getCommissionVotes(). */
  getComiteVotes(loanId: number): Observable<ComiteVoteInfo[]> {
    return this.getCommissionVotes(loanId);
  }

  /** Soumettre un avis FAVORABLE / DEFAVORABLE de la commission. */
  castCommissionVote(loanId: number, body: {
    vote: 'FAVORABLE' | 'DEFAVORABLE';
    commentaire?: string;
    montantSuggere?: number;
    nbTranchesSuggeres?: number;
  }): Observable<ComiteVoteInfo> {
    return this.http.post<ComiteVoteInfo>(`${this.API_URL}/comite/${loanId}/vote`, body);
  }

  /** Alias legacy — préférer castCommissionVote(). */
  castComiteVote(loanId: number, body: {
    vote: 'FAVORABLE' | 'DEFAVORABLE';
    commentaire?: string;
    montantSuggere?: number;
    nbTranchesSuggeres?: number;
  }): Observable<ComiteVoteInfo> {
    return this.castCommissionVote(loanId, body);
  }

  enrich(d: Demande): Demande {
    const typeLabels: Record<string, string> = {
      CONGE:               'Congé annuel',
      ANNUEL:              'Congé annuel',
      MALADIE:             'Congé maladie',
      FAMILIAL:            'Congé familial',
      HAJJ:                'Congé pèlerinage (Hajj)',
      MATERNITE:           'Congé maternité',
      POSTNATAL:           'Congé postnatal',
      ALLAITEMENT:         'Repos allaitement',
      SANS_SOLDE:          'Congé sans solde',
      LONGUE_MALADIE:      'Longue maladie',
      NAISSANCE_PERE:      'Naissance (père)',
      CREATION_ENTREPRISE: "Création d'entreprise",
      OBLIGATIONS_LEGALES: 'Obligations légales',
      RTT:                 'RTT',
      FORMATION:           'Formation',
      PRET:                'Crédit',
      CREDIT:              'Crédit',
      DOCUMENT:            'Document',
      DOCUMENT_ADMINISTRATIF: 'Document administratif',
      AUTORISATION:        "Autorisation d'absence",
      AUTRE:               "Autorisation d'absence",
    };
    const statutLabels: Record<string, string> = {
      EN_ATTENTE:           'En attente',
      VALIDEE_CHEF:         'Avis hiérarchie favorable',
      EN_ETUDE_COMMISSION:  'En étude — Commission de prêt',
      EN_ETUDE_DG:          'En étude — Commission de prêt',
      VALIDEE_COMMISSION:   'Avis commission favorable',
      VALIDEE_DG:           'Avis commission favorable',
      VALIDEE_RH:           'Validé — Direction RH',

      VALIDEE:              'Validée',
      REJETEE:              'Rejetée',
      ANNULEE:              'Annulée',
      EN_ETUDE_MEDICALE:    'Comité médical'
    };
    // leaveTypeName (e.g. "MALADIE") from backend overrides type ("CONGE") for label resolution
    const labelKey = (d as any).leaveTypeName || d.type;
    return {
      ...d,
      typeLabel:   d.typeLabel   ?? typeLabels[labelKey] ?? typeLabels[d.type] ?? d.type,
      statutLabel: d.statutLabel ?? statutLabels[d.statut as string] ?? d.statut,
      employePhoto: d.employePhoto ?? undefined
    };
  }
}
