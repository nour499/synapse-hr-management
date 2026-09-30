/**
 * Interfaces pour la gestion des demandes
 * Utilisées par les interfaces Chef ET Employé
 */

export type TypeDemande =
  | 'CONGE' | 'FORMATION' | 'DOCUMENT_ADMINISTRATIF' | 'PRET' | 'CREDIT' | 'AUTRE'
  | 'ANNUEL' | 'MALADIE' | 'RTT' | 'SANS_SOLDE'
  | 'FAMILIAL' | 'HAJJ' | 'MATERNITE' | 'POSTNATAL' | 'ALLAITEMENT'
  | 'LONGUE_MALADIE' | 'NAISSANCE_PERE' | 'CREATION_ENTREPRISE' | 'OBLIGATIONS_LEGALES'
  // Backend enum values (may differ from frontend aliases above)
  | 'DOCUMENT' | 'AUTORISATION';
export type StatutDemande =
  | 'EN_ATTENTE'
  | 'VALIDEE_CHEF'
  | 'EN_ETUDE_COMMISSION'   // En étude par la commission de prêt
  | 'EN_ETUDE_DG'           // Alias backend — mappé sur EN_ETUDE_COMMISSION
  | 'VALIDEE_COMMISSION'    // Avis favorable de la commission
  | 'VALIDEE_DG'            // Alias backend — mappé sur VALIDEE_COMMISSION
  | 'VALIDEE_RH'            // Décision finale Direction RH
  | 'REJETEE'
  | 'VALIDEE'
  | 'ANNULEE'
  | 'EN_ETUDE_MEDICALE';

export interface Demande {
  id: number;
  employeId: string;
  employeNom: string;
  employePrenom: string;
  employeInitiales: string;
  employePhoto?: string;

  // Type de demande
  type: TypeDemande;
  typeLabel?: string;
  typeIcon?: string;
  typeColor?: string;

  // Description
  description: string;

  // Dates (On garde 'date' en optionnel pour la compatibilité avec ton Dashboard)
  dateCreation: string;
  dateDebut: string | null;
  dateFin: string | null;
  date?: string;           // Ajouté pour corriger l'erreur template HTML
  joursOuvres?: number;

  // Statut
  statut: StatutDemande | string;
  statutLabel?: string;
  statutIcon?: string;
  statutColor?: string;    // Renommé pour cohérence (était statusColor)

  // Propriétés UI pour le Dashboard (Points de couleur et icônes)
  bgColor?: string;        // Ajouté pour corriger l'erreur template HTML
  icon?: string;           // Ajouté pour corriger l'erreur template HTML

  // Validation
  validePar?: string | null;
  validateurNom?: string | null;
  validateurNomChef?: string | null;
  validateurNomDg?: string | null;
  validateurNomRh?: string | null;
  dateValidation?: string | null;
  dateValidationDg?: string | null;
  dateValidationRh?: string | null;
  commentaireChef: string | null;
  commentaireRh: string | null;

  // Congé spécifique
  leaveTypeId?: number;
  leaveTypeName?: string;   // MALADIE, ANNUEL, FAMILIAL… renvoyé par le backend
  halfSalary?: boolean;
  medApproved?: boolean;
  medComment?: string;
  dateValidationMed?: string;

  // Pièces jointes
  pieceJointes?: string[];

  // Document (DOCUMENT_REQUESTS)
  copiesCount?: number;
  docTypeId?: number;
  language?: string;

  // Formation (TRAINING_REQUESTS)
  trainingTitle?: string;
  provider?: string;
  plannedDate?: string;
  durationDays?: number;
  estimatedCost?: number;
  lieu?: string;
  modeFormation?: string;

  // Prêt (LOAN_REQUESTS) — saisie
  amount?: number;
  currency?: string;
  durationMonths?: number;
  monthlyPayment?: number;
  capaciteEndettement?: number;   // Calculée automatiquement (salaire × 33 %)
  tauxEndettement?: number;       // Taux d'endettement résultant (%)

  // Prêt — décision Direction RH
  montantApprouve?: number;
  nbTranches?: number;
  montantTranche?: number;
  commentaireDirection?: string;
  dgComment?: string;             // Alias legacy

  // Avis commission
  validateurNomCommission?: string | null;
  dateValidationCommission?: string | null;
  commentaireCommission?: string | null;

  // Vote de la commission (enrichi côté frontend)
  votes?: ComiteVoteInfo[];
}

