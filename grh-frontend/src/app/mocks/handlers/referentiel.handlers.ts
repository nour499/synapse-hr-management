import { http, HttpResponse } from 'msw';
import { MOCK_TYPES_CONGE, MOCK_JOURS_FERIES, MOCK_GRILLE_SALARIALE, MOCK_COMPETENCES } from '../data/referentiel.mock';

let nextId = 200;

// ─── Types de congé ───────────────────────────────────────
const typesCongeHandlers = [
  http.get('/api/admin/referentiel/types-conge', () => HttpResponse.json(MOCK_TYPES_CONGE)),

  http.post('/api/admin/referentiel/types-conge', async ({ request }) => {
    const body = await request.json() as any;
    const item = { ...body, id: ++nextId };
    MOCK_TYPES_CONGE.push(item);
    return HttpResponse.json(item, { status: 201 });
  }),

  http.put('/api/admin/referentiel/types-conge/:id', async ({ params, request }) => {
    const body = await request.json() as any;
    const idx  = MOCK_TYPES_CONGE.findIndex(x => x.id === +params['id']);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    MOCK_TYPES_CONGE[idx] = { ...MOCK_TYPES_CONGE[idx], ...body };
    return HttpResponse.json(MOCK_TYPES_CONGE[idx]);
  }),

  http.delete('/api/admin/referentiel/types-conge/:id', ({ params }) => {
    const idx = MOCK_TYPES_CONGE.findIndex(x => x.id === +params['id']);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    MOCK_TYPES_CONGE.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  })
];

// ─── Jours fériés ─────────────────────────────────────────
const joursFeriesHandlers = [
  http.get('/api/admin/referentiel/jours-feries', () => HttpResponse.json(MOCK_JOURS_FERIES)),

  http.post('/api/admin/referentiel/jours-feries', async ({ request }) => {
    const body = await request.json() as any;
    const item = { ...body, id: ++nextId };
    MOCK_JOURS_FERIES.push(item);
    return HttpResponse.json(item, { status: 201 });
  }),

  http.put('/api/admin/referentiel/jours-feries/:id', async ({ params, request }) => {
    const body = await request.json() as any;
    const idx  = MOCK_JOURS_FERIES.findIndex(x => x.id === +params['id']);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    MOCK_JOURS_FERIES[idx] = { ...MOCK_JOURS_FERIES[idx], ...body };
    return HttpResponse.json(MOCK_JOURS_FERIES[idx]);
  }),

  http.delete('/api/admin/referentiel/jours-feries/:id', ({ params }) => {
    const idx = MOCK_JOURS_FERIES.findIndex(x => x.id === +params['id']);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    MOCK_JOURS_FERIES.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  })
];

// ─── Grille salariale ─────────────────────────────────────
const grilleSalarialeHandlers = [
  http.get('/api/admin/referentiel/grille-salariale', () => HttpResponse.json(MOCK_GRILLE_SALARIALE)),

  http.put('/api/admin/referentiel/grille-salariale/:id', async ({ params, request }) => {
    const body = await request.json() as any;
    const idx  = MOCK_GRILLE_SALARIALE.findIndex(x => x.id === +params['id']);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    MOCK_GRILLE_SALARIALE[idx] = { ...MOCK_GRILLE_SALARIALE[idx], ...body };
    return HttpResponse.json(MOCK_GRILLE_SALARIALE[idx]);
  })
];

// ─── Compétences ──────────────────────────────────────────
const competencesHandlers = [
  http.get('/api/admin/referentiel/competences', () => HttpResponse.json(MOCK_COMPETENCES)),

  http.post('/api/admin/referentiel/competences', async ({ request }) => {
    const body = await request.json() as any;
    const item = { ...body, id: ++nextId, actif: true };
    MOCK_COMPETENCES.push(item);
    return HttpResponse.json(item, { status: 201 });
  }),

  http.put('/api/admin/referentiel/competences/:id', async ({ params, request }) => {
    const body = await request.json() as any;
    const idx  = MOCK_COMPETENCES.findIndex(x => x.id === +params['id']);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    MOCK_COMPETENCES[idx] = { ...MOCK_COMPETENCES[idx], ...body };
    return HttpResponse.json(MOCK_COMPETENCES[idx]);
  }),

  http.delete('/api/admin/referentiel/competences/:id', ({ params }) => {
    const idx = MOCK_COMPETENCES.findIndex(x => x.id === +params['id']);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    MOCK_COMPETENCES.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  })
];

export const referentielHandlers = [
  ...typesCongeHandlers,
  ...joursFeriesHandlers,
  ...grilleSalarialeHandlers,
  ...competencesHandlers
];
