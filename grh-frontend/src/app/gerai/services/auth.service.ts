import { Injectable, inject } from '@angular/core';
import Keycloak from 'keycloak-js';

export type UserRole = 'admin' | 'chef' | 'employe' | 'comite' | 'dg';

const SYSTEM_ROLES = new Set([
  'offline_access', 'uma_authorization', 'manage-account',
  'manage-account-links', 'view-profile', 'default-roles-synapse',
  'default-roles-master', 'create-realm', 'broker'
]);

@Injectable({ providedIn: 'root' })
export class AuthService {

  private keycloak = inject(Keycloak);

  private get token() { return this.keycloak.tokenParsed; }

  private get realmRoles(): string[] {
    const all = (this.token?.realm_access?.roles as string[] | undefined) ?? [];
    return all.filter(r => !SYSTEM_ROLES.has(r)).map(r => r.toLowerCase());
  }

  get role(): UserRole {
    const roles = this.realmRoles;
    if (roles.some(r => r === 'directeur_general')) return 'dg';
    if (roles.some(r => r === 'admin' || r === 'admin_rh')) return 'admin';
    if (roles.some(r => r === 'comite'))  return 'comite';
    if (roles.some(r => r === 'chef'))    return 'chef';
    return 'employe';
  }

  get email():     string { return this.token?.['email']       ?? ''; }
  get firstName(): string { return this.token?.['given_name']  ?? ''; }
  get lastName():  string { return this.token?.['family_name'] ?? ''; }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`.trim() || 'Utilisateur';
  }

  get initials(): string {
    const p = this.firstName.charAt(0);
    const n = this.lastName.charAt(0);
    return (p + n).toUpperCase() || 'U';
  }

  get postLabel(): string {
    const map: Record<UserRole, string> = {
      admin:   'Administrateur RH',
      chef:    'Chef de Projet',
      employe: 'Employé',
      comite:  'Membre du comité',
      dg:      'Directeur Général'
    };
    return map[this.role];
  }

  hasRole(...roles: UserRole[]): boolean {
    return roles.includes(this.role);
  }

  logout(): void {
    this.keycloak.logout({ redirectUri: window.location.origin });
  }
}
