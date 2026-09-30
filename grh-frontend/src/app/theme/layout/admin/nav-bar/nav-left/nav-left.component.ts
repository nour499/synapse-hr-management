import { Component, OnInit, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import Keycloak from 'keycloak-js';

import { SharedModule } from 'src/app/theme/shared/shared.module';
import { NavigationItem, NAV_CHEF, NAV_EMPLOYE } from '../../navigation/navigation';

@Component({
  selector: 'app-nav-left',
  standalone: true,
  imports: [CommonModule, RouterModule, SharedModule],
  templateUrl: './nav-left.component.html',
  styleUrls: ['./nav-left.component.scss']
})
export class NavLeftComponent implements OnInit {

  private keycloak = inject(Keycloak);

  NavCollapsedMob = output();
  navigationItems: NavigationItem[] = [];
  userRole: 'chef' | 'employe' | null = null;

  ngOnInit(): void {
    this.loadMenuByRole();
  }

  loadMenuByRole(): void {
    const roles = (this.keycloak.tokenParsed?.realm_access?.roles as string[]) ?? [];

    if (roles.includes('chef') || roles.includes('CHEF')) {
      this.userRole = 'chef';
      this.navigationItems = NAV_CHEF;
    } else if (roles.includes('employe') || roles.includes('EMPLOYE')) {
      this.userRole = 'employe';
      this.navigationItems = NAV_EMPLOYE;
    } 
    /*else {
      this.userRole = 'employe';
      this.navigationItems = NAV_EMPLOYE;
    }*/
  }

  navCollapsedMob(): void {
    this.NavCollapsedMob.emit();
  }

  logout(): void {
    this.keycloak.logout({ redirectUri: window.location.origin });
  }
}