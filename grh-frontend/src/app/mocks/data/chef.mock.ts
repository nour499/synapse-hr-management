/**
 * chef.mock.ts
 * ─────────────────────────────────────────────────────────────
 * Mock MSW pour tous les endpoints chef.
 * Utilise exactement les mêmes modèles que les vrais services :
 *   - EquipeApiService       → /api/equipe/membres
 *   - TacheChefService       → /api/chef/taches
 *   - ProjetChefService      → /api/chef/projets
 *   - DashboardChefService   → /api/chef/kpis | /api/chef/demandes | /api/chef/notifications
 *
 * Architecture production (Spring Boot) :
 *   Chaque endpoint filtre par chefId depuis le JWT Keycloak.
 *   Ici on simule avec des données fixes.
 */

import { delay, http, HttpResponse } from 'msw';
import { MembreEquipe } from 'src/app/gerai/models/equipe.model';
import {
    KPIsChef, DemandeChef, TacheChef,
    ProjetChef, NotificationChef
} from 'src/app/gerai/models/chef.model';

// ── Dates ─────────────────────────────────────────────────────
const now = Date.now();
const ago = (d: number) => new Date(now - d * 86_400_000).toISOString().split('T')[0];
const inDays = (d: number) => new Date(now + d * 86_400_000).toISOString().split('T')[0];
const isoAgo = (d: number) => new Date(now - d * 86_400_000).toISOString();

// ══════════════════════════════════════════════════════════════
// MEMBRES D'ÉQUIPE — utilisés par EquipeApiService
// Mêmes IDs que CHAT_USERS_MOCK pour cohérence
// ══════════════════════════════════════════════════════════════

export let MOCK_EQUIPE: MembreEquipe[] = [
    {
        id: 1, keycloakId: '98d63792-7104-4b53-b0a5-f39b6999a0d8',
        nom: 'Benzarti', prenom: 'Nabil',
        email: 'nabil.benzarti@synapse.tn', poste: 'Développeur Frontend',
        departement: 'Informatique', statut: 'ACTIF',
        present: true, telephone: '+216 71 001 001',
        dateEmbauche: ago(540), manager: 'Mariem Saadaoui',
        competences: ['Angular', 'TypeScript', 'Tailwind']
    },
    {
        id: 2, keycloakId: 'd8004f21-7290-48e0-ae89-082098650085',
        nom: 'Khalil', prenom: 'Amina',
        email: 'amina.khalil@synapse.tn', poste: 'Développeur Backend',
        departement: 'Informatique', statut: 'ACTIF',
        present: true, telephone: '+216 71 001 002',
        dateEmbauche: ago(480), manager: 'Mariem Saadaoui',
        competences: ['Spring Boot', 'Kafka', 'PostgreSQL']
    },
    {
        id: 3, keycloakId: '749f7e52-bc66-4d0a-9d6e-0960bc21008d',
        nom: 'Trabelsi', prenom: 'Sarah',
        email: 'sarah.trabelsi@synapse.tn', poste: 'DevOps Engineer',
        departement: 'Infrastructure', statut: 'ACTIF',
        present: true, telephone: '+216 71 001 003',
        dateEmbauche: ago(360), manager: 'Mariem Saadaoui',
        competences: ['Docker', 'Kubernetes', 'CI/CD']
    },
    {
        id: 4, keycloakId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        nom: 'Saidi', prenom: 'Mehdi',
        email: 'mehdi.saidi@synapse.tn', poste: 'Chef de Projet',
        departement: 'Management', statut: 'ACTIF',
        present: false, telephone: '+216 71 001 004',
        dateEmbauche: ago(720), manager: 'Mariem Saadaoui',
        competences: ['Scrum', 'Jira', 'MS Project']
    },
    {
        id: 5, keycloakId: 'a1b2c3d4-0000-0000-0000-000000000005',
        nom: 'Manager', prenom: 'Stéphane',
        email: 'stephane.manager@synapse.tn', poste: 'Architecte Solution',
        departement: 'Informatique', statut: 'CONGE',
        present: false, telephone: '+216 71 001 005',
        dateEmbauche: ago(900), manager: 'Mariem Saadaoui',
        competences: ['Architecture', 'AWS', 'Microservices']
    },
    {
        id: 6, keycloakId: 'a1b2c3d4-0000-0000-0000-000000000006',
        nom: 'Mansouri', prenom: 'Leila',
        email: 'leila.mansouri@synapse.tn', poste: 'Analyste BI',
        departement: 'Data', statut: 'ACTIF',
        present: true, telephone: '+216 71 001 006',
        dateEmbauche: ago(270), manager: 'Mariem Saadaoui',
        competences: ['Power BI', 'SQL', 'Python']
    }
];

