import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

// project import
import { NavigationItem } from '../../navigation';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { NavCollapseComponent } from '../nav-collapse/nav-collapse.component';
import { NavItemComponent } from '../nav-item/nav-item.component';

@Component({
  selector: 'app-nav-group',
  standalone: true,
  imports: [CommonModule, SharedModule, NavCollapseComponent, NavItemComponent],
  templateUrl: './nav-group.component.html',
  styleUrls: ['./nav-group.component.scss']
})
export class NavGroupComponent {
  item = input.required<NavigationItem>();
}
