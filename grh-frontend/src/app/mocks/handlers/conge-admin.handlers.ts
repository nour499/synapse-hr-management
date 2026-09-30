import { http, HttpResponse } from 'msw';
import { MOCK_CONGES_ADMIN } from '../data/conge-admin.mock';
import { DemandeCongeAdmin } from 'src/app/gerai/models/conge-admin.model';

export const congeAdminHandlers = [

  // GET /api/admin/conges  (optional ?statut= & ?departement=)
  http.get('/api/admin/conges', ({ request }) => {
    const url  = new URL(request.url);
    const stat = url.searchParams.get('statut');
    const dept = url.searchParams.get('departement');
    let list   = [...MOCK_CONGES_ADMIN];
    if (stat) list = list.filter(c => c.statut === stat);
    if (dept) list = list.filter(c => c.departement === dept);
    return HttpResponse.json(list);
  }),

  // GET /api/admin/conges/:id
  http.get('/api/admin/conges/:id', ({ params }) => {
    const item = MOCK_CONGES_ADMIN.find(c => c.id === Number(params['id']));
    if (!item) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(item);
  }),

  // PUT /api/admin/conges/:id
  http.put('/api/admin/conges/:id', async ({ params, request }) => {
    const idx  = MOCK_CONGES_ADMIN.findIndex(c => c.id === Number(params['id']));
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    const body = await request.json() as Partial<DemandeCongeAdmin>;
    MOCK_CONGES_ADMIN[idx] = { ...MOCK_CONGES_ADMIN[idx], ...body };
    return HttpResponse.json(MOCK_CONGES_ADMIN[idx]);
  })
];
