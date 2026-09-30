import { http, HttpResponse } from 'msw';
import { MOCK_DEPARTS } from '../data/depart.mock';
import { DepartEmploye } from 'src/app/gerai/models/depart.model';

let nextId = MOCK_DEPARTS.length + 1;

export const departHandlers = [

  // GET /api/departs — list (optional ?statut= filter)
  http.get('http://localhost:8085/api/departs', ({ request }) => {
    const url    = new URL(request.url);
    const statut = url.searchParams.get('statut');
    const list   = statut
      ? MOCK_DEPARTS.filter(d => d.statut === statut)
      : MOCK_DEPARTS;
    return HttpResponse.json([...list]);
  }),

  // GET /api/departs/:id
  http.get('http://localhost:8085/api/departs/:id', ({ params }) => {
    const depart = MOCK_DEPARTS.find(d => d.id === Number(params['id']));
    if (!depart) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(depart);
  }),

  // POST /api/departs
  http.post('http://localhost:8085/api/departs', async ({ request }) => {
    const body = await request.json() as Partial<DepartEmploye>;
    const created: DepartEmploye = {
      id        : nextId++,
      employeId : body.employeId   ?? 0,
      employeNom: body.employeNom  ?? '',
      employePoste: body.employePoste,
      employePhoto: body.employePhoto,
      employeDept : body.employeDept,
      dateDepart  : body.dateDepart  ?? '',
      typeDepart  : body.typeDepart  ?? 'DEMISSION',
      raison      : body.raison      ?? '',
      statut      : body.statut      ?? 'EN_COURS',
      notes       : body.notes       ?? '',
      createdAt   : new Date().toISOString().split('T')[0]
    };
    MOCK_DEPARTS.push(created);
    return HttpResponse.json(created, { status: 201 });
  }),

  // PUT /api/departs/:id
  http.put('http://localhost:8085/api/departs/:id', async ({ params, request }) => {
    const idx = MOCK_DEPARTS.findIndex(d => d.id === Number(params['id']));
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    const body = await request.json() as Partial<DepartEmploye>;
    MOCK_DEPARTS[idx] = { ...MOCK_DEPARTS[idx], ...body };
    return HttpResponse.json(MOCK_DEPARTS[idx]);
  }),

  // DELETE /api/departs/:id
  http.delete('http://localhost:8085/api/departs/:id', ({ params }) => {
    const idx = MOCK_DEPARTS.findIndex(d => d.id === Number(params['id']));
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    MOCK_DEPARTS.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  })
];
