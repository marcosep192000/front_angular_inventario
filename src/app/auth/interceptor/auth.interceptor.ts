import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environments } from '../../../environments/environments.prod';
import { TokenService } from '../../services/token.service';

// Interceptor que agrega el token al encabezado Authorization si está presente pero no si es distinto 
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const esApiPropia = req.url.startsWith(environments.baseURL);
  const esAcceso = /\/acceso(?:\/|$)|\/login(?:\/|$)|\/auth(?:\/|$)/i.test(req.url);
  if (!esApiPropia || esAcceso) return next(req);

  if (!tokenService.isTokenValid()) {
    tokenService.logOut();
    return next(req);
  }

  const token = tokenService.getToken();
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