// ══════════════════════════════════════════════════════════════
// KPIs — calculés dynamiquement depuis les données
// ══════════════════════════════════════════════════════════════

function calculerKPIs(): KPIsChef {
    return {
        totalEmployes: MOCK_EQUIPE.length,
        demandesEnAttente: MOCK_DEMANDES.filter(d => d.statut === 'EN_ATTENTE').length,
        projetsActifs: MOCK_PROJETS_CHEF.filter(p => p.statut === 'en_cours').length,
        tauxPresenceEquipe: Math.round(MOCK_EQUIPE.filter(m => m.present).length / MOCK_EQUIPE.length * 100),
        tachesEnRetard: MOCK_TACHES_CHEF.filter(t => new Date(t.echeance) < new Date() && t.statut !== 'TERMINEE').length,
        performanceEquipe: 87
    };
}

// ══════════════════════════════════════════════════════════════
// DEMANDES — utilisées par DashboardChefService + DemandeService
// ══════════════════════════════════════════════════════════════

let _demandeId = 10;
const did = () => _demandeId++;

export let MOCK_DEMANDES: DemandeChef[] = [
    {
        id: did(), employeId: '98d63792-7104-4b53-b0a5-f39b6999a0d8',
        employeNom: 'Amina Khalil', type: 'Formation',
        dateCreation: isoAgo(1), statut: 'EN_ATTENTE',
        description: 'Demande de formation Spring Boot avancé',
        priorite: 'Haute', dateDebut: inDays(7), dateFin: inDays(9)
    },
    {
        id: did(), employeId: '749f7e52-bc66-4d0a-9d6e-0960bc21008d',
        employeNom: 'Sarah Trabelsi', type: 'Matériel',
        dateCreation: isoAgo(0), statut: 'EN_ATTENTE',
        description: 'Demande d\'un second écran 27"',
        priorite: 'Moyenne'
    },
    {
        id: did(), employeId: '98d63792-7104-4b53-b0a5-f39b6999a0d8',
        employeNom: 'Nabil Benzarti', type: 'Congé',
        dateCreation: isoAgo(2), statut: 'EN_ATTENTE',
        description: 'Congé annuel — 5 jours',
        priorite: 'Basse', dateDebut: inDays(14), dateFin: inDays(18)
    },
    {
        id: did(), employeId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        employeNom: 'Mehdi Saidi', type: 'Document',
        dateCreation: isoAgo(3), statut: 'EN_ATTENTE',
        description: 'Attestation de travail pour dossier bancaire',
        priorite: 'Moyenne'
    },
    {
        id: did(), employeId: 'a1b2c3d4-0000-0000-0000-000000000006',
        employeNom: 'Leila Mansouri', type: 'Autorisation',
        dateCreation: isoAgo(1), statut: 'VALIDEE',
        description: 'Sortie anticipée vendredi pour rendez-vous médical',
        priorite: 'Basse'
    }
];

// ══════════════════════════════════════════════════════════════
// TÂCHES CHEF — utilisées par TacheChefService
// ══════════════════════════════════════════════════════════════

export let MOCK_TACHES_CHEF: TacheChef[] = [
    {
        id: 1, titre: 'Configuration CI/CD pipeline', assigneA: 'emp-3', assigneNom: 'Sarah Trabelsi',
        priorite: 'Haute', statut: 'EN_COURS', echeance: inDays(2), progression: 45, projetId: 1
    },
    {
        id: 2, titre: 'Intégration API Spring Boot', assigneA: 'emp-2', assigneNom: 'Amina Khalil',
        priorite: 'Haute', statut: 'EN_COURS', echeance: ago(2), progression: 70, projetId: 1
    },
    {
        id: 3, titre: 'Revue de code Frontend', assigneA: 'emp-4', assigneNom: 'Nabil Benzarti',
        priorite: 'Moyenne', statut: 'A_FAIRE', echeance: inDays(1), progression: 0, projetId: 2
    },
    {
        id: 4, titre: 'Maquettes module RH', assigneA: 'emp-5', assigneNom: 'Mehdi Saidi',
        priorite: 'Moyenne', statut: 'A_FAIRE', echeance: inDays(4), progression: 0, projetId: 2
    },
    {
        id: 5, titre: 'Tests de charge API', assigneA: 'emp-3', assigneNom: 'Sarah Trabelsi',
        priorite: 'Basse', statut: 'A_FAIRE', echeance: inDays(10), progression: 0, projetId: 1
    }
];

