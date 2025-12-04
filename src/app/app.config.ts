import { ApplicationConfig, isDevMode, inject } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideServiceWorker } from '@angular/service-worker';

import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { SecureStorageEcho } from '@awesome-cordova-plugins/secure-storage-echo/ngx';

import { authInterceptor } from './interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    SecureStorageEcho,
    provideRouter(routes), 
    provideServiceWorker('ngsw-worker.js', {
        enabled: !isDevMode(),
        registrationStrategy: 'registerWhenStable:30000'
    }),
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
  ]
};
