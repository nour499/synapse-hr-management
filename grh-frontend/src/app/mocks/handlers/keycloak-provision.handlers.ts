import { http, HttpResponse } from 'msw';
import { MOCK_EMPLOYE_ACCESS } from '../data/keycloak-access.mock';
import { KEYCLOAK_ROLES, KEYCLOAK_GROUPS, EmployeAccess } from '../../gerai/models/keycloak-access.model';

export interface ProvisionRequest {
  employeId : number;
  prenom    : string;
  nom       : string;
  email     : string;
  role      : string;
  groups   ?: string[];
}

export interface ProvisionResult {
  username      : string;
  motDePasse    : string;
  emailEnvoye   : boolean;
  keycloakUserId: string;
  message       : string;
}

function generateUsername(prenom: string, nom: string): string {
  const normalize = (s: string) =>
    s.toLowerCase()
     .normalize('NFD')
     .replace(/[\u0300-\u036f]/g, '')
     .replace(/\s+/g, '.');
  return `${normalize(prenom)}.${normalize(nom)}`;
}

function generatePassword(): string {
  const upper   = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower   = 'abcdefghjkmnpqrstuvwxyz';
  const digits  = '23456789';
  const special = '@#!$';
  const rand = (str: string) => str[Math.floor(Math.random() * str.length)];
  return `Synapse${rand(upper)}${rand(upper)}${rand(lower)}${rand(lower)}${rand(digits)}${rand(digits)}${rand(special)}`;
}

export const keycloakProvisionHandlers = [

  // ── Référentiel : rôles et groupes disponibles ─────────
  http.get('/api/admin/keycloak/roles',  () => HttpResponse.json(KEYCLOAK_ROLES)),
  http.get('/api/admin/keycloak/groups', () => HttpResponse.json(KEYCLOAK_GROUPS)),

  // ── Accès d'un employé ──────────────────────────────────
  http.get('/api/admin/keycloak/employes/:id/access', ({ params }) => {
    const access = MOCK_EMPLOYE_ACCESS.find(a => a.employeId === +params['id']);
    if (!access) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(access);
  }),

  // ── Mise à jour des rôles ───────────────────────────────
  http.put('/api/admin/keycloak/employes/:id/roles', async ({ params, request }) => {
    const { roles } = await request.json() as { roles: string[] };
    const idx = MOCK_EMPLOYE_ACCESS.findIndex(a => a.employeId === +params['id']);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    MOCK_EMPLOYE_ACCESS[idx].roles = roles;
    return HttpResponse.json(MOCK_EMPLOYE_ACCESS[idx]);
  }),

  // ── Mise à jour des groupes ─────────────────────────────
  http.put('/api/admin/keycloak/employes/:id/groups', async ({ params, request }) => {
    const { groups } = await request.json() as { groups: string[] };
    const idx = MOCK_EMPLOYE_ACCESS.findIndex(a => a.employeId === +params['id']);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    MOCK_EMPLOYE_ACCESS[idx].groups = groups;
    return HttpResponse.json(MOCK_EMPLOYE_ACCESS[idx]);
  }),

  // ── Activer / désactiver le compte ──────────────────────
  http.put('/api/admin/keycloak/employes/:id/account', async ({ params, request }) => {
    const body = await request.json() as { accountEnabled?: boolean };
    const idx  = MOCK_EMPLOYE_ACCESS.findIndex(a => a.employeId === +params['id']);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    if (body.accountEnabled !== undefined)
      MOCK_EMPLOYE_ACCESS[idx].accountEnabled = body.accountEnabled;
    return HttpResponse.json(MOCK_EMPLOYE_ACCESS[idx]);
  }),

  // ── Réinitialiser le mot de passe ──────────────────────
  http.post('/api/admin/keycloak/employes/:id/reset-password', async ({ params }) => {
    const idx = MOCK_EMPLOYE_ACCESS.findIndex(a => a.employeId === +params['id']);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    const motDePasse = generatePassword();
    return HttpResponse.json({ motDePasse, emailEnvoye: true });
  }),

  // ── Provision (nouveau compte) ──────────────────────────
  http.post('/api/admin/keycloak/provision', async ({ request }) => {
    const body = await request.json() as ProvisionRequest;
    await new Promise(r => setTimeout(r, 800));

    const username   = generateUsername(body.prenom, body.nom);
    const motDePasse = generatePassword();

    const newAccess: EmployeAccess = {
      employeId    : body.employeId,
      username,
      accountEnabled: true,
      emailVerified : false,
      roles        : [body.role || 'employe'],
      groups       : body.groups ?? [],
      createdAt    : new Date().toISOString().slice(0, 10)
    };
    MOCK_EMPLOYE_ACCESS.push(newAccess);

    const result: ProvisionResult = {
      username,
      motDePasse,
      emailEnvoye   : true,
      keycloakUserId: crypto.randomUUID(),
      message       : `Compte créé. E-mail envoyé avec les identifiants.`
    };
    return HttpResponse.json(result, { status: 201 });
  })
];
