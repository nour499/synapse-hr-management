import { Employe } from 'src/app/theme/shared/interfaces/employe';
import { StatistiquesEmploye } from 'src/app/theme/shared/interfaces/statistiques-employe';

export let MOCK_EMPLOYES: Employe[] = [
    {
        id: 1,
        nom: 'Ben Ali', prenom: 'Sami',
        email: 'sami.benali@synapse.tn',
        photo: 'https://randomuser.me/api/portraits/men/32.jpg',
        telephone: '+216 71 000 001',
        dateEmbauche: '2021-03-15',
        poste: 'Développeur Backend',
        departement: 'Informatique',
        chefId: 1,
        genre: 'M', dateNaissance: '1993-06-12',
        diplome: 'Master Informatique',
        adresse: '12 Rue de la République, Tunis',
        salaire: 3200,
        lieuTravail: 'BUREAU',
        statut: 'ACTIF'
    },
    {
        id: 2,
        nom: 'Trabelsi', prenom: 'Ines',
        email: 'ines.trabelsi@synapse.tn',
        photo: 'https://randomuser.me/api/portraits/women/44.jpg',
        telephone: '+216 71 000 002',
        dateEmbauche: '2020-07-01',
        poste: 'Analyste BI',
        departement: 'Data',
        chefId: 1,
        genre: 'F', dateNaissance: '1991-03-22',
        diplome: 'Ingénieur Data Science',
        adresse: '5 Avenue Habib Bourguiba, Sfax',
        salaire: 3800,
        lieuTravail: 'HYBRIDE',
        statut: 'ACTIF'
    },
    {
        id: 3,
        nom: 'Karray', prenom: 'Youssef',
        email: 'youssef.karray@synapse.tn',
        photo: 'https://randomuser.me/api/portraits/men/67.jpg',
        telephone: '+216 71 000 003',
        dateEmbauche: '2019-11-20',
        poste: 'Chef de projet',
        departement: 'Management',
        chefId: 1,
        genre: 'M', dateNaissance: '1988-09-05',
        diplome: 'MBA Management',
        adresse: '8 Rue Ibn Khaldoun, Sousse',
        salaire: 5000,
        lieuTravail: 'BUREAU',
        statut: 'ACTIF'
    },
    {
        id: 4,
        nom: 'Gharbi', prenom: 'Mohamed',
        email: 'mohamed.gharbi@synapse.tn',
        photo: 'https://randomuser.me/api/portraits/men/51.jpg',
        telephone: '+216 71 000 004',
        dateEmbauche: '2022-01-10',
        poste: 'Développeur Frontend',
        departement: 'Informatique',
        chefId: 2,
        genre: 'M', dateNaissance: '1997-01-30',
        diplome: 'Licence Informatique',
        adresse: '3 Rue de Carthage, Tunis',
        salaire: 2800,
        lieuTravail: 'TELETRAVAIL',
        statut: 'ACTIF'
    },
    {
        id: 5,
        nom: 'Sassi', prenom: 'Leila',
        email: 'leila.sassi@synapse.tn',
        photo: 'https://randomuser.me/api/portraits/women/29.jpg',
        telephone: '+216 71 000 005',
        dateEmbauche: '2021-09-01',
        poste: 'Designer UI/UX',
        departement: 'Design',
        chefId: 2,
        genre: 'F', dateNaissance: '1994-11-18',
        diplome: 'Licence Design Graphique',
        adresse: '20 Rue du Lac, Tunis',
        salaire: 2600,
        lieuTravail: 'HYBRIDE',
        statut: 'CONGE'
    },
    {
        id: 6,
        nom: 'Hammami', prenom: 'Youssef',
        email: 'youssef.hammami@synapse.tn',
        photo: 'https://randomuser.me/api/portraits/men/22.jpg',
        telephone: '+216 71 000 006',
        dateEmbauche: '2020-03-15',
        poste: 'DevOps Engineer',
        departement: 'Informatique',
        chefId: 1,
        genre: 'M', dateNaissance: '1990-04-07',
        diplome: 'Ingénieur Systèmes',
        adresse: '15 Avenue de la Liberté, Monastir',
        salaire: 4200,
        lieuTravail: 'BUREAU',
        statut: 'ACTIF'
    },
    {
        id: 7,
        nom: 'Mejri', prenom: 'Rania',
        email: 'rania.mejri@synapse.tn',
        photo: 'https://randomuser.me/api/portraits/women/58.jpg',
        telephone: '+216 71 000 007',
        dateEmbauche: '2023-02-01',
        poste: 'QA Engineer',
        departement: 'Qualité',
        chefId: 2,
        genre: 'F', dateNaissance: '1998-07-25',
        diplome: 'Master Qualité Logicielle',
        adresse: '7 Rue du Jasmin, Bizerte',
        salaire: 2500,
        lieuTravail: 'BUREAU',
        statut: 'INACTIF'
    }
];

let nextId = MOCK_EMPLOYES.length + 1;
export const getNextEmployeId = () => nextId++;

export const MOCK_STATISTIQUES: Record<number, StatistiquesEmploye> = {
    1: { congesRestants: 18, demandesEnCours: 1, tachesActives: 4, tauxPresence: 96 },
    2: { congesRestants: 12, demandesEnCours: 2, tachesActives: 3, tauxPresence: 88 },
    3: { congesRestants: 20, demandesEnCours: 0, tachesActives: 6, tauxPresence: 99 },
    4: { congesRestants: 15, demandesEnCours: 1, tachesActives: 5, tauxPresence: 94 },
    5: { congesRestants: 10, demandesEnCours: 3, tachesActives: 2, tauxPresence: 82 },
    6: { congesRestants: 22, demandesEnCours: 0, tachesActives: 7, tauxPresence: 98 },
    7: { congesRestants: 14, demandesEnCours: 1, tachesActives: 3, tauxPresence: 91 }
};

export const DEFAULT_STATS: StatistiquesEmploye = {
    congesRestants: 15,
    demandesEnCours: 1,
    tachesActives: 3,
    tauxPresence: 95
};
