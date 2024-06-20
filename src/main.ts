import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';

import { getApp, initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, indexedDBLocalPersistence, initializeAuth, provideAuth } from '@angular/fire/auth';

import { Capacitor } from '@capacitor/core';
import { AngularFireModule } from '@angular/fire/compat';

import { IonicModule } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage-angular';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { baseUrlInterceptor } from './app/interceptors/baseurl.interceptor';
import { authorizationInterceptor } from './app/interceptors/authorization.interceptor';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([
      baseUrlInterceptor,
      authorizationInterceptor])),
    importProvidersFrom(IonicModule.forRoot({innerHTMLTemplatesEnabled: true})),
    importProvidersFrom(IonicStorageModule.forRoot()),
    importProvidersFrom(
      provideFirebaseApp(() =>
        initializeApp(environment.firebaseConfig)
      )
    ),
    importProvidersFrom(AngularFireModule.initializeApp(environment.firebaseConfig)),
    importProvidersFrom(
      provideAuth(() => {
        if (Capacitor.isNativePlatform()) {
          return initializeAuth(getApp(), {
            persistence: indexedDBLocalPersistence
          });
        }
        else {
          return getAuth();
        }
      })
    ),
  ],
});
