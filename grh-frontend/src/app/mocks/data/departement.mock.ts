import { Departement } from 'src/app/gerai/models/departement.model';

export let MOCK_DEPARTEMENTS: Departement[] = [
  {
    id: 1, nom: 'Informatique',
    responsable: 'Sami Ben Ali',
    responsablePhoto: 'https://randomuser.me/api/portraits/men/32.jpg',
    telephone: '+216 71 234 001', email: 'it@synapse-rh.tn',
    capacite: 30, anneeCreation: 2010, totalEmployes: 24,
    description: 'Développement logiciel, infrastructure et cybersécurité'
  },
  {
    id: 2, nom: 'Ressources Humaines',
    responsable: 'Leila Ouertani',
    responsablePhoto: 'https://randomuser.me/api/portraits/women/65.jpg',
    telephone: '+216 71 234 002', email: 'rh@synapse-rh.tn',
    capacite: 12, anneeCreation: 2008, totalEmployes: 9,
    description: 'Recrutement, formation, paie et gestion du personnel'
  },
  {
    id: 3, nom: 'Data & Analytics',
    responsable: 'Ines Trabelsi',
    responsablePhoto: 'https://randomuser.me/api/portraits/women/44.jpg',
    telephone: '+216 71 234 003', email: 'data@synapse-rh.tn',
    capacite: 18, anneeCreation: 2016, totalEmployes: 14,
    description: 'Business Intelligence, Data Science et reporting'
  },
  {
    id: 4, nom: 'Finance & Comptabilité',
    responsable: 'Omar Zouari',
    responsablePhoto: 'https://randomuser.me/api/portraits/men/47.jpg',
    telephone: '+216 71 234 004', email: 'finance@synapse-rh.tn',
    capacite: 15, anneeCreation: 2008, totalEmployes: 11,
    description: 'Comptabilité générale, contrôle de gestion et trésorerie'
  },
  {
    id: 5, nom: 'Marketing & Communication',
    responsable: 'Sonia Hamdi',
    responsablePhoto: 'https://randomuser.me/api/portraits/women/12.jpg',
    telephone: '+216 71 234 005', email: 'marketing@synapse-rh.tn',
    capacite: 14, anneeCreation: 2012, totalEmployes: 10,
    description: 'Stratégie marketing, communication digitale et branding'
  },
  {
    id: 6, nom: 'Design & Expérience',
    responsable: 'Karim Mansour',
    responsablePhoto: 'https://randomuser.me/api/portraits/men/55.jpg',
    telephone: '+216 71 234 006', email: 'design@synapse-rh.tn',
    capacite: 10, anneeCreation: 2018, totalEmployes: 7,
    description: 'UX/UI Design, identité visuelle et prototypage'
  },
  {
    id: 7, nom: 'Qualité & Processus',
    responsable: 'Fatma Jebali',
    responsablePhoto: 'https://randomuser.me/api/portraits/women/29.jpg',
    telephone: '+216 71 234 007', email: 'qualite@synapse-rh.tn',
    capacite: 8, anneeCreation: 2014, totalEmployes: 6,
    description: 'Assurance qualité, audits internes et amélioration continue'
  },
  {
    id: 8, nom: 'Commercial & Ventes',
    responsable: 'Mehdi Saadi',
    responsablePhoto: 'https://randomuser.me/api/portraits/men/61.jpg',
    telephone: '+216 71 234 008', email: 'commercial@synapse-rh.tn',
    capacite: 20, anneeCreation: 2009, totalEmployes: 17,
    description: 'Développement commercial, gestion des clients et partenariats'
  }
];
