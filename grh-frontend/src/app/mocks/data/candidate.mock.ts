import { Candidate } from '../../gerai/models/candidate.model';

export let MOCK_CANDIDATES: Candidate[] = [
  {
    id: 1, nom: 'Benali', prenom: 'Sara', email: 'sara.benali@email.com',
    telephone: '+212 6 11 22 33 44', jobId: 1, jobTitre: 'Développeur Full Stack Angular',
    departement: 'Informatique', statut: 'INTERVIEWE', datePostulation: '2026-04-01',
    experience: 4, competences: ['Angular', 'TypeScript', 'Node.js', 'PostgreSQL'],
    shortliste: true, linkedin: 'linkedin.com/in/sara-benali',
    localisation: 'Casablanca', noteRecruteur: 'Très bonne maîtrise Angular', score: 82
  },
  {
    id: 2, nom: 'El Fassi', prenom: 'Youssef', email: 'youssef.elfassi@email.com',
    telephone: '+212 6 22 33 44 55', jobId: 1, jobTitre: 'Développeur Full Stack Angular',
    departement: 'Informatique', statut: 'SHORTLISTE', datePostulation: '2026-04-02',
    experience: 6, competences: ['Angular', 'React', 'Java', 'Spring Boot'],
    shortliste: true, localisation: 'Rabat', score: 78
  },
  {
    id: 3, nom: 'Oukhouya', prenom: 'Nadia', email: 'nadia.oukhouya@email.com',
    telephone: '+212 6 33 44 55 66', jobId: 2, jobTitre: 'Data Scientist Senior',
    departement: 'Data & Analytics', statut: 'EN_REVUE', datePostulation: '2026-04-03',
    experience: 5, competences: ['Python', 'Machine Learning', 'TensorFlow', 'SQL'],
    shortliste: false, localisation: 'Casablanca', score: 71
  },
  {
    id: 4, nom: 'Cherkaoui', prenom: 'Mehdi', email: 'mehdi.cherkaoui@email.com',
    telephone: '+212 6 44 55 66 77', jobId: 2, jobTitre: 'Data Scientist Senior',
    departement: 'Data & Analytics', statut: 'SHORTLISTE', datePostulation: '2026-04-03',
    experience: 7, competences: ['Python', 'PyTorch', 'Spark', 'Hadoop', 'R'],
    shortliste: true, linkedin: 'linkedin.com/in/mehdi-cherkaoui',
    localisation: 'Marrakech', score: 89
  },
  {
    id: 5, nom: 'Taouil', prenom: 'Amine', email: 'amine.taouil@email.com',
    telephone: '+212 6 55 66 77 88', jobId: 3, jobTitre: 'Responsable Marketing Digital',
    departement: 'Marketing', statut: 'NOUVEAU', datePostulation: '2026-04-10',
    experience: 3, competences: ['SEO', 'Google Ads', 'Social Media', 'Analytics'],
    shortliste: false, localisation: 'Casablanca'
  },
  {
    id: 6, nom: 'Bouazzaoui', prenom: 'Leila', email: 'leila.bouazzaoui@email.com',
    telephone: '+212 6 66 77 88 99', jobId: 3, jobTitre: 'Responsable Marketing Digital',
    departement: 'Marketing', statut: 'INTERVIEWE', datePostulation: '2026-04-05',
    experience: 5, competences: ['Marketing Digital', 'Content Strategy', 'HubSpot', 'SEO'],
    shortliste: true, linkedin: 'linkedin.com/in/leila-bouazzaoui',
    localisation: 'Rabat', noteRecruteur: 'Profil créatif et analytique', score: 76
  },
  {
    id: 7, nom: 'Alami', prenom: 'Reda', email: 'reda.alami@email.com',
    telephone: '+212 6 77 88 99 00', jobId: 4, jobTitre: 'DevOps Engineer',
    departement: 'Informatique', statut: 'OFFRE_ENVOYEE', datePostulation: '2026-03-25',
    experience: 5, competences: ['Docker', 'Kubernetes', 'CI/CD', 'AWS', 'Terraform'],
    shortliste: true, linkedin: 'linkedin.com/in/reda-alami',
    localisation: 'Casablanca', noteRecruteur: 'Excellente maîtrise DevOps', score: 91
  },
  {
    id: 8, nom: 'Ziani', prenom: 'Fatima', email: 'fatima.ziani@email.com',
    telephone: '+212 6 88 99 00 11', jobId: 4, jobTitre: 'DevOps Engineer',
    departement: 'Informatique', statut: 'REJETE', datePostulation: '2026-03-28',
    experience: 2, competences: ['Linux', 'Docker', 'Git'],
    shortliste: false, localisation: 'Fès', score: 52
  },
  {
    id: 9, nom: 'Lahlou', prenom: 'Karim', email: 'karim.lahlou@email.com',
    telephone: '+212 6 99 00 11 22', jobId: 5, jobTitre: 'UX/UI Designer',
    departement: 'Design', statut: 'EMBAUCHE', datePostulation: '2026-03-15',
    experience: 4, competences: ['Figma', 'Adobe XD', 'Design System', 'User Research'],
    shortliste: true, linkedin: 'linkedin.com/in/karim-lahlou',
    localisation: 'Casablanca', noteRecruteur: 'Portfolio exceptionnel', score: 94
  },
  {
    id: 10, nom: 'Berrada', prenom: 'Hind', email: 'hind.berrada@email.com',
    telephone: '+212 6 00 11 22 33', jobId: 1, jobTitre: 'Développeur Full Stack Angular',
    departement: 'Informatique', statut: 'EN_REVUE', datePostulation: '2026-04-08',
    experience: 2, competences: ['Angular', 'JavaScript', 'CSS', 'HTML'],
    shortliste: false, localisation: 'Casablanca', score: 61
  },
  {
    id: 11, nom: 'Moussaoui', prenom: 'Omar', email: 'omar.moussaoui@email.com',
    telephone: '+212 6 11 33 55 77', jobId: 6, jobTitre: 'Analyste Financier',
    departement: 'Finance', statut: 'SHORTLISTE', datePostulation: '2026-04-06',
    experience: 5, competences: ['Excel', 'Power BI', 'SAP', 'Analyse financière'],
    shortliste: true, localisation: 'Rabat', score: 80
  },
  {
    id: 12, nom: 'Sebti', prenom: 'Safia', email: 'safia.sebti@email.com',
    telephone: '+212 6 22 44 66 88', jobId: 6, jobTitre: 'Analyste Financier',
    departement: 'Finance', statut: 'NOUVEAU', datePostulation: '2026-04-12',
    experience: 3, competences: ['Comptabilité', 'Excel', 'Analyse financière'],
    shortliste: false, localisation: 'Casablanca'
  }
];
