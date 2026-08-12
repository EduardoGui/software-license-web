import { Routes } from '@angular/router';

import { Home } from './home/home';
import { UsuariosList } from './features/usuarios/usuarios-list';
import { UsuarioForm } from './features/usuarios/usuario-form';
import { UsuarioView } from './features/usuarios/usuario-view';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'usuarios', component: UsuariosList },
  { path: 'usuarios/novo', component: UsuarioForm },
  { path: 'usuarios/:id/editar', component: UsuarioForm },
  { path: 'usuarios/:id', component: UsuarioView },
];
