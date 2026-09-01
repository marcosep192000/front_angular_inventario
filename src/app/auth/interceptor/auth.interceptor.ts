import { HttpClient, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environments } from '../../../environments/environments';
import { TokenService } from '../../services/token.service';
import { Observable, catchError, finalize, shareReplay, switchMap, tap, throwError } from 'rxjs';
import { ResponseAcceso } from '../../interfaces/ResponseAcceso';

let refreshRequest$: Observable<ResponseAcceso> | null = null;

// Interceptor que agrega el token al encabezado Authorization si está presente pero no si es distinto 
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const http = inject(HttpClient);
  const esApiPropia = req.url.startsWith(environments.baseURL);
  const esAcceso = /\/acceso(?:\/|$)|\/login(?:\/|$)|\/auth(?:\/|$)/i.test(req.url);
  const esLicencia = /\/license(?:\/|$)/i.test(req.url);
  if (esApiPropia && esLicencia) {
    const token = tokenService.getToken();
    return token && tokenService.isTokenValid()
      ? next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }))
      : next(req);
  }
  if (!esApiPropia || esAcceso) return next(req);

  const refrescar = (): Observable<ResponseAcceso> => {
    if (!refreshRequest$) {
      refreshRequest$ = http.post<ResponseAcceso>(`${environments.baseURL}auth/refresh`, {}, { withCredentials: true }).pipe(
        tap(session => tokenService.setSession(session)),
        finalize(() => refreshRequest$ = null),
        shareReplay(1),
      );
    }
    return refreshRequest$;
  };

  const enviarConToken = () => next(req.clone({ setHeaders: { Authorization: `Bearer ${tokenService.getToken()}` } }));

  if (!tokenService.isTokenValid()) {
    return refrescar().pipe(
      switchMap(() => enviarConToken()),
      catchError(error => { tokenService.logOut(); return throwError(() => error); }),
    );
  }

  return enviarConToken().pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401) return throwError(() => error);
      return refrescar().pipe(
        switchMap(() => enviarConToken()),
        catchError(refreshError => { tokenService.logOut(); return throwError(() => refreshError); }),
      );
    }),
  );
};
