import { http, HttpResponse, delay } from 'msw';
import { MOCK_TACHES, updateTachesList } from 'src/app/mocks/data/tache.mock';

export const TachesHandlers = [
    // GET Tâches filtrées
    http.get('/api/affectation/taches', async ({ request }) => {
        const url = new URL(request.url);
        const projetNom = url.searchParams.get('projet');
        const filtered = projetNom
            ? MOCK_TACHES.filter(t => t.projet === projetNom)
            : MOCK_TACHES;
        return HttpResponse.json(filtered);
    }),

    // POST Nouvelle tâche
    http.post('/api/affectation/taches', async ({ request }) => {
        const newTache = (await request.json()) as any;
        newTache.id = MOCK_TACHES.length > 0 ? Math.max(...MOCK_TACHES.map(t => t.id)) + 1 : 1;
        MOCK_TACHES.push(newTache);
        return HttpResponse.json(newTache, { status: 201 });
    }),

    // PUT Mettre à jour une tâche
    http.put('/api/affectation/taches/:id', async ({ params, request }) => {
        const id = Number(params['id']);
        const idx = MOCK_TACHES.findIndex(t => t.id === id);
        if (idx === -1) return new HttpResponse(null, { status: 404 });
        const update = (await request.json()) as any;
        MOCK_TACHES[idx] = { ...MOCK_TACHES[idx], ...update };
        return HttpResponse.json(MOCK_TACHES[idx]);
    }),

    // DELETE Tâche
    http.delete('/api/affectation/taches/:id', ({ params }) => {
        const { id } = params;
        const newList = MOCK_TACHES.filter(t => t.id !== Number(id));
        updateTachesList(newList);
        return new HttpResponse(null, { status: 204 });
    })
];