import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../features/auth/auth.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.ehAdministrador()) {
    return true;
  }

  const usuarioId = authService.obterUsuarioId();
  router.navigate(usuarioId ? ['/usuarios', usuarioId] : ['/login']);
  return false;
};
