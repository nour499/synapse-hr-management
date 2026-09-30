import { http, HttpResponse, delay } from 'msw';
import { PROJETS_MOCK, TACHES_PROJET_MOCK } from '../data/projets-employe.mock';

export const projetsEmployeHandlers = [
    http.get('/api/projets', async () => {
        await delay(20);
        return HttpResponse.json(PROJETS_MOCK);
    }),

    http.get('/api/projets/mes-taches', async () => {
        await delay(20);
        return HttpResponse.json(TACHES_PROJET_MOCK);
    }),

    http.patch('/api/projets/taches/:id/toggle', async ({ params }) => {
        const id = Number(params['id']);
        const tache = TACHES_PROJET_MOCK.find(t => t.id === id);
        if (tache) {
            tache.terminee = !tache.terminee;
            return HttpResponse.json(tache);
        }
        return new HttpResponse(null, { status: 404 });
    })
];