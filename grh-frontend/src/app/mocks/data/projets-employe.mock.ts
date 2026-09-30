/**
 * projets-employe.mock.ts
 * ─────────────────────────────────────────────────────────────
 * Source unique de vérité pour la simulation des projets employé.
 *
 * Architecture de production (Spring Boot + Kafka) :
 *   GET  /api/projets            → ProjetRepository.findByMembreId(keycloak.sub)
 *   GET  /api/projets/mes-taches → TacheRepository.findByAssigneId(keycloak.sub)
 *   PATCH /api/projets/taches/:id/toggle → TacheService.toggleStatut(id)
 */

import { http, HttpResponse, delay } from 'msw';
import { Projet, StatutProjet, TacheProjet } from 'src/app/gerai/models/projet.model';

// ── Helpers dates ────────────────────────────────────────────
const dateIn = (d: number) => new Date(Date.now() + d * 86_400_000).toISOString().split('T')[0];
const datePast = (d: number) => new Date(Date.now() - d * 86_400_000).toISOString().split('T')[0];

// ══════════════════════════════════════════════════════════════
// PROJETS
// ══════════════════════════════════════════════════════════════

export let PROJETS_MOCK: Projet[] = [
    {
        id: 1,
        nom: 'SYNAPSE — Module RH',
        description: 'Développement du système de gestion RH avec dashboards employé et chef, gestion des demandes, congés et absences.',
        couleur: '#3B82F6',
        statut: StatutProjet.EN_COURS,
        progression: 68,
        dateDebut: datePast(60),
        dateEcheance: dateIn(20),
        totalTaches: 24,
        tachesCompletees: 16,
        equipe: [
            { id: 1, nom: 'Nabil Benzarti', initiales: 'NB' },
            { id: 2, nom: 'Sarra Trabelsi', initiales: 'ST' },
            { id: 3, nom: 'Ahmed Khalil', initiales: 'AK' },
            { id: 4, nom: 'Leila Mansouri', initiales: 'LM' }
        ]
    },
    {
        id: 2,
        nom: 'Portail Fournisseurs',
        description: 'Mise en place d\'un portail self-service pour les fournisseurs externes avec gestion des contrats et factures.',
        couleur: '#10B981',
        statut: StatutProjet.EN_COURS,
        progression: 42,
        dateDebut: datePast(30),
        dateEcheance: dateIn(45),
        totalTaches: 18,
        tachesCompletees: 7,
        equipe: [
            { id: 1, nom: 'Nabil Benzarti', initiales: 'NB' },
            { id: 5, nom: 'Mehdi Saidi', initiales: 'MS' }
        ]
    },
    {
        id: 3,
        nom: 'App Mobile RH',
        description: 'Application mobile (React Native) pour les employés : pointage, demandes, notifications push.',
        couleur: '#F59E0B',
        statut: StatutProjet.EN_PAUSE,
        progression: 25,
        dateDebut: datePast(45),
        dateEcheance: dateIn(60),
        totalTaches: 30,
        tachesCompletees: 7,
        equipe: [
            { id: 2, nom: 'Sarra Trabelsi', initiales: 'ST' },
            { id: 6, nom: 'Youssef Karray', initiales: 'YK' },
            { id: 7, nom: 'Sarah Ben Amor', initiales: 'SB' }
        ]
    },
    {
        id: 4,
        nom: 'Migration Base de Données',
        description: 'Migration de la base monolithique PostgreSQL vers une architecture microservices avec Kafka.',
        couleur: '#8B5CF6',
        statut: StatutProjet.TERMINE,
        progression: 100,
        dateDebut: datePast(90),
        dateEcheance: datePast(10),
        totalTaches: 12,
        tachesCompletees: 12,
        equipe: [
            { id: 1, nom: 'Nabil Benzarti', initiales: 'NB' },
            { id: 3, nom: 'Ahmed Khalil', initiales: 'AK' }
        ]
    }
];

