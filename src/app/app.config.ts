import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { HttpErrorResponse, provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideToastr } from 'ngx-toastr';
import { authInterceptor } from './auth/interceptor/auth.interceptor';
import { spinnerInterceptor } from './auth/interceptor/spinner.interceptor';
import { licenseInterceptor } from './auth/interceptor/license.interceptor';


export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes),
    provideClientHydration(),
    provideAnimationsAsync(),
    provideHttpClient(
    withFetch(),
    withInterceptors([authInterceptor, licenseInterceptor, spinnerInterceptor])
  ),
    provideToastr(), 
  ]
};
