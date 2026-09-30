export interface NavigationItem {
  id: string;
  title: string;
  type: 'item' | 'collapse' | 'group';
  translate?: string;
  icon?: string;
  hidden?: boolean;
  url?: string;
  classes?: string;
  external?: boolean;
  target?: boolean;
  breadcrumbs?: boolean;
  children?: NavigationItem[];
  role?: string[];
  isMainParent?: boolean;
}

// ═══════════════════════════════════════════════════
// 👤 MENU EMPLOYÉ
// ═══════════════════════════════════════════════════
export const NAV_EMPLOYE: NavigationItem[] = [
  {
    id: 'synapse-employe',
    title: 'SYNAPSE',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'dashboard-employe',
        title: 'Mon Dashboard',
        type: 'item',
        classes: 'nav-item',
        url: '/employe/dashboard',
        icon: 'ti ti-layout-dashboard',
        breadcrumbs: false
      },
      {
        id: 'mon-profil',
        title: 'Mon Profil',
        type: 'item',
        classes: 'nav-item',
        url: '/employe/profil',
        icon: 'ti ti-user',
        breadcrumbs: false
      },
      {
        id: 'mes-demandes',
        title: 'Mes Demandes',
        type: 'item',
        classes: 'nav-item',
        url: '/employe/demandes',
        icon: 'ti ti-file-text',
        breadcrumbs: false
      },
      {
        id: 'mes-taches',
        title: 'Mes Tâches',
        type: 'item',
        classes: 'nav-item',
        url: '/employe/taches',
        icon: 'ti ti-checklist',
        breadcrumbs: false
      },
      {
        id: 'mes-projets',
        title: 'Mes Projets',
        type: 'item',
        classes: 'nav-item',
        url: '/employe/projets',
        icon: 'ti ti-briefcase',
        breadcrumbs: false
      },
      {
        id: 'mes-formations',
        title: 'Mes Formations',
        type: 'item',
        classes: 'nav-item',
        url: '/employe/formations',
        icon: 'ti ti-school',
        breadcrumbs: false
      },
      {
        id: 'mes-evaluations',
        title: 'Mes Évaluations',
        type: 'item',
        classes: 'nav-item',
        url: '/employe/evaluations',
        icon: 'ti ti-chart-bar',
        breadcrumbs: false
      },
      {
        id: 'mes-actifs',
        title: 'Mes Actifs',
        type: 'item',
        classes: 'nav-item',
        url: '/employe/mes-actifs',
        icon: 'ti ti-device-laptop',
        breadcrumbs: false
      }
    ]
  },
  {
    id: 'communication-employe',
    title: 'COMMUNICATION',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'chat-employe',
        title: 'Chat',
        type: 'item',
        classes: 'nav-item',
        url: '/chat',
        icon: 'ti ti-message-circle',
        breadcrumbs: false
      },
      {
        id: 'notifications-employe',
        title: 'Notifications',
        type: 'item',
        classes: 'nav-item',
        url: '/notifications',
        icon: 'ti ti-bell',
        breadcrumbs: false
      }
    ]
  }
];

// ═══════════════════════════════════════════════════
// 🏢 MENU CHEF
// ═══════════════════════════════════════════════════
// ═══════════════════════════════════════════════════
// 🏦 MENU COMMISSION DE PRÊT
// ═══════════════════════════════════════════════════
export const NAV_COMITE: NavigationItem[] = [
  {
    id: 'comite-group',
    title: 'COMMISSION DE PRÊT',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'comite-dashboard',
        title: 'Avis sur les prêts',
        type: 'item',
        classes: 'nav-item',
        url: '/admin/comite-credit',
        icon: 'ti ti-scale',
        breadcrumbs: false
      }
    ]
  }
];

