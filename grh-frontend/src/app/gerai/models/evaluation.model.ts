// ── Types ────────────────────────────────────────────────────

export type EvaluationStatut =
  | 'EN_ATTENTE'          // campagne active, employé n'a pas encore commencé
  | 'AUTO_SOUMISE'        // auto-éval soumise, en attente chef
  | 'VALIDEE_CHEF'        // chef a évalué, en attente RH
  | 'VALIDEE_RH'          // calibrée et validée par RH
  | 'CLOTUREE';           // entretien fait, résultats communiqués

export type CampagneStatut = 'BROUILLON' | 'ACTIVE' | 'CLOTUREE';

export type Periode = 'T1' | 'T2' | 'T3' | 'T4' | 'ANNUEL';

export type MentionPerformance = 'INSUFFISANT' | 'A_AMELIORER' | 'SATISFAISANT' | 'BIEN' | 'EXCELLENT';

export type Recommandation = 'AUGMENTATION' | 'PROMOTION' | 'FORMATION' | 'RAS' | 'PIP';

// ── Auto-évaluation (remplie par l'employé) ──────────────────

export interface AutoEvaluation {
  // Axe objectifs
  realisationObjectifs : number; // 1–5
  qualiteTravail       : number; // 1–5
  respectDelais        : number; // 1–5

  // Axe compétences comportementales
  communication : number; // 1–5
  autonomie     : number; // 1–5
  collaboration : number; // 1–5
  adaptabilite  : number; // 1–5

  // Axe développement
  formationsCompletees : number; // nombre réel (depuis module formations)
  nouvellesCompetences : string;

  // Narration
  reussitesPeriode    : string;
  defisRencontres     : string;
  objectifsSuivante   : string;
  commentaireLibre   ?: string;
}

// ── Évaluation chef ──────────────────────────────────────────

export interface EvaluationChef {
  // Axe objectifs
  realisationObjectifs  : number; // 1–5
  qualiteTravail        : number; // 1–5
  respectDelais         : number; // 1–5
  contributionProjets   : number; // 1–5

  // Axe compétences
  communication         : number; // 1–5
  autonomie             : number; // 1–5
  collaboration         : number; // 1–5
  adaptabilite          : number; // 1–5
  leadershipInitiative  : number; // 1–5

  // Narration
  pointsForts            : string;
  axesAmelioration       : string;
  commentaireGlobal      : string;

  // Recommandation
  recommandation              : Recommandation;
  commentaireRecommandation  ?: string;
}

// ── Campagne ─────────────────────────────────────────────────

export interface CampagneEvaluation {
  id            : number;
  titre         : string;
  periode       : Periode;
  annee         : number;
  dateDebut     : string;
  dateFin       : string;
  statut        : CampagneStatut;
  departements ?: string[];   // undefined = tous les départements
  creePar       : string;
  description  ?: string;
}

// ── Évaluation individuelle ───────────────────────────────────

export interface Evaluation {
  id             : number;
  campagneId     : number;
  campagneTitre  : string;
  periode        : Periode;
  annee          : number;

  // Employé évalué
  employeId      : number;
  employeNom     : string;
  employePrenom  : string;
  employePoste   : string;
  departement    : string;

  // Chef évaluateur
  chefId         : number;
  chefNom        : string;

  // Données auto-alimentées depuis d'autres modules
  tauxPresence        ?: number; // % (depuis stats)
  formationsRealisees ?: number; // nb (depuis module formations)
  tachesCompletees    ?: number; // nb (depuis module tâches)
  totalTaches         ?: number;

  // Workflow
  statut             : EvaluationStatut;

  // Auto-évaluation
  autoEval          ?: AutoEvaluation;
  dateAutoEval      ?: string;

  // Évaluation chef
  evalChef          ?: EvaluationChef;
  dateEvalChef      ?: string;
  recommandation    ?: Recommandation;

  // Calibration RH
  scoreAjuste       ?: number;   // si RH ajuste le score calculé
  commentaireRh     ?: string;
  dateValidationRh  ?: string;
  valideeParRh      ?: string;

  // Score final
  scoreObjectifs     ?: number;  // /40
  scoreCompetences   ?: number;  // /30
  scoreFormations    ?: number;  // /20
  scorePresence      ?: number;  // /10
  scoreFinal         ?: number;  // /100
  mention            ?: MentionPerformance;
}

