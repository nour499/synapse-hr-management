import { http, HttpResponse, delay } from 'msw';
import { MembreEquipe, CreateMembreDTO, UpdateMembreDTO } from 'src/app/gerai/models/equipe.model';
import { MOCK_MEMBRES, getNextMembreId } from '../data/equipe.mock';

export const equipeHandlers = [
    http.get('/api/equipe/membres', async () => {
        await delay(20);
        return HttpResponse.json(MOCK_MEMBRES);
    }),

    http.get('/api/equipe/membres/:id', async ({ params }) => {
        await delay(20);
        const id = Number(params['id']);
        const membre = MOCK_MEMBRES.find(m => m.id === id);
        if (!membre) {
            return new HttpResponse(JSON.stringify({ error: 'Membre introuvable' }), { status: 404 });
        }
        return HttpResponse.json(membre);
    }),

    http.post('/api/equipe/membres', async ({ request }) => {
        await delay(20);
        const body = await request.json() as CreateMembreDTO;

        if (!body.nom || !body.prenom || !body.email || !body.poste) {
            return new HttpResponse(JSON.stringify({ error: 'Champs requis manquants' }), { status: 400 });
        }

        const doublon = MOCK_MEMBRES.find(m => m.email === body.email);
        if (doublon) {
            return new HttpResponse(JSON.stringify({ error: 'Un membre avec cet email existe déjà' }), { status: 409 });
        }

        const nouveauMembre: MembreEquipe = {
            id: getNextMembreId(),
            nom: body.nom,
            prenom: body.prenom,
            poste: body.poste,
            email: body.email,
            photo: body.photo,
            statut: body.statut ?? 'ACTIF',
            telephone: body.telephone ?? '',
            dateEmbauche: new Date().toISOString().split('T')[0],
            departement: body.departement ?? '',
            manager: body.manager ?? 'Stéphane Manager',
            competences: body.competences ?? []
        };

        MOCK_MEMBRES.push(nouveauMembre);
        return HttpResponse.json(nouveauMembre, { status: 201 });
    }),

    http.patch('/api/equipe/membres/:id', async ({ params, request }) => {
        await delay(20);
        const id = Number(params['id']);
        const idx = MOCK_MEMBRES.findIndex(m => m.id === id);
        if (idx === -1) {
            return new HttpResponse(JSON.stringify({ error: 'Membre introuvable' }), { status: 404 });
        }
        const body = await request.json() as UpdateMembreDTO;
        MOCK_MEMBRES[idx] = { ...MOCK_MEMBRES[idx], ...body };
        return HttpResponse.json(MOCK_MEMBRES[idx]);
    }),

    http.delete('/api/equipe/membres/:id', async ({ params }) => {
        await delay(20);
        const id = Number(params['id']);
        const idx = MOCK_MEMBRES.findIndex(m => m.id === id);
        if (idx === -1) {
            return new HttpResponse(JSON.stringify({ error: 'Membre introuvable' }), { status: 404 });
        }
        MOCK_MEMBRES.splice(idx, 1);
        return HttpResponse.json({ success: true });
    })
];
