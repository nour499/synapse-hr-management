import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { NavigationItem } from '../../navigation';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { NavItemComponent } from '../nav-item/nav-item.component';

@Component({
  selector: 'app-nav-collapse',
  standalone: true,
  imports: [CommonModule, RouterModule, SharedModule, NavItemComponent],
  templateUrl: './nav-collapse.component.html',
  styleUrls: ['./nav-collapse.component.scss']
})
export class NavCollapseComponent {
  item = input.required<NavigationItem>();
  isOpen = false;

  toggle(): void {
    this.isOpen = !this.isOpen;
  }
}
