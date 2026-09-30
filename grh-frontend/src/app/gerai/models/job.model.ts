export type JobStatus   = 'OUVERT' | 'EN_COURS' | 'FERME' | 'EN_ATTENTE';
export type JobType     = 'CDI' | 'CDD' | 'STAGE' | 'FREELANCE' | 'ALTERNANCE';
export type JobRole     = 'JUNIOR' | 'SENIOR' | 'LEAD' | 'MANAGER' | 'DIRECTEUR' | 'STAGIAIRE';

export interface Job {
  id           : number;
  titre        : string;
  statut       : JobStatus;
  datePublication: string;
  role         : JobRole;
  postes       : number;
  departement  : string;
  typeContrat  : JobType;
  description ?: string;
  lieu        ?: string;
}

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  OUVERT    : 'Ouvert',
  EN_COURS  : 'En cours',
  FERME     : 'Fermé',
  EN_ATTENTE: 'En attente'
};

export const JOB_TYPE_LABELS: Record<JobType, string> = {
  CDI       : 'CDI',
  CDD       : 'CDD',
  STAGE     : 'Stage',
  FREELANCE : 'Freelance',
  ALTERNANCE: 'Alternance'
};

export const JOB_ROLE_LABELS: Record<JobRole, string> = {
  JUNIOR   : 'Junior',
  SENIOR   : 'Senior',
  LEAD     : 'Lead',
  MANAGER  : 'Manager',
  DIRECTEUR: 'Directeur',
  STAGIAIRE: 'Stagiaire'
};