export const NAV_CHEF: NavigationItem[] = [
  {
    id: 'synapse-chef',
    title: 'SYNAPSE',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'dashboard-chef',
        title: 'Mon Dashboard',
        type: 'item',
        classes: 'nav-item',
        url: '/chef/dashboard',
        icon: 'ti ti-layout-dashboard',
        breadcrumbs: false
      },
      {
        id: 'mon-equipe',
        title: 'Mon Équipe',
        type: 'item',
        classes: 'nav-item',
        url: '/chef/equipe',
        icon: 'ti ti-users',
        breadcrumbs: false
      },
      {
        id: 'chef-recrutement',
        title: 'Recrutement',
        type: 'item',
        classes: 'nav-item',
        url: '/chef/recrutement',
        icon: 'ti ti-user-search',
        breadcrumbs: false
      },
      {
        id: 'valider-demandes',
        title: 'Demandes',
        type: 'item',
        classes: 'nav-item',
        url: '/chef/demandes',
        icon: 'ti ti-clipboard-check',
        breadcrumbs: false
      },
      {
        id: 'liste-taches',
        title: 'Affectation des Tâches',
        type: 'item',
        classes: 'nav-item',
        url: '/chef/taches',
        icon: 'ti ti-subtask',
        breadcrumbs: false
      },
      {
        id: 'liste-projets',
        title: 'Projets',
        type: 'item',
        classes: 'nav-item',
        url: '/chef/projets',
        icon: 'ti ti-layout-kanban',
        breadcrumbs: false
      },
      {
        id: 'rapports-chef',
        title: 'Rapports',
        type: 'item',
        classes: 'nav-item',
        url: '/chef/rapports',
        icon: 'ti ti-chart-dots',
        breadcrumbs: false
      },
      {
        id: 'planning-chef',
        title: 'Planning Congés',
        type: 'item',
        classes: 'nav-item',
        url: '/chef/planning',
        icon: 'ti ti-calendar-stats',
        breadcrumbs: false
      },
      {
        id: 'chef-formations',
        title: 'Formations équipe',
        type: 'item',
        classes: 'nav-item',
        url: '/chef/formations',
        icon: 'ti ti-school',
        breadcrumbs: false
      },
      {
        id: 'chef-evaluations',
        title: 'Évaluations équipe',
        type: 'item',
        classes: 'nav-item',
        url: '/chef/evaluations',
        icon: 'ti ti-chart-bar',
        breadcrumbs: false
      },
      {
        id: 'profil-chef',
        title: 'Mon Profil',
        type: 'item',
        classes: 'nav-item',
        url: '/chef/profil',
        icon: 'ti ti-user',
        breadcrumbs: false
      }
    ]
  },
  {
    id: 'communication-chef',
    title: 'COMMUNICATION',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'chat-chef',
        title: 'Chat équipe',
        type: 'item',
        classes: 'nav-item',
        url: '/chat',
        icon: 'ti ti-message-circle',
        breadcrumbs: false
      },
      {
        id: 'notifications-chef',
        title: 'Notifications',
        type: 'item',
        classes: 'nav-item',
        url: '/notifications',
        icon: 'ti ti-bell',
        breadcrumbs: false
      }
    ]
  }
];

// ═══════════════════════════════════════════════════
// 🛡️ MENU ADMIN
// ═══════════════════════════════════════════════════
export const NAV_ADMIN: NavigationItem[] = [
  {
    id: 'synapse-admin',
    title: 'SYNAPSE RH',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'dashboard-admin',
        title: 'Dashboard',
        type: 'item',
        classes: 'nav-item',
        url: '/admin/dashboard',
        icon: 'ti ti-layout-dashboard',
        breadcrumbs: false
      }
    ]
  },
  {
    id: 'gestion-rh',
    title: 'GESTION RH',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'admin-employes',
        title: 'Employés',
        type: 'item',
        classes: 'nav-item',
        url: '/admin/employes',
        icon: 'ti ti-users',
        breadcrumbs: false
      },
      {
        id: 'admin-departements',
        title: 'Départements',
        type: 'item',
        classes: 'nav-item',
        url: '/admin/departements',
        icon: 'ti ti-building',
        breadcrumbs: false
      },
      {
        id: 'admin-actifs',
        title: 'Actifs',
        type: 'item',
        classes: 'nav-item',
        url: '/admin/actifs',
        icon: 'ti ti-box',
        breadcrumbs: false
      },
      {
        id: 'admin-planning',
        title: 'Planning RH',
        type: 'item',
        classes: 'nav-item',
        url: '/admin/planning',
        icon: 'ti ti-calendar-stats',
        breadcrumbs: false
      },
      {
        id: 'admin-soldes-conges',
        title: 'Soldes congés',
        type: 'item',
        classes: 'nav-item',
        url: '/admin/soldes-conges',
        icon: 'ti ti-coin',
        breadcrumbs: false
      },
      {
        id: 'admin-demandes',
        title: 'Demandes',
        type: 'item',
        classes: 'nav-item',
        url: '/admin/demandes',
        icon: 'ti ti-clipboard-list',
        breadcrumbs: false
      },
      {
        id: 'admin-credits-dg',
        title: 'Prêts — Direction RH',
        type: 'item',
        classes: 'nav-item',
        url: '/admin/credits-dg',
        icon: 'ti ti-credit-card',
        breadcrumbs: false
      },
      {
        id: 'admin-departs',
        title: 'Départs',
        type: 'item',
        classes: 'nav-item',
        url: '/admin/departs',
        icon: 'ti ti-door-exit',
        breadcrumbs: false
      },
      {
        id: 'admin-projets',
        title: 'Vue Projets',
        type: 'item',
        classes: 'nav-item',
        url: '/admin/projets',
        icon: 'ti ti-layout-kanban',
        breadcrumbs: false
      }
    ]
  },
  {
    id: 'formation-admin',
    title: 'FORMATION & ÉVALUATION',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'admin-formations',
        title: 'Formations',
        type: 'item',
        classes: 'nav-item',
        url: '/admin/formations',
        icon: 'ti ti-school',
        breadcrumbs: false
      },
      {
        id: 'admin-evaluations',
        title: 'Évaluations',
        type: 'item',
        classes: 'nav-item',
        url: '/admin/evaluations',
        icon: 'ti ti-chart-bar',
        breadcrumbs: false
      },
      {
        id: 'admin-attrition',
        title: 'Prédiction Attrition',
        type: 'item',
        classes: 'nav-item',
        url: '/admin/attrition',
        icon: 'ti ti-trending-down',
        breadcrumbs: false
      },
      {
        id: 'admin-rapports',
        title: 'Rapports RH',
        type: 'item',
        classes: 'nav-item',
        url: '/admin/rapports',
        icon: 'ti ti-chart-dots',
        breadcrumbs: false
      }
    ]
  },
  {
    id: 'recrutement-admin',
    title: 'RECRUTEMENT',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'admin-rec-demandes',
        title: "Demandes d'embauche",
        type: 'item',
        classes: 'nav-item',
        url: '/admin/recrutement',
        icon: 'ti ti-user-search',
        breadcrumbs: false
      },
      {
        id: 'admin-rec-jobs',
        title: 'Offres d\'emploi',
        type: 'item',
        classes: 'nav-item',
        url: '/admin/jobs',
        icon: 'ti ti-news',
        breadcrumbs: false
      },
      {
        id: 'admin-rec-candidats',
        title: 'Candidats',
        type: 'item',
        classes: 'nav-item',
        url: '/admin/recrutement/candidats',
        icon: 'ti ti-users',
        breadcrumbs: false
      },
      {
        id: 'admin-rec-pipeline',
        title: 'Pipeline',
        type: 'item',
        classes: 'nav-item',
        url: '/admin/recrutement/pipeline',
        icon: 'ti ti-layout-kanban',
        breadcrumbs: false
      },
      {
        id: 'admin-rec-entretiens',
        title: 'Entretiens',
        type: 'item',
        classes: 'nav-item',
        url: '/admin/recrutement/entretiens',
        icon: 'ti ti-microphone',
        breadcrumbs: false
      },
      {
        id: 'admin-rec-shortlist',
        title: 'Shortlist',
        type: 'item',
        classes: 'nav-item',
        url: '/admin/recrutement/shortlist',
        icon: 'ti ti-star',
        breadcrumbs: false
      },
      {
        id: 'admin-rec-cvs',
        title: 'CV & Résumés',
        type: 'item',
        classes: 'nav-item',
        url: '/admin/recrutement/cvs',
        icon: 'ti ti-file-cv',
        breadcrumbs: false
      }
    ]
  },
  {
    id: 'parametrage-admin',
    title: 'PARAMÉTRAGE',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'admin-referentiel',
        title: 'Référentiel RH',
        type: 'item',
        classes: 'nav-item',
        url: '/admin/referentiel',
        icon: 'ti ti-settings-2',
        breadcrumbs: false
      }
    ]
  },
  {
    id: 'communication-admin',
    title: 'COMMUNICATION',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'chat-admin',
        title: 'Chat',
        type: 'item',
        classes: 'nav-item',
        url: '/chat',
        icon: 'ti ti-message-circle',
        breadcrumbs: false
      },
      {
        id: 'notifications-admin',
        title: 'Notifications',
        type: 'item',
        classes: 'nav-item',
        url: '/notifications',
        icon: 'ti ti-bell',
        breadcrumbs: false
      }
    ]
  }
];

// ═══════════════════════════════════════════════════
// 🏛️ MENU DIRECTEUR GÉNÉRAL
// ═══════════════════════════════════════════════════
export const NAV_DG: NavigationItem[] = [
  {
    id: 'dg-group',
    title: 'DIRECTION GÉNÉRALE',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'dg-credits',
        title: 'Approbation des prêts',
        type: 'item',
        classes: 'nav-item',
        url: '/dg/dashboard',
        icon: 'ti ti-writing-sign',
        breadcrumbs: false
      }
    ]
  },
  {
    id: 'communication-dg',
    title: 'COMMUNICATION',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'notifications-dg',
        title: 'Notifications',
        type: 'item',
        classes: 'nav-item',
        url: '/notifications',
        icon: 'ti ti-bell',
        breadcrumbs: false
      }
    ]
  }
];

// ═══════════════════════════════════════════════════
// 📦 Export combiné (fallback Berry)
// ═══════════════════════════════════════════════════
export const NavigationItems: NavigationItem[] = [
  ...NAV_EMPLOYE,
  ...NAV_CHEF,
  ...NAV_ADMIN,
  ...NAV_DG
];