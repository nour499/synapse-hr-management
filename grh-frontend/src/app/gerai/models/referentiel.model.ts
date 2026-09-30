// ─── Types de congé ───────────────────────────────────────
export interface TypeConge {
  id          : number;
  code        : string;
  libelle     : string;
  description?: string;
  nombreJours : number;
  paye        : boolean;
  actif       : boolean;
  couleur     : string;
  icone       : string;
}

// ─── Jours fériés ─────────────────────────────────────────
export interface JourFerie {
  id         : number;
  libelle    : string;
  date       : string;
  recurrent  : boolean;
  description?: string;
}

// ─── Grille salariale ─────────────────────────────────────
export type NiveauPoste = 'STAGIAIRE' | 'JUNIOR' | 'SENIOR' | 'LEAD' | 'MANAGER' | 'DIRECTEUR';

export interface GrilleSalariale {
  id          : number;
  niveau      : NiveauPoste;
  intitule    : string;
  salaireMin  : number;
  salaireMax  : number;
  salaireBase : number;
  devise      : string;
  avantages  ?: string[];
}

export const NIVEAU_LABELS: Record<NiveauPoste, string> = {
  STAGIAIRE: 'Stagiaire',
  JUNIOR   : 'Junior',
  SENIOR   : 'Senior',
  LEAD     : 'Lead / Expert',
  MANAGER  : 'Manager',
  DIRECTEUR: 'Directeur'
};

// ─── Compétences ──────────────────────────────────────────
export type CategorieCompetence = 'TECHNIQUE' | 'SOFT_SKILL' | 'LANGUE' | 'OUTIL' | 'CERTIFICATION';

export interface Competence {
  id         : number;
  nom        : string;
  categorie  : CategorieCompetence;
  description?: string;
  actif      : boolean;
}

export const CATEGORIE_LABELS: Record<CategorieCompetence, string> = {
  TECHNIQUE    : 'Technique',
  SOFT_SKILL   : 'Soft Skill',
  LANGUE       : 'Langue',
  OUTIL        : 'Outil',
  CERTIFICATION: 'Certification'
};

export const CATEGORIE_COLORS: Record<CategorieCompetence, string> = {
  TECHNIQUE    : '#6366F1',
  SOFT_SKILL   : '#10B981',
  LANGUE       : '#F59E0B',
  OUTIL        : '#0EA5E9',
  CERTIFICATION: '#8B5CF6'
};
