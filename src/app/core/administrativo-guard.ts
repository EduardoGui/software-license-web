import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../features/auth/auth.service';

// Libera Administrador e Administrativo - usado nas rotas de DP, Patrimônio e no subconjunto de
// Cadastros Gerais (Locais/Empresas PJ/Notas Fiscais) que o papel Administrativo pode operar.
// As demais rotas administrativas continuam usando adminGuard (só Administrador).
export const administrativoGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.podeAcessarAdministrativo()) {
    return true;
  }

  const usuarioId = authService.obterUsuarioId();
  router.navigate(usuarioId ? ['/usuarios', usuarioId] : ['/login']);
  return false;
};
