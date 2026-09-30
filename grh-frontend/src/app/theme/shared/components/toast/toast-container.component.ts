import { Component, inject } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { ToastService, Toast } from 'src/app/gerai/services/toast.service';

const ICONS: Record<string, string> = {
  success: 'ti ti-circle-check',
  error:   'ti ti-circle-x',
  warning: 'ti ti-alert-triangle',
  info:    'ti ti-info-circle'
};

const COLORS: Record<string, string> = {
  success: '#10B981',
  error:   '#EF4444',
  warning: '#F59E0B',
  info:    '#3B82F6'
};

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule, AsyncPipe],
  template: `
    <div style="position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:10px;pointer-events:none;">
      @for (toast of toastService.toasts$ | async; track toast.id) {
        <div style="display:flex;align-items:center;gap:12px;min-width:280px;max-width:380px;padding:14px 16px;border-radius:12px;background:#fff;box-shadow:0 4px 20px rgba(0,0,0,.12);border-left:4px solid;pointer-events:auto;animation:slideIn .25s ease;"
             [style.border-left-color]="color(toast)">
          <i [class]="icon(toast)" style="font-size:20px;flex-shrink:0;" [style.color]="color(toast)"></i>
          <span style="font-size:13px;color:#374151;flex:1;line-height:1.4;">{{ toast.message }}</span>
          <button (click)="toastService.dismiss(toast.id)"
                  style="background:none;border:none;cursor:pointer;padding:2px;color:#9CA3AF;display:flex;align-items:center;flex-shrink:0;">
            <i class="ti ti-x" style="font-size:14px;"></i>
          </button>
        </div>
      }
    </div>
    <style>
      @keyframes slideIn {
        from { opacity: 0; transform: translateX(24px); }
        to   { opacity: 1; transform: translateX(0);    }
      }
    </style>
  `
})
export class ToastContainerComponent {
  toastService = inject(ToastService);
  icon(t: Toast): string  { return ICONS[t.type]  ?? ICONS['info'];  }
  color(t: Toast): string { return COLORS[t.type] ?? COLORS['info']; }
}
