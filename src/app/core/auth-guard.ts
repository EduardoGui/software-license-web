import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../features/auth/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.estaAutenticado()) {
    return true;
  }

  const tinhaToken = !!authService.obterToken();
  authService.logout();
  router.navigate(['/login'], tinhaToken ? { queryParams: { expirada: '1' } } : undefined);
  return false;
};
