import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../features/auth/auth.service';

export const usuarioViewGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.ehAdministrador()) {
    return true;
  }

  const idRota = Number(route.paramMap.get('id'));
  const meuId = authService.obterUsuarioId();
  if (authService.ehColaborador() && meuId === idRota) {
    return true;
  }

  router.navigate(meuId ? ['/usuarios', meuId] : ['/login']);
  return false;
};
