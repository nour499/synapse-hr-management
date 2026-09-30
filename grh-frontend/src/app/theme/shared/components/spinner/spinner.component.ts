import { Component, OnDestroy, ViewEncapsulation, input, inject, ChangeDetectorRef } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { Spinkit } from './spinkit';

@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss', './spinkit-css/sk-line-material.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SpinnerComponent implements OnDestroy {
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  isSpinnerVisible = true;
  Spinkit = Spinkit;
  backgroundColor = input('#2689E2');
  spinner = input(Spinkit.skLine);

  constructor() {
    this.router.events.subscribe(
      (event) => {
        if (event instanceof NavigationStart) {
          // ✅ setTimeout évite NG0100
          setTimeout(() => {
            this.isSpinnerVisible = true;
            this.cdr.detectChanges();
          });
        } else if (
          event instanceof NavigationEnd ||
          event instanceof NavigationCancel ||
          event instanceof NavigationError
        ) {
          // ✅ setTimeout évite NG0100
          setTimeout(() => {
            this.isSpinnerVisible = false;
            this.cdr.detectChanges();
          });
        }
      },
      () => {
        setTimeout(() => {
          this.isSpinnerVisible = false;
          this.cdr.detectChanges();
        });
      }
    );
  }

  ngOnDestroy(): void {
    this.isSpinnerVisible = false;
  }
}