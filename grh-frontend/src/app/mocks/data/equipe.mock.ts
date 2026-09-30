import { MembreEquipe } from 'src/app/gerai/models/equipe.model';

export let MOCK_MEMBRES: MembreEquipe[] = [
    {
        id: 1,
        nom: 'Ben Ali',
        prenom: 'Sami',
        poste: 'Développeur Backend',
        email: 'sami.benali@synapse.tn',
        photo: 'https://randomuser.me/api/portraits/men/32.jpg',
        statut: 'ACTIF',
        telephone: '+216 71 000 001',
        dateEmbauche: '2021-03-15',
        departement: 'Informatique',
        manager: 'Stéphane Manager',
        competences: ['Java', 'Spring Boot', 'PostgreSQL'],
        keycloakId: 'emp-001',
        present: true
    },
    {
        id: 2,
        nom: 'Trabelsi',
        prenom: 'Ines',
        poste: 'Analyste BI',
        email: 'ines.trabelsi@synapse.tn',
        photo: 'https://randomuser.me/api/portraits/women/44.jpg',
        statut: 'CONGE',
        telephone: '+216 71 000 002',
        dateEmbauche: '2020-07-01',
        departement: 'Data',
        manager: 'Stéphane Manager',
        competences: ['Power BI', 'SQL', 'Python'],
        keycloakId: 'emp-002',
        present: true
    },
    {
        id: 3,
        nom: 'Karray',
        prenom: 'Youssef',
        poste: 'Chef de projet',
        email: 'youssef.karray@synapse.tn',
        photo: 'https://randomuser.me/api/portraits/men/67.jpg',
        statut: 'ACTIF',
        telephone: '+216 71 000 003',
        dateEmbauche: '2019-01-10',
        departement: 'Management',
        manager: 'Stéphane Manager',
        competences: ['Scrum', 'Jira', 'MS Project'],
        keycloakId: 'emp-003',
        present: true
    }
];

export let nextMembreId = 4;

export function getNextMembreId(): number {
    return nextMembreId++;
}
