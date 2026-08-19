import { Routes } from '@angular/router';

import { authGuard } from './core/auth-guard';
import { adminGuard } from './core/admin-guard';
import { usuarioViewGuard } from './core/usuario-view-guard';
import { Login } from './features/auth/login';
import { DefinirSenha } from './features/auth/definir-senha';
import { DashboardPage } from './features/dashboard/dashboard-page';
import { UsuariosList } from './features/usuarios/usuarios-list';
import { UsuarioForm } from './features/usuarios/usuario-form';
import { UsuarioView } from './features/usuarios/usuario-view';
import { LicencasList } from './features/licencas/licencas-list';
import { LicencaForm } from './features/licencas/licenca-form';
import { LicencaView } from './features/licencas/licenca-view';
import { LicencaAlterarValor } from './features/licencas/licenca-alterar-valor';
import { LicencaCustoMensalPage } from './features/licenca-custo-mensal/licenca-custo-mensal-page';
import { MovimentacoesList } from './features/movimentacoes/movimentacoes-list';
import { MovimentacaoForm } from './features/movimentacoes/movimentacao-form';
import { MovimentacaoEncerrar } from './features/movimentacoes/movimentacao-encerrar';
import { MovimentacaoEditarEncerramento } from './features/movimentacoes/movimentacao-editar-encerramento';
import { TimelinePage } from './features/timeline/timeline-page';
import { TiposEquipamentoList } from './features/tipos-equipamento/tipos-equipamento-list';
import { TipoEquipamentoForm } from './features/tipos-equipamento/tipo-equipamento-form';
import { NotasFiscaisEntradaList } from './features/notas-fiscais-entrada/notas-fiscais-entrada-list';
import { NotaFiscalEntradaForm } from './features/notas-fiscais-entrada/nota-fiscal-entrada-form';
import { NotaFiscalEntradaView } from './features/notas-fiscais-entrada/nota-fiscal-entrada-view';
import { EquipamentosList } from './features/equipamentos/equipamentos-list';
import { EquipamentoBaixar } from './features/equipamentos/equipamento-baixar';
import { EquipamentoForm } from './features/equipamentos/equipamento-form';
import { EquipamentoAlocacoesList } from './features/equipamento-alocacoes/equipamento-alocacoes-list';
import { EquipamentoAlocacaoForm } from './features/equipamento-alocacoes/equipamento-alocacao-form';
import { EquipamentoAlocacaoEncerrar } from './features/equipamento-alocacoes/equipamento-alocacao-encerrar';
import { EquipamentoAlocacaoEditarEncerramento } from './features/equipamento-alocacoes/equipamento-alocacao-editar-encerramento';
import { RelatorioMensalLocacaoPage } from './features/relatorio-mensal-locacao/relatorio-mensal-locacao-page';
import { InventarioPage } from './features/inventario/inventario-page';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'definir-senha', component: DefinirSenha },
  {
    path: '',
    canActivateChild: [authGuard],
    children: [
      { path: '', component: DashboardPage, canActivate: [adminGuard] },
      { path: 'usuarios', component: UsuariosList, canActivate: [adminGuard] },
      { path: 'usuarios/novo', component: UsuarioForm, canActivate: [adminGuard] },
      { path: 'usuarios/:id/editar', component: UsuarioForm, canActivate: [adminGuard] },
      { path: 'usuarios/:id', component: UsuarioView, canActivate: [usuarioViewGuard] },
      { path: 'licencas', component: LicencasList, canActivate: [adminGuard] },
      { path: 'licencas/novo', component: LicencaForm, canActivate: [adminGuard] },
      { path: 'licencas/custo-mensal', component: LicencaCustoMensalPage, canActivate: [adminGuard] },
      { path: 'licencas/:id/editar', component: LicencaForm, canActivate: [adminGuard] },
      { path: 'licencas/:id/alterar-valor', component: LicencaAlterarValor, canActivate: [adminGuard] },
      { path: 'licencas/:id', component: LicencaView, canActivate: [adminGuard] },
      { path: 'movimentacoes', component: MovimentacoesList, canActivate: [adminGuard] },
      { path: 'movimentacoes/nova', component: MovimentacaoForm, canActivate: [adminGuard] },
      { path: 'movimentacoes/:id/encerrar', component: MovimentacaoEncerrar, canActivate: [adminGuard] },
      { path: 'movimentacoes/:id/editar', component: MovimentacaoEditarEncerramento, canActivate: [adminGuard] },
      { path: 'timeline', component: TimelinePage, canActivate: [adminGuard] },
      { path: 'equipamentos/tipos', component: TiposEquipamentoList, canActivate: [adminGuard] },
      { path: 'equipamentos/tipos/novo', component: TipoEquipamentoForm, canActivate: [adminGuard] },
      { path: 'equipamentos/tipos/:id/editar', component: TipoEquipamentoForm, canActivate: [adminGuard] },
      { path: 'equipamentos/notas-fiscais', component: NotasFiscaisEntradaList, canActivate: [adminGuard] },
      { path: 'equipamentos/notas-fiscais/novo', component: NotaFiscalEntradaForm, canActivate: [adminGuard] },
      { path: 'equipamentos/notas-fiscais/:id', component: NotaFiscalEntradaView, canActivate: [adminGuard] },
      { path: 'equipamentos/lista', component: EquipamentosList, canActivate: [adminGuard] },
      { path: 'equipamentos/lista/:id/editar', component: EquipamentoForm, canActivate: [adminGuard] },
      { path: 'equipamentos/lista/:id/baixar', component: EquipamentoBaixar, canActivate: [adminGuard] },
      { path: 'equipamentos/alocacoes', component: EquipamentoAlocacoesList, canActivate: [adminGuard] },
      { path: 'equipamentos/alocacoes/nova', component: EquipamentoAlocacaoForm, canActivate: [adminGuard] },
      { path: 'equipamentos/alocacoes/:id/encerrar', component: EquipamentoAlocacaoEncerrar, canActivate: [adminGuard] },
      {
        path: 'equipamentos/alocacoes/:id/editar',
        component: EquipamentoAlocacaoEditarEncerramento,
        canActivate: [adminGuard],
      },
      { path: 'equipamentos/relatorio-mensal', component: RelatorioMensalLocacaoPage, canActivate: [adminGuard] },
      { path: 'equipamentos/inventario', component: InventarioPage, canActivate: [adminGuard] },
    ],
  },
];
