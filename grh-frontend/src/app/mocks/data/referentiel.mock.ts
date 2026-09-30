import { TypeConge, JourFerie, GrilleSalariale, Competence } from '../../gerai/models/referentiel.model';

// ─── Types de congé ───────────────────────────────────────
export let MOCK_TYPES_CONGE: TypeConge[] = [
  { id: 1, code: 'CA',  libelle: 'Congé annuel',       description: 'Congé payé annuel légal',              nombreJours: 18, paye: true,  actif: true,  couleur: '#6366F1', icone: 'ti ti-beach' },
  { id: 2, code: 'ML',  libelle: 'Maladie',            description: 'Congé pour raison médicale',           nombreJours: 90, paye: true,  actif: true,  couleur: '#EF4444', icone: 'ti ti-first-aid-kit' },
  { id: 3, code: 'MAT', libelle: 'Maternité',          description: 'Congé de maternité',                   nombreJours: 98, paye: true,  actif: true,  couleur: '#EC4899', icone: 'ti ti-heart' },
  { id: 4, code: 'PAT', libelle: 'Paternité',          description: 'Congé de paternité',                   nombreJours: 15, paye: true,  actif: true,  couleur: '#0EA5E9', icone: 'ti ti-baby-carriage' },
  { id: 5, code: 'SS',  libelle: 'Sans solde',         description: 'Congé non rémunéré',                   nombreJours: 30, paye: false, actif: true,  couleur: '#64748B', icone: 'ti ti-calendar-off' },
  { id: 6, code: 'EV',  libelle: 'Événement familial', description: 'Mariage, décès, naissance…',           nombreJours: 4,  paye: true,  actif: true,  couleur: '#F59E0B', icone: 'ti ti-gift' },
  { id: 7, code: 'FOR', libelle: 'Formation',          description: 'Congé pour formation professionnelle', nombreJours: 10, paye: true,  actif: true,  couleur: '#10B981', icone: 'ti ti-school' },
  { id: 8, code: 'REC', libelle: 'Récupération',       description: 'Récupération d\'heures supplémentaires',nombreJours: 5,  paye: true,  actif: false, couleur: '#8B5CF6', icone: 'ti ti-clock-hour-4' }
];

// ─── Jours fériés ─────────────────────────────────────────
export let MOCK_JOURS_FERIES: JourFerie[] = [
  { id:  1, libelle: 'Jour de l\'An',               date: '2026-01-01', recurrent: true,  description: 'Premier jour de l\'année' },
  { id:  2, libelle: 'Fête du Trône',               date: '2026-07-30', recurrent: true,  description: 'Fête nationale du Maroc' },
  { id:  3, libelle: 'Fête de l\'Indépendance',     date: '2026-11-18', recurrent: true,  description: 'Fête nationale du Maroc' },
  { id:  4, libelle: 'Fête du Travail',             date: '2026-05-01', recurrent: true,  description: 'Journée internationale du travail' },
  { id:  5, libelle: 'Fête de la Jeunesse',         date: '2026-08-21', recurrent: true,  description: 'Anniversaire du Roi Mohammed VI' },
  { id:  6, libelle: 'Manifeste de l\'Indépendance',date: '2026-01-11', recurrent: true,  description: 'Commémoration du manifeste de l\'indépendance' },
  { id:  7, libelle: 'Marche Verte',                date: '2026-11-06', recurrent: true,  description: 'Anniversaire de la Marche Verte' },
  { id:  8, libelle: 'Aïd Al-Fitr (J1)',            date: '2026-03-20', recurrent: false, description: 'Fin du mois de Ramadan' },
  { id:  9, libelle: 'Aïd Al-Fitr (J2)',            date: '2026-03-21', recurrent: false, description: 'Fin du mois de Ramadan' },
  { id: 10, libelle: 'Aïd Al-Adha (J1)',            date: '2026-05-27', recurrent: false, description: 'Fête du sacrifice' },
  { id: 11, libelle: 'Aïd Al-Adha (J2)',            date: '2026-05-28', recurrent: false, description: 'Fête du sacrifice' },
  { id: 12, libelle: 'Nouvel An Hégirien',          date: '2026-06-17', recurrent: false, description: 'Premier jour du calendrier hégirien' },
  { id: 13, libelle: 'Aïd Al-Mawlid',              date: '2026-08-26', recurrent: false, description: 'Naissance du Prophète' }
];

