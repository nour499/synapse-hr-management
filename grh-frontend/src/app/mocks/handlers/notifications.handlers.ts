import { delay, http, HttpResponse } from 'msw';
import {
    MOCK_CHEF_NOTIFICATIONS,
    MOCK_EMPLOYE_NOTIFICATIONS
} from 'src/app/mocks/data/notifications.mock';

type Role = 'CHEF' | 'EMPLOYE';

/* ── Inline mock data for NotificationService (theme/shared/interfaces/notification format) ── */

const now = Date.now();
const ago = (min: number) => new Date(now - min * 60_000).toISOString().split('T')[0];

let serviceNotifications = [
    { id: 1, titre: 'Demande approuvée', message: 'Votre demande de congé a été approuvée.', type: 'SUCCESS' as const, date: ago(5), lu: false },
    { id: 2, titre: 'Nouvelle tâche assignée', message: 'Une tâche "Intégration API" vous a été affectée.', type: 'INFO' as const, date: ago(30), lu: false },
    { id: 3, titre: 'Échéance proche', message: 'La tâche "Tests unitaires" arrive à échéance demain.', type: 'WARNING' as const, date: ago(120), lu: false },
    { id: 4, titre: 'Demande refusée', message: 'Votre demande de formation a été refusée.', type: 'ERROR' as const, date: ago(300), lu: true }
];

// Utilisation de références locales pour permettre la mutation propre par MSW
let chefNotifs = [...MOCK_CHEF_NOTIFICATIONS];
let employeNotifs = [...MOCK_EMPLOYE_NOTIFICATIONS];

function resolveSource(role: string) {
    // Normalisation de la casse pour éviter les erreurs de matching
    const r = role.toUpperCase();
    return r === 'CHEF' ? chefNotifs : employeNotifs;
}

export const notificationsHandlers = [

    /**
     * GET /api/notifications
     */
    http.get('/api/notifications', async ({ request }) => {
        await delay(20);
        const url = new URL(request.url);
        const roleParam = url.searchParams.get('role') || 'EMPLOYE';

        const source = resolveSource(roleParam);

        // On trie par date décroissante (plus récent en premier)
        const sorted = [...source].sort(
            (a, b) => new Date(b.heure).getTime() - new Date(a.heure).getTime()
        );

        return HttpResponse.json(sorted);
    }),

    /**
     * PATCH /api/notifications/:id/read
     */
    http.patch('/api/notifications/:id/read', async ({ params }) => {
        await delay(20);
        const id = Number(params['id']);

        // On cherche dans les deux listes
        const notif = [...chefNotifs, ...employeNotifs].find(n => n.id === id);

        if (!notif) {
            return new HttpResponse(null, { status: 404 });
        }

        notif.lue = true; // Mutation de l'objet en mémoire
        return HttpResponse.json(notif);
    }),

    /**
     * POST /api/notifications/mark-all-read
     */
    http.post('/api/notifications/mark-all-read', async ({ request }) => {
        await delay(20);
        const url = new URL(request.url);
        const roleParam = url.searchParams.get('role') || 'EMPLOYE';

        const source = resolveSource(roleParam);

        // On modifie directement les objets de la source
        source.forEach(n => {
            n.lue = true;
        });

        return new HttpResponse(null, { status: 204 });
    }),

    /**
     * DELETE /api/notifications/:id
     */
    http.delete('/api/notifications/:id', async ({ params }) => {
        await delay(20);
        const id = Number(params['id']);

        const ci = chefNotifs.findIndex(n => n.id === id);
        if (ci !== -1) {
            chefNotifs.splice(ci, 1);
            return new HttpResponse(null, { status: 204 });
        }

        const ei = employeNotifs.findIndex(n => n.id === id);
        if (ei !== -1) {
            employeNotifs.splice(ei, 1);
            return new HttpResponse(null, { status: 204 });
        }

        return new HttpResponse(null, { status: 404 });
    }),

    /**
     * DELETE /api/notifications (Vider tout)
     */
    http.delete('/api/notifications', async ({ request }) => {
        await delay(20);
        const url = new URL(request.url);
        const roleParam = url.searchParams.get('role') || 'EMPLOYE';

        if (roleParam.toUpperCase() === 'CHEF') {
            chefNotifs = [];
        } else {
            employeNotifs = [];
        }

        return new HttpResponse(null, { status: 204 });
    }),

    /* ── NotificationService endpoints (http://localhost:8085/api/notifications) ── */

    /**
     * GET http://localhost:8085/api/notifications/mes-notifications
     * Used by NotificationService.getNotifications()
     */
    http.get('http://localhost:8085/api/notifications/mes-notifications', async () => {
        await delay(100);
        return HttpResponse.json(serviceNotifications);
    }),

    /**
     * PUT http://localhost:8085/api/notifications/:id/marquer-comme-lue
     * Used by NotificationService.marquerCommeLue(id)
     */
    http.put('http://localhost:8085/api/notifications/:id/marquer-comme-lue', async ({ params }) => {
        await delay(60);
        const id = Number(params['id']);
        const notif = serviceNotifications.find(n => n.id === id);
        if (!notif) return new HttpResponse(null, { status: 404 });
        notif.lu = true;
        return new HttpResponse(null, { status: 204 });
    })
];