import { Routes } from '@angular/router';

import { Home } from './home/home';
import { UsuariosList } from './features/usuarios/usuarios-list';
import { UsuarioForm } from './features/usuarios/usuario-form';
import { UsuarioView } from './features/usuarios/usuario-view';
import { LicencasList } from './features/licencas/licencas-list';
import { LicencaForm } from './features/licencas/licenca-form';
import { LicencaView } from './features/licencas/licenca-view';
import { MovimentacoesList } from './features/movimentacoes/movimentacoes-list';
import { MovimentacaoForm } from './features/movimentacoes/movimentacao-form';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'usuarios', component: UsuariosList },
  { path: 'usuarios/novo', component: UsuarioForm },
  { path: 'usuarios/:id/editar', component: UsuarioForm },
  { path: 'usuarios/:id', component: UsuarioView },
  { path: 'licencas', component: LicencasList },
  { path: 'licencas/novo', component: LicencaForm },
  { path: 'licencas/:id/editar', component: LicencaForm },
  { path: 'licencas/:id', component: LicencaView },
  { path: 'movimentacoes', component: MovimentacoesList },
  { path: 'movimentacoes/nova', component: MovimentacaoForm },
];
