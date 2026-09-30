import { http, HttpResponse } from 'msw';
import {
  CAMPAGNES_MOCK, EVALUATIONS_MOCK,
  nextCampagneIdFn, nextEvalIdFn
} from '../data/evaluation.mock';
import {
  CampagneEvaluation, Evaluation, EvaluationChef,
  AutoEvaluation, calculerScore
} from 'src/app/gerai/models/evaluation.model';

const BASE = '/api/evaluations';
const CAMP = '/api/evaluations/campagnes';

export const evaluationHandlers = [

  // ══ CAMPAGNES ════════════════════════════════════════════

  http.get(CAMP, () => HttpResponse.json(CAMPAGNES_MOCK)),

  http.get(`${CAMP}/:id`, ({ params }) => {
    const c = CAMPAGNES_MOCK.find(c => c.id === Number(params['id']));
    return c ? HttpResponse.json(c) : new HttpResponse(null, { status: 404 });
  }),

  http.post(CAMP, async ({ request }) => {
    const body = await request.json() as Partial<CampagneEvaluation>;
    const newC: CampagneEvaluation = {
      id      : nextCampagneIdFn(),
      titre   : body.titre!,
      periode : body.periode!,
      annee   : body.annee!,
      dateDebut   : body.dateDebut!,
      dateFin     : body.dateFin!,
      statut      : 'BROUILLON',
      departements: body.departements,
      creePar     : body.creePar ?? 'Admin RH',
      description : body.description,
    };
    CAMPAGNES_MOCK.push(newC);
    return HttpResponse.json(newC, { status: 201 });
  }),

  http.put(`${CAMP}/:id/activer`, ({ params }) => {
    const idx = CAMPAGNES_MOCK.findIndex(c => c.id === Number(params['id']));
    if (idx < 0) return new HttpResponse(null, { status: 404 });
    CAMPAGNES_MOCK[idx] = { ...CAMPAGNES_MOCK[idx], statut: 'ACTIVE' };
    return HttpResponse.json(CAMPAGNES_MOCK[idx]);
  }),

  http.put(`${CAMP}/:id/cloturer`, ({ params }) => {
    const idx = CAMPAGNES_MOCK.findIndex(c => c.id === Number(params['id']));
    if (idx < 0) return new HttpResponse(null, { status: 404 });
    CAMPAGNES_MOCK[idx] = { ...CAMPAGNES_MOCK[idx], statut: 'CLOTUREE' };
    return HttpResponse.json(CAMPAGNES_MOCK[idx]);
  }),

  http.delete(`${CAMP}/:id`, ({ params }) => {
    const idx = CAMPAGNES_MOCK.findIndex(c => c.id === Number(params['id']));
    if (idx < 0) return new HttpResponse(null, { status: 404 });
    CAMPAGNES_MOCK.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  // ══ ÉVALUATIONS ══════════════════════════════════════════

  // GET all — filterable by campagneId, employeId, chefId, statut
  http.get(BASE, ({ request }) => {
    const url        = new URL(request.url);
    const campagneId = url.searchParams.get('campagneId');
    const employeId  = url.searchParams.get('employeId');
    const chefId     = url.searchParams.get('chefId');
    const statut     = url.searchParams.get('statut');

    let list = [...EVALUATIONS_MOCK];
    if (campagneId) list = list.filter(e => e.campagneId === Number(campagneId));
    if (employeId)  list = list.filter(e => e.employeId  === Number(employeId));
    if (chefId)     list = list.filter(e => e.chefId     === Number(chefId));
    if (statut)     list = list.filter(e => e.statut     === statut);
    return HttpResponse.json(list);
  }),

  http.get(`${BASE}/:id`, ({ params }) => {
    const e = EVALUATIONS_MOCK.find(e => e.id === Number(params['id']));
    return e ? HttpResponse.json(e) : new HttpResponse(null, { status: 404 });
  }),

  // Créer des évaluations en masse pour une campagne
  http.post(`${CAMP}/:campagneId/generer`, async ({ params, request }) => {
    const body = await request.json() as { employes: Partial<Evaluation>[] };
    const campagne = CAMPAGNES_MOCK.find(c => c.id === Number(params['campagneId']));
    if (!campagne) return new HttpResponse(null, { status: 404 });

    const created: Evaluation[] = body.employes.map(e => ({
      id: nextEvalIdFn(),
      campagneId   : campagne.id,
      campagneTitre: campagne.titre,
      periode      : campagne.periode,
      annee        : campagne.annee,
      employeId    : e.employeId!,
      employeNom   : e.employeNom!,
      employePrenom: e.employePrenom!,
      employePoste : e.employePoste ?? '',
      departement  : e.departement ?? '',
      chefId       : e.chefId!,
      chefNom      : e.chefNom ?? '',
      statut       : 'EN_ATTENTE' as const,
      tauxPresence      : e.tauxPresence,
      formationsRealisees: e.formationsRealisees,
      tachesCompletees  : e.tachesCompletees,
      totalTaches       : e.totalTaches,
    }));
    EVALUATIONS_MOCK.push(...created);
    return HttpResponse.json(created, { status: 201 });
  }),

  // Employé soumet son auto-évaluation
  http.put(`${BASE}/:id/auto-evaluation`, async ({ params, request }) => {
    const idx = EVALUATIONS_MOCK.findIndex(e => e.id === Number(params['id']));
    if (idx < 0) return new HttpResponse(null, { status: 404 });
    const body = await request.json() as AutoEvaluation;
    const now  = new Date().toISOString().split('T')[0];
    EVALUATIONS_MOCK[idx] = {
      ...EVALUATIONS_MOCK[idx],
      autoEval    : body,
      dateAutoEval: now,
      statut      : 'AUTO_SOUMISE',
    };
    return HttpResponse.json(EVALUATIONS_MOCK[idx]);
  }),

  // Chef soumet son évaluation
  http.put(`${BASE}/:id/evaluation-chef`, async ({ params, request }) => {
    const idx = EVALUATIONS_MOCK.findIndex(e => e.id === Number(params['id']));
    if (idx < 0) return new HttpResponse(null, { status: 404 });
    const body = await request.json() as EvaluationChef;
    const now  = new Date().toISOString().split('T')[0];

    const updated = {
      ...EVALUATIONS_MOCK[idx],
      evalChef       : body,
      dateEvalChef   : now,
      recommandation : body.recommandation,
      statut         : 'VALIDEE_CHEF' as const,
    };
    // Calcul du score automatique
    const scores = calculerScore(updated);
    EVALUATIONS_MOCK[idx] = { ...updated, ...scores };
    return HttpResponse.json(EVALUATIONS_MOCK[idx]);
  }),

  // Admin RH valide (avec éventuel ajustement)
  http.put(`${BASE}/:id/valider-rh`, async ({ params, request }) => {
    const idx = EVALUATIONS_MOCK.findIndex(e => e.id === Number(params['id']));
    if (idx < 0) return new HttpResponse(null, { status: 404 });
    const body = await request.json() as { commentaireRh?: string; scoreAjuste?: number; valideeParRh?: string };
    const now  = new Date().toISOString().split('T')[0];

    const base     = EVALUATIONS_MOCK[idx];
    const scores   = calculerScore(base);
    const final    = body.scoreAjuste ?? scores.scoreFinal;
    const mention  = final >= 85 ? 'EXCELLENT' : final >= 70 ? 'BIEN' : final >= 55 ? 'SATISFAISANT' : final >= 40 ? 'A_AMELIORER' : 'INSUFFISANT';

    EVALUATIONS_MOCK[idx] = {
      ...base, ...scores,
      scoreAjuste      : body.scoreAjuste,
      scoreFinal       : final,
      mention,
      commentaireRh    : body.commentaireRh,
      dateValidationRh : now,
      valideeParRh     : body.valideeParRh ?? 'Admin RH',
      statut           : 'VALIDEE_RH',
    };
    return HttpResponse.json(EVALUATIONS_MOCK[idx]);
  }),

  // Admin clôture (après entretien)
  http.put(`${BASE}/:id/cloturer`, ({ params }) => {
    const idx = EVALUATIONS_MOCK.findIndex(e => e.id === Number(params['id']));
    if (idx < 0) return new HttpResponse(null, { status: 404 });
    EVALUATIONS_MOCK[idx] = { ...EVALUATIONS_MOCK[idx], statut: 'CLOTUREE' };
    return HttpResponse.json(EVALUATIONS_MOCK[idx]);
  }),
];
