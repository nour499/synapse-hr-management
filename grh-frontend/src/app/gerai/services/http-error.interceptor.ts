import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { ToastService } from './toast.service';
import { AuthService } from './auth.service';

// Deduplicate repeated toasts within a short window (e.g. forkJoin with N parallel calls)
const _shown = new Map<number, number>();
function _shouldShow(status: number): boolean {
  const now = Date.now();
  const last = _shown.get(status) ?? 0;
  if (now - last < 2000) return false;
  _shown.set(status, now);
  return true;
}

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  const auth  = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const status = error.status;

      if (status === 401) {
        // 401 from backend: token was attached but rejected — show a warning only.
        // Do NOT call auth.logout() here: the bearer token interceptor handles token
        // refresh automatically; calling logout on every 401 creates a redirect loop
        // when the dev proxy is first loading. Only log out after repeated failures.
        if (_shouldShow(401)) {
          toast.warning('Accès non autorisé. Veuillez vous reconnecter si le problème persiste.');
        }
      } else if (status === 403) {
        if (_shouldShow(403)) {
          toast.warning('Accès non autorisé.');
        }
      } else if (status === 0) {
        // Network error: server unreachable, CORS blocked, etc.
        if (_shouldShow(0)) {
          toast.error('Impossible de joindre le serveur. Vérifiez votre connexion.');
        }
      } else if (status >= 500) {
        if (_shouldShow(status)) {
          toast.error(`Erreur serveur (${status}). Réessayez dans un moment.`);
        }
      }

      // Always re-throw so component-level catchError handlers still fire
      return throwError(() => error);
    })
  );
};
