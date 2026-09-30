import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { AuthService, UserRole } from 'src/app/gerai/services/auth.service';
import { NotificationService } from 'src/app/gerai/services/notification.service';
import { Notification } from 'src/app/gerai/models/notification.model';
import { tempsRelatif } from 'src/app/gerai/utils/temps-relatif';
import { Subscription } from 'rxjs';

export interface ProfileLink {
  label: string;
  icon: string;
  route: string;
}

const PROFILE_LINKS: Record<UserRole, ProfileLink[]> = {
  employe: [
    { label: 'Mon profil',   icon: 'ti ti-user',           route: '/employe/profil'   },
    { label: 'Mes demandes', icon: 'ti ti-file-text',      route: '/employe/demandes' },
    { label: 'Mes tâches',   icon: 'ti ti-checkbox',       route: '/employe/taches'   },
    { label: 'Mes projets',  icon: 'ti ti-briefcase',      route: '/employe/projets'  }
  ],
  chef: [
    { label: 'Mon Dashboard', icon: 'ti ti-layout-dashboard', route: '/chef/dashboard' },
    { label: 'Mon Équipe',    icon: 'ti ti-users',            route: '/chef/equipe'    },
    { label: 'Demandes',      icon: 'ti ti-clipboard-check',  route: '/chef/demandes'  },
    { label: 'Mes Projets',   icon: 'ti ti-briefcase',        route: '/chef/projets'   }
  ],
  admin: [
    { label: 'Dashboard RH', icon: 'ti ti-layout-dashboard', route: '/admin/dashboard'   },
    { label: 'Employés',     icon: 'ti ti-users',            route: '/admin/employes'    },
    { label: 'Demandes',     icon: 'ti ti-clipboard-list',   route: '/admin/demandes'    },
    { label: 'Recrutement',  icon: 'ti ti-user-search',      route: '/admin/recrutement' }
  ],
  comite: [
    { label: 'Commission de prêt', icon: 'ti ti-scale', route: '/admin/comite-credit' }
  ],
  dg: [
    { label: 'Dossiers de prêts', icon: 'ti ti-cash', route: '/dg/dashboard' }
  ]
};

const ROLE_ICONS: Record<UserRole, string> = {
  admin:   'ti ti-shield-check',
  chef:    'ti ti-crown',
  employe: 'ti ti-user',
  comite:  'ti ti-users-group',
  dg:      'ti ti-building'
};

@Component({
  selector: 'app-nav-right',
  standalone: true,
  imports: [CommonModule, RouterModule, SharedModule],
  templateUrl: './nav-right.component.html',
  styleUrls: ['./nav-right.component.scss']
})
export class NavRightComponent implements OnInit, OnDestroy {
  auth = inject(AuthService);
  private notifService = inject(NotificationService);
  private subs: Subscription[] = [];

  profileLinks: ProfileLink[] = [];
  notifications: Notification[] = [];
  unreadCount = 0;

  private get storeRole(): 'CHEF' | 'EMPLOYE' | null {
    if (this.auth.role === 'chef') return 'CHEF';
    if (this.auth.role === 'employe') return 'EMPLOYE';
    return null;
  }

  get userRole():  UserRole { return this.auth.role; }
  get roleIcon():  string   { return ROLE_ICONS[this.auth.role]; }
  get roleLabel(): string   { return this.auth.postLabel; }

  ngOnInit(): void {
    this.profileLinks = PROFILE_LINKS[this.auth.role];
    // Load for all roles — admin has personal DB notifications too
    this.notifService.load(this.auth.role.toUpperCase() as any);
    this.subs.push(
      this.notifService.notifications$.subscribe(ns => this.notifications = ns.slice(0, 5))
    );
    this.subs.push(
      this.notifService.unreadCount$.subscribe(count => this.unreadCount = count)
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  markAsRead(id: number): void {
    this.notifService.markAsRead(id).subscribe();
  }

  markAllAsRead(): void {
    this.notifService.markAllAsRead().subscribe();
  }

  tempsRelatif(heure: string): string { return tempsRelatif(heure); }

  getNotifIconClass(type: string): string {
    return ({ success: 'bg-light-success', info: 'bg-light-primary', warning: 'bg-light-warning', danger: 'bg-light-danger' } as Record<string, string>)[type] ?? 'bg-light-primary';
  }

  logout(): void { this.auth.logout(); }
}
