
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import 'hammerjs';

if (environment.production) {
  enableProdMode();
}

if ('serviceWorker' in navigator && environment.production) {
  navigator.serviceWorker.register('/ngsw-worker.js').then(registration => {
    console.log('Service Worker registrado con éxito:', registration);
  }).catch(err => {
    console.warn('Registro de Service Worker fallido:', err);
  });
}

platformBrowserDynamic().bootstrapModule(AppModule);
