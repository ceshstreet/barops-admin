import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Fábrica: crea un guard que exige un rol específico */
export const roleGuard = (requiredRole: 'admin' | 'bartender'): CanActivateFn => () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  const user = auth.user();
  if (!user) {
    router.navigate(['/login']);
    return false;
  }

  if (user.role === requiredRole) return true;

  // Redirige al dashboard correcto según su rol real
  router.navigate(user.role === 'bartender' ? ['/bartender/dashboard'] : ['/dashboard']);
  return false;
};