// ── Constants ────────────────────────────────────────────────

export const STATUT_EVAL_LABELS: Record<EvaluationStatut, string> = {
  EN_ATTENTE    : 'En attente',
  AUTO_SOUMISE  : 'Auto-éval soumise',
  VALIDEE_CHEF  : 'Évaluée par le chef',
  VALIDEE_RH    : 'Validée RH',
  CLOTUREE      : 'Clôturée',
};

export const STATUT_EVAL_COLORS: Record<EvaluationStatut, string> = {
  EN_ATTENTE    : '#F59E0B',
  AUTO_SOUMISE  : '#0EA5E9',
  VALIDEE_CHEF  : '#8B5CF6',
  VALIDEE_RH    : '#10B981',
  CLOTUREE      : '#64748B',
};

export const MENTION_LABELS: Record<MentionPerformance, string> = {
  INSUFFISANT  : 'Insuffisant',
  A_AMELIORER  : 'À améliorer',
  SATISFAISANT : 'Satisfaisant',
  BIEN         : 'Bien',
  EXCELLENT    : 'Excellent',
};

export const MENTION_COLORS: Record<MentionPerformance, string> = {
  INSUFFISANT  : '#EF4444',
  A_AMELIORER  : '#F97316',
  SATISFAISANT : '#F59E0B',
  BIEN         : '#6366F1',
  EXCELLENT    : '#10B981',
};

export const RECOMMANDATION_LABELS: Record<Recommandation, string> = {
  AUGMENTATION : 'Augmentation salariale',
  PROMOTION    : 'Promotion',
  FORMATION    : 'Plan de formation',
  RAS          : 'Aucune action',
  PIP          : 'Plan d\'amélioration (PIP)',
};

export const RECOMMANDATION_COLORS: Record<Recommandation, string> = {
  AUGMENTATION : '#10B981',
  PROMOTION    : '#6366F1',
  FORMATION    : '#0EA5E9',
  RAS          : '#64748B',
  PIP          : '#EF4444',
};

export const PERIODE_LABELS: Record<Periode, string> = {
  T1     : '1er trimestre',
  T2     : '2e trimestre',
  T3     : '3e trimestre',
  T4     : '4e trimestre',
  ANNUEL : 'Annuel',
};

// ── Score calculator ──────────────────────────────────────────

export function calculerScore(eval_: Evaluation): {
  scoreObjectifs: number; scoreCompetences: number;
  scoreFormations: number; scorePresence: number;
  scoreFinal: number; mention: MentionPerformance;
} {
  const chef = eval_.evalChef;

  // Axe objectifs /40 → moyenne des 4 critères chef (1–5) → /5 × 40
  const scoreObjectifs = chef
    ? Math.round(((chef.realisationObjectifs + chef.qualiteTravail + chef.respectDelais + chef.contributionProjets) / 4 / 5) * 40)
    : 0;

  // Axe compétences /30 → moyenne des 5 critères chef → /5 × 30
  const scoreCompetences = chef
    ? Math.round(((chef.communication + chef.autonomie + chef.collaboration + chef.adaptabilite + chef.leadershipInitiative) / 5 / 5) * 30)
    : 0;

  // Axe formations /20 → 0 form=4pts, 1=12pts, 2=16pts, 3+=20pts
  const nForms = eval_.formationsRealisees ?? 0;
  const scoreFormations = nForms >= 3 ? 20 : nForms === 2 ? 16 : nForms === 1 ? 12 : 4;

  // Axe présence /10
  const scorePresence = Math.round(((eval_.tauxPresence ?? 100) / 100) * 10);

  const scoreFinal = scoreObjectifs + scoreCompetences + scoreFormations + scorePresence;

  const mention: MentionPerformance =
    scoreFinal >= 85 ? 'EXCELLENT'    :
    scoreFinal >= 70 ? 'BIEN'         :
    scoreFinal >= 55 ? 'SATISFAISANT' :
    scoreFinal >= 40 ? 'A_AMELIORER'  : 'INSUFFISANT';

  return { scoreObjectifs, scoreCompetences, scoreFormations, scorePresence, scoreFinal, mention };
}
