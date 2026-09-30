import { Projet, StatutProjet } from 'src/app/gerai/models/projet.model';
import { Tache } from 'src/app/gerai/models/tache.model';
import { Employe } from 'src/app/theme/shared/interfaces/employe';

export const MOCK_EMPLOYES: Employe[] = [
    { id: 1, nom: 'Ben Ali', prenom: 'Sami', email: 's.benali@synapse.tn', poste: 'Développeur', departement: 'Informatique', statut: 'ACTIF' },
    { id: 2, nom: 'Trabelsi', prenom: 'Ines', email: 'i.trabelsi@synapse.tn', poste: 'Designer', departement: 'Design', statut: 'CONGE' },
    { id: 3, nom: 'Gharbi', prenom: 'Mohamed', email: 'm.gharbi@synapse.tn', poste: 'Analyste', departement: 'Informatique', statut: 'ACTIF' },
    { id: 4, nom: 'Sassi', prenom: 'Leila', email: 'l.sassi@synapse.tn', poste: 'Testeur', departement: 'Qualité', statut: 'CONGE' },
    { id: 5, nom: 'Hammami', prenom: 'Youssef', email: 'y.hammami@synapse.tn', poste: 'DevOps', departement: 'Informatique', statut: 'ACTIF' }
];

export const MOCK_PROJETS_TACHES: Projet[] = [
    {
        id: 1,
        nom: 'Refonte Système RH',
        description: 'Migration complète du système RH.',
        couleur: '#6366f1',
        dateDebut: '2025-01-15',
        dateFin: '2025-06-30',
        statut: StatutProjet.EN_COURS,
        progression: 65,
        totalTaches: 20,
        tachesCompletees: 13,
        equipe: [
            { id: 1, nom: 'Sami Ben Ali', initiales: 'SB' },
            { id: 2, nom: 'Ines Trabelsi', initiales: 'IT' },
            { id: 3, nom: 'Mohamed Gharbi', initiales: 'MG' }
        ]
    },
    {
        id: 2,
        nom: 'Application Mobile Employés',
        description: 'App mobile de gestion RH.',
        couleur: '#f59e0b',
        dateDebut: '2025-02-01',
        dateFin: '2025-08-31',
        statut: StatutProjet.EN_COURS,
        progression: 40,
        totalTaches: 15,
        tachesCompletees: 6,
        equipe: [
            { id: 1, nom: 'Sami Ben Ali', initiales: 'SB' },
            { id: 4, nom: 'Leila Sassi', initiales: 'LS' }
        ]
    }
];

// On utilise 'let' pour pouvoir ajouter/supprimer des tâches en mémoire
export let MOCK_TACHES: Tache[] = [
    { id: 1, titre: 'Analyse des besoins',       projet: 'Refonte Système RH',          priorite: 'Haute',   prioriteColor: '#ff5370', echeance: '2025-01-31', statut: 'TERMINEE', assigneA: 'Mohamed Gharbi'  },
    { id: 2, titre: 'Conception UX/UI',           projet: 'Refonte Système RH',          priorite: 'Haute',   prioriteColor: '#ff5370', echeance: '2025-02-28', statut: 'TERMINEE', assigneA: 'Ines Trabelsi'   },
    { id: 3, titre: 'Développement backend API',  projet: 'Refonte Système RH',          priorite: 'Haute',   prioriteColor: '#ff5370', echeance: '2025-04-30', statut: 'EN_COURS', assigneA: 'Sami Ben Ali'    },
    { id: 4, titre: 'Intégration Keycloak',       projet: 'Refonte Système RH',          priorite: 'Moyenne', prioriteColor: '#FFB64D', echeance: '2025-04-15', statut: 'EN_COURS', assigneA: 'Sami Ben Ali'    },
    { id: 5, titre: 'Tests unitaires',            projet: 'Refonte Système RH',          priorite: 'Basse',   prioriteColor: '#2ed8b6', echeance: '2025-05-15', statut: 'A_FAIRE',  assigneA: 'Mohamed Gharbi'  },
    { id: 6, titre: 'Maquettes mobile',           projet: 'Application Mobile Employés', priorite: 'Haute',   prioriteColor: '#ff5370', echeance: '2025-03-15', statut: 'TERMINEE', assigneA: 'Ines Trabelsi'   },
    { id: 7, titre: 'Tests QA mobile',            projet: 'Application Mobile Employés', priorite: 'Moyenne', prioriteColor: '#FFB64D', echeance: '2025-05-31', statut: 'EN_COURS', assigneA: 'Leila Sassi'     },
    { id: 8, titre: 'Config infrastructure',      projet: 'Tableau de Bord Analytics',   priorite: 'Haute',   prioriteColor: '#ff5370', echeance: '2025-04-20', statut: 'A_FAIRE',  assigneA: 'Youssef Hammami' },
    { id: 9, titre: 'Modélisation données KPI',   projet: 'Tableau de Bord Analytics',   priorite: 'Moyenne', prioriteColor: '#FFB64D', echeance: '2025-05-10', statut: 'A_FAIRE',  assigneA: 'Mohamed Gharbi'  }
];

// Fonction utilitaire pour mettre à jour les tâches (simule le DELETE/POST)
export const updateTachesList = (newList: Tache[]) => {
    MOCK_TACHES = newList;
};