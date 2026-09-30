import { http, HttpResponse } from 'msw';
import { FORMATIONS_MOCK, nextFormationId } from '../data/formation.mock';
import { DemandeFormation, StatutFormation } from 'src/app/gerai/models/formation.model';

const BASE = '/api/formations';

export const formationHandlers = [

  // ── GET all (filterable by employeId, statut, chefId) ──
  http.get(BASE, ({ request }) => {
    const url        = new URL(request.url);
    const employeId  = url.searchParams.get('employeId');
    const chefId     = url.searchParams.get('chefId');
    const statut     = url.searchParams.get('statut');

    let list = [...FORMATIONS_MOCK];
    if (employeId) list = list.filter(f => f.employeId === Number(employeId));
    if (chefId)    list = list.filter(f => f.chefId    === Number(chefId));
    if (statut)    list = list.filter(f => f.statut    === statut);

    return HttpResponse.json(list);
  }),

  // ── GET one ──
  http.get(`${BASE}/:id`, ({ params }) => {
    const f = FORMATIONS_MOCK.find(f => f.id === Number(params['id']));
    if (!f) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(f);
  }),

  // ── POST – employé crée une demande ──
  http.post(BASE, async ({ request }) => {
    const body = await request.json() as Partial<DemandeFormation>;
    const now  = new Date().toISOString().split('T')[0];
    const newF: DemandeFormation = {
      id            : nextFormationId(),
      employeId     : body.employeId!,
      employeNom    : body.employeNom!,
      employePrenom : body.employePrenom!,
      departement   : body.departement ?? '',
      chefId        : body.chefId,
      chefNom       : body.chefNom,
      titre         : body.titre!,
      organisme     : body.organisme!,
      type          : body.type!,
      mode          : body.mode!,
      dureeJours    : body.dureeJours!,
      coutEstime    : body.coutEstime,
      lieu          : body.lieu,
      dateDebutSouhaitee: body.dateDebutSouhaitee,
      dateFinSouhaitee  : body.dateFinSouhaitee,
      objectifs     : body.objectifs!,
      competencesVisees : body.competencesVisees,
      statut        : 'EN_ATTENTE',
      dateDemande   : now,
    };
    FORMATIONS_MOCK.push(newF);
    return HttpResponse.json(newF, { status: 201 });
  }),

  // ── PUT /:id/chef-decision – chef valide ou rejette ──
  http.put(`${BASE}/:id/chef-decision`, async ({ params, request }) => {
    const idx = FORMATIONS_MOCK.findIndex(f => f.id === Number(params['id']));
    if (idx < 0) return new HttpResponse(null, { status: 404 });

    const body = await request.json() as { decision: 'APPROUVE_CHEF' | 'REJETE_CHEF'; commentaire?: string };
    const now  = new Date().toISOString().split('T')[0];

    FORMATIONS_MOCK[idx] = {
      ...FORMATIONS_MOCK[idx],
      statut              : body.decision,
      commentaireChef     : body.commentaire,
      dateTraitementChef  : now,
    };
    return HttpResponse.json(FORMATIONS_MOCK[idx]);
  }),

  // ── PUT /:id/rh-decision – admin RH approuve ou rejette ──
  http.put(`${BASE}/:id/rh-decision`, async ({ params, request }) => {
    const idx = FORMATIONS_MOCK.findIndex(f => f.id === Number(params['id']));
    if (idx < 0) return new HttpResponse(null, { status: 404 });

    const body = await request.json() as { decision: 'APPROUVE_RH' | 'REJETE_RH'; commentaire?: string; traiteeParRh?: string };
    const now  = new Date().toISOString().split('T')[0];

    FORMATIONS_MOCK[idx] = {
      ...FORMATIONS_MOCK[idx],
      statut           : body.decision,
      commentaireRh    : body.commentaire,
      dateTraitementRh : now,
      traiteeParRh     : body.traiteeParRh ?? 'Admin RH',
    };
    return HttpResponse.json(FORMATIONS_MOCK[idx]);
  }),

  // ── PUT /:id/planifier – admin fixe les dates et passe en PLANIFIEE ──
  http.put(`${BASE}/:id/planifier`, async ({ params, request }) => {
    const idx = FORMATIONS_MOCK.findIndex(f => f.id === Number(params['id']));
    if (idx < 0) return new HttpResponse(null, { status: 404 });

    const body = await request.json() as { dateDebutReelle: string; dateFinReelle: string; lieu?: string };
    FORMATIONS_MOCK[idx] = {
      ...FORMATIONS_MOCK[idx],
      statut         : 'PLANIFIEE',
      dateDebutReelle: body.dateDebutReelle,
      dateFinReelle  : body.dateFinReelle,
      lieu           : body.lieu ?? FORMATIONS_MOCK[idx].lieu,
    };
    return HttpResponse.json(FORMATIONS_MOCK[idx]);
  }),

  // ── PUT /:id/demarrer – passe en EN_COURS ──
  http.put(`${BASE}/:id/demarrer`, ({ params }) => {
    const idx = FORMATIONS_MOCK.findIndex(f => f.id === Number(params['id']));
    if (idx < 0) return new HttpResponse(null, { status: 404 });
    FORMATIONS_MOCK[idx] = { ...FORMATIONS_MOCK[idx], statut: 'EN_COURS' };
    return HttpResponse.json(FORMATIONS_MOCK[idx]);
  }),

  // ── PUT /:id/completer – passe en COMPLETEE avec évaluation ──
  http.put(`${BASE}/:id/completer`, async ({ params, request }) => {
    const idx = FORMATIONS_MOCK.findIndex(f => f.id === Number(params['id']));
    if (idx < 0) return new HttpResponse(null, { status: 404 });

    const body = await request.json() as { certificatObtenu?: boolean; evaluation?: number; noteEvaluation?: string };
    FORMATIONS_MOCK[idx] = {
      ...FORMATIONS_MOCK[idx],
      statut          : 'COMPLETEE',
      certificatObtenu: body.certificatObtenu,
      evaluation      : body.evaluation,
      noteEvaluation  : body.noteEvaluation,
    };
    return HttpResponse.json(FORMATIONS_MOCK[idx]);
  }),

  // ── PUT /:id/annuler ──
  http.put(`${BASE}/:id/annuler`, ({ params }) => {
    const idx = FORMATIONS_MOCK.findIndex(f => f.id === Number(params['id']));
    if (idx < 0) return new HttpResponse(null, { status: 404 });
    FORMATIONS_MOCK[idx] = { ...FORMATIONS_MOCK[idx], statut: 'ANNULEE' };
    return HttpResponse.json(FORMATIONS_MOCK[idx]);
  }),

  // ── DELETE ──
  http.delete(`${BASE}/:id`, ({ params }) => {
    const idx = FORMATIONS_MOCK.findIndex(f => f.id === Number(params['id']));
    if (idx < 0) return new HttpResponse(null, { status: 404 });
    FORMATIONS_MOCK.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  }),
];
