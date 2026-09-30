import { Component, Input } from '@angular/core';

@Component({
  selector  : 'app-skeleton-rows',
  standalone: true,
  template  : `
    <div class="skel-list">
      @for (i of rowArr; track i) {
        <div class="skel-row">

          <!-- First cell: avatar + 2 lines  OR  just 2 lines -->
          <div class="skel-cell-first">
            @if (withAvatar) { <div class="sk sk-av"></div> }
            <div class="skel-lines">
              <div class="sk sk-md" [style.width]="withAvatar ? '130px' : '160px'"></div>
              <div class="sk sk-sm" style="width:90px; margin-top:5px"></div>
            </div>
          </div>

          <!-- Middle data cells -->
          @for (j of colArr; track j) {
            <div class="skel-cell">
              <div class="sk sk-md" [style.width]="cellWidths[j % cellWidths.length]"></div>
            </div>
          }

          <!-- Status pill -->
          <div class="skel-cell">
            <div class="sk sk-pill"></div>
          </div>

          <!-- Action buttons -->
          <div class="skel-cell-actions">
            <div class="sk sk-btn"></div>
            <div class="sk sk-btn"></div>
          </div>

        </div>
      }
    </div>
  `,
  styles: [`
    .skel-list {
      padding: 4px 0;
    }
    .skel-row {
      display        : flex;
      align-items    : center;
      gap            : 20px;
      padding        : 13px 20px;
      border-bottom  : 1px solid #F1F5F9;
    }
    .skel-row:last-child { border-bottom: none; }
    .skel-cell-first {
      display    : flex;
      align-items: center;
      gap        : 12px;
      flex       : 2;
      min-width  : 0;
    }
    .skel-lines { display: flex; flex-direction: column; flex: 1; }
    .skel-cell  { flex: 1; min-width: 0; }
    .skel-cell-actions { display: flex; gap: 6px; flex-shrink: 0; }
  `]
})
export class SkeletonRowsComponent {
  @Input() rows       = 6;
  @Input() cols       = 3;
  @Input() withAvatar = true;

  readonly cellWidths = ['110px', '90px', '130px', '80px', '100px'];

  get rowArr() { return Array(this.rows).fill(0); }
  get colArr() { return Array(this.cols).fill(0); }
}
