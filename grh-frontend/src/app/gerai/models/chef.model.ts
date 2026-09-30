/**
 * Interfaces pour le Dashboard Chef
 */

export interface PerformanceChef {
    tauxLivraisonProjet: number;    // Project Delivery — % on time (0–100)
    satisfactionClient: number;     // Client Satisfaction (0–5)
    collaborationEquipe: number;    // Team Collaboration score (0–100)
    qualiteCode: number;            // Code Quality team avg (0–100)
    tempsResolutionBugs: number;    // Bug Resolution Time avg (days)
}

export type StatutDemande = 'EN_ATTENTE' | 'VALIDEE' | 'REFUSEE';

export interface DemandeChef {
    id: number;
    employeId: string;
    employeNom: string;
    type: 'Congé' | 'Formation' | 'Document' | 'Autorisation' | 'Matériel';
    dateDebut?: string;
    dateFin?: string;
    dateCreation: string;
    statut: StatutDemande;
    description?: string;
    priorite?: 'Haute' | 'Moyenne' | 'Basse';
}

export interface MembreEquipe {
    id: number;
    keycloakId: string;
    nom: string;
    email?: string;
    poste: string;
    departement?: string;
    present: boolean;
    avatar?: string;
    statut: 'ACTIF' | 'CONGE' | 'INACTIF';
}

export interface TacheChef {
    id: number;
    titre: string;
    description?: string;
    assigneA?: string;
    assigneNom?: string;
    priorite: 'Haute' | 'Moyenne' | 'Basse';
    statut: 'A_FAIRE' | 'EN_COURS' | 'TERMINEE';
    echeance: string;
    progression?: number;
    projetId?: number;
}

export interface ProjetChef {
    id: number;
    nom: string;
    description?: string;
    dateDebut: string;
    dateFinPrevue: string;
    avancement: number;
    statut: 'planifie' | 'en_cours' | 'termine' | 'en_pause';
    chefProjet?: string;
    equipe?: string[];
    budget?: number;
    priorite?: 'Haute' | 'Moyenne' | 'Basse';
}

export interface KPIsChef {
    totalEmployes: number;
    demandesEnAttente: number;
    projetsActifs: number;
    tauxPresenceEquipe: number;
    tachesEnRetard?: number;
    performanceEquipe?: number;
}

export interface NotificationChef {
    id: number;
    titre: string;
    message: string;
    date: string;
    type: 'success' | 'warning' | 'danger' | 'info';
    lue: boolean;
    lien?: string;
}

export interface DashboardStats {
    kpis: KPIsChef;
    demandes: DemandeChef[];
    equipe: MembreEquipe[];
    taches: TacheChef[];
    projets: ProjetChef[];
    notifications: NotificationChef[];
}
