import { http, HttpResponse } from 'msw';
import { MOCK_SOLDES } from '../data/solde-conge-admin.mock';
import { SoldeCongeAdmin } from 'src/app/gerai/models/solde-conge-admin.model';

export const soldeCongeAdminHandlers = [

  // GET /api/admin/soldes-conges
  http.get('/api/admin/soldes-conges', () =>
    HttpResponse.json([...MOCK_SOLDES])
  ),

  // GET /api/admin/soldes-conges/:id
  http.get('/api/admin/soldes-conges/:id', ({ params }) => {
    const item = MOCK_SOLDES.find(s => s.id === Number(params['id']));
    if (!item) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(item);
  }),

  // PUT /api/admin/soldes-conges/:id
  http.put('/api/admin/soldes-conges/:id', async ({ params, request }) => {
    const idx  = MOCK_SOLDES.findIndex(s => s.id === Number(params['id']));
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    const body = await request.json() as Partial<SoldeCongeAdmin>;
    MOCK_SOLDES[idx] = { ...MOCK_SOLDES[idx], ...body };
    return HttpResponse.json(MOCK_SOLDES[idx]);
  }),

  // DELETE /api/admin/soldes-conges/:id
  http.delete('/api/admin/soldes-conges/:id', ({ params }) => {
    const idx = MOCK_SOLDES.findIndex(s => s.id === Number(params['id']));
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    MOCK_SOLDES.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  })
];
