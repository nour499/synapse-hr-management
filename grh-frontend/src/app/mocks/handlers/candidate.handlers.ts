import { http, HttpResponse } from 'msw';
import { MOCK_CANDIDATES } from '../data/candidate.mock';

export const candidateHandlers = [
  http.get('/api/admin/candidates', ({ request }) => {
    const url    = new URL(request.url);
    const jobId  = url.searchParams.get('jobId');
    const statut = url.searchParams.get('statut');
    let data = [...MOCK_CANDIDATES];
    if (jobId)  data = data.filter(c => c.jobId === +jobId);
    if (statut) data = data.filter(c => c.statut === statut);
    return HttpResponse.json(data);
  }),

  http.get('/api/admin/candidates/shortlist', () => {
    return HttpResponse.json(MOCK_CANDIDATES.filter(c => c.shortliste));
  }),

  http.get('/api/admin/candidates/:id', ({ params }) => {
    const c = MOCK_CANDIDATES.find(c => c.id === +params['id']);
    return c ? HttpResponse.json(c) : new HttpResponse(null, { status: 404 });
  }),

  http.put('/api/admin/candidates/:id/statut', async ({ params, request }) => {
    const body = await request.json() as { statut: string };
    const idx  = MOCK_CANDIDATES.findIndex(c => c.id === +params['id']);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    (MOCK_CANDIDATES[idx] as any).statut = body.statut;
    if (body.statut === 'SHORTLISTE') MOCK_CANDIDATES[idx].shortliste = true;
    return HttpResponse.json(MOCK_CANDIDATES[idx]);
  }),

  http.put('/api/admin/candidates/:id/note', async ({ params, request }) => {
    const body = await request.json() as { noteRecruteur?: string; score?: number };
    const idx  = MOCK_CANDIDATES.findIndex(c => c.id === +params['id']);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    if (body.noteRecruteur !== undefined) MOCK_CANDIDATES[idx].noteRecruteur = body.noteRecruteur;
    if (body.score         !== undefined) MOCK_CANDIDATES[idx].score         = body.score;
    return HttpResponse.json(MOCK_CANDIDATES[idx]);
  }),

  http.put('/api/admin/candidates/:id/shortlist', async ({ params, request }) => {
    const body = await request.json() as { shortliste: boolean };
    const idx  = MOCK_CANDIDATES.findIndex(c => c.id === +params['id']);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    MOCK_CANDIDATES[idx].shortliste = body.shortliste;
    return HttpResponse.json(MOCK_CANDIDATES[idx]);
  }),

  http.delete('/api/admin/candidates/:id', ({ params }) => {
    const idx = MOCK_CANDIDATES.findIndex(c => c.id === +params['id']);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    MOCK_CANDIDATES.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  })
];
