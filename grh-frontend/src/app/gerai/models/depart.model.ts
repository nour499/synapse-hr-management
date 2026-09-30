export type TypeDepart =
  | 'DEMISSION'
  | 'LICENCIEMENT'
  | 'RETRAITE'
  | 'FIN_CONTRAT'
  | 'MUTATION'
  | 'DECES';

export type StatutDepart =
  | 'EN_COURS'
  | 'VALIDE'
  | 'ANNULE';

export interface DepartEmploye {
  id          : number;
  employeId   : number;
  employeNom  : string;        // prenom + nom
  employePoste?: string;
  employePhoto?: string;
  employeDept ?: string;
  dateDepart  : string;        // ISO date
  typeDepart  : TypeDepart;
  raison      : string;
  statut      : StatutDepart;
  notes       ?: string;
  createdAt   : string;        // ISO date
}

// ── Display helpers ─────────────────────────────────
export const TYPE_DEPART_LABELS: Record<TypeDepart, string> = {
  DEMISSION   : 'Démission',
  LICENCIEMENT: 'Licenciement',
  RETRAITE    : 'Retraite',
  FIN_CONTRAT : 'Fin de contrat',
  MUTATION    : 'Mutation',
  DECES       : 'Décès'
};

export const TYPE_DEPART_ICONS: Record<TypeDepart, string> = {
  DEMISSION   : 'ti ti-logout',
  LICENCIEMENT: 'ti ti-user-x',
  RETRAITE    : 'ti ti-armchair',
  FIN_CONTRAT : 'ti ti-calendar-off',
  MUTATION    : 'ti ti-arrows-exchange',
  DECES       : 'ti ti-flower'
};

export const TYPE_DEPART_COLORS: Record<TypeDepart, string> = {
  DEMISSION   : '#F97316',
  LICENCIEMENT: '#EF4444',
  RETRAITE    : '#8B5CF6',
  FIN_CONTRAT : '#3B82F6',
  MUTATION    : '#06B6D4',
  DECES       : '#64748B'
};
