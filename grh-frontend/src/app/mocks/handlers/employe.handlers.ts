import { http, HttpResponse, delay } from 'msw';
import {
    MOCK_EMPLOYES,
    MOCK_STATISTIQUES,
    DEFAULT_STATS,
    getNextEmployeId
} from 'src/app/mocks/data/employe.mock';

const BASE = 'http://localhost:8085/api/employes';

export const employeHandlers = [

    // ── GET /employes/search?q=... ────────────────────────────
    // Must be declared before /:id to avoid shadowing
    http.get(`${BASE}/search`, async ({ request }) => {
        await delay(100);
        const q = new URL(request.url).searchParams.get('q')?.toLowerCase() ?? '';
        const results = MOCK_EMPLOYES.filter(e =>
            e.nom.toLowerCase().includes(q) ||
            e.prenom.toLowerCase().includes(q) ||
            e.email.toLowerCase().includes(q)
        );
        return HttpResponse.json(results);
    }),

    // ── GET /employes/stats (global) ──────────────────────────
    http.get(`${BASE}/stats`, async () => {
        await delay(80);
        return HttpResponse.json(DEFAULT_STATS);
    }),

    // ── GET /employes/chef/:chefId ────────────────────────────
    http.get(`${BASE}/chef/:chefId`, async ({ params }) => {
        await delay(100);
        const chefId = Number(params['chefId']);
        const results = MOCK_EMPLOYES.filter(e => e.chefId === chefId);
        return HttpResponse.json(results);
    }),

    // ── GET /employes/:id/stats ───────────────────────────────
    http.get(`${BASE}/:id/stats`, async ({ params }) => {
        await delay(80);
        const id = Number(params['id']);
        const stats = MOCK_STATISTIQUES[id] ?? DEFAULT_STATS;
        return HttpResponse.json(stats);
    }),

    // ── GET /employes/:id ─────────────────────────────────────
    http.get(`${BASE}/:id`, async ({ params }) => {
        await delay(80);
        const id = Number(params['id']);
        const employe = MOCK_EMPLOYES.find(e => e.id === id);
        if (!employe) return new HttpResponse(null, { status: 404 });
        return HttpResponse.json(employe);
    }),

    // ── GET /employes ─────────────────────────────────────────
    http.get(BASE, async () => {
        await delay(120);
        return HttpResponse.json(MOCK_EMPLOYES);
    }),

    // ── POST /employes ────────────────────────────────────────
    http.post(BASE, async ({ request }) => {
        await delay(150);
        const body = (await request.json()) as any;
        const newEmploye = { ...body, id: getNextEmployeId() };
        MOCK_EMPLOYES.push(newEmploye);
        return HttpResponse.json(newEmploye, { status: 201 });
    }),

    // ── PUT /employes/:id ─────────────────────────────────────
    http.put(`${BASE}/:id`, async ({ params, request }) => {
        await delay(150);
        const id = Number(params['id']);
        const idx = MOCK_EMPLOYES.findIndex(e => e.id === id);
        if (idx === -1) return new HttpResponse(null, { status: 404 });
        const update = (await request.json()) as any;
        MOCK_EMPLOYES[idx] = { ...MOCK_EMPLOYES[idx], ...update };
        return HttpResponse.json(MOCK_EMPLOYES[idx]);
    }),

    // ── DELETE /employes/:id ──────────────────────────────────
    http.delete(`${BASE}/:id`, async ({ params }) => {
        await delay(100);
        const id = Number(params['id']);
        const idx = MOCK_EMPLOYES.findIndex(e => e.id === id);
        if (idx === -1) return new HttpResponse(null, { status: 404 });
        MOCK_EMPLOYES.splice(idx, 1);
        return new HttpResponse(null, { status: 204 });
    })
];
