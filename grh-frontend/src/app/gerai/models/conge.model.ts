/**
 * Interfaces pour la gestion des congés
 */

export interface SoldeConge {
    employeId: string;
    annuel: number;
    annuelTotal: number; // Total de jours annuels
    maladie: number;
    maladieTotal: number;
    rtt: number;
    rttTotal: number;
    pris: number; // Total déjà pris cette année
    anneeEnCours: number;
}

export interface DemandeConge {
    id: number;
    employeId: string;
    type: 'ANNUEL' | 'MALADIE' | 'RTT' | 'SANS_SOLDE';
    dateDebut: string;
    dateFin: string;
    jours: number;
    joursOuvres: number; // Jours ouvrés uniquement
    statut: 'EN_ATTENTE' | 'APPROUVE' | 'REJETE';
    motif?: string;
    commentaireRefus?: string;
    dateDemande: string;
    dateReponse?: string;
    validePar?: string; // ID du manager
    validateurNom?: string; // Nom du validateur
}

export interface StatistiquesConges {
    totalDemandes: number;
    enAttente: number;
    approuvees: number;
    rejetees: number;
    joursRestantsTotal: number;
    tauxUtilisation: number; // Pourcentage
    prochainConge?: {
        dateDebut: string;
        jours: number;
    };
}

// DTO pour créer une demande
export interface CreateDemandeDTO {
    type: 'ANNUEL' | 'MALADIE' | 'RTT' | 'SANS_SOLDE';
    dateDebut: string;
    dateFin: string;
    motif?: string;
}

// Absence d'un collègue visible par l'équipe
export interface TeamAbsence {
  employeId: string;
  nom: string;
  prenom: string;
  type: 'ANNUEL' | 'MALADIE' | 'RTT' | 'SANS_SOLDE';
  dateDebut: string;
  dateFin: string;
}

// Réponse complète avec toutes les données
export interface CongesComplet {
    solde: SoldeConge;
    demandes: DemandeConge[];
    statistiques: StatistiquesConges;
}