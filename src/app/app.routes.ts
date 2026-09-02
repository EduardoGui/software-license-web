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
import { UsuarioPerfilForm } from './features/usuarios/usuario-perfil-form';
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
import { SetoresList } from './features/setores/setores-list';
import { SetorForm } from './features/setores/setor-form';
import { TiposDespesaList } from './features/tipos-despesa/tipos-despesa-list';
import { TipoDespesaForm } from './features/tipos-despesa/tipo-despesa-form';
import { ReembolsosDespesaList } from './features/reembolsos-despesa/reembolsos-despesa-list';
import { ReembolsoDespesaForm } from './features/reembolsos-despesa/reembolso-despesa-form';
import { ReembolsosDespesaPendentesList } from './features/reembolsos-despesa/reembolsos-despesa-pendentes-list';
import { ReembolsosDespesaAprovadosList } from './features/reembolsos-despesa/reembolsos-despesa-aprovados-list';
import { ReembolsoDespesaDecidir } from './features/reembolsos-despesa/reembolso-despesa-decidir';
import { ReembolsoDespesaAprovacaoDetalhe } from './features/reembolsos-despesa/reembolso-despesa-aprovacao-detalhe';
import { EmailsNotificacaoReembolsoList } from './features/emails-notificacao-reembolso/emails-notificacao-reembolso-list';
import { EmailNotificacaoReembolsoForm } from './features/emails-notificacao-reembolso/email-notificacao-reembolso-form';
import { LocaisList } from './features/locais/locais-list';
import { LocalForm } from './features/locais/local-form';
import { LogsAuditoriaList } from './features/logs-auditoria/logs-auditoria-list';
import { TiposPatrimonioList } from './features/tipos-patrimonio/tipos-patrimonio-list';
import { TipoPatrimonioForm } from './features/tipos-patrimonio/tipo-patrimonio-form';
import { PatrimonioItensList } from './features/patrimonio/patrimonio-itens-list';
import { PatrimonioItemForm } from './features/patrimonio/patrimonio-item-form';
import { EmpresasPjList } from './features/empresas-pj/empresas-pj-list';
import { EmpresaPjForm } from './features/empresas-pj/empresa-pj-form';
import { FornecedoresList } from './features/fornecedores/fornecedores-list';
import { FornecedorForm } from './features/fornecedores/fornecedor-form';
import { ContratosList } from './features/contratos/contratos-list';
import { ContratoForm } from './features/contratos/contrato-form';
import { ContratoView } from './features/contratos/contrato-view';
import { PlanoSaudeCustosPage } from './features/plano-saude-custos/plano-saude-custos-page';
import { PlanoSaudeRelatorioPage } from './features/plano-saude-relatorio/plano-saude-relatorio-page';
import { NotasDebitoPjList } from './features/notas-debito-pj/notas-debito-pj-list';
import { NotaDebitoPjForm } from './features/notas-debito-pj/nota-debito-pj-form';
import { NotaDebitoPjView } from './features/notas-debito-pj/nota-debito-pj-view';

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
      { path: 'usuarios/:id/perfil', component: UsuarioPerfilForm, canActivate: [usuarioViewGuard] },
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
      { path: 'patrimonio/tipos', component: TiposPatrimonioList, canActivate: [adminGuard] },
      { path: 'patrimonio/tipos/novo', component: TipoPatrimonioForm, canActivate: [adminGuard] },
      { path: 'patrimonio/tipos/:id/editar', component: TipoPatrimonioForm, canActivate: [adminGuard] },
      { path: 'patrimonio', component: PatrimonioItensList, canActivate: [adminGuard] },
      { path: 'patrimonio/:id/editar', component: PatrimonioItemForm, canActivate: [adminGuard] },
      { path: 'dp/setores', component: SetoresList, canActivate: [adminGuard] },
      { path: 'dp/setores/novo', component: SetorForm, canActivate: [adminGuard] },
      { path: 'dp/setores/:id/editar', component: SetorForm, canActivate: [adminGuard] },
      { path: 'dp/tipos-despesa', component: TiposDespesaList, canActivate: [adminGuard] },
      { path: 'dp/tipos-despesa/novo', component: TipoDespesaForm, canActivate: [adminGuard] },
      { path: 'dp/tipos-despesa/:id/editar', component: TipoDespesaForm, canActivate: [adminGuard] },
      { path: 'dp/emails-notificacao-reembolso', component: EmailsNotificacaoReembolsoList, canActivate: [adminGuard] },
      { path: 'dp/emails-notificacao-reembolso/novo', component: EmailNotificacaoReembolsoForm, canActivate: [adminGuard] },
      {
        path: 'dp/emails-notificacao-reembolso/:id/editar',
        component: EmailNotificacaoReembolsoForm,
        canActivate: [adminGuard],
      },
      { path: 'dp/logs-auditoria', component: LogsAuditoriaList, canActivate: [adminGuard] },
      { path: 'dp/locais', component: LocaisList, canActivate: [adminGuard] },
      { path: 'dp/locais/novo', component: LocalForm, canActivate: [adminGuard] },
      { path: 'dp/locais/:id/editar', component: LocalForm, canActivate: [adminGuard] },
      { path: 'dp/empresas-pj', component: EmpresasPjList, canActivate: [adminGuard] },
      { path: 'dp/empresas-pj/novo', component: EmpresaPjForm, canActivate: [adminGuard] },
      { path: 'dp/empresas-pj/:id/editar', component: EmpresaPjForm, canActivate: [adminGuard] },
      { path: 'dp/fornecedores', component: FornecedoresList, canActivate: [adminGuard] },
      { path: 'dp/fornecedores/novo', component: FornecedorForm, canActivate: [adminGuard] },
      { path: 'dp/fornecedores/:id/editar', component: FornecedorForm, canActivate: [adminGuard] },
      { path: 'dp/plano-saude/custos', component: PlanoSaudeCustosPage, canActivate: [adminGuard] },
      { path: 'dp/plano-saude/relatorio-mensal', component: PlanoSaudeRelatorioPage, canActivate: [adminGuard] },
      { path: 'dp/plano-saude/notas-debito', component: NotasDebitoPjList, canActivate: [adminGuard] },
      { path: 'dp/plano-saude/notas-debito/nova', component: NotaDebitoPjForm, canActivate: [adminGuard] },
      { path: 'dp/plano-saude/notas-debito/:id/editar', component: NotaDebitoPjForm, canActivate: [adminGuard] },
      { path: 'dp/plano-saude/notas-debito/:id', component: NotaDebitoPjView, canActivate: [adminGuard] },
      { path: 'reembolsos-despesa', component: ReembolsosDespesaList },
      { path: 'reembolsos-despesa/novo', component: ReembolsoDespesaForm },
      { path: 'reembolsos-despesa/pendentes', component: ReembolsosDespesaPendentesList },
      { path: 'reembolsos-despesa/aprovados-por-mim', component: ReembolsosDespesaAprovadosList },
      { path: 'reembolsos-despesa/:id/detalhe', component: ReembolsoDespesaAprovacaoDetalhe },
      { path: 'reembolsos-despesa/:id/editar', component: ReembolsoDespesaForm },
      { path: 'reembolsos-despesa/:id/devolver', component: ReembolsoDespesaDecidir, data: { acao: 'devolver' } },
      { path: 'reembolsos-despesa/:id/reprovar', component: ReembolsoDespesaDecidir, data: { acao: 'reprovar' } },
      { path: 'contratos', component: ContratosList, canActivate: [adminGuard] },
      { path: 'contratos/novo', component: ContratoForm, canActivate: [adminGuard] },
      { path: 'contratos/:id', component: ContratoView, canActivate: [adminGuard] },
    ],
  },
];
