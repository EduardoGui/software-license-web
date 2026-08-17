import { Routes } from '@angular/router';

import { authGuard } from './core/auth-guard';
import { Login } from './features/auth/login';
import { DashboardPage } from './features/dashboard/dashboard-page';
import { UsuariosList } from './features/usuarios/usuarios-list';
import { UsuarioForm } from './features/usuarios/usuario-form';
import { UsuarioView } from './features/usuarios/usuario-view';
import { LicencasList } from './features/licencas/licencas-list';
import { LicencaForm } from './features/licencas/licenca-form';
import { LicencaView } from './features/licencas/licenca-view';
import { MovimentacoesList } from './features/movimentacoes/movimentacoes-list';
import { MovimentacaoForm } from './features/movimentacoes/movimentacao-form';
import { MovimentacaoEncerrar } from './features/movimentacoes/movimentacao-encerrar';
import { TimelinePage } from './features/timeline/timeline-page';
import { TiposEquipamentoList } from './features/tipos-equipamento/tipos-equipamento-list';
import { TipoEquipamentoForm } from './features/tipos-equipamento/tipo-equipamento-form';
import { NotasFiscaisEntradaList } from './features/notas-fiscais-entrada/notas-fiscais-entrada-list';
import { NotaFiscalEntradaForm } from './features/notas-fiscais-entrada/nota-fiscal-entrada-form';
import { NotaFiscalEntradaView } from './features/notas-fiscais-entrada/nota-fiscal-entrada-view';

export const routes: Routes = [
  { path: 'login', component: Login },
  {
    path: '',
    canActivateChild: [authGuard],
    children: [
      { path: '', component: DashboardPage },
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
      { path: 'movimentacoes/:id/encerrar', component: MovimentacaoEncerrar },
      { path: 'timeline', component: TimelinePage },
      { path: 'equipamentos/tipos', component: TiposEquipamentoList },
      { path: 'equipamentos/tipos/novo', component: TipoEquipamentoForm },
      { path: 'equipamentos/tipos/:id/editar', component: TipoEquipamentoForm },
      { path: 'equipamentos/notas-fiscais', component: NotasFiscaisEntradaList },
      { path: 'equipamentos/notas-fiscais/novo', component: NotaFiscalEntradaForm },
      { path: 'equipamentos/notas-fiscais/:id', component: NotaFiscalEntradaView },
    ],
  },
];
