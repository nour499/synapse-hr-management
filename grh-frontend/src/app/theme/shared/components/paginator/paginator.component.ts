import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-paginator',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (totalPages > 1) {
      <div class="pag-bar">
        <span class="pag-info">{{ from }}–{{ to }} sur {{ total }}</span>

        <div class="pag-controls">
          <button class="pag-btn" [disabled]="page <= 1" (click)="go(page - 1)" aria-label="Précédent">
            <i class="ti ti-chevron-left"></i>
          </button>

          @for (p of pages; track p) {
            @if (p === 0) {
              <span class="pag-ellipsis">…</span>
            } @else {
              <button class="pag-btn pag-num" [class.active]="p === page" (click)="go(p)">
                {{ p }}
              </button>
            }
          }

          <button class="pag-btn" [disabled]="page >= totalPages" (click)="go(page + 1)" aria-label="Suivant">
            <i class="ti ti-chevron-right"></i>
          </button>
        </div>
      </div>
    }
  `,
  styles: [`
    .pag-bar {
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px 4px 4px;
      flex-wrap: wrap; gap: 10px;
    }
    .pag-info {
      font-size: 13px; color: #64748B;
    }
    .pag-controls {
      display: flex; align-items: center; gap: 4px;
    }
    .pag-btn {
      min-width: 34px; height: 34px; padding: 0 6px;
      border: 1px solid #E2E8F0; border-radius: 8px;
      background: #fff; color: #475569;
      font-size: 13px; font-weight: 500; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.15s;
      &:hover:not(:disabled):not(.active) { background: #F1F5F9; border-color: #CBD5E1; }
      &:disabled { opacity: 0.4; cursor: not-allowed; }
      &.active { background: #6366F1; border-color: #6366F1; color: #fff; font-weight: 600; }
      i { font-size: 15px; }
    }
    .pag-ellipsis {
      width: 28px; text-align: center; color: #94A3B8; font-size: 14px; user-select: none;
    }

    :host-context(.dark) .pag-btn,
    :host-context(body.dark) .pag-btn {
      background: #1a1f2e; border-color: rgba(255,255,255,0.1); color: #94A3B8;
      &:hover:not(:disabled):not(.active) { background: rgba(255,255,255,0.06); }
      &.active { background: #6366F1; border-color: #6366F1; color: #fff; }
    }
    :host-context(.dark) .pag-info,
    :host-context(body.dark) .pag-info { color: #64748B; }
  `]
})
export class PaginatorComponent {
  @Input() total    = 0;
  @Input() pageSize = 10;
  @Input() page     = 1;
  @Output() pageChange = new EventEmitter<number>();

  get totalPages(): number {
    return Math.ceil(this.total / this.pageSize);
  }

  get from(): number { return (this.page - 1) * this.pageSize + 1; }
  get to():   number { return Math.min(this.page * this.pageSize, this.total); }

  get pages(): (number | 0)[] {
    const t = this.totalPages;
    if (t <= 7) return Array.from({ length: t }, (_, i) => i + 1);

    const core = new Set([
      1,
      Math.max(2, this.page - 1),
      this.page,
      Math.min(t - 1, this.page + 1),
      t
    ]);
    const sorted = Array.from(core).sort((a, b) => a - b);

    const result: (number | 0)[] = [];
    let prev = 0;
    for (const p of sorted) {
      if (prev && p - prev > 1) result.push(0);
      result.push(p);
      prev = p;
    }
    return result;
  }

  go(p: number): void {
    if (p < 1 || p > this.totalPages || p === this.page) return;
    this.pageChange.emit(p);
  }
}
