import { Interview } from '../../gerai/models/interview.model';

export let MOCK_INTERVIEWS: Interview[] = [
  {
    id: 1, candidatId: 1, candidatNom: 'Benali', candidatPrenom: 'Sara',
    jobId: 1, jobTitre: 'Développeur Full Stack Angular', departement: 'Informatique',
    type: 'TECHNIQUE', statut: 'TERMINE', decision: 'RETENU',
    date: '2026-04-15', heureDebut: '10:00', heureFin: '11:30',
    lieu: 'Salle A - Siège', intervieweur: 'Rachid Amsaleg',
    noteGlobale: 4, commentaire: 'Excellente maîtrise Angular et bonnes pratiques'
  },
  {
    id: 2, candidatId: 1, candidatNom: 'Benali', candidatPrenom: 'Sara',
    jobId: 1, jobTitre: 'Développeur Full Stack Angular', departement: 'Informatique',
    type: 'RH', statut: 'PLANIFIE', decision: 'EN_ATTENTE',
    date: '2026-04-22', heureDebut: '14:00', heureFin: '15:00',
    lieu: 'Bureau RH', intervieweur: 'Imane Tazi'
  },
  {
    id: 3, candidatId: 4, candidatNom: 'Cherkaoui', candidatPrenom: 'Mehdi',
    jobId: 2, jobTitre: 'Data Scientist Senior', departement: 'Data & Analytics',
    type: 'TECHNIQUE', statut: 'PLANIFIE', decision: 'EN_ATTENTE',
    date: '2026-04-23', heureDebut: '09:00', heureFin: '10:30',
    lienVisio: 'https://meet.google.com/xyz-abc', intervieweur: 'Kamal Idrissi'
  },
  {
    id: 4, candidatId: 6, candidatNom: 'Bouazzaoui', candidatPrenom: 'Leila',
    jobId: 3, jobTitre: 'Responsable Marketing Digital', departement: 'Marketing',
    type: 'PRESENTIEL', statut: 'TERMINE', decision: 'RETENU',
    date: '2026-04-14', heureDebut: '11:00', heureFin: '12:00',
    lieu: 'Salle B', intervieweur: 'Sana Benkirane',
    noteGlobale: 4, commentaire: 'Vision stratégique solide'
  },
  {
    id: 5, candidatId: 7, candidatNom: 'Alami', candidatPrenom: 'Reda',
    jobId: 4, jobTitre: 'DevOps Engineer', departement: 'Informatique',
    type: 'TECHNIQUE', statut: 'TERMINE', decision: 'RETENU',
    date: '2026-04-10', heureDebut: '14:00', heureFin: '15:30',
    lieu: 'Salle Tech', intervieweur: 'Rachid Amsaleg',
    noteGlobale: 5, commentaire: 'Profil rare et très complet'
  },
  {
    id: 6, candidatId: 8, candidatNom: 'Ziani', candidatPrenom: 'Fatima',
    jobId: 4, jobTitre: 'DevOps Engineer', departement: 'Informatique',
    type: 'TELEPHONIQUE', statut: 'TERMINE', decision: 'REJETE',
    date: '2026-04-08', heureDebut: '10:00', heureFin: '10:30',
    intervieweur: 'Rachid Amsaleg',
    noteGlobale: 2, commentaire: 'Expérience insuffisante pour le poste'
  },
  {
    id: 7, candidatId: 11, candidatNom: 'Moussaoui', candidatPrenom: 'Omar',
    jobId: 6, jobTitre: 'Analyste Financier', departement: 'Finance',
    type: 'VISIO', statut: 'PLANIFIE', decision: 'EN_ATTENTE',
    date: '2026-04-24', heureDebut: '15:00', heureFin: '16:00',
    lienVisio: 'https://teams.microsoft.com/xyz', intervieweur: 'Nadia Rahali'
  },
  {
    id: 8, candidatId: 2, candidatNom: 'El Fassi', candidatPrenom: 'Youssef',
    jobId: 1, jobTitre: 'Développeur Full Stack Angular', departement: 'Informatique',
    type: 'TECHNIQUE', statut: 'PLANIFIE', decision: 'EN_ATTENTE',
    date: '2026-04-25', heureDebut: '10:00', heureFin: '11:30',
    lieu: 'Salle A', intervieweur: 'Rachid Amsaleg'
  }
];
