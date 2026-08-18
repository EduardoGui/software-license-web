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
import { MovimentacaoEditarEncerramento } from './features/movimentacoes/movimentacao-editar-encerramento';
import { TimelinePage } from './features/timeline/timeline-page';
import { TiposEquipamentoList } from './features/tipos-equipamento/tipos-equipamento-list';
import { TipoEquipamentoForm } from './features/tipos-equipamento/tipo-equipamento-form';
import { NotasFiscaisEntradaList } from './features/notas-fiscais-entrada/notas-fiscais-entrada-list';
import { NotaFiscalEntradaForm } from './features/notas-fiscais-entrada/nota-fiscal-entrada-form';
import { NotaFiscalEntradaView } from './features/notas-fiscais-entrada/nota-fiscal-entrada-view';
import { EquipamentosList } from './features/equipamentos/equipamentos-list';
import { EquipamentoForm } from './features/equipamentos/equipamento-form';
import { EquipamentoAlocacoesList } from './features/equipamento-alocacoes/equipamento-alocacoes-list';
import { EquipamentoAlocacaoForm } from './features/equipamento-alocacoes/equipamento-alocacao-form';
import { EquipamentoAlocacaoEncerrar } from './features/equipamento-alocacoes/equipamento-alocacao-encerrar';
import { EquipamentoAlocacaoEditarEncerramento } from './features/equipamento-alocacoes/equipamento-alocacao-editar-encerramento';
import { RelatorioMensalLocacaoPage } from './features/relatorio-mensal-locacao/relatorio-mensal-locacao-page';
import { InventarioPage } from './features/inventario/inventario-page';

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
      { path: 'movimentacoes/:id/editar', component: MovimentacaoEditarEncerramento },
      { path: 'timeline', component: TimelinePage },
      { path: 'equipamentos/tipos', component: TiposEquipamentoList },
      { path: 'equipamentos/tipos/novo', component: TipoEquipamentoForm },
      { path: 'equipamentos/tipos/:id/editar', component: TipoEquipamentoForm },
      { path: 'equipamentos/notas-fiscais', component: NotasFiscaisEntradaList },
      { path: 'equipamentos/notas-fiscais/novo', component: NotaFiscalEntradaForm },
      { path: 'equipamentos/notas-fiscais/:id', component: NotaFiscalEntradaView },
      { path: 'equipamentos/lista', component: EquipamentosList },
      { path: 'equipamentos/lista/:id/editar', component: EquipamentoForm },
      { path: 'equipamentos/alocacoes', component: EquipamentoAlocacoesList },
      { path: 'equipamentos/alocacoes/nova', component: EquipamentoAlocacaoForm },
      { path: 'equipamentos/alocacoes/:id/encerrar', component: EquipamentoAlocacaoEncerrar },
      { path: 'equipamentos/alocacoes/:id/editar', component: EquipamentoAlocacaoEditarEncerramento },
      { path: 'equipamentos/relatorio-mensal', component: RelatorioMensalLocacaoPage },
      { path: 'equipamentos/inventario', component: InventarioPage },
    ],
  },
];