// ══════════════════════════════════════════════════════════════
// PROJETS CHEF — utilisés par ProjetChefService
// ══════════════════════════════════════════════════════════════

export let MOCK_PROJETS_CHEF: ProjetChef[] = [
    {
        id: 1, nom: 'SYNAPSE — Module RH',
        description: 'Système de gestion RH complet avec dashboards, congés et demandes.',
        dateDebut: ago(60), dateFinPrevue: inDays(30),
        avancement: 68, statut: 'en_cours',
        chefProjet: 'Mariem Saadaoui',
        equipe: ['Nabil Benzarti', 'Amina Khalil', 'Sarah Trabelsi'],
        budget: 45000, priorite: 'Haute'
    },
    {
        id: 2, nom: 'Portail Fournisseurs',
        description: 'Portail self-service pour les fournisseurs : contrats et factures.',
        dateDebut: ago(30), dateFinPrevue: inDays(45),
        avancement: 42, statut: 'en_cours',
        chefProjet: 'Mariem Saadaoui',
        equipe: ['Mehdi Saidi', 'Leila Mansouri'],
        budget: 28000, priorite: 'Moyenne'
    },
    {
        id: 3, nom: 'App Mobile RH',
        description: 'Application mobile React Native — pointage et notifications.',
        dateDebut: ago(45), dateFinPrevue: inDays(60),
        avancement: 25, statut: 'planifie',
        chefProjet: 'Mariem Saadaoui',
        equipe: ['Nabil Benzarti', 'Stéphane Manager'],
        budget: 35000, priorite: 'Moyenne'
    },
    {
        id: 4, nom: 'Migration Base de Données',
        description: 'Migration PostgreSQL monolithique → microservices Kafka.',
        dateDebut: ago(90), dateFinPrevue: ago(10),
        avancement: 100, statut: 'termine',
        chefProjet: 'Mariem Saadaoui',
        equipe: ['Amina Khalil', 'Sarah Trabelsi'],
        budget: 18000, priorite: 'Haute'
    }
];

// ══════════════════════════════════════════════════════════════
// NOTIFICATIONS CHEF
// ══════════════════════════════════════════════════════════════

export let MOCK_NOTIFS_CHEF: NotificationChef[] = [
    {
        id: 1, titre: 'Demande de congé en attente',
        message: 'Nabil Benzarti a soumis une demande de congé.',
        date: isoAgo(0), type: 'info', lue: false, lien: '/chef/demandes'
    },
    {
        id: 2, titre: 'Tâche en retard',
        message: 'Intégration API Spring Boot dépasse son délai.',
        date: isoAgo(1), type: 'danger', lue: false, lien: '/chef/taches'
    },
    {
        id: 3, titre: 'Projet terminé',
        message: 'Migration Base de Données marquée à 100 %.',
        date: isoAgo(2), type: 'success', lue: true, lien: '/chef/projets'
    },
    {
        id: 4, titre: 'Échéance approchante',
        message: 'SYNAPSE Module RH arrive à échéance dans 30 jours.',
        date: isoAgo(3), type: 'warning', lue: false, lien: '/chef/projets'
    }
];

// ══════════════════════════════════════════════════════════════
// MSW HANDLERS
// ══════════════════════════════════════════════════════════════

