export type InterviewType   = 'TELEPHONIQUE' | 'VISIO' | 'PRESENTIEL' | 'TECHNIQUE' | 'RH';
export type InterviewStatut = 'PLANIFIE' | 'EN_COURS' | 'TERMINE' | 'ANNULE' | 'REPORTE';
export type InterviewDecision = 'EN_ATTENTE' | 'RETENU' | 'REJETE';

export interface Interview {
  id            : number;
  candidatId    : number;
  candidatNom   : string;
  candidatPrenom: string;
  candidatPhoto?: string;
  jobId         : number;
  jobTitre      : string;
  departement   : string;
  type          : InterviewType;
  statut        : InterviewStatut;
  decision      : InterviewDecision;
  date          : string;
  heureDebut    : string;
  heureFin      : string;
  lieu         ?: string;
  lienVisio    ?: string;
  intervieweur  : string;
  intervieweurPhoto?: string;
  noteGlobale  ?: number;
  commentaire  ?: string;
}

export const INTERVIEW_TYPE_LABELS: Record<InterviewType, string> = {
  TELEPHONIQUE: 'Téléphonique',
  VISIO       : 'Visioconférence',
  PRESENTIEL  : 'Présentiel',
  TECHNIQUE   : 'Technique',
  RH          : 'RH'
};

export const INTERVIEW_STATUT_LABELS: Record<InterviewStatut, string> = {
  PLANIFIE: 'Planifié',
  EN_COURS: 'En cours',
  TERMINE : 'Terminé',
  ANNULE  : 'Annulé',
  REPORTE : 'Reporté'
};

export const INTERVIEW_DECISION_LABELS: Record<InterviewDecision, string> = {
  EN_ATTENTE: 'En attente',
  RETENU    : 'Retenu',
  REJETE    : 'Rejeté'
};
