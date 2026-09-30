export type CategorieActif = 'TANGIBLE' | 'NUMERIQUE';

export type TypeActifTangible =
  | 'ORDINATEUR' | 'WORKSTATION' | 'IMPRIMANTE'
  | 'TELEPHONE'  | 'CASQUE'      | 'VEHICULE' | 'AUTRE';

export type TypeActifNumerique =
  | 'LICENCE_LOGICIEL' | 'CLE_ACCES' | 'ABONNEMENT' | 'AUTRE';

export type StatutActif =
  | 'ATTRIBUE' | 'DISPONIBLE' | 'EN_MAINTENANCE' | 'HORS_SERVICE';

export interface Actif {
  id              : number;
  nom             : string;
  categorie       : CategorieActif;
  type            : TypeActifTangible | TypeActifNumerique;
  marque?         : string;
  modele?         : string;
  numeroSerie?    : string;
  description?    : string;
  valeur?         : number;
  dateAcquisition?: string;
  dateAttribution?: string;
  dateExpiration? : string;   // licences / abonnements
  statut          : StatutActif;
  employeId?      : number;
  employeNom?     : string;   // denormalized for display
}

export const TYPES_TANGIBLES: { value: TypeActifTangible; label: string; icon: string }[] = [
  { value: 'ORDINATEUR',  label: 'Ordinateur',   icon: 'ti ti-device-laptop'  },
  { value: 'WORKSTATION', label: 'Workstation',  icon: 'ti ti-device-desktop' },
  { value: 'IMPRIMANTE',  label: 'Imprimante',   icon: 'ti ti-printer'        },
  { value: 'TELEPHONE',   label: 'Téléphone',    icon: 'ti ti-device-mobile'  },
  { value: 'CASQUE',      label: 'Casque audio', icon: 'ti ti-headphones'     },
  { value: 'VEHICULE',    label: 'Véhicule',     icon: 'ti ti-car'            },
  { value: 'AUTRE',       label: 'Autre',        icon: 'ti ti-package'        },
];

export const TYPES_NUMERIQUES: { value: TypeActifNumerique; label: string; icon: string }[] = [
  { value: 'LICENCE_LOGICIEL', label: 'Licence logiciel',  icon: 'ti ti-license'       },
  { value: 'CLE_ACCES',        label: 'Clé d\'accès',      icon: 'ti ti-key'           },
  { value: 'ABONNEMENT',       label: 'Abonnement',        icon: 'ti ti-refresh'       },
  { value: 'AUTRE',            label: 'Autre numérique',   icon: 'ti ti-cloud'         },
];

export const ALL_TYPE_LABELS: Record<string, string> = {
  ORDINATEUR      : 'Ordinateur',
  WORKSTATION     : 'Workstation',
  IMPRIMANTE      : 'Imprimante',
  TELEPHONE       : 'Téléphone',
  CASQUE          : 'Casque audio',
  VEHICULE        : 'Véhicule',
  LICENCE_LOGICIEL: 'Licence logiciel',
  CLE_ACCES       : 'Clé d\'accès',
  ABONNEMENT      : 'Abonnement',
  AUTRE           : 'Autre',
};

// ── Asset request (employee → admin) ──────────────────────────
export type TypeDemandeActif    = 'REPARATION' | 'RENOUVELLEMENT';
export type StatutDemandeActif  = 'EN_ATTENTE' | 'EN_COURS' | 'RESOLUE' | 'REJETEE';
export type UrgenceDemandeActif = 'NORMALE' | 'URGENTE';

export interface DemandeActif {
  id               : number;
  actifId          : number;
  actifNom         : string;
  actifType        : string;
  employeId        : number;
  employeNom       : string;
  type             : TypeDemandeActif;
  description      : string;
  urgence          : UrgenceDemandeActif;
  statut           : StatutDemandeActif;
  dateCreation     : string;
  dateTraitement?  : string;
  commentaireAdmin?: string;
}

export const STATUT_DEMANDE_ACTIF_LABELS: Record<StatutDemandeActif, string> = {
  EN_ATTENTE: 'En attente',
  EN_COURS  : 'En cours',
  RESOLUE   : 'Résolue',
  REJETEE   : 'Rejetée',
};

export const STATUT_DEMANDE_ACTIF_COLORS: Record<StatutDemandeActif, string> = {
  EN_ATTENTE: '#F59E0B',
  EN_COURS  : '#6366F1',
  RESOLUE   : '#10B981',
  REJETEE   : '#EF4444',
};

export const ALL_TYPE_ICONS: Record<string, string> = {
  ORDINATEUR      : 'ti ti-device-laptop',
  WORKSTATION     : 'ti ti-device-desktop',
  IMPRIMANTE      : 'ti ti-printer',
  TELEPHONE       : 'ti ti-device-mobile',
  CASQUE          : 'ti ti-headphones',
  VEHICULE        : 'ti ti-car',
  LICENCE_LOGICIEL: 'ti ti-license',
  CLE_ACCES       : 'ti ti-key',
  ABONNEMENT      : 'ti ti-refresh',
  AUTRE           : 'ti ti-package',
};
