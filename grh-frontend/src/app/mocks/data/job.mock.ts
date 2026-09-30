import { Job } from 'src/app/gerai/models/job.model';

export let MOCK_JOBS: Job[] = [
  {
    id: 1, titre: 'Développeur Full-Stack Angular / Spring Boot',
    statut: 'OUVERT', datePublication: '2026-04-01',
    role: 'SENIOR', postes: 2, departement: 'Informatique', typeContrat: 'CDI',
    lieu: 'Tunis', description: 'Conception et développement d\'applications web modernes.'
  },
  {
    id: 2, titre: 'Data Scientist',
    statut: 'OUVERT', datePublication: '2026-04-05',
    role: 'SENIOR', postes: 1, departement: 'Data & Analytics', typeContrat: 'CDI',
    lieu: 'Tunis', description: 'Modélisation prédictive et analyse de données massives.'
  },
  {
    id: 3, titre: 'Chargé(e) de Recrutement',
    statut: 'EN_COURS', datePublication: '2026-03-20',
    role: 'JUNIOR', postes: 1, departement: 'Ressources Humaines', typeContrat: 'CDI',
    lieu: 'Tunis', description: 'Gestion du processus de recrutement de A à Z.'
  },
  {
    id: 4, titre: 'Contrôleur de Gestion',
    statut: 'EN_COURS', datePublication: '2026-03-15',
    role: 'SENIOR', postes: 1, departement: 'Finance & Comptabilité', typeContrat: 'CDI',
    lieu: 'Tunis', description: 'Pilotage budgétaire et reporting financier mensuel.'
  },
  {
    id: 5, titre: 'UX/UI Designer',
    statut: 'OUVERT', datePublication: '2026-04-10',
    role: 'JUNIOR', postes: 1, departement: 'Design & Expérience', typeContrat: 'CDD',
    lieu: 'Tunis', description: 'Conception d\'interfaces utilisateurs et prototypage.'
  },
  {
    id: 6, titre: 'Chef de Projet IT',
    statut: 'FERME', datePublication: '2026-02-01',
    role: 'MANAGER', postes: 1, departement: 'Informatique', typeContrat: 'CDI',
    lieu: 'Tunis', description: 'Pilotage de projets de transformation numérique.'
  },
  {
    id: 7, titre: 'Stagiaire Marketing Digital',
    statut: 'OUVERT', datePublication: '2026-04-12',
    role: 'STAGIAIRE', postes: 2, departement: 'Marketing & Communication', typeContrat: 'STAGE',
    lieu: 'Tunis', description: 'Gestion des réseaux sociaux et campagnes digitales.'
  },
  {
    id: 8, titre: 'Ingénieur DevOps',
    statut: 'EN_ATTENTE', datePublication: '2026-04-18',
    role: 'SENIOR', postes: 1, departement: 'Informatique', typeContrat: 'CDI',
    lieu: 'Tunis', description: 'Mise en place et maintenance des pipelines CI/CD.'
  },
  {
    id: 9, titre: 'Responsable Qualité',
    statut: 'FERME', datePublication: '2026-01-15',
    role: 'MANAGER', postes: 1, departement: 'Qualité & Processus', typeContrat: 'CDI',
    lieu: 'Tunis', description: 'Animation du système de management de la qualité.'
  },
  {
    id: 10, titre: 'Développeur Mobile React Native',
    statut: 'OUVERT', datePublication: '2026-04-15',
    role: 'JUNIOR', postes: 1, departement: 'Informatique', typeContrat: 'CDD',
    lieu: 'Sfax', description: 'Développement d\'applications mobiles cross-platform.'
  },
  {
    id: 11, titre: 'Business Analyst',
    statut: 'EN_COURS', datePublication: '2026-03-28',
    role: 'SENIOR', postes: 1, departement: 'Data & Analytics', typeContrat: 'CDI',
    lieu: 'Tunis', description: 'Analyse des besoins métier et rédaction des spécifications.'
  },
  {
    id: 12, titre: 'Consultant Freelance BI',
    statut: 'OUVERT', datePublication: '2026-04-08',
    role: 'LEAD', postes: 1, departement: 'Data & Analytics', typeContrat: 'FREELANCE',
    lieu: 'Remote', description: 'Développement de tableaux de bord Power BI.'
  }
];
