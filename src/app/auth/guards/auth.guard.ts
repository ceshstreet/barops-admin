import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Redirige a /login si no hay sesión activa.
 *  La sesión ya fue restaurada por provideAppInitializer antes de que
 *  el router evalúe cualquier guard, así que basta con la comprobación síncrona. */
export const authGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) return true;

  router.navigate(['/login']);
  return false;
};
