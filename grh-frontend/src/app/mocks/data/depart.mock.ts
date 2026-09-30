import { DepartEmploye } from 'src/app/gerai/models/depart.model';

export let MOCK_DEPARTS: DepartEmploye[] = [
  {
    id: 1,
    employeId: 3, employeNom: 'Karim Mansour',
    employePoste: 'Designer UI/UX', employeDept: 'Design',
    employePhoto: 'https://randomuser.me/api/portraits/men/55.jpg',
    dateDepart: '2025-06-30',
    typeDepart: 'DEMISSION',
    raison: 'Opportunité professionnelle à l\'étranger',
    statut: 'VALIDE',
    notes: 'Préavis de 2 mois respecté. Passation effectuée.',
    createdAt: '2025-04-10'
  },
  {
    id: 2,
    employeId: 5, employeNom: 'Fatma Jebali',
    employePoste: 'Responsable Qualité', employeDept: 'Qualité',
    employePhoto: 'https://randomuser.me/api/portraits/women/29.jpg',
    dateDepart: '2025-07-31',
    typeDepart: 'RETRAITE',
    raison: 'Départ à la retraite après 27 ans de service',
    statut: 'VALIDE',
    notes: 'Cérémonie de départ prévue le 30/07/2025.',
    createdAt: '2025-03-20'
  },
  {
    id: 3,
    employeId: 6, employeNom: 'Mehdi Saadi',
    employePoste: 'Développeur Frontend', employeDept: 'Informatique',
    employePhoto: 'https://randomuser.me/api/portraits/men/61.jpg',
    dateDepart: '2025-05-15',
    typeDepart: 'FIN_CONTRAT',
    raison: 'Fin de CDD non renouvelé',
    statut: 'VALIDE',
    notes: '',
    createdAt: '2025-03-01'
  },
  {
    id: 4,
    employeId: 4, employeNom: 'Rania Khelifa',
    employePoste: 'Chargée RH', employeDept: 'RH',
    employePhoto: 'https://randomuser.me/api/portraits/women/68.jpg',
    dateDepart: '2025-09-01',
    typeDepart: 'MUTATION',
    raison: 'Mutation vers la filiale de Sfax',
    statut: 'EN_COURS',
    notes: 'Dossier en attente de validation RH centrale.',
    createdAt: '2025-04-15'
  },
  {
    id: 5,
    employeId: 7, employeNom: 'Omar Zouari',
    employePoste: 'Analyste Financier', employeDept: 'Finance',
    employePhoto: 'https://randomuser.me/api/portraits/men/47.jpg',
    dateDepart: '2025-04-30',
    typeDepart: 'LICENCIEMENT',
    raison: 'Faute grave — divulgation d\'informations confidentielles',
    statut: 'VALIDE',
    notes: 'Procédure disciplinaire close.',
    createdAt: '2025-04-02'
  },
  {
    id: 6,
    employeId: 8, employeNom: 'Sonia Hamdi',
    employePoste: 'Responsable Marketing', employeDept: 'Marketing',
    employePhoto: 'https://randomuser.me/api/portraits/women/12.jpg',
    dateDepart: '2025-08-15',
    typeDepart: 'DEMISSION',
    raison: 'Reconversion professionnelle',
    statut: 'EN_COURS',
    notes: '',
    createdAt: '2025-04-18'
  }
];
