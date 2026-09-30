import { http, HttpResponse, delay } from 'msw';
import { TACHES_MOCK } from '../data/taches-employe.mock';

export const tachesHandlers = [
    // GET : Récupérer toutes les tâches
    http.get('*/api/taches', async () => {
        await delay(20);
        return HttpResponse.json(TACHES_MOCK);
    }),

    // PATCH : Mettre à jour le statut (Drag & Drop)
    http.patch('*/api/taches/:id', async ({ params, request }) => {
        const id = Number(params['id']);
        const body = await request.json() as any;

        const index = TACHES_MOCK.findIndex(t => t.id === id);
        if (index !== -1) {
            TACHES_MOCK[index] = { ...TACHES_MOCK[index], ...body };
            return HttpResponse.json(TACHES_MOCK[index]);
        }
        return new HttpResponse(null, { status: 404 });
    })
];