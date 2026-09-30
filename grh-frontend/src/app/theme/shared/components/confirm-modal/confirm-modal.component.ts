import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (open) {
      <div class="cm-overlay" (click)="cancelled.emit()"></div>
      <div class="cm-box" role="dialog" aria-modal="true">
        <div class="cm-icon-wrap">
          <i class="ti ti-alert-triangle"></i>
        </div>
        <h3 class="cm-title">{{ title }}</h3>
        <p class="cm-msg">{{ message }}</p>
        <div class="cm-actions">
          <button class="cm-btn-cancel" type="button" [disabled]="loading" (click)="cancelled.emit()">
            <i class="ti ti-x"></i> Annuler
          </button>
          <button class="cm-btn-confirm" type="button" [disabled]="loading" (click)="confirmed.emit()">
            @if (loading) {
              <span class="cm-spinner"></span>
            } @else {
              <i class="ti ti-trash"></i>
            }
            {{ confirmLabel }}
          </button>
        </div>
      </div>
    }
  `,
  styles: [`
    .cm-overlay {
      position: fixed; inset: 0;
      background: rgba(15, 23, 42, 0.45);
      backdrop-filter: blur(4px);
      z-index: 1000;
      animation: cmFadeIn 0.15s ease;
    }
    .cm-box {
      position: fixed; top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      z-index: 1001;
      width: 400px; max-width: calc(100vw - 32px);
      background: #fff; border-radius: 20px;
      padding: 36px 32px; text-align: center;
      box-shadow: 0 20px 60px rgba(0,0,0,0.18);
      animation: cmSlideUp 0.2s ease;
    }
    .cm-icon-wrap {
      width: 64px; height: 64px; border-radius: 50%;
      background: #FEF2F2;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 20px;
      i { font-size: 30px; color: #EF4444; }
    }
    .cm-title { margin: 0 0 12px; font-size: 18px; font-weight: 700; color: #0F172A; }
    .cm-msg   { margin: 0 0 28px; font-size: 14px; color: #64748B; line-height: 1.6; }
    .cm-actions { display: flex; gap: 12px; justify-content: center; }
    .cm-btn-cancel {
      display: flex; align-items: center; gap: 6px;
      padding: 10px 20px; border: 1px solid #E2E8F0;
      border-radius: 10px; background: #F8FAFC;
      color: #475569; font-size: 14px; font-weight: 500; cursor: pointer;
      &:hover:not(:disabled) { background: #F1F5F9; }
      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }
    .cm-btn-confirm {
      display: flex; align-items: center; gap: 6px;
      padding: 10px 20px; border: none; border-radius: 10px;
      background: #EF4444; color: #fff;
      font-size: 14px; font-weight: 600; cursor: pointer;
      &:hover:not(:disabled) { background: #DC2626; }
      &:disabled { opacity: 0.6; cursor: not-allowed; }
    }
    .cm-spinner {
      width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.4);
      border-top-color: #fff; border-radius: 50%;
      animation: cmSpin 0.7s linear infinite;
      display: inline-block;
    }
    @keyframes cmFadeIn  { from { opacity: 0; } to { opacity: 1; } }
    @keyframes cmSlideUp { from { transform: translate(-50%, calc(-50% + 16px)); opacity: 0; } to { transform: translate(-50%, -50%); opacity: 1; } }
    @keyframes cmSpin    { to { transform: rotate(360deg); } }

    :host-context(.dark) .cm-box,
    :host-context(body.dark) .cm-box {
      background: #1e2536;
      .cm-title { color: #E2E8F0; }
      .cm-msg   { color: #94A3B8; }
    }
    :host-context(.dark) .cm-btn-cancel,
    :host-context(body.dark) .cm-btn-cancel {
      background: rgba(255,255,255,0.04);
      border-color: rgba(255,255,255,0.1);
      color: #94A3B8;
    }
  `]
})
export class ConfirmModalComponent {
  @Input() open    = false;
  @Input() title   = 'Confirmer la suppression';
  @Input() message = 'Cette action est irréversible.';
  @Input() confirmLabel = 'Supprimer';
  @Input() loading = false;

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();
}
