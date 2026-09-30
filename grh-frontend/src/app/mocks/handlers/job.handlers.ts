import { http, HttpResponse } from 'msw';
import { MOCK_JOBS } from '../data/job.mock';
import { Job } from 'src/app/gerai/models/job.model';

export const jobHandlers = [

  http.get('/api/admin/jobs', () =>
    HttpResponse.json([...MOCK_JOBS])
  ),

  http.get('/api/admin/jobs/:id', ({ params }) => {
    const item = MOCK_JOBS.find(j => j.id === Number(params['id']));
    if (!item) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(item);
  }),

  http.post('/api/admin/jobs', async ({ request }) => {
    const body    = await request.json() as Omit<Job, 'id'>;
    const newItem : Job = { ...body, id: Math.max(0, ...MOCK_JOBS.map(j => j.id)) + 1 };
    MOCK_JOBS.push(newItem);
    return HttpResponse.json(newItem, { status: 201 });
  }),

  http.put('/api/admin/jobs/:id', async ({ params, request }) => {
    const idx = MOCK_JOBS.findIndex(j => j.id === Number(params['id']));
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    const body = await request.json() as Partial<Job>;
    MOCK_JOBS[idx] = { ...MOCK_JOBS[idx], ...body };
    return HttpResponse.json(MOCK_JOBS[idx]);
  }),

  http.delete('/api/admin/jobs/:id', ({ params }) => {
    const idx = MOCK_JOBS.findIndex(j => j.id === Number(params['id']));
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    MOCK_JOBS.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  })
];
