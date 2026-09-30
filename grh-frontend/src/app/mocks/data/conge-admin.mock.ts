import { DemandeCongeAdmin } from 'src/app/gerai/models/conge-admin.model';

export let MOCK_CONGES_ADMIN: DemandeCongeAdmin[] = [
  {
    id: 1, employeId: 1,
    employeNom: 'Sami Ben Ali', employePhoto: 'https://randomuser.me/api/portraits/men/32.jpg',
    departement: 'Informatique',
    typeConge: 'ANNUEL', dateDebut: '2026-04-14', dateFin: '2026-04-17',
    nombreJours: 4, dureeType: 'JOURNEE_COMPLETE', statut: 'APPROUVE',
    raison: 'Congé de printemps',
    dateDemande: '2026-04-01', approvePar: 'Leila RH', dateApprobation: '2026-04-03',
    commentaire: 'Approuvé — bon repos !'
  },
  {
    id: 2, employeId: 2,
    employeNom: 'Ines Trabelsi', employePhoto: 'https://randomuser.me/api/portraits/women/44.jpg',
    departement: 'Data',
    typeConge: 'MALADIE', dateDebut: '2026-04-15', dateFin: '2026-04-16',
    nombreJours: 2, dureeType: 'JOURNEE_COMPLETE', statut: 'APPROUVE',
    raison: 'Grippe avec fièvre — certificat médical joint',
    dateDemande: '2026-04-15', approvePar: 'Leila RH', dateApprobation: '2026-04-15',
    commentaire: ''
  },
  {
    id: 3, employeId: 4,
    employeNom: 'Rania Khelifa', employePhoto: 'https://randomuser.me/api/portraits/women/68.jpg',
    departement: 'RH',
    typeConge: 'RTT', dateDebut: '2026-04-22', dateFin: '2026-04-22',
    nombreJours: 1, dureeType: 'DEMI_JOURNEE', statut: 'APPROUVE',
    raison: 'RTT récupération',
    dateDemande: '2026-04-10', approvePar: 'Leila RH', dateApprobation: '2026-04-12',
    commentaire: ''
  },
  {
    id: 4, employeId: 1,
    employeNom: 'Sami Ben Ali', employePhoto: 'https://randomuser.me/api/portraits/men/32.jpg',
    departement: 'Informatique',
    typeConge: 'ANNUEL', dateDebut: '2026-05-04', dateFin: '2026-05-08',
    nombreJours: 5, dureeType: 'JOURNEE_COMPLETE', statut: 'EN_ATTENTE',
    raison: 'Semaine de vacances mai',
    dateDemande: '2026-04-18',
    commentaire: ''
  },
  {
    id: 5, employeId: 7,
    employeNom: 'Omar Zouari', employePhoto: 'https://randomuser.me/api/portraits/men/47.jpg',
    departement: 'Finance',
    typeConge: 'SANS_SOLDE', dateDebut: '2026-04-21', dateFin: '2026-04-24',
    nombreJours: 4, dureeType: 'JOURNEE_COMPLETE', statut: 'REJETE',
    raison: 'Voyage personnel',
    dateDemande: '2026-04-08', approvePar: 'Leila RH', dateApprobation: '2026-04-10',
    commentaire: 'Période de bilan — demande non recevable'
  },
  {
    id: 6, employeId: 8,
    employeNom: 'Sonia Hamdi', employePhoto: 'https://randomuser.me/api/portraits/women/12.jpg',
    departement: 'Marketing',
    typeConge: 'MATERNITE', dateDebut: '2026-04-01', dateFin: '2026-06-30',
    nombreJours: 65, dureeType: 'JOURNEE_COMPLETE', statut: 'APPROUVE',
    raison: 'Congé maternité légal',
    dateDemande: '2026-03-01', approvePar: 'Leila RH', dateApprobation: '2026-03-03',
    commentaire: 'Félicitations ! Congé accordé conformément à la législation.'
  },
  {
    id: 7, employeId: 5,
    employeNom: 'Fatma Jebali', employePhoto: 'https://randomuser.me/api/portraits/women/29.jpg',
    departement: 'Qualité',
    typeConge: 'EXCEPTIONNEL', dateDebut: '2026-04-18', dateFin: '2026-04-19',
    nombreJours: 2, dureeType: 'JOURNEE_COMPLETE', statut: 'APPROUVE',
    raison: 'Décès d\'un proche',
    dateDemande: '2026-04-18', approvePar: 'Leila RH', dateApprobation: '2026-04-18',
    commentaire: 'Toutes nos condoléances.'
  },
  {
    id: 8, employeId: 2,
    employeNom: 'Ines Trabelsi', employePhoto: 'https://randomuser.me/api/portraits/women/44.jpg',
    departement: 'Data',
    typeConge: 'RTT', dateDebut: '2026-04-29', dateFin: '2026-04-29',
    nombreJours: 1, dureeType: 'JOURNEE_COMPLETE', statut: 'EN_ATTENTE',
    raison: 'Pont du 30 avril',
    dateDemande: '2026-04-17',
    commentaire: ''
  },
  {
    id: 9, employeId: 3,
    employeNom: 'Karim Mansour', employePhoto: 'https://randomuser.me/api/portraits/men/55.jpg',
    departement: 'Design',
    typeConge: 'ANNUEL', dateDebut: '2026-04-20', dateFin: '2026-04-24',
    nombreJours: 5, dureeType: 'JOURNEE_COMPLETE', statut: 'APPROUVE',
    raison: 'Congé annuel',
    dateDemande: '2026-04-05', approvePar: 'Leila RH', dateApprobation: '2026-04-07',
    commentaire: ''
  },
  {
    id: 10, employeId: 6,
    employeNom: 'Mehdi Saadi', employePhoto: 'https://randomuser.me/api/portraits/men/61.jpg',
    departement: 'Informatique',
    typeConge: 'MALADIE', dateDebut: '2026-04-14', dateFin: '2026-04-14',
    nombreJours: 1, dureeType: 'DEMI_JOURNEE', statut: 'APPROUVE',
    raison: 'Rendez-vous médical urgent',
    dateDemande: '2026-04-14', approvePar: 'Leila RH', dateApprobation: '2026-04-14',
    commentaire: ''
  }
];
