import {
  CampagneEvaluation, Evaluation, calculerScore
} from 'src/app/gerai/models/evaluation.model';

// ── Campagnes ────────────────────────────────────────────────
export let CAMPAGNES_MOCK: CampagneEvaluation[] = [
  {
    id: 1, titre: 'Évaluation Annuelle 2025', periode: 'ANNUEL', annee: 2025,
    dateDebut: '2026-01-01', dateFin: '2026-02-28', statut: 'CLOTUREE',
    creePar: 'Admin RH', description: 'Évaluation annuelle de performance — exercice 2025.'
  },
  {
    id: 2, titre: 'Évaluation T1 2026', periode: 'T1', annee: 2026,
    dateDebut: '2026-04-01', dateFin: '2026-04-30', statut: 'ACTIVE',
    creePar: 'Admin RH', description: 'Évaluation du premier trimestre 2026.'
  },
  {
    id: 3, titre: 'Évaluation T2 2026', periode: 'T2', annee: 2026,
    dateDebut: '2026-07-01', dateFin: '2026-07-31', statut: 'BROUILLON',
    creePar: 'Admin RH'
  }
];

// ── Évaluations ──────────────────────────────────────────────
export let EVALUATIONS_MOCK: Evaluation[] = [

  // ── Campagne 1 (CLOTUREE) ───────────────────────────────
  {
    id: 1, campagneId: 1, campagneTitre: 'Évaluation Annuelle 2025', periode: 'ANNUEL', annee: 2025,
    employeId: 1, employeNom: 'Ben Ali', employePrenom: 'Sami', employePoste: 'Développeur Backend', departement: 'Informatique',
    chefId: 3, chefNom: 'Dupont',
    tauxPresence: 94, formationsRealisees: 2, tachesCompletees: 18, totalTaches: 20,
    statut: 'CLOTUREE',
    autoEval: {
      realisationObjectifs: 4, qualiteTravail: 4, respectDelais: 4,
      communication: 4, autonomie: 5, collaboration: 3, adaptabilite: 4,
      formationsCompletees: 2, nouvellesCompetences: 'Spring Boot 3, Docker',
      reussitesPeriode: 'Migration vers microservices réussie en avance sur le planning.',
      defisRencontres: 'Intégration d\'une nouvelle technologie cloud avec peu de documentation.',
      objectifsSuivante: 'Certification AWS, prise en charge d\'un junior.',
    },
    dateAutoEval: '2026-01-10',
    evalChef: {
      realisationObjectifs: 4, qualiteTravail: 5, respectDelais: 4, contributionProjets: 4,
      communication: 3, autonomie: 5, collaboration: 4, adaptabilite: 4, leadershipInitiative: 4,
      pointsForts: 'Excellente maîtrise technique, livraisons de haute qualité.',
      axesAmelioration: 'Améliorer la communication avec les non-techniques.',
      commentaireGlobal: 'Sami est un élément clé de l\'équipe backend. Très fiable.',
      recommandation: 'AUGMENTATION', commentaireRecommandation: '+5% justifié par la qualité constante.'
    },
    dateEvalChef: '2026-01-18',
    recommandation: 'AUGMENTATION',
    commentaireRh: 'Score cohérent avec la répartition salariale du département.',
    dateValidationRh: '2026-01-25', valideeParRh: 'Admin RH',
    scoreObjectifs: 32, scoreCompetences: 24, scoreFormations: 16, scorePresence: 9,
    scoreFinal: 81, mention: 'BIEN',
  },
  {
    id: 2, campagneId: 1, campagneTitre: 'Évaluation Annuelle 2025', periode: 'ANNUEL', annee: 2025,
    employeId: 2, employeNom: 'Trabelsi', employePrenom: 'Ines', employePoste: 'Analyste BI', departement: 'Data',
    chefId: 4, chefNom: 'Leclerc',
    tauxPresence: 88, formationsRealisees: 3, tachesCompletees: 22, totalTaches: 24,
    statut: 'CLOTUREE',
    autoEval: {
      realisationObjectifs: 5, qualiteTravail: 5, respectDelais: 4,
      communication: 5, autonomie: 4, collaboration: 5, adaptabilite: 5,
      formationsCompletees: 3, nouvellesCompetences: 'Power BI, Python Pandas, Scikit-Learn',
      reussitesPeriode: 'Mise en place du dashboard KPI utilisé par la direction.',
      defisRencontres: 'Volume de données à traiter en forte croissance.',
      objectifsSuivante: 'Machine learning en production, encadrement d\'un stagiaire.',
    },
    dateAutoEval: '2026-01-08',
    evalChef: {
      realisationObjectifs: 5, qualiteTravail: 5, respectDelais: 5, contributionProjets: 5,
      communication: 5, autonomie: 4, collaboration: 5, adaptabilite: 5, leadershipInitiative: 4,
      pointsForts: 'Vision analytique exceptionnelle, livrables toujours au-delà des attentes.',
      axesAmelioration: 'Déléguer davantage pour monter en puissance en leadership.',
      commentaireGlobal: 'Meilleure performance du département. Très forte valeur ajoutée.',
      recommandation: 'PROMOTION', commentaireRecommandation: 'Proposée au poste de Lead Data Analyst.'
    },
    dateEvalChef: '2026-01-15',
    recommandation: 'PROMOTION',
    commentaireRh: 'Promotion validée. Grille salariale Lead appliquée dès T2.',
    dateValidationRh: '2026-01-22', valideeParRh: 'Admin RH',
    scoreObjectifs: 40, scoreCompetences: 29, scoreFormations: 20, scorePresence: 9,
    scoreFinal: 98, mention: 'EXCELLENT',
  },
  {
    id: 3, campagneId: 1, campagneTitre: 'Évaluation Annuelle 2025', periode: 'ANNUEL', annee: 2025,
    employeId: 5, employeNom: 'Hammami', employePrenom: 'Youssef', employePoste: 'DevOps Engineer', departement: 'Informatique',
    chefId: 3, chefNom: 'Dupont',
    tauxPresence: 72, formationsRealisees: 0, tachesCompletees: 8, totalTaches: 15,
    statut: 'CLOTUREE',
    autoEval: {
      realisationObjectifs: 3, qualiteTravail: 3, respectDelais: 2,
      communication: 3, autonomie: 3, collaboration: 3, adaptabilite: 3,
      formationsCompletees: 0, nouvellesCompetences: '',
      reussitesPeriode: 'Migration partielle vers Kubernetes.',
      defisRencontres: 'Problèmes personnels ayant impacté la présence et la concentration.',
      objectifsSuivante: 'Rattraper les certifications DevOps manquées.',
    },
    dateAutoEval: '2026-01-12',
    evalChef: {
      realisationObjectifs: 2, qualiteTravail: 3, respectDelais: 2, contributionProjets: 2,
      communication: 3, autonomie: 2, collaboration: 3, adaptabilite: 3, leadershipInitiative: 2,
      pointsForts: 'Bonne connaissance technique de base.',
      axesAmelioration: 'Présence, respect des engagements, formation continue.',
      commentaireGlobal: 'Année difficile. Un accompagnement renforcé est nécessaire.',
      recommandation: 'PIP', commentaireRecommandation: 'Plan d\'amélioration sur 3 mois avec points hebdomadaires.'
    },
    dateEvalChef: '2026-01-20',
    recommandation: 'PIP',
    commentaireRh: 'PIP validé. Suivi mensuel RH activé.',
    dateValidationRh: '2026-01-28', valideeParRh: 'Admin RH',
    scoreObjectifs: 18, scoreCompetences: 15, scoreFormations: 4, scorePresence: 7,
    scoreFinal: 44, mention: 'A_AMELIORER',
  },

  // ── Campagne 2 (ACTIVE — en cours) ──────────────────────
  {
    id: 4, campagneId: 2, campagneTitre: 'Évaluation T1 2026', periode: 'T1', annee: 2026,
    employeId: 1, employeNom: 'Ben Ali', employePrenom: 'Sami', employePoste: 'Développeur Backend', departement: 'Informatique',
    chefId: 3, chefNom: 'Dupont',
    tauxPresence: 96, formationsRealisees: 1, tachesCompletees: 14, totalTaches: 18,
    statut: 'AUTO_SOUMISE',
    autoEval: {
      realisationObjectifs: 4, qualiteTravail: 5, respectDelais: 4,
      communication: 4, autonomie: 5, collaboration: 4, adaptabilite: 4,
      formationsCompletees: 1, nouvellesCompetences: 'AWS Lambda',
      reussitesPeriode: 'Refonte de l\'API de notifications, -30% de temps de réponse.',
      defisRencontres: 'Charge de travail élevée suite au départ d\'un collègue.',
      objectifsSuivante: 'Finaliser la certification AWS, recruter un junior.',
    },
    dateAutoEval: '2026-04-12',
  },
  {
    id: 5, campagneId: 2, campagneTitre: 'Évaluation T1 2026', periode: 'T1', annee: 2026,
    employeId: 2, employeNom: 'Trabelsi', employePrenom: 'Ines', employePoste: 'Lead Data Analyst', departement: 'Data',
    chefId: 4, chefNom: 'Leclerc',
    tauxPresence: 91, formationsRealisees: 1, tachesCompletees: 20, totalTaches: 22,
    statut: 'VALIDEE_CHEF',
    autoEval: {
      realisationObjectifs: 5, qualiteTravail: 5, respectDelais: 5,
      communication: 5, autonomie: 5, collaboration: 5, adaptabilite: 4,
      formationsCompletees: 1, nouvellesCompetences: 'Encadrement équipe',
      reussitesPeriode: 'Prise en main réussie du rôle de Lead, onboarding de 2 nouveaux.',
      defisRencontres: 'Transition management tout en maintenant la production.',
      objectifsSuivante: 'Mettre en place des KPIs d\'équipe.',
    },
    dateAutoEval: '2026-04-08',
    evalChef: {
      realisationObjectifs: 5, qualiteTravail: 5, respectDelais: 5, contributionProjets: 5,
      communication: 5, autonomie: 5, collaboration: 5, adaptabilite: 4, leadershipInitiative: 5,
      pointsForts: 'Leadership naturel, montée en puissance spectaculaire.',
      axesAmelioration: 'Gérer la charge pour éviter le burnout.',
      commentaireGlobal: 'Premier trimestre en tant que Lead réussi haut la main.',
      recommandation: 'RAS',
    },
    dateEvalChef: '2026-04-15',
    recommandation: 'RAS',
  },
  {
    id: 6, campagneId: 2, campagneTitre: 'Évaluation T1 2026', periode: 'T1', annee: 2026,
    employeId: 5, employeNom: 'Hammami', employePrenom: 'Youssef', employePoste: 'DevOps Engineer', departement: 'Informatique',
    chefId: 3, chefNom: 'Dupont',
    tauxPresence: 85, formationsRealisees: 1, tachesCompletees: 10, totalTaches: 12,
    statut: 'AUTO_SOUMISE',
    autoEval: {
      realisationObjectifs: 4, qualiteTravail: 3, respectDelais: 3,
      communication: 3, autonomie: 4, collaboration: 3, adaptabilite: 4,
      formationsCompletees: 1, nouvellesCompetences: 'Kubernetes avancé',
      reussitesPeriode: 'Mise en production du cluster K8s, amélioration nette vs an passé.',
      defisRencontres: 'Montée en compétence rapide sur un périmètre technique élargi.',
      objectifsSuivante: 'Certification CKA, 0 incident P1.',
    },
    dateAutoEval: '2026-04-13',
  },
  {
    id: 7, campagneId: 2, campagneTitre: 'Évaluation T1 2026', periode: 'T1', annee: 2026,
    employeId: 7, employeNom: 'Petit', employePrenom: 'Thomas', employePoste: 'Développeur Full-Stack', departement: 'Informatique',
    chefId: 3, chefNom: 'Dupont',
    tauxPresence: 98, formationsRealisees: 0, tachesCompletees: 6, totalTaches: 14,
    statut: 'EN_ATTENTE',
  },
];

let nextCampagneId  = CAMPAGNES_MOCK.length  + 1;
let nextEvalId      = EVALUATIONS_MOCK.length + 1;

export function nextCampagneIdFn():  number { return nextCampagneId++;  }
export function nextEvalIdFn():      number { return nextEvalId++;       }
