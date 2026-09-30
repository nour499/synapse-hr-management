import { http, HttpResponse } from 'msw';
import { MOCK_INTERVIEWS } from '../data/interview.mock';

let nextId = 100;

export const interviewHandlers = [
  http.get('/api/admin/interviews', ({ request }) => {
    const url       = new URL(request.url);
    const candidatId = url.searchParams.get('candidatId');
    const statut    = url.searchParams.get('statut');
    let data = [...MOCK_INTERVIEWS];
    if (candidatId) data = data.filter(i => i.candidatId === +candidatId);
    if (statut)     data = data.filter(i => i.statut     === statut);
    data.sort((a, b) => a.date.localeCompare(b.date));
    return HttpResponse.json(data);
  }),

  http.get('/api/admin/interviews/:id', ({ params }) => {
    const i = MOCK_INTERVIEWS.find(i => i.id === +params['id']);
    return i ? HttpResponse.json(i) : new HttpResponse(null, { status: 404 });
  }),

  http.post('/api/admin/interviews', async ({ request }) => {
    const body = await request.json() as any;
    const newInterview = { ...body, id: ++nextId, decision: 'EN_ATTENTE', statut: 'PLANIFIE' };
    MOCK_INTERVIEWS.push(newInterview);
    return HttpResponse.json(newInterview, { status: 201 });
  }),

  http.put('/api/admin/interviews/:id', async ({ params, request }) => {
    const body = await request.json() as any;
    const idx  = MOCK_INTERVIEWS.findIndex(i => i.id === +params['id']);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    MOCK_INTERVIEWS[idx] = { ...MOCK_INTERVIEWS[idx], ...body };
    return HttpResponse.json(MOCK_INTERVIEWS[idx]);
  }),

  http.put('/api/admin/interviews/:id/decision', async ({ params, request }) => {
    const body = await request.json() as { decision: string; noteGlobale?: number; commentaire?: string };
    const idx  = MOCK_INTERVIEWS.findIndex(i => i.id === +params['id']);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    (MOCK_INTERVIEWS[idx] as any).decision = body.decision;
    (MOCK_INTERVIEWS[idx] as any).statut   = 'TERMINE';
    if (body.noteGlobale !== undefined) MOCK_INTERVIEWS[idx].noteGlobale = body.noteGlobale;
    if (body.commentaire !== undefined) MOCK_INTERVIEWS[idx].commentaire = body.commentaire;
    return HttpResponse.json(MOCK_INTERVIEWS[idx]);
  }),

  http.delete('/api/admin/interviews/:id', ({ params }) => {
    const idx = MOCK_INTERVIEWS.findIndex(i => i.id === +params['id']);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    MOCK_INTERVIEWS.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  })
];
