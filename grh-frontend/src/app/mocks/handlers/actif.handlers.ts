import { http, HttpResponse, delay } from 'msw';
import { MOCK_ACTIFS, getNextActifId, MOCK_DEMANDES_ACTIF, getNextDemandeActifId } from 'src/app/mocks/data/actif.mock';
import { DemandeActif } from 'src/app/gerai/models/actif.model';

const BASE = 'http://localhost:8085/api/actifs';

export const actifHandlers = [

  // ── GET /actifs?employeId=&categorie= ────────────────
  http.get(BASE, async ({ request }) => {
    await delay(100);
    const params     = new URL(request.url).searchParams;
    const employeId  = params.get('employeId');
    const categorie  = params.get('categorie');
    let results      = [...MOCK_ACTIFS];
    if (employeId)  results = results.filter(a => a.employeId === Number(employeId));
    if (categorie)  results = results.filter(a => a.categorie === categorie);
    return HttpResponse.json(results);
  }),

  // ── GET /actifs/:id ──────────────────────────────────
  http.get(`${BASE}/:id`, async ({ params }) => {
    await delay(80);
    const actif = MOCK_ACTIFS.find(a => a.id === Number(params['id']));
    if (!actif) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(actif);
  }),

  // ── POST /actifs ─────────────────────────────────────
  http.post(BASE, async ({ request }) => {
    await delay(150);
    const body    = (await request.json()) as any;
    const newActif = { ...body, id: getNextActifId() };
    MOCK_ACTIFS.push(newActif);
    return HttpResponse.json(newActif, { status: 201 });
  }),

  // ── PUT /actifs/:id ──────────────────────────────────
  http.put(`${BASE}/:id`, async ({ params, request }) => {
    await delay(150);
    const id  = Number(params['id']);
    const idx = MOCK_ACTIFS.findIndex(a => a.id === id);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    const update = (await request.json()) as any;
    MOCK_ACTIFS[idx] = { ...MOCK_ACTIFS[idx], ...update };
    return HttpResponse.json(MOCK_ACTIFS[idx]);
  }),

  // ── DELETE /actifs/:id ───────────────────────────────
  http.delete(`${BASE}/:id`, async ({ params }) => {
    await delay(100);
    const id  = Number(params['id']);
    const idx = MOCK_ACTIFS.findIndex(a => a.id === id);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    MOCK_ACTIFS.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  // ── GET /actifs/demandes?employeId= ──────────────────
  http.get(`${BASE}/demandes`, async ({ request }) => {
    await delay(80);
    const params     = new URL(request.url).searchParams;
    const employeId  = params.get('employeId');
    let results      = [...MOCK_DEMANDES_ACTIF];
    if (employeId) results = results.filter(d => d.employeId === Number(employeId));
    return HttpResponse.json(results);
  }),

  // ── POST /actifs/demandes ─────────────────────────────
  http.post(`${BASE}/demandes`, async ({ request }) => {
    await delay(150);
    const body = (await request.json()) as Partial<DemandeActif>;
    const newD: DemandeActif = {
      ...(body as DemandeActif),
      id          : getNextDemandeActifId(),
      statut      : 'EN_ATTENTE',
      dateCreation: new Date().toISOString().split('T')[0],
    };
    MOCK_DEMANDES_ACTIF.push(newD);
    return HttpResponse.json(newD, { status: 201 });
  }),

  // ── PUT /actifs/demandes/:id — admin updates status ───
  http.put(`${BASE}/demandes/:id`, async ({ params, request }) => {
    await delay(120);
    const idx = MOCK_DEMANDES_ACTIF.findIndex(d => d.id === Number(params['id']));
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    const body = (await request.json()) as Partial<DemandeActif>;
    MOCK_DEMANDES_ACTIF[idx] = {
      ...MOCK_DEMANDES_ACTIF[idx],
      ...body,
      dateTraitement: body.statut && body.statut !== 'EN_ATTENTE'
        ? new Date().toISOString().split('T')[0]
        : MOCK_DEMANDES_ACTIF[idx].dateTraitement,
    };
    return HttpResponse.json(MOCK_DEMANDES_ACTIF[idx]);
  }),
];