// ══════════════════════════════════════════════════════════════
// TÂCHES RÉCENTES DE L'EMPLOYÉ
// ══════════════════════════════════════════════════════════════

export let TACHES_PROJET_MOCK: TacheProjet[] = [
    {
        id: 1,
        titre: 'Intégration API authentification Keycloak',
        projetNom: 'SYNAPSE — Module RH',
        projetCouleur: '#3B82F6',
        priorite: 'Haute',
        echeance: dateIn(2),
        terminee: false
    },
    {
        id: 2,
        titre: 'Revue de code sprint 12',
        projetNom: 'SYNAPSE — Module RH',
        projetCouleur: '#3B82F6',
        priorite: 'Moyenne',
        echeance: dateIn(1),
        terminee: false
    },
    {
        id: 3,
        titre: 'Maquettes écrans mobile',
        projetNom: 'App Mobile RH',
        projetCouleur: '#F59E0B',
        priorite: 'Haute',
        echeance: dateIn(5),
        terminee: false
    },
    {
        id: 4,
        titre: 'Rédiger documentation API fournisseurs',
        projetNom: 'Portail Fournisseurs',
        projetCouleur: '#10B981',
        priorite: 'Basse',
        echeance: dateIn(10),
        terminee: false
    },
    {
        id: 5,
        titre: 'Tests d\'intégration module absences',
        projetNom: 'SYNAPSE — Module RH',
        projetCouleur: '#3B82F6',
        priorite: 'Moyenne',
        echeance: datePast(2),   // En retard intentionnellement
        terminee: false
    },
    {
        id: 6,
        titre: 'Rapport migration base de données',
        projetNom: 'Migration Base de Données',
        projetCouleur: '#8B5CF6',
        priorite: 'Basse',
        echeance: datePast(5),
        terminee: true
    }
];

// ══════════════════════════════════════════════════════════════
// MSW HANDLERS
// ══════════════════════════════════════════════════════════════

export const projetsEmployeHandlers = [

    /**
     * GET /api/projets
     * Production → filtre par employeId depuis le JWT Keycloak
     * Tri : en cours en premier, puis terminés
     */
    http.get('*/api/projets', async () => {
        await delay(20);
        const ordre: Record<string, number> = { EN_COURS: 0, EN_PAUSE: 1, TERMINE: 2 };
        const sorted = [...PROJETS_MOCK].sort((a, b) => ordre[a.statut] - ordre[b.statut]);
        return HttpResponse.json(sorted);
    }),

    /**
     * GET /api/projets/mes-taches
     * Production → TacheRepository.findByAssigneId(sub)
     * Tri : non terminées d'abord, puis par date d'échéance
     */
    http.get('*/api/projets/mes-taches', async () => {
        await delay(20);
        const sorted = [...TACHES_PROJET_MOCK].sort((a, b) => {
            if (a.terminee !== b.terminee) return a.terminee ? 1 : -1;
            return new Date(a.echeance).getTime() - new Date(b.echeance).getTime();
        });
        return HttpResponse.json(sorted);
    }),

    /**
     * PATCH /api/projets/taches/:id/toggle
     * Production → TacheService.toggleStatut(id, employeId)
     * Met à jour tachesCompletees du projet parent si besoin
     */
    http.patch('*/api/projets/taches/:id/toggle', async ({ params }) => {
        await delay(20);
        const id = Number(params['id']);
        const tache = TACHES_PROJET_MOCK.find(t => t.id === id);
        if (!tache) return new HttpResponse(null, { status: 404 });

        tache.terminee = !tache.terminee;

        // Mettre à jour tachesCompletees du projet parent (simulation)
        const projet = PROJETS_MOCK.find(p => p.nom === tache.projetNom);
        if (projet) {
            const completees = TACHES_PROJET_MOCK.filter(
                t => t.projetNom === projet.nom && t.terminee
            ).length;
            projet.tachesCompletees = completees;
            projet.progression = Math.round((completees / projet.totalTaches) * 100);
        }

        return HttpResponse.json(tache);
    })
];