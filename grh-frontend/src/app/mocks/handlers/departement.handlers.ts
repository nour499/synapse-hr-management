import { http, HttpResponse } from 'msw';
import { MOCK_DEPARTEMENTS } from '../data/departement.mock';
import { Departement } from 'src/app/gerai/models/departement.model';

export const departementHandlers = [

  http.get('/api/admin/departements', () =>
    HttpResponse.json([...MOCK_DEPARTEMENTS])
  ),

  http.get('/api/admin/departements/:id', ({ params }) => {
    const item = MOCK_DEPARTEMENTS.find(d => d.id === Number(params['id']));
    if (!item) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(item);
  }),

  http.post('/api/admin/departements', async ({ request }) => {
    const body = await request.json() as Omit<Departement, 'id'>;
    const newItem: Departement = {
      ...body,
      id: Math.max(0, ...MOCK_DEPARTEMENTS.map(d => d.id)) + 1
    };
    MOCK_DEPARTEMENTS.push(newItem);
    return HttpResponse.json(newItem, { status: 201 });
  }),

  http.put('/api/admin/departements/:id', async ({ params, request }) => {
    const idx  = MOCK_DEPARTEMENTS.findIndex(d => d.id === Number(params['id']));
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    const body = await request.json() as Partial<Departement>;
    MOCK_DEPARTEMENTS[idx] = { ...MOCK_DEPARTEMENTS[idx], ...body };
    return HttpResponse.json(MOCK_DEPARTEMENTS[idx]);
  }),

  http.delete('/api/admin/departements/:id', ({ params }) => {
    const idx = MOCK_DEPARTEMENTS.findIndex(d => d.id === Number(params['id']));
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    MOCK_DEPARTEMENTS.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  })
];
