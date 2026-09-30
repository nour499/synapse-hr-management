import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import Keycloak from 'keycloak-js';

import { NavigationItem } from '../../navigation';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { LayoutStateService } from 'src/app/theme/shared/service/layout-state.service';

@Component({
  selector: 'app-nav-item',
  standalone: true,
  imports: [CommonModule, SharedModule, RouterModule],
  templateUrl: './nav-item.component.html',
  styleUrls: ['./nav-item.component.scss']
})
export class NavItemComponent {

  item = input.required<NavigationItem>();
  private layoutState = inject(LayoutStateService);
  private keycloak = inject(Keycloak);

  handleClick(event: MouseEvent) {
    if (this.item().id === 'logout') {
      event.preventDefault();
      this.keycloak.logout({ redirectUri: window.location.origin });
      return;
    }

    const nav = document.querySelector('app-navigation.pc-navbar') as HTMLDivElement;
    if (nav?.classList.contains('mob-open')) {
      nav.classList.remove('mob-open');
    }
  }
}