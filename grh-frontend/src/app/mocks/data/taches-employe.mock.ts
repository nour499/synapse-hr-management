/**
 * taches-employe.mock.ts
 * ─────────────────────────────────────────────────────
 * Source unique de vérité pour la simulation des tâches employé.
 *
 * Architecture de production (Spring Boot + Kafka) :
 *   GET  /api/taches          → TacheRepository.findByEmployeId(keycloak.sub)
 *   PATCH /api/taches/:id     → TacheService.updateStatut(id, dto)
 *   Kafka topic: taches.updated → notifie en temps réel les changements
 */

import { http, HttpResponse, delay } from 'msw';
import { TacheKanban } from 'src/app/gerai/models/tache.model';

// ── Auto-id ──────────────────────────────────────────────────
let _id = 10;
const nid = () => _id++;

// ── Dates relatives ───────────────────────────────────────────
const dateIn = (days: number) =>
    new Date(Date.now() + days * 86_400_000).toISOString().split('T')[0];

const datePast = (days: number) =>
    new Date(Date.now() - days * 86_400_000).toISOString().split('T')[0];

// ══════════════════════════════════════════════════════════════
// DONNÉES MOCK
// ══════════════════════════════════════════════════════════════

export let TACHES_MOCK: TacheKanban[] = [

    // ── À FAIRE ─────────────────────────────────────────────────
    {
        id: 1,
        titre: 'Rédiger les spécifications API v2',
        projet: 'SYNAPSE - RH',
        priorite: 'Haute',
        prioriteColor: '#EF4444',
        statut: 'A_FAIRE',
        echeance: dateIn(4),
        progression: 0,
        description: 'Documenter tous les endpoints REST de la v2 avec Swagger.'
    },
    {
        id: 2,
        titre: 'Configurer l\'environnement Docker',
        projet: 'Infrastructure',
        priorite: 'Moyenne',
        prioriteColor: '#F59E0B',
        statut: 'A_FAIRE',
        echeance: dateIn(7),
        progression: 0,
        description: 'Préparer les conteneurs Docker pour le déploiement.'
    },
    {
        id: 3,
        titre: 'Tests unitaires module absences',
        projet: 'Module Absences',
        priorite: 'Basse',
        prioriteColor: '#10B981',
        statut: 'A_FAIRE',
        echeance: dateIn(14),
        progression: 0,
        description: 'Écrire les tests unitaires avec JUnit 5 pour le module absences.'
    },

    // ── EN COURS ─────────────────────────────────────────────────
    {
        id: 4,
        titre: 'Intégration API Spring Boot',
        projet: 'SYNAPSE - RH',
        priorite: 'Haute',
        prioriteColor: '#EF4444',
        statut: 'EN_COURS',
        echeance: dateIn(2),
        progression: 65,
        description: 'Connexion des services front Angular avec le backend Spring Boot.'
    },
    {
        id: 5,
        titre: 'Revue de code sprint 12',
        projet: 'SYNAPSE - RH',
        priorite: 'Moyenne',
        prioriteColor: '#F59E0B',
        statut: 'EN_COURS',
        echeance: dateIn(1),
        progression: 40,
        description: 'Analyser et commenter les PR ouvertes pour le sprint 12.'
    },
    {
        id: 6,
        titre: 'Mise à jour documentation technique',
        projet: 'Formation API',
        priorite: 'Basse',
        prioriteColor: '#10B981',
        statut: 'EN_COURS',
        echeance: dateIn(5),
        progression: 25,
        description: 'Mettre à jour le wiki confluence avec les nouveaux flux.'
    },

    // ── TERMINÉES ────────────────────────────────────────────────
    {
        id: 7,
        titre: 'Migration base de données',
        projet: 'SYNAPSE - RH',
        priorite: 'Haute',
        prioriteColor: '#EF4444',
        statut: 'TERMINEE',
        echeance: datePast(5),
        progression: 100,
        description: 'Migration des tables vers PostgreSQL 15 avec scripts Flyway.'
    },
    {
        id: 8,
        titre: 'Formation Keycloak équipe',
        projet: 'Formation API',
        priorite: 'Moyenne',
        prioriteColor: '#F59E0B',
        statut: 'TERMINEE',
        echeance: datePast(10),
        progression: 100,
        description: 'Session de formation sur l\'authentification SSO avec Keycloak.'
    }
];

// ══════════════════════════════════════════════════════════════
// MSW HANDLERS
// ══════════════════════════════════════════════════════════════

export const tachesHandlers = [

    /**
     * GET /api/taches
     * En production → filtre par employeId depuis le JWT Keycloak
     */
    http.get('*/api/taches', async () => {
        await delay(20);
        // Tri : en retard en premier, puis par priorité
        const sorted = [...TACHES_MOCK].sort((a, b) => {
            const dateA = new Date(a.echeance).getTime();
            const dateB = new Date(b.echeance).getTime();
            return dateA - dateB;
        });
        return HttpResponse.json(sorted);
    }),

    /**
     * PATCH /api/taches/:id
     * Mise à jour partielle (statut + progression lors du drag & drop)
     */
    http.patch('*/api/taches/:id', async ({ params, request }) => {
        await delay(20);
        const id = Number(params['id']);
        const body = await request.json() as Partial<TacheKanban>;
        const index = TACHES_MOCK.findIndex(t => t.id === id);

        if (index === -1) {
            return new HttpResponse(
                JSON.stringify({ error: 'Tâche introuvable' }),
                { status: 404 }
            );
        }

        TACHES_MOCK[index] = { ...TACHES_MOCK[index], ...body };
        return HttpResponse.json(TACHES_MOCK[index]);
    })
];