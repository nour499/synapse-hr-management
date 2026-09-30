import { Routes } from '@angular/router';
import { roleRedirectGuard, requireRoleGuard } from './guards/auth.guard';
import { AdminComponent } from './theme/layout/admin/admin.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    canActivate: [roleRedirectGuard],
    component: AdminComponent
  },
  {
    path: '',
    component: AdminComponent,
    canActivateChild: [requireRoleGuard],
    children: [

      // ─── DASHBOARDS ───
      {
        path: 'employe/dashboard',
        loadComponent: () => import('./gerai/employe/dashboard-employe.component')
          .then(m => m.DashboardEmployeComponent),
        data: { roles: ['employe', 'employé', 'chef', 'admin'] }
      },
      {
        path: 'chef/dashboard',
        loadComponent: () => import('./gerai/chef/dashboard-chef.component')
          .then(m => m.DashboardChefComponent),
        data: { roles: ['chef', 'admin'] }
      },
      {
        path: 'admin/dashboard',
        loadComponent: () => import('./gerai/admin/dashboard-admin/dashboard-admin.component')
          .then(m => m.DashboardAdminComponent),
        data: { roles: ['admin', 'admin_rh'] }
      },

      // ─── PAGES ADMIN ───
      {
        path: 'admin/employes',
        loadComponent: () => import('./gerai/admin/employes/liste-employes/liste-employes-admin.component')
          .then(m => m.ListeEmployesAdminComponent),
        data: { roles: ['admin', 'admin_rh'] }
      },
      {
        path: 'admin/employes/ajouter',
        loadComponent: () => import('./gerai/admin/employes/form-employe/form-employe-admin.component')
          .then(m => m.FormEmployeAdminComponent),
        data: { roles: ['admin', 'admin_rh'] }
      },
      {
        path: 'admin/employes/:id',
        loadComponent: () => import('./gerai/admin/employes/profil-employe-admin/profil-employe-admin.component')
          .then(m => m.ProfilEmployeAdminComponent),
        data: { roles: ['admin', 'admin_rh'] }
      },
      {
        path: 'admin/employes/:id/modifier',
        loadComponent: () => import('./gerai/admin/employes/form-employe/form-employe-admin.component')
          .then(m => m.FormEmployeAdminComponent),
        data: { roles: ['admin', 'admin_rh'] }
      },
      {
        path: 'admin/actifs',
        loadComponent: () => import('./gerai/admin/actifs/liste-actifs/liste-actifs-admin.component')
          .then(m => m.ListeActifsAdminComponent),
        data: { roles: ['admin', 'admin_rh'] }
      },
      {
        path: 'admin/actifs/ajouter',
        loadComponent: () => import('./gerai/admin/actifs/form-actif/form-actif-admin.component')
          .then(m => m.FormActifAdminComponent),
        data: { roles: ['admin', 'admin_rh'] }
      },
      {
        path: 'admin/actifs/:id/modifier',
        loadComponent: () => import('./gerai/admin/actifs/form-actif/form-actif-admin.component')
          .then(m => m.FormActifAdminComponent),
        data: { roles: ['admin', 'admin_rh'] }
      },
      {
        path: 'admin/departs',
        loadComponent: () => import('./gerai/admin/departs/liste-departs/liste-departs-admin.component')
          .then(m => m.ListeDepartsAdminComponent),
        data: { roles: ['admin', 'admin_rh'] }
      },
      {
        path: 'admin/departs/:id',
        loadComponent: () => import('./gerai/admin/departs/detail-depart/detail-depart-admin.component')
          .then(m => m.DetailDepartAdminComponent),
        data: { roles: ['admin', 'admin_rh'] }
      },
      {
        path: 'admin/planning',
        loadComponent: () => import('./gerai/admin/planning/planning-rh.component')
          .then(m => m.PlanningRhComponent),
        data: { roles: ['admin', 'admin_rh'] }
      },
      {
        path: 'admin/soldes-conges',
        loadComponent: () => import('./gerai/admin/soldes-conges/soldes-conges-admin.component')
          .then(m => m.SoldesCongesAdminComponent),
        data: { roles: ['admin', 'admin_rh'] }
      },
      {
        path: 'admin/demandes',
        loadComponent: () => import('./gerai/admin/demandes/demandes-admin.component')
          .then(m => m.DemandesAdminComponent),
        data: { roles: ['admin', 'admin_rh'] }
      },
      {
        path: 'admin/departements',
        loadComponent: () => import('./gerai/admin/departements/departements-admin.component')
          .then(m => m.DepartementsAdminComponent),
        data: { roles: ['admin', 'admin_rh'] }
      },
      {
        path: 'admin/jobs',
        loadComponent: () => import('./gerai/admin/jobs/jobs-admin.component')
          .then(m => m.JobsAdminComponent),
        data: { roles: ['admin', 'admin_rh'] }
      },
      {
        path: 'admin/recrutement',
        loadComponent: () => import('./gerai/admin/recrutement/recrutement-admin.component')
          .then(m => m.RecrutementAdminComponent),
        data: { roles: ['admin', 'admin_rh'] }
      },
      {
        path: 'chef/recrutement',
        loadComponent: () => import('./gerai/chef/recrutement/recrutement-chef.component')
          .then(m => m.RecrutementChefComponent),
        data: { roles: ['chef', 'admin'] }
      },
      {
        path: 'admin/recrutement/candidats',
        loadComponent: () => import('./gerai/admin/recrutement/candidats/candidats-admin.component')
          .then(m => m.CandidatsAdminComponent),
        data: { roles: ['admin', 'admin_rh'] }
      },
      {
        path: 'admin/recrutement/pipeline',
        loadComponent: () => import('./gerai/admin/recrutement/pipeline/pipeline-admin.component')
          .then(m => m.PipelineAdminComponent),
        data: { roles: ['admin', 'admin_rh'] }
      },
      {
        path: 'admin/recrutement/entretiens',
        loadComponent: () => import('./gerai/admin/recrutement/entretiens/entretiens-admin.component')
          .then(m => m.EntretiensAdminComponent),
        data: { roles: ['admin', 'admin_rh'] }
      },
      {
        path: 'admin/recrutement/shortlist',
        loadComponent: () => import('./gerai/admin/recrutement/shortlist/shortlist-admin.component')
          .then(m => m.ShortlistAdminComponent),
        data: { roles: ['admin', 'admin_rh'] }
      },
      {
        path: 'admin/recrutement/cvs',
        loadComponent: () => import('./gerai/admin/recrutement/cvs/cvs-admin.component')
          .then(m => m.CvsAdminComponent),
        data: { roles: ['admin', 'admin_rh'] }
      },
      {
        path: 'admin/referentiel',
        loadComponent: () => import('./gerai/admin/referentiel/referentiel-rh.component')
          .then(m => m.ReferentielRhComponent),
        data: { roles: ['admin', 'admin_rh'] }
      },
      {
        path: 'admin/projets',
        loadComponent: () => import('./gerai/admin/projets/projets-admin.component')
          .then(m => m.ProjetsAdminComponent),
        data: { roles: ['admin', 'admin_rh'] }
      },
      {
        path: 'admin/formations',
        loadComponent: () => import('./gerai/admin/formations/formations-admin.component')
          .then(m => m.FormationsAdminComponent),
        data: { roles: ['admin', 'admin_rh'] }
      },
      {
        path: 'admin/credits-dg',
        loadComponent: () => import('./gerai/admin/credits-dg/credits-dg.component')
          .then(m => m.CreditsDgComponent),
        data: { roles: ['admin', 'admin_rh'] }
      },
      // ─── DIRECTEUR GÉNÉRAL ───
      {
        path: 'dg/dashboard',
        loadComponent: () => import('./gerai/admin/credits-dg/credits-dg.component')
          .then(m => m.CreditsDgComponent),
        data: { roles: ['directeur_general'] }
      },
      {
        path: 'admin/comite-credit',
        loadComponent: () => import('./gerai/admin/comite-credit/comite-credit.component')
          .then(m => m.ComiteCreditComponent),
        data: { roles: ['admin', 'admin_rh', 'comite'] }
      },
      {
        path: 'chef/formations',
        loadComponent: () => import('./gerai/chef/formations/formations-chef.component')
          .then(m => m.FormationsChefComponent),
        data: { roles: ['chef', 'admin'] }
      },
      {
        path: 'employe/formations',
        loadComponent: () => import('./gerai/employe/formations/formations-employe.component')
          .then(m => m.FormationsEmployeComponent),
        data: { roles: ['employe', 'employé', 'chef', 'admin'] }
      },
      {
        path: 'employe/evaluations',
        loadComponent: () => import('./gerai/employe/evaluations/evaluations-employe.component')
          .then(m => m.EvaluationsEmployeComponent),
        data: { roles: ['employe', 'employé', 'chef', 'admin'] }
      },
      {
        path: 'chef/evaluations',
        loadComponent: () => import('./gerai/chef/evaluations/evaluations-chef.component')
          .then(m => m.EvaluationsChefComponent),
        data: { roles: ['chef', 'admin'] }
      },
      {
        path: 'admin/evaluations',
        loadComponent: () => import('./gerai/admin/evaluations/evaluations-admin.component')
          .then(m => m.EvaluationsAdminComponent),
        data: { roles: ['admin', 'admin_rh'] }
      },
      {
        path: 'admin/attrition',
        loadComponent: () => import('./gerai/admin/attrition/attrition-admin.component')
          .then(m => m.AttritionAdminComponent),
        data: { roles: ['admin', 'admin_rh'] }
      },
      {
        path: 'admin/rapports',
        loadComponent: () => import('./gerai/admin/rapports/rapports-admin.component')
          .then(m => m.RapportsAdminComponent),
        data: { roles: ['admin', 'admin_rh'] }
      },

      // ─── PAGES EMPLOYÉ ───
      {
        path: 'employe/profil',
        loadComponent: () => import('./gerai/employe/profil/profil-employe.component')
          .then(m => m.ProfilEmployeComponent),
        data: { roles: ['employe', 'employé', 'chef', 'admin'] }
      },
      {
        path: 'employe/demandes',
        loadComponent: () => import('./gerai/employe/demandes/liste-demandes/liste-demandes.component')
          .then(m => m.ListeDemandesComponent),
        data: { roles: ['employe', 'employé', 'chef', 'admin'] }
      },
      {
        path: 'employe/demandes/deposer',
        loadComponent: () => import('./gerai/employe/demandes/deposer-demande/deposer-demande.component')
          .then(m => m.DeposerDemandeComponent),
        data: { roles: ['employe', 'employé', 'chef', 'admin'] }
      },
      {
        path: 'employe/demandes/:id',
        loadComponent: () => import('./gerai/employe/demandes/detail-demande/detail-demande.component')
          .then(m => m.DetailDemandeComponent),
        data: { roles: ['employe', 'employé', 'chef', 'admin'] }
      },
      {
        path: 'employe/taches',
        loadComponent: () => import('./gerai/employe/taches/liste-taches.component')
          .then(m => m.ListeTachesComponent),
        data: { roles: ['employe', 'employé', 'chef', 'admin'] }
      },
      {
        path: 'employe/projets',
        loadComponent: () => import('./gerai/employe/projets/liste-projets.component')
          .then(m => m.ListeProjetsComponent),
        data: { roles: ['employe', 'employé', 'chef', 'admin'] }
      },
      {
        path: 'employe/mes-actifs',
        loadComponent: () => import('./gerai/employe/mes-actifs/mes-actifs.component')
          .then(m => m.MesActifsComponent),
        data: { roles: ['employe', 'employé', 'chef', 'admin'] }
      },

      // ─── PAGES CHEF ───
      {
        path: 'chef/equipe',
        loadComponent: () => import('./gerai/chef/equipe/equipe.component')
          .then(m => m.EquipeComponent),
        data: { roles: ['chef', 'admin'] }
      },
      // ✅ Profil détaillé d'un employé
      {
        path: 'chef/equipe/:id',
        loadComponent: () => import('./gerai/chef/equipe-detail/equipe-detail.component')
          .then(m => m.EquipeDetailComponent),
        data: { roles: ['chef', 'admin'] }
      },
      {
        path: 'chef/demandes',
        loadComponent: () => import('./gerai/chef/demandes/demandes.component')
          .then(m => m.DemandesChefComponent),
        data: { roles: ['chef', 'admin'] }
      },
      {
        path: 'chef/demandes/:id',
        loadComponent: () => import('./gerai/chef/demande-detail/demande-detail.component')
          .then(m => m.DemandeDetailComponent),
        data: { roles: ['chef', 'admin'] }
      },
      {
        path: 'chef/taches',
        loadComponent: () => import('./gerai/chef/taches/affectation-taches.component')
          .then(m => m.AffectationTachesComponent),
        data: { roles: ['chef', 'admin'] }
      },
      {
        path: 'chef/projets',
        loadComponent: () => import('./gerai/chef/projets/projets.component')
          .then(m => m.ProjetsComponent),
        data: { roles: ['chef', 'admin'] }
      },
      {
        path: 'chef/rapports',
        loadComponent: () => import('./gerai/chef/rapports/rapports.component')
          .then(m => m.RapportsComponent),
        data: { roles: ['chef', 'admin'] }
      },
      {
        path: 'chef/planning',
        loadComponent: () => import('./gerai/chef/planning-conges/planning-conges.component')
          .then(m => m.PlanningCongesComponent),
        data: { roles: ['chef', 'admin'] }
      },
      {
        path: 'chef/profil',
        loadComponent: () => import('./gerai/chef/profil/profil-chef.component')
          .then(m => m.ProfilChefComponent),
        data: { roles: ['employe', 'employé', 'chef', 'admin'] }
      },

      // ─── PAGES COMMUNES ───
      {
        path: 'chat',
        loadComponent: () => import('./gerai/chef/chat/chat.component')
          .then(m => m.ChatComponent),
        data: { roles: ['employe', 'employé', 'chef', 'admin'] }
      },
      {
        path: 'notifications',
        loadComponent: () => import('./gerai/chef/notifications/notifications.component')
          .then(m => m.NotificationsComponent),
        data: { roles: ['employe', 'employé', 'chef', 'admin', 'directeur_general'] }
      },
      {
        path: 'access-denied',
        loadComponent: () => import('./demo/pages/authentication/login/login.component')
          .then(m => m.LoginComponent)
      }
    ]
  },
  {
    path: 'postuler',
    loadComponent: () => import('./gerai/public/postuler/postuler.component')
      .then(m => m.PostulerComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];