// Angular import
import { AfterViewInit, Component, OnInit, OnDestroy, effect, inject } from '@angular/core';
import { CommonModule, Location, LocationStrategy } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';

// Project import
import { ConfigurationComponent } from './configuration/configuration.component';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { NavigationComponent } from './navigation/navigation.component';
import { BreadcrumbComponent } from '../../shared/components/breadcrumbs/breadcrumbs.component';
import { LayoutStateService } from '../../shared/service/layout-state.service';
import { NotificationWebSocketService } from 'src/app/gerai/services/notification-websocket.service';
import { NotificationService } from 'src/app/gerai/services/notification.service';
import { AuthService } from 'src/app/gerai/services/auth.service';
import { UserRole } from 'src/app/gerai/models/user-role.type';

@Component({
  selector: 'app-admin',
  imports: [CommonModule, NavigationComponent, NavBarComponent, ConfigurationComponent, RouterModule, BreadcrumbComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit, AfterViewInit, OnDestroy {
  private location = inject(Location);
  private locationStrategy = inject(LocationStrategy);
  cdr = inject(ChangeDetectorRef);
  private layoutState = inject(LayoutStateService);
  private wsNotif = inject(NotificationWebSocketService);
  private notifService = inject(NotificationService);
  private authService = inject(AuthService);
  private notifSub?: Subscription;

  // public props
  currentLayout!: string;
  navCollapsed = false;
  navCollapsedMob = false;
  windowWidth!: number;

  // Constructor
  constructor() {
    effect(() => {
      this.navCollapsedMob = this.layoutState.navCollapsedMob();
      this.cdr.detectChanges();
    });
  }

  // life cycle hook

  ngOnInit(): void {
    const wsRole = (this.authService.role === 'comite' ? 'admin' : this.authService.role).toUpperCase() as UserRole;
    this.wsNotif.connect(wsRole);
    this.notifSub = this.wsNotif.nouvelleNotification$.subscribe(notif => {
      this.notifService.push(notif);
    });
  }

  ngOnDestroy(): void {
    this.notifSub?.unsubscribe();
  }

  ngAfterViewInit() {
    this.windowWidth = window.innerWidth;
    this.cdr.detectChanges();
  }

  // private method
  private isThemeLayout(layout: string) {
    this.currentLayout = layout;
  }

  // public method
  navMobClick() {
    this.layoutState.toggleNavCollapsedMob();
    if (document.querySelector('app-navigation.pc-sidebar')?.classList.contains('navbar-collapsed')) {
      document.querySelector('app-navigation.pc-sidebar')?.classList.remove('navbar-collapsed');
    }
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.closeMenu();
    }
  }

  closeMenu() {
    this.layoutState.toggleNavCollapsedMob();
  }
}
