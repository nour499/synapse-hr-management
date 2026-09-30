export type TypeConge =
  | 'CONGE' | 'ANNUEL' | 'MALADIE' | 'RTT' | 'SANS_SOLDE'
  | 'MATERNITE' | 'PATERNITE' | 'EXCEPTIONNEL'
  | 'FAMILIAL' | 'HAJJ' | 'POSTNATAL' | 'ALLAITEMENT'
  | 'LONGUE_MALADIE' | 'NAISSANCE_PERE'
  | 'CREATION_ENTREPRISE' | 'OBLIGATIONS_LEGALES';

export type DureeType        = 'JOURNEE_COMPLETE' | 'DEMI_JOURNEE';
export type StatutCongeAdmin = 'EN_ATTENTE' | 'EN_ETUDE_MEDICALE' | 'APPROUVE' | 'REJETE' | 'ANNULE';

export interface DemandeCongeAdmin {
  id              : number;
  // Employee info
  employeId       : number;
  employeNom      : string;
  employePhoto   ?: string;
  departement    ?: string;
  // Leave details
  typeConge       : TypeConge;
  dateDebut       : string;
  dateFin         : string;
  nombreJours     : number;
  dureeType       : DureeType;
  statut          : StatutCongeAdmin;
  raison          : string;
  halfSalary     ?: boolean;
  // Tracking
  dateDemande     : string;
  approvePar     ?: string;
  dateApprobation?: string;
  commentaire    ?: string;
}

// ── Display helpers ─────────────────────────────────
export const TYPE_CONGE_LABELS: Record<TypeConge, string> = {
  CONGE              : 'Congé annuel',
  ANNUEL             : 'Congé annuel',
  MALADIE            : 'Congé maladie',
  RTT                : 'RTT',
  SANS_SOLDE         : 'Sans solde',
  MATERNITE          : 'Congé maternité',
  PATERNITE          : 'Congé paternité',
  EXCEPTIONNEL       : 'Congé exceptionnel',
  FAMILIAL           : 'Congé familial',
  HAJJ               : 'Pèlerinage (Hajj)',
  POSTNATAL          : 'Congé postnatal',
  ALLAITEMENT        : 'Repos allaitement',
  LONGUE_MALADIE     : 'Longue maladie',
  NAISSANCE_PERE     : 'Naissance (père)',
  CREATION_ENTREPRISE: "Création d'entreprise",
  OBLIGATIONS_LEGALES: 'Obligations légales'
};

export const TYPE_CONGE_ICONS: Record<TypeConge, string> = {
  CONGE              : 'ti ti-beach',
  ANNUEL             : 'ti ti-beach',
  MALADIE            : 'ti ti-stethoscope',
  RTT                : 'ti ti-clock-pause',
  SANS_SOLDE         : 'ti ti-calendar-off',
  MATERNITE          : 'ti ti-baby-carriage',
  PATERNITE          : 'ti ti-baby',
  EXCEPTIONNEL       : 'ti ti-star',
  FAMILIAL           : 'ti ti-heart',
  HAJJ               : 'ti ti-compass',
  POSTNATAL          : 'ti ti-moon',
  ALLAITEMENT        : 'ti ti-droplet',
  LONGUE_MALADIE     : 'ti ti-activity-heartbeat',
  NAISSANCE_PERE     : 'ti ti-baby',
  CREATION_ENTREPRISE: 'ti ti-building-store',
  OBLIGATIONS_LEGALES: 'ti ti-gavel'
};

export const TYPE_CONGE_COLORS: Record<TypeConge, string> = {
  CONGE              : '#3B82F6',
  ANNUEL             : '#3B82F6',
  MALADIE            : '#EF4444',
  RTT                : '#8B5CF6',
  SANS_SOLDE         : '#64748B',
  MATERNITE          : '#EC4899',
  PATERNITE          : '#06B6D4',
  EXCEPTIONNEL       : '#F59E0B',
  FAMILIAL           : '#F97316',
  HAJJ               : '#059669',
  POSTNATAL          : '#8B5CF6',
  ALLAITEMENT        : '#DB2777',
  LONGUE_MALADIE     : '#DC2626',
  NAISSANCE_PERE     : '#0EA5E9',
  CREATION_ENTREPRISE: '#7C3AED',
  OBLIGATIONS_LEGALES: '#B45309'
};

export const DUREE_TYPE_LABELS: Record<DureeType, string> = {
  JOURNEE_COMPLETE: 'Journée complète',
  DEMI_JOURNEE    : 'Demi-journée'
};

export const TYPE_CONGE_GROUPS: { label: string; types: TypeConge[] }[] = [
  { label: 'Congés ordinaires',       types: ['CONGE', 'MALADIE', 'SANS_SOLDE', 'RTT'] },
  { label: 'Maternité / parentalité', types: ['MATERNITE', 'POSTNATAL', 'ALLAITEMENT', 'NAISSANCE_PERE'] },
  { label: 'Congés spéciaux',         types: ['FAMILIAL', 'HAJJ', 'LONGUE_MALADIE', 'CREATION_ENTREPRISE', 'OBLIGATIONS_LEGALES'] }
];

export const HALF_SALARY_TYPES     = new Set<TypeConge>(['POSTNATAL', 'ALLAITEMENT']);
export const MEDICAL_COMMITTEE_TYPES = new Set<TypeConge>(['LONGUE_MALADIE']);