export const chefHandlers = [

    // ── KPIs — calculés dynamiquement ────────────────────────────
    http.get('*/api/chef/kpis', async () => {
        await delay(20);
        return HttpResponse.json(calculerKPIs());
    }),

    // ── Demandes en attente ───────────────────────────────────────
    http.get('*/api/chef/demandes', async ({ request }) => {
        await delay(20);
        const url = new URL(request.url);
        const statut = url.searchParams.get('statut');
        const data = statut === 'toutes'
            ? MOCK_DEMANDES
            : MOCK_DEMANDES.filter(d => d.statut === 'EN_ATTENTE');
        return HttpResponse.json(data);
    }),

    http.post('*/api/chef/demandes/:id/valider', async ({ params }) => {
        await delay(20);
        const id = Number(params['id']);
        const demande = MOCK_DEMANDES.find(d => d.id === id);
        if (!demande) return new HttpResponse(null, { status: 404 });
        demande.statut = 'VALIDEE';
        return HttpResponse.json({ success: true, message: `Demande #${id} validée` });
    }),

    http.post('*/api/chef/demandes/:id/refuser', async ({ params }) => {
        await delay(20);
        const id = Number(params['id']);
        const demande = MOCK_DEMANDES.find(d => d.id === id);
        if (!demande) return new HttpResponse(null, { status: 404 });
        demande.statut = 'REFUSEE';
        return HttpResponse.json({ success: true, message: `Demande #${id} refusée` });
    }),

    // ── Équipe — réutilise le même endpoint qu'EquipeApiService ──
    http.get('*/api/equipe/membres', async () => {
        await delay(20);
        return HttpResponse.json(MOCK_EQUIPE);
    }),

    http.get('*/api/equipe/membres/:id', async ({ params }) => {
        await delay(20);
        const membre = MOCK_EQUIPE.find(m => m.id === Number(params['id']));
        if (!membre) return new HttpResponse(null, { status: 404 });
        return HttpResponse.json(membre);
    }),

    http.post('*/api/equipe/membres', async ({ request }) => {
        await delay(20);
        const body = await request.json() as Partial<MembreEquipe>;
        const nouveau: MembreEquipe = {
            id: MOCK_EQUIPE.length + 1,
            keycloakId: crypto.randomUUID(),
            nom: body.nom ?? '',
            prenom: body.prenom ?? '',
            email: body.email ?? '',
            poste: body.poste ?? '',
            departement: body.departement ?? '',
            statut: body.statut ?? 'ACTIF',
            present: true,
            telephone: body.telephone ?? '',
            dateEmbauche: new Date().toISOString().split('T')[0],
            manager: 'Mariem Saadaoui',
            competences: body.competences ?? []
        };
        MOCK_EQUIPE.push(nouveau);
        return HttpResponse.json(nouveau, { status: 201 });
    }),

    http.patch('*/api/equipe/membres/:id', async ({ params, request }) => {
        await delay(20);
        const idx = MOCK_EQUIPE.findIndex(m => m.id === Number(params['id']));
        if (idx === -1) return new HttpResponse(null, { status: 404 });
        const body = await request.json() as Partial<MembreEquipe>;
        MOCK_EQUIPE[idx] = { ...MOCK_EQUIPE[idx], ...body };
        return HttpResponse.json(MOCK_EQUIPE[idx]);
    }),

    http.delete('*/api/equipe/membres/:id', async ({ params }) => {
        await delay(20);
        const idx = MOCK_EQUIPE.findIndex(m => m.id === Number(params['id']));
        if (idx === -1) return new HttpResponse(null, { status: 404 });
        MOCK_EQUIPE.splice(idx, 1);
        return HttpResponse.json({ success: true });
    }),

    // ── Tâches chef ───────────────────────────────────────────────
    http.get('*/api/chef/taches', async () => {
        await delay(20);
        return HttpResponse.json(MOCK_TACHES_CHEF);
    }),

    http.patch('*/api/chef/taches/:id', async ({ params, request }) => {
        await delay(20);
        const idx = MOCK_TACHES_CHEF.findIndex(t => t.id === Number(params['id']));
        if (idx === -1) return new HttpResponse(null, { status: 404 });
        const body = await request.json() as Partial<TacheChef>;
        MOCK_TACHES_CHEF[idx] = { ...MOCK_TACHES_CHEF[idx], ...body };
        return HttpResponse.json(MOCK_TACHES_CHEF[idx]);
    }),

    // ── Projets chef ──────────────────────────────────────────────
    http.get('*/api/chef/projets', async () => {
        await delay(20);
        return HttpResponse.json(MOCK_PROJETS_CHEF);
    }),

    // ── Notifications ─────────────────────────────────────────────
    http.get('*/api/chef/notifications', async () => {
        await delay(20);
        return HttpResponse.json(MOCK_NOTIFS_CHEF);
    })
];