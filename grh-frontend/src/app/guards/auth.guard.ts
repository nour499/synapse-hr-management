import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  CanActivateChildFn,
  Router,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';
import { inject } from '@angular/core';
import { AuthGuardData, createAuthGuard } from 'keycloak-angular';

const ROLE_CHEF    = ['chef'];
const ROLE_EMPLOYE = ['employe', 'employé'];
const ROLE_ADMIN   = ['admin', 'admin_rh'];
const ROLE_DG      = ['directeur_general'];
const ROLE_COMITE  = ['comite'];

const ROLES_SYSTEME = new Set([
  'offline_access', 'uma_authorization', 'manage-account',
  'manage-account-links', 'view-profile', 'default-roles-synapse',
  'default-roles-master', 'create-realm', 'broker'
]);

function normaliserRole(role: string): string {
  return role.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function getTousLesRoles(grantedRoles: AuthGuardData['grantedRoles']): string[] {
  const realmRoles = grantedRoles.realmRoles ?? [];
  const clientRoles = Object.values(grantedRoles.resourceRoles ?? {}).flat() as string[];
  const tous = [...new Set([...realmRoles, ...clientRoles])].filter(r => !ROLES_SYSTEME.has(r));
  return tous;
}

function hasAnyRole(userRoles: string[], variants: string[]): boolean {
  return userRoles.some(ur => variants.some(v => normaliserRole(ur) === normaliserRole(v)));
}

// ────────────────────────────────────────────────────────────
// Guard 1 : REDIRECTION INITIALE
// ────────────────────────────────────────────────────────────
const roleRedirectLogic = async (
  _route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
  authData: AuthGuardData
): Promise<boolean | UrlTree> => {
  const { authenticated, grantedRoles, keycloak } = authData;
  const router = inject(Router);

  if (!authenticated) {
    await keycloak.login({ redirectUri: window.location.origin + state.url });
    return false;
  }

  const roles = getTousLesRoles(grantedRoles);

  if (hasAnyRole(roles, ROLE_COMITE))  return router.parseUrl('/admin/comite-credit');
  if (hasAnyRole(roles, ROLE_DG))      return router.parseUrl('/dg/dashboard');
  if (hasAnyRole(roles, ROLE_ADMIN))   return router.parseUrl('/admin/dashboard');
  if (hasAnyRole(roles, ROLE_CHEF))    return router.parseUrl('/chef/dashboard');
  if (hasAnyRole(roles, ROLE_EMPLOYE)) return router.parseUrl('/employe/dashboard');

  return router.parseUrl('/access-denied');
};

export const roleRedirectGuard: CanActivateFn =
  createAuthGuard<CanActivateFn>(roleRedirectLogic);

// ────────────────────────────────────────────────────────────
// Guard 2 : PROTECTION DES ROUTES
// ────────────────────────────────────────────────────────────
const requireRoleLogic = async (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
  authData: AuthGuardData
): Promise<boolean | UrlTree> => {
  const { authenticated, grantedRoles, keycloak } = authData;
  const router = inject(Router);

  if (!authenticated) {
    await keycloak.login({ redirectUri: window.location.origin + state.url });
    return false;
  }

  const rolesRequis: string[] = route.data?.['roles'] ?? [];
  if (rolesRequis.length === 0) return true;

  const userRoles = getTousLesRoles(grantedRoles);

  const aAcces = rolesRequis.some(requis =>
    userRoles.some(ur => normaliserRole(ur) === normaliserRole(requis))
  );

  if (!aAcces) {
    return router.parseUrl('/access-denied');
  }

  return true;
};

export const requireRoleGuard: CanActivateChildFn =
  createAuthGuard<CanActivateChildFn>(requireRoleLogic);
