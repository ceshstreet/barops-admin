import { HttpInterceptorFn } from '@angular/common/http';

/** Agrega withCredentials a todas las peticiones para que las cookies se envíen */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req.clone({ withCredentials: true }));
};
