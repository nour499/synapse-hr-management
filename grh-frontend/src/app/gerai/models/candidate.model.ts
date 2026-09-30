export type CandidateStatut =
  | 'NOUVEAU' | 'EN_REVUE' | 'SHORTLISTE'
  | 'INTERVIEWE' | 'OFFRE_ENVOYEE' | 'EMBAUCHE' | 'REJETE';

export interface Candidate {
  id            : number;
  nom           : string;
  prenom        : string;
  email         : string;
  telephone     : string;
  photo        ?: string;
  jobId         : number;
  jobTitre      : string;
  departement  ?: string;
  statut        : CandidateStatut;
  datePostulation?: string;
  experience    : number;
  competences   : string[];
  shortliste    : boolean;
  cvUrl        ?: string;
  linkedin     ?: string;
  localisation ?: string;
  noteRecruteur  ?: string;
  score          ?: number;
  screeningScore ?: number;
}

export const CANDIDATE_STATUT_LABELS: Record<CandidateStatut, string> = {
  NOUVEAU      : 'Nouveau',
  EN_REVUE     : 'À revoir',
  SHORTLISTE   : 'Shortlisté',
  INTERVIEWE   : 'Entretien',
  OFFRE_ENVOYEE: 'Offre envoyée',
  EMBAUCHE     : 'Embauché',
  REJETE       : 'Rejeté'
};

export const PIPELINE_STAGES: { statut: CandidateStatut; label: string; color: string; icon: string }[] = [
  { statut: 'NOUVEAU',       label: 'Candidatures',   color: '#64748B', icon: 'ti ti-inbox'          },
  { statut: 'EN_REVUE',      label: 'À revoir',        color: '#F97316', icon: 'ti ti-alert-circle'  },
  { statut: 'SHORTLISTE',    label: 'Shortlisté',     color: '#0EA5E9', icon: 'ti ti-star'           },
  { statut: 'INTERVIEWE',    label: 'Entretien',      color: '#F59E0B', icon: 'ti ti-microphone'     },
  { statut: 'OFFRE_ENVOYEE', label: 'Offre envoyée',  color: '#8B5CF6', icon: 'ti ti-send'           },
  { statut: 'EMBAUCHE',      label: 'Embauché',       color: '#10B981', icon: 'ti ti-circle-check'   },
  { statut: 'REJETE',        label: 'Rejeté',         color: '#EF4444', icon: 'ti ti-circle-x'       }
];
