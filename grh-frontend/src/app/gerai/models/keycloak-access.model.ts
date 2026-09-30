export interface KeycloakRole {
  id         : string;
  name       : string;
  description: string;
  color      : string;
  icon       : string;
}

export interface KeycloakGroup {
  id         : string;
  name       : string;
  path       : string;
  description: string;
  icon       : string;
}

export interface EmployeAccess {
  employeId      : number;
  username       : string;
  accountEnabled : boolean;
  emailVerified  : boolean;
  roles          : string[];   // role names
  groups         : string[];   // group paths
  createdAt     ?: string;
  lastLogin     ?: string;
}

export const KEYCLOAK_ROLES: KeycloakRole[] = [
  { id: 'r1', name: 'employe',  description: 'Employé standard — accès à son espace personnel', color: '#6366F1', icon: 'ti ti-user'         },
  { id: 'r2', name: 'chef',     description: 'Chef d\'équipe — gestion de son équipe et projets',color: '#0EA5E9', icon: 'ti ti-users'        },
  { id: 'r3', name: 'admin_rh', description: 'Administrateur RH — gestion RH complète',         color: '#F59E0B', icon: 'ti ti-shield-half'  },
  { id: 'r4', name: 'admin',    description: 'Super administrateur — accès total au système',    color: '#EF4444', icon: 'ti ti-shield-filled' }
];

export const KEYCLOAK_GROUPS: KeycloakGroup[] = [
  { id: 'g1',  name: 'Informatique', path: '/Informatique', description: 'Équipe Informatique & Développement', icon: 'ti ti-code'      },
  { id: 'g2',  name: 'RH',           path: '/RH',           description: 'Équipe Ressources Humaines',          icon: 'ti ti-heart'     },
  { id: 'g3',  name: 'Finance',       path: '/Finance',      description: 'Équipe Finance & Comptabilité',       icon: 'ti ti-coin'      },
  { id: 'g4',  name: 'Marketing',     path: '/Marketing',    description: 'Équipe Marketing & Communication',    icon: 'ti ti-speakerphone' },
  { id: 'g5',  name: 'Data',          path: '/Data',         description: 'Équipe Data & Analytics',             icon: 'ti ti-chart-bar' },
  { id: 'g6',  name: 'Design',        path: '/Design',       description: 'Équipe Design & UX',                  icon: 'ti ti-palette'   },
  { id: 'g7',  name: 'Qualité',       path: '/Qualité',      description: 'Équipe Qualité & Tests',               icon: 'ti ti-checkup-list' },
  { id: 'g8',  name: 'Commercial',    path: '/Commercial',   description: 'Équipe Commerciale',                  icon: 'ti ti-building-store' },
  { id: 'g9',  name: 'Managers',      path: '/Managers',     description: 'Groupe transversal des managers',     icon: 'ti ti-crown'     },
  { id: 'g10', name: 'Administration',path: '/Administration',description: 'Groupe Administration & Direction',  icon: 'ti ti-settings'  }
];
