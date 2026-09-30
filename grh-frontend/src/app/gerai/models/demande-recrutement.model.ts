import { JobRole, JobType } from './job.model';

export type StatutDemandeRec = 'EN_ATTENTE' | 'APPROUVEE' | 'REJETEE' | 'CONVERTIE';
export type Urgence          = 'NORMALE' | 'URGENTE' | 'CRITIQUE';

export interface DemandeRecrutement {
  id            : number;
  chefId        : string;
  chefNom       : string;
  chefPhoto    ?: string;
  departement   : string;
  titrePoste    : string;
  role          : JobRole;
  nombrePostes  : number;
  typeContrat   : JobType;
  justification : string;
  urgence       : Urgence;
  statut        : StatutDemandeRec;
  dateDemande   : string;
  commentaireRh  ?: string;
  traiteePar     ?: string;
  dateTraitement ?: string;
  jobId        ?: number;
}

export const URGENCE_LABELS: Record<Urgence, string> = {
  NORMALE  : 'Normale',
  URGENTE  : 'Urgente',
  CRITIQUE : 'Critique'
};

export const STATUT_REC_LABELS: Record<StatutDemandeRec, string> = {
  EN_ATTENTE: 'En attente',
  APPROUVEE : 'Approuvée',
  REJETEE   : 'Rejetée',
  CONVERTIE : 'Convertie en offre'
};
