import { SoldeCongeAdmin } from 'src/app/gerai/models/solde-conge-admin.model';

const YEAR = new Date().getFullYear();

export let MOCK_SOLDES: SoldeCongeAdmin[] = [
  {
    id: 1, employeId: 1, annee: YEAR,
    employeNom: 'Sami Ben Ali',
    employePhoto: 'https://randomuser.me/api/portraits/men/32.jpg',
    departement: 'Informatique', poste: 'Développeur Backend',
    soldePrecedent: 5, soldeTotal: 25, reportSolde: 5,
    congesUtilises: 7, congesAcceptes: 3, congesRejetes: 1, congesExpires: 0,
    soldeActuel: 18
  },
  {
    id: 2, employeId: 2, annee: YEAR,
    employeNom: 'Ines Trabelsi',
    employePhoto: 'https://randomuser.me/api/portraits/women/44.jpg',
    departement: 'Data', poste: 'Analyste BI',
    soldePrecedent: 3, soldeTotal: 25, reportSolde: 3,
    congesUtilises: 13, congesAcceptes: 5, congesRejetes: 2, congesExpires: 3,
    soldeActuel: 12
  },
  {
    id: 3, employeId: 3, annee: YEAR,
    employeNom: 'Youssef Karray',
    employePhoto: 'https://randomuser.me/api/portraits/men/67.jpg',
    departement: 'Management', poste: 'Chef de projet',
    soldePrecedent: 8, soldeTotal: 30, reportSolde: 8,
    congesUtilises: 5, congesAcceptes: 2, congesRejetes: 0, congesExpires: 0,
    soldeActuel: 20
  },
  {
    id: 4, employeId: 4, annee: YEAR,
    employeNom: 'Mohamed Gharbi',
    employePhoto: 'https://randomuser.me/api/portraits/men/51.jpg',
    departement: 'Informatique', poste: 'Développeur Frontend',
    soldePrecedent: 0, soldeTotal: 20, reportSolde: 0,
    congesUtilises: 5, congesAcceptes: 2, congesRejetes: 1, congesExpires: 0,
    soldeActuel: 15
  },
  {
    id: 5, employeId: 5, annee: YEAR,
    employeNom: 'Leila Sassi',
    employePhoto: 'https://randomuser.me/api/portraits/women/29.jpg',
    departement: 'Design', poste: 'Designer UI/UX',
    soldePrecedent: 2, soldeTotal: 25, reportSolde: 2,
    congesUtilises: 15, congesAcceptes: 6, congesRejetes: 3, congesExpires: 2,
    soldeActuel: 10
  },
  {
    id: 6, employeId: 6, annee: YEAR,
    employeNom: 'Youssef Hammami',
    employePhoto: 'https://randomuser.me/api/portraits/men/22.jpg',
    departement: 'Informatique', poste: 'DevOps Engineer',
    soldePrecedent: 10, soldeTotal: 30, reportSolde: 10,
    congesUtilises: 3, congesAcceptes: 1, congesRejetes: 0, congesExpires: 0,
    soldeActuel: 22
  },
  {
    id: 7, employeId: 7, annee: YEAR,
    employeNom: 'Rania Mejri',
    employePhoto: 'https://randomuser.me/api/portraits/women/58.jpg',
    departement: 'Qualité', poste: 'QA Engineer',
    soldePrecedent: 1, soldeTotal: 20, reportSolde: 1,
    congesUtilises: 6, congesAcceptes: 3, congesRejetes: 2, congesExpires: 1,
    soldeActuel: 14
  }
];