export interface ComiteVoteInfo {
  voteId: number;
  loanId: number;
  memberId: number;
  memberNom: string;
  vote: 'FAVORABLE' | 'DEFAVORABLE';
  commentaire?: string;
  montantSuggere?: number;
  nbTranchesSuggeres?: number;
  votedAt: string;
}

// --- Les autres interfaces restent identiques ---

export interface StatistiquesDemandes {
  total: number;
  enAttente: number;
  validees: number;
  rejetees: number;
  parType: {
    [key in TypeDemande]?: number; // Optionnel car tous les types ne sont pas forcément présents
  };
}

export interface CreateDemandeDTO {
  type: TypeDemande;
  description: string;
  dateDebut: string | null;
  dateFin: string | null;
  pieceJointes?: string[];
}

export interface DemandesEmployeComplet {
  demandes: Demande[];
  statistiques: StatistiquesDemandes;
}

export interface TypeDemandeConfig {
  type: TypeDemande;
  label: string;
  icon: string;
  color: string;
  requiresDates: boolean;
  leaveTypeId?: number;
  halfSalary?: boolean;
  requiresAttachment?: boolean;
  onceInCareer?: boolean;
  medicalCommittee?: boolean;
}

export const TYPES_DEMANDE_CONFIG: TypeDemandeConfig[] = [
  // ── Congés ─────────────────────────────────────────────────────────────────
  { type: 'CONGE',               label: 'Congé annuel',            icon: 'ti ti-beach',              color: '#3B82F6', requiresDates: true,  leaveTypeId: 1  },
  { type: 'MALADIE',             label: 'Congé maladie',           icon: 'ti ti-stethoscope',        color: '#EF4444', requiresDates: true,  leaveTypeId: 2  },
  { type: 'FAMILIAL',            label: 'Congé familial',          icon: 'ti ti-heart',              color: '#F97316', requiresDates: true,  leaveTypeId: 8  },
  { type: 'HAJJ',                label: 'Congé pèlerinage (Hajj)', icon: 'ti ti-compass',            color: '#059669', requiresDates: true,  leaveTypeId: 9,  onceInCareer: true },
  { type: 'MATERNITE',           label: 'Congé maternité',         icon: 'ti ti-baby-carriage',      color: '#EC4899', requiresDates: true,  leaveTypeId: 5,  requiresAttachment: true },
  { type: 'POSTNATAL',           label: 'Congé postnatal',         icon: 'ti ti-moon',               color: '#8B5CF6', requiresDates: true,  leaveTypeId: 10, halfSalary: true, requiresAttachment: true },
  { type: 'ALLAITEMENT',         label: 'Repos allaitement',       icon: 'ti ti-droplet',            color: '#DB2777', requiresDates: true,  leaveTypeId: 11, halfSalary: true },
  { type: 'SANS_SOLDE',          label: 'Congé sans solde',        icon: 'ti ti-calendar-off',       color: '#64748B', requiresDates: true,  leaveTypeId: 4  },
  { type: 'LONGUE_MALADIE',      label: 'Longue maladie',          icon: 'ti ti-activity-heartbeat', color: '#DC2626', requiresDates: true,  leaveTypeId: 12, requiresAttachment: true, medicalCommittee: true },
  { type: 'NAISSANCE_PERE',      label: 'Naissance (père)',        icon: 'ti ti-baby',               color: '#0EA5E9', requiresDates: true,  leaveTypeId: 6,  requiresAttachment: true },
  { type: 'CREATION_ENTREPRISE', label: 'Création d\'entreprise',  icon: 'ti ti-building-store',     color: '#7C3AED', requiresDates: true,  leaveTypeId: 14 },
  { type: 'OBLIGATIONS_LEGALES', label: 'Obligations légales',     icon: 'ti ti-gavel',              color: '#B45309', requiresDates: true,  leaveTypeId: 15, requiresAttachment: true },
  // ── Autres demandes ────────────────────────────────────────────────────────
  { type: 'FORMATION',              label: 'Formation',              icon: 'ti ti-school',      color: '#10B981', requiresDates: true  },
  { type: 'DOCUMENT_ADMINISTRATIF', label: 'Document administratif', icon: 'ti ti-file-text',   color: '#8B5CF6', requiresDates: false },
  { type: 'CREDIT',                 label: 'Crédit',                 icon: 'ti ti-credit-card', color: '#F59E0B', requiresDates: false },
  { type: 'AUTRE',                  label: 'Autorisation d\'absence', icon: 'ti ti-clock-pause', color: '#64748B', requiresDates: true  }
];