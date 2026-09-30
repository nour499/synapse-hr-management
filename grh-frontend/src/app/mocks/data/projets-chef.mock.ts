import { Projet } from 'src/app/gerai/models/projet.model';
import { Employe } from 'src/app/theme/shared/interfaces/employe';
import { StatutProjet } from 'src/app/gerai/models/projet.model';

// ── RÉFÉRENTIEL EMPLOYÉS ──────────────────────────────────
export const MOCK_EMPLOYES: Employe[] = [
    { id: 1, nom: 'Ben Ali', prenom: 'Sami', email: 's.benali@synapse.tn', poste: 'Développeur', departement: 'Informatique', statut: 'ACTIF' },
    { id: 2, nom: 'Trabelsi', prenom: 'Ines', email: 'i.trabelsi@synapse.tn', poste: 'Designer', departement: 'Design', statut: 'CONGE' },
    { id: 3, nom: 'Gharbi', prenom: 'Mohamed', email: 'm.gharbi@synapse.tn', poste: 'Analyste', departement: 'Informatique', statut: 'ACTIF' },
    { id: 4, nom: 'Sassi', prenom: 'Leila', email: 'l.sassi@synapse.tn', poste: 'Testeur', departement: 'Qualité', statut: 'CONGE' },
    { id: 5, nom: 'Hammami', prenom: 'Youssef', email: 'y.hammami@synapse.tn', poste: 'DevOps', departement: 'Informatique', statut: 'ACTIF' }
];

// ── BASE DE DONNÉES PROJETS (Utilise 'let' pour le CRUD) ──
export let MOCK_PROJETS : Projet[] = [
    {
        id: 1,
        nom: 'Refonte Système RH',
        description: 'Migration et modernisation complète du système RH vers une plateforme cloud.',
        couleur: '#6366f1',
        dateDebut: '2025-01-15',
        dateFin: '2025-06-30',
        statut: StatutProjet.EN_COURS,
        progression: 65,
        totalTaches: 20,
        tachesCompletees: 13,
        chefProjet: undefined,
        membres: MOCK_EMPLOYES.slice(0, 3),
        equipe: [
            { id: 1, nom: 'Sami Ben Ali', initiales: 'SB' },
            { id: 2, nom: 'Ines Trabelsi', initiales: 'IT' },
            { id: 3, nom: 'Mohamed Gharbi', initiales: 'MG' }
        ]
    },
    {
        id: 2,
        nom: 'Application Mobile Employés',
        description: "Développement d'une application mobile RH native.",
        couleur: '#f59e0b',
        dateDebut: '2025-02-01',
        dateFin: '2025-08-31',
        statut: StatutProjet.EN_COURS,
        progression: 40,
        totalTaches: 15,
        tachesCompletees: 6,
        chefProjet: undefined,
        membres: [MOCK_EMPLOYES[0], MOCK_EMPLOYES[3]],
        equipe: [
            { id: 1, nom: 'Sami Ben Ali', initiales: 'SB' },
            { id: 4, nom: 'Leila Sassi', initiales: 'LS' }
        ]
    },
    {
        id: 3,
        nom: 'Portail Fournisseurs',
        description: "Portail de gestion des fournisseurs et appels d'offres.",
        couleur: '#10b981',
        dateDebut: '2024-09-01',
        dateFin: '2024-12-31',
        statut: StatutProjet.TERMINE,
        progression: 100,
        totalTaches: 30,
        tachesCompletees: 30,
        chefProjet: undefined,
        membres: [MOCK_EMPLOYES[1], MOCK_EMPLOYES[2], MOCK_EMPLOYES[4]],
        equipe: [
            { id: 2, nom: 'Ines Trabelsi', initiales: 'IT' },
            { id: 3, nom: 'Mohamed Gharbi', initiales: 'MG' },
            { id: 5, nom: 'Youssef Hammami', initiales: 'YH' }
        ]
    },
    {
        id: 4,
        nom: 'Tableau de Bord Analytics',
        description: 'Dashboard analytique pour le suivi des KPIs RH.',
        couleur: '#ef4444',
        dateDebut: '2025-03-01',
        dateFin: '2025-04-30',
        statut: StatutProjet.EN_PAUSE,
        progression: 20,
        totalTaches: 12,
        tachesCompletees: 2,
        chefProjet: undefined,
        membres: [MOCK_EMPLOYES[2], MOCK_EMPLOYES[3]],
        equipe: [
            { id: 3, nom: 'Mohamed Gharbi', initiales: 'MG' },
            { id: 4, nom: 'Leila Sassi', initiales: 'LS' }
        ]
    },
    {
        id: 5,
        nom: 'Formation IA & Automatisation',
        description: "Programme de formation aux outils d'intelligence artificielle.",
        couleur: '#8b5cf6',
        dateDebut: '2025-07-01',
        dateFin: '2025-12-31',
        statut: StatutProjet.EN_PAUSE,
        progression: 0,
        totalTaches: 8,
        tachesCompletees: 0,
        chefProjet: undefined,
        membres: [...MOCK_EMPLOYES],
        equipe: MOCK_EMPLOYES.map(e => ({
            id: e.id,
            nom: `${e.prenom} ${e.nom}`,
            initiales: `${e.prenom[0]}${e.nom[0]}`
        }))
    }
];

// ── FONCTION DE MISE À JOUR (Setter) ──────────────────────
// MSW a besoin de cette fonction pour modifier la liste ci-dessus
export const updateProjetsMock = (newList: Projet[]) => {
    MOCK_PROJETS = [...newList];
};