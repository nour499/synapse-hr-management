import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

import { NavigationItem, NAV_ADMIN, NAV_CHEF, NAV_EMPLOYE, NAV_COMITE, NAV_DG } from './navigation';
import { AuthService } from 'src/app/gerai/services/auth.service';
import { NotificationService } from 'src/app/gerai/services/notification.service';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit, OnDestroy {

  private auth         = inject(AuthService);
  private notifService = inject(NotificationService);
  private sub?: Subscription;

  navItems: NavigationItem[] = [];
  unreadCount = 0;
  private unreadLiens = new Set<string>();

  ngOnInit(): void {
    const map: Record<string, NavigationItem[]> = {
      admin:   NAV_ADMIN,
      chef:    NAV_CHEF,
      employe: NAV_EMPLOYE,
      comite:  NAV_COMITE,
      dg:      NAV_DG
    };
    this.navItems = map[this.auth.role] ?? [];
    this.sub = this.notifService.notifications$.subscribe(ns => {
      const unread = ns.filter(n => !n.lue);
      this.unreadCount = unread.length;
      this.unreadLiens = new Set(unread.filter(n => n.lien).map(n => n.lien!));
    });
  }

  ngOnDestroy(): void { this.sub?.unsubscribe(); }

  logout(): void { this.auth.logout(); }

  hasActivity(item: NavigationItem): boolean {
    // Notifications item already shows a count badge — no dot needed there
    if (!item.url || item.id?.includes('notifications') || item.id?.includes('chat')) return false;
    const url = item.url;
    for (const lien of this.unreadLiens) {
      // Require exact match or lien goes deeper (proper path boundary, not substring)
      if (lien === url || lien.startsWith(url + '/')) return true;
    }
    return false;
  }
}