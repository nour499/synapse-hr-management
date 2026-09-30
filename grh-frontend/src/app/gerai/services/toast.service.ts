import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {

  private _toasts = new BehaviorSubject<Toast[]>([]);
  readonly toasts$ = this._toasts.asObservable();

  private nextId = 0;

  success(message: string, duration = 4000): void { this._add('success', message, duration); }
  error(message: string,   duration = 5000): void { this._add('error',   message, duration); }
  warning(message: string, duration = 4000): void { this._add('warning', message, duration); }
  info(message: string,    duration = 3000): void { this._add('info',    message, duration); }

  dismiss(id: number): void {
    this._toasts.next(this._toasts.value.filter(t => t.id !== id));
  }

  private _add(type: ToastType, message: string, duration: number): void {
    const id = this.nextId++;
    this._toasts.next([...this._toasts.value, { id, type, message }]);
    setTimeout(() => this.dismiss(id), duration);
  }
}
