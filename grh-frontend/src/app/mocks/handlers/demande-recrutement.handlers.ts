import { http, HttpResponse } from 'msw';
import { MOCK_DEMANDES_REC } from '../data/demande-recrutement.mock';
import { MOCK_JOBS }          from '../data/job.mock';
import { DemandeRecrutement } from 'src/app/gerai/models/demande-recrutement.model';
import { Job }                from 'src/app/gerai/models/job.model';

export const demandeRecrutementHandlers = [

  // GET all (admin)
  http.get('/api/admin/recrutement', () =>
    HttpResponse.json([...MOCK_DEMANDES_REC])
  ),

  // GET by chef
  http.get('/api/chef/recrutement', ({ request }) => {
    const chefId = new URL(request.url).searchParams.get('chefId');
    const list   = chefId
      ? MOCK_DEMANDES_REC.filter(d => d.chefId === chefId)
      : [...MOCK_DEMANDES_REC];
    return HttpResponse.json(list);
  }),

  // POST — chef submits a request
  http.post('/api/chef/recrutement', async ({ request }) => {
    const body    = await request.json() as Omit<DemandeRecrutement, 'id' | 'statut' | 'dateDemande'>;
    const newItem : DemandeRecrutement = {
      ...body,
      id          : Math.max(0, ...MOCK_DEMANDES_REC.map(d => d.id)) + 1,
      statut      : 'EN_ATTENTE',
      dateDemande : new Date().toISOString().split('T')[0]
    };
    MOCK_DEMANDES_REC.unshift(newItem);
    return HttpResponse.json(newItem, { status: 201 });
  }),

  // PUT approve → convert to job offer
  http.put('/api/admin/recrutement/:id/approuver', async ({ params, request }) => {
    const idx = MOCK_DEMANDES_REC.findIndex(d => d.id === Number(params['id']));
    if (idx === -1) return new HttpResponse(null, { status: 404 });

    const body = await request.json() as { commentaire?: string; traiteePar?: string };
    const d    = MOCK_DEMANDES_REC[idx];

    // Create the job offer
    const newJob: Job = {
      id             : Math.max(0, ...MOCK_JOBS.map(j => j.id)) + 1,
      titre          : d.titrePoste,
      statut         : 'OUVERT',
      datePublication: new Date().toISOString().split('T')[0],
      role           : d.role,
      postes         : d.nombrePostes,
      departement    : d.departement,
      typeContrat    : d.typeContrat,
      description    : d.justification
    };
    MOCK_JOBS.push(newJob);

    MOCK_DEMANDES_REC[idx] = {
      ...d,
      statut        : 'CONVERTIE',
      dateTraitement: new Date().toISOString().split('T')[0],
      traiteePar    : body.traiteePar ?? 'Leila RH',
      commentaireRh : body.commentaire ?? 'Offre publiée.',
      jobId         : newJob.id
    };
    return HttpResponse.json({ demande: MOCK_DEMANDES_REC[idx], job: newJob });
  }),

  // PUT reject
  http.put('/api/admin/recrutement/:id/rejeter', async ({ params, request }) => {
    const idx = MOCK_DEMANDES_REC.findIndex(d => d.id === Number(params['id']));
    if (idx === -1) return new HttpResponse(null, { status: 404 });

    const body = await request.json() as { motif: string; traiteePar?: string };
    MOCK_DEMANDES_REC[idx] = {
      ...MOCK_DEMANDES_REC[idx],
      statut        : 'REJETEE',
      dateTraitement: new Date().toISOString().split('T')[0],
      traiteePar    : body.traiteePar ?? 'Leila RH',
      commentaireRh : body.motif
    };
    return HttpResponse.json(MOCK_DEMANDES_REC[idx]);
  }),

  // DELETE (chef cancels own pending request)
  http.delete('/api/chef/recrutement/:id', ({ params }) => {
    const idx = MOCK_DEMANDES_REC.findIndex(d => d.id === Number(params['id']));
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    MOCK_DEMANDES_REC.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  })
];