// ─── Grille salariale ─────────────────────────────────────
export let MOCK_GRILLE_SALARIALE: GrilleSalariale[] = [
  { id: 1, niveau: 'STAGIAIRE', intitule: 'Stagiaire',         salaireMin:  2500, salaireMax:  4000, salaireBase:  3000, devise: 'MAD', avantages: ['Indemnité de stage', 'Transport'] },
  { id: 2, niveau: 'JUNIOR',   intitule: 'Junior (0–3 ans)',   salaireMin:  5000, salaireMax:  8000, salaireBase:  6500, devise: 'MAD', avantages: ['Mutuelle', 'Transport', 'Tickets restaurant'] },
  { id: 3, niveau: 'SENIOR',   intitule: 'Senior (3–7 ans)',   salaireMin:  8000, salaireMax: 14000, salaireBase: 11000, devise: 'MAD', avantages: ['Mutuelle', 'Transport', 'Tickets restaurant', 'Prime performance'] },
  { id: 4, niveau: 'LEAD',     intitule: 'Lead / Expert',      salaireMin: 13000, salaireMax: 20000, salaireBase: 16000, devise: 'MAD', avantages: ['Mutuelle famille', 'Transport', 'Tickets restaurant', 'Prime performance', 'Formation'] },
  { id: 5, niveau: 'MANAGER',  intitule: 'Manager',            salaireMin: 18000, salaireMax: 30000, salaireBase: 23000, devise: 'MAD', avantages: ['Mutuelle famille', 'Voiture de service', 'Tickets restaurant', 'Prime performance', 'Stock options'] },
  { id: 6, niveau: 'DIRECTEUR',intitule: 'Directeur',          salaireMin: 28000, salaireMax: 60000, salaireBase: 40000, devise: 'MAD', avantages: ['Mutuelle famille', 'Voiture', 'Téléphone', 'Prime performance', 'Stock options', 'Logement'] }
];

// ─── Compétences ──────────────────────────────────────────
export let MOCK_COMPETENCES: Competence[] = [
  // Technique
  { id:  1, nom: 'Angular',            categorie: 'TECHNIQUE',     actif: true  },
  { id:  2, nom: 'React',              categorie: 'TECHNIQUE',     actif: true  },
  { id:  3, nom: 'Spring Boot',        categorie: 'TECHNIQUE',     actif: true  },
  { id:  4, nom: 'Python',             categorie: 'TECHNIQUE',     actif: true  },
  { id:  5, nom: 'Machine Learning',   categorie: 'TECHNIQUE',     actif: true  },
  { id:  6, nom: 'SQL / PostgreSQL',   categorie: 'TECHNIQUE',     actif: true  },
  { id:  7, nom: 'DevOps / CI-CD',     categorie: 'TECHNIQUE',     actif: true  },
  { id:  8, nom: 'Kubernetes',         categorie: 'TECHNIQUE',     actif: true  },
  // Outils
  { id:  9, nom: 'Figma',              categorie: 'OUTIL',         actif: true  },
  { id: 10, nom: 'Jira',              categorie: 'OUTIL',         actif: true  },
  { id: 11, nom: 'Power BI',           categorie: 'OUTIL',         actif: true  },
  { id: 12, nom: 'SAP',                categorie: 'OUTIL',         actif: true  },
  { id: 13, nom: 'Docker',             categorie: 'OUTIL',         actif: true  },
  // Soft Skills
  { id: 14, nom: 'Leadership',         categorie: 'SOFT_SKILL',    actif: true  },
  { id: 15, nom: 'Communication',      categorie: 'SOFT_SKILL',    actif: true  },
  { id: 16, nom: 'Gestion de projet',  categorie: 'SOFT_SKILL',    actif: true  },
  { id: 17, nom: 'Travail en équipe',  categorie: 'SOFT_SKILL',    actif: true  },
  { id: 18, nom: 'Résolution problème',categorie: 'SOFT_SKILL',    actif: false },
  // Langues
  { id: 19, nom: 'Français',           categorie: 'LANGUE',        actif: true  },
  { id: 20, nom: 'Anglais',            categorie: 'LANGUE',        actif: true  },
  { id: 21, nom: 'Arabe',              categorie: 'LANGUE',        actif: true  },
  { id: 22, nom: 'Espagnol',           categorie: 'LANGUE',        actif: true  },
  // Certifications
  { id: 23, nom: 'AWS Solutions Arch.',categorie: 'CERTIFICATION', actif: true  },
  { id: 24, nom: 'PMP',                categorie: 'CERTIFICATION', actif: true  },
  { id: 25, nom: 'Scrum Master',       categorie: 'CERTIFICATION', actif: true  }
];
