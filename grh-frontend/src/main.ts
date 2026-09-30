(window as any).global = window;

import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { AppComponent } from './app/app.component';
import { routes } from './app/app-routing.module';
import { environment } from './environments/environment';

// Match any request that goes through the /api/ proxy path (Angular dev server
// proxies /api/* to the backend services) or directly to a backend port.
// This ensures the Bearer token is attached regardless of whether the call
// uses a relative /api/... URL or an absolute http://localhost:808x/... URL.
const apiOriginPattern = /\/(api|uploads)\//i;

import {
  provideKeycloak,
  includeBearerTokenInterceptor,
  createInterceptorCondition,
  INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
  IncludeBearerTokenCondition
} from 'keycloak-angular';
import { ErrorHandler } from '@angular/core';

import { httpErrorInterceptor } from './app/gerai/services/http-error.interceptor';
import { GlobalErrorHandler }   from './app/gerai/services/global-error-handler';
import { enableMocking } from './app/mocks/browser';

if (environment.production) enableProdMode();

const urlCondition = createInterceptorCondition<IncludeBearerTokenCondition>({
  urlPattern: apiOriginPattern
});

async function main() {
  if (!environment.production && environment.useMocks) {
    await enableMocking();
  }

  bootstrapApplication(AppComponent, {
    providers: [
      provideRouter(routes),

      provideHttpClient(
        withInterceptors([includeBearerTokenInterceptor, httpErrorInterceptor])
      ),

      { provide: ErrorHandler, useClass: GlobalErrorHandler },

      {
        provide: INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
        useValue: [urlCondition]
      },

      provideKeycloak({
        config: {
          url: environment.keycloak.url,
          realm: environment.keycloak.realm,
          clientId: environment.keycloak.clientId
        },
        initOptions: {
          onLoad: 'check-sso',
          silentCheckSsoRedirectUri: window.location.origin + '/assets/silent-check-sso.html',
          checkLoginIframe: false,
          pkceMethod: 'S256',
          flow: 'standard',
          redirectUri: window.location.origin
        }
      })
    ]
  }).catch(err => console.error(err));
}

main();