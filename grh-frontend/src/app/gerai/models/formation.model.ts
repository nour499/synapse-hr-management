export type StatutFormation =
  | 'EN_ATTENTE'       // soumis par l'employé
  | 'APPROUVE_CHEF'    // validé chef (niveau 1)
  | 'REJETE_CHEF'      // rejeté chef
  | 'APPROUVE_RH'      // approuvé RH (final)
  | 'REJETE_RH'        // rejeté RH
  | 'PLANIFIEE'        // date fixée
  | 'EN_COURS'         // formation en cours
  | 'COMPLETEE'        // terminée
  | 'ANNULEE';         // annulée

export type TypeFormation =
  | 'TECHNIQUE' | 'MANAGEMENT' | 'LANGUE' | 'SECURITE'
  | 'QUALITE' | 'SOFT_SKILL' | 'CERTIFICATION' | 'AUTRE';

export type ModeFormation = 'PRESENTIEL' | 'DISTANCIEL' | 'HYBRIDE';

export interface DemandeFormation {
  id                  : number;
  // Demandeur
  employeId           : number;
  employeNom          : string;
  employePrenom       : string;
  employePhoto       ?: string;
  departement         : string;
  chefId             ?: number;
  chefNom            ?: string;
  // Formation
  titre               : string;
  organisme           : string;
  type                : TypeFormation;
  mode                : ModeFormation;
  dureeJours          : number;
  coutEstime         ?: number;
  lieu               ?: string;
  dateDebutSouhaitee ?: string;
  dateFinSouhaitee   ?: string;
  objectifs           : string;
  competencesVisees  ?: string[];
  // Workflow
  statut              : StatutFormation;
  dateDemande         : string;
  // Validation chef
  commentaireChef    ?: string;
  dateTraitementChef ?: string;
  // Validation RH
  commentaireRh      ?: string;
  dateTraitementRh   ?: string;
  traiteeParRh       ?: string;
  // Post-approbation
  dateDebutReelle    ?: string;
  dateFinReelle      ?: string;
  certificatObtenu   ?: boolean;
  evaluation         ?: number;   // 1-5
  noteEvaluation     ?: string;
}

export const STATUT_FORMATION_LABELS: Record<StatutFormation, string> = {
  EN_ATTENTE    : 'En attente chef',
  APPROUVE_CHEF : 'Validé chef',
  REJETE_CHEF   : 'Rejeté chef',
  APPROUVE_RH   : 'Approuvé RH',
  REJETE_RH     : 'Rejeté RH',
  PLANIFIEE     : 'Planifiée',
  EN_COURS      : 'En cours',
  COMPLETEE     : 'Complétée',
  ANNULEE       : 'Annulée'
};

export const STATUT_FORMATION_COLORS: Record<StatutFormation, string> = {
  EN_ATTENTE    : '#F59E0B',
  APPROUVE_CHEF : '#0EA5E9',
  REJETE_CHEF   : '#EF4444',
  APPROUVE_RH   : '#8B5CF6',
  REJETE_RH     : '#EF4444',
  PLANIFIEE     : '#6366F1',
  EN_COURS      : '#F97316',
  COMPLETEE     : '#10B981',
  ANNULEE       : '#64748B'
};

export const TYPE_FORMATION_LABELS: Record<TypeFormation, string> = {
  TECHNIQUE    : 'Technique',
  MANAGEMENT   : 'Management',
  LANGUE       : 'Langue',
  SECURITE     : 'Sécurité',
  QUALITE      : 'Qualité',
  SOFT_SKILL   : 'Soft Skill',
  CERTIFICATION: 'Certification',
  AUTRE        : 'Autre'
};

export const TYPE_FORMATION_COLORS: Record<TypeFormation, string> = {
  TECHNIQUE    : '#6366F1',
  MANAGEMENT   : '#0EA5E9',
  LANGUE       : '#F59E0B',
  SECURITE     : '#EF4444',
  QUALITE      : '#10B981',
  SOFT_SKILL   : '#EC4899',
  CERTIFICATION: '#8B5CF6',
  AUTRE        : '#64748B'
};

export const MODE_FORMATION_LABELS: Record<ModeFormation, string> = {
  PRESENTIEL: 'Présentiel',
  DISTANCIEL: 'Distanciel',
  HYBRIDE   : 'Hybride'
};

// Statuts que l'employé peut voir comme "actifs" (non terminaux)
export const STATUTS_ACTIFS: StatutFormation[] = [
  'EN_ATTENTE', 'APPROUVE_CHEF', 'APPROUVE_RH', 'PLANIFIEE', 'EN_COURS'
];

// Workflow steps for progress display
export const FORMATION_STEPS: { statut: StatutFormation; label: string }[] = [
  { statut: 'EN_ATTENTE',    label: 'Demande soumise'  },
  { statut: 'APPROUVE_CHEF', label: 'Validé par le chef' },
  { statut: 'APPROUVE_RH',   label: 'Approuvé RH'      },
  { statut: 'PLANIFIEE',     label: 'Planifiée'         },
  { statut: 'COMPLETEE',     label: 'Complétée'         }
];
