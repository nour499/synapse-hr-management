import { http, HttpResponse, delay } from 'msw';
import { MOCK_PROJETS, MOCK_EMPLOYES, updateProjetsMock } from 'src/app/mocks/data/projets-chef.mock';
import { Projet } from 'src/app/gerai/models/projet.model';

export const ProjetsHandlers = [

    // 1. Récupérer tous les projets
    http.get('/api/affectation/projets', async () => {
        return HttpResponse.json(MOCK_PROJETS);
    }),

    // 2. Créer un nouveau projet
    http.post('/api/affectation/projets', async ({ request }) => {
        const newProjet = (await request.json()) as Projet;

        // Génération automatique d'un ID
        newProjet.id = MOCK_PROJETS.length > 0
            ? Math.max(...MOCK_PROJETS.map(p => p.id)) + 1
            : 1;

        MOCK_PROJETS.push(newProjet);
        return HttpResponse.json(newProjet, { status: 201 });
    }),

    // 3. Modifier un projet existant
    http.put('/api/affectation/projets/:id', async ({ params, request }) => {
        const { id } = params;
        const updatedData = (await request.json()) as Partial<Projet>;

        const index = MOCK_PROJETS.findIndex(p => p.id === Number(id));

        if (index !== -1) {
            // On fusionne les anciennes données avec les nouvelles
            MOCK_PROJETS[index] = { ...MOCK_PROJETS[index], ...updatedData };
            return HttpResponse.json(MOCK_PROJETS[index]);
        }

        return new HttpResponse(null, { status: 404 });
    }),

    // 4. Supprimer un projet
    http.delete('/api/affectation/projets/:id', ({ params }) => {
        const { id } = params;
        const newList = MOCK_PROJETS.filter(p => p.id !== Number(id));

        // Mise à jour de la "DB" via le setter
        updateProjetsMock(newList);

        return new HttpResponse(null, { status: 204 });
    }),

    // 5. Récupérer les employés (pour les sélections dans les formulaires)
    http.get('/api/affectation/employes', () => {
        return HttpResponse.json(MOCK_EMPLOYES);
    }),
    /*http.all('*', ({ request }) => {
        console.warn('Unhandled request:', request.url);
        return new HttpResponse(null, { status: 404 });
    })*/

];