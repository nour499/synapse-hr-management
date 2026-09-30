import { ErrorHandler, Injectable, NgZone, inject } from '@angular/core';
import { ToastService } from './toast.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private toast = inject(ToastService);
  private zone  = inject(NgZone);

  handleError(error: unknown): void {
    // Ignore lazy-chunk loading failures during deploys (browser cache stale)
    if (error instanceof Error && /Loading chunk \d+ failed/i.test(error.message)) {
      window.location.reload();
      return;
    }

    // HttpErrorResponse is already handled by the interceptor — don't double-toast
    if (this._isHttpError(error)) return;

    this.zone.run(() =>
      this.toast.error('Une erreur inattendue s\'est produite.')
    );

    console.error('[GlobalErrorHandler]', error);
  }

  private _isHttpError(err: unknown): boolean {
    return (
      typeof err === 'object' && err !== null &&
      'status' in err && 'url' in err &&
      typeof (err as any).status === 'number'
    );
  }
}
