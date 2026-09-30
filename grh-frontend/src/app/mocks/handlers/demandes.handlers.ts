// src/mocks/handlers/demandes.handlers.ts
import { http, HttpResponse } from 'msw';
import {
  getToutesDemandes,
  getDemandesByEmploye,
  getDemandeById,
  getDemandesEnAttente,
  getHistorique,
  getStatistiques,
  creerDemande,
  annulerDemande,
  validerDemandeChef,
  validerDemandeRH
} from '../data/demandes.mock';
import { CreateDemandeDTO } from 'src/app/gerai/models/demande.model';

const BASE_URL = '/api/demandes';

export const demandesHandlers = [

  /* ══════════════════════════════════════════════════════════════
     📋 ENDPOINTS GÉNÉRIQUES
     ══════════════════════════════════════════════════════════════ */

  http.get(BASE_URL, () => {
    const demandes = getToutesDemandes();
    console.log('[MSW] 📋 GET /api/demandes -', demandes.length, 'demandes');
    return HttpResponse.json(demandes);
  }),

  http.get(`${BASE_URL}/recentes`, ({ request }) => {
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get('limit')) || 5;
    const demandes = getToutesDemandes().slice(0, limit);
    console.log('[MSW] 🕒 GET /api/demandes/recentes?limit=' + limit);
    return HttpResponse.json(demandes);
  }),

  // PUT /api/demandes/:id/valider
http.put(`${BASE_URL}/:id/valider`, ({ params }) => {
  const id = Number(params['id']);
  const demande = validerDemandeRH(id, true); // ✅ approuve = true
  if (!demande) {
    return new HttpResponse(JSON.stringify({ error: 'Demande introuvable' }), { status: 404 });
  }
  console.log('[MSW] ✅ PUT /api/demandes/' + id + '/valider (RH)');
  return HttpResponse.json(demande);
}),

// PUT /api/demandes/:id/refuser
http.put(`${BASE_URL}/:id/refuser`, async ({ params, request }) => {
  const id = Number(params['id']);
  const body = await request.json() as Partial<CreateDemandeDTO> & { motif?: string };
  const motif = body.motif ?? '';

  const demande = validerDemandeRH(id, false, motif); // ✅ approuve = false
  if (!demande) {
    return new HttpResponse(JSON.stringify({ error: 'Demande introuvable' }), { status: 404 });
  }
  console.log('[MSW] ❌ PUT /api/demandes/' + id + '/refuser - motif:', motif);
  return HttpResponse.json(demande);
}),
  /* ══════════════════════════════════════════════════════════════
     📋 ENDPOINTS EMPLOYÉ
     ══════════════════════════════════════════════════════════════ */

  http.get(`${BASE_URL}/employe/:employeId`, ({ params }) => {
    const employeId = params['employeId'] as string;
    const demandes = getDemandesByEmploye(employeId);
    console.log('[MSW] 📋 GET /api/demandes/employe/' + employeId + ' -', demandes.length, 'demandes');
    return HttpResponse.json(demandes);
  }),

  http.get(`${BASE_URL}/employe/:employeId/complet`, ({ params }) => {
    const employeId = params['employeId'] as string;
    const data = {
      demandes: getDemandesByEmploye(employeId),
      statistiques: getStatistiques(employeId)
    };
    console.log('[MSW] 🎯 GET /api/demandes/employe/' + employeId + '/complet');
    return HttpResponse.json(data);
  }),

  http.get(`${BASE_URL}/employe/:employeId/statistiques`, ({ params }) => {
    const employeId = params['employeId'] as string;
    const stats = getStatistiques(employeId);
    console.log('[MSW] 📊 GET /api/demandes/employe/' + employeId + '/statistiques');
    return HttpResponse.json(stats);
  }),

  http.post(BASE_URL, async ({ request }) => {
    const body = await request.json() as CreateDemandeDTO & { employeId: string };
    if (!body.type || !body.description) {
      return new HttpResponse(JSON.stringify({ error: 'Données incomplètes' }), { status: 400 });
    }
    const nouvelleDemande = creerDemande(body);
    console.log('[MSW] ✅ POST /api/demandes -', body.type, body.description);
    return HttpResponse.json(nouvelleDemande, { status: 201 });
  }),

  http.delete(`${BASE_URL}/:id`, ({ params }) => {
    const id = Number(params['id']);
    const success = annulerDemande(id);
    if (!success) {
      return new HttpResponse(JSON.stringify({ error: 'Impossible d\'annuler cette demande' }), { status: 400 });
    }
    console.log('[MSW] 🗑️ DELETE /api/demandes/' + id);
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(`${BASE_URL}/:id`, ({ params }) => {
    const id = Number(params['id']);
    const demande = getDemandeById(id);
    if (!demande) {
      return new HttpResponse(JSON.stringify({ error: 'Demande introuvable' }), { status: 404 });
    }
    console.log('[MSW] 👁️ GET /api/demandes/' + id);
    return HttpResponse.json(demande);
  }),

  /* ══════════════════════════════════════════════════════════════
     👔 ENDPOINTS CHEF
     ══════════════════════════════════════════════════════════════ */

  http.get(`${BASE_URL}/chef/:chefId/a-valider`, ({ params, request }) => {
    const chefId = params['chefId'] as string;
    const url = new URL(request.url);
    const employeId = url.searchParams.get('employeId') || undefined;
    const demandes = getDemandesEnAttente(employeId);
    console.log(`[MSW] 📋 GET /api/demandes/chef/${chefId}/a-valider -`, demandes.length, 'demandes');
    return HttpResponse.json(demandes);
  }),

  http.get(`${BASE_URL}/chef/:chefId/historique`, ({ params, request }) => {
    const chefId = params['chefId'] as string;
    const url = new URL(request.url);
    const employeId = url.searchParams.get('employeId') || undefined;
    const demandes = getHistorique(employeId);
    console.log(`[MSW] 📚 GET /api/demandes/chef/${chefId}/historique -`, demandes.length, 'demandes');
    return HttpResponse.json(demandes);
  }),

  http.put(`${BASE_URL}/chef/:chefId/:id/valider`, async ({ params, request }) => {
    const chefId = params['chefId'] as string;
    const id = Number(params['id']);
    const url = new URL(request.url);
    const approuve = url.searchParams.get('approuve') === 'true';
    const commentaire = url.searchParams.get('commentaire') || '';
    const demandeValidee = validerDemandeChef(id, approuve, commentaire);
    if (!demandeValidee) {
      return new HttpResponse(JSON.stringify({ error: 'Demande introuvable' }), { status: 404 });
    }
    console.log(`[MSW] ✅ PUT /api/demandes/chef/${chefId}/${id}/valider -`, approuve ? 'APPROUVEE' : 'REJETEE');
    return HttpResponse.json(demandeValidee);
  })
];