import { HttpInterceptorFn } from '@angular/common/http';

// Interceptor que agrega el token al encabezado Authorization si está presente pero no si es distinto 
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Si la URL contiene "Acceso", no agregar el token
  if (req.url.indexOf('Acceso') > 0) {
    return next(req);
  }

  // Obtener el token del almacenamiento local
     const token = localStorage.getItem('token');
  // Si el token está presente, agregarlo a la cabecera Authorization
  if (token) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(clonedRequest);
  } else {
    // Si no hay token, continuar sin modificar la solicitud
    return next(req);
  }
};
