import { Routes } from '@angular/router';

import { Home } from './home/home';
import { UsuariosList } from './features/usuarios/usuarios-list';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'usuarios', component: UsuariosList },
];
