export interface Vencimento {
  licencaId: number;
  nome: string;
  dataTerminoPrevisto: string;
  diasParaVencer: number;
}

export interface VencimentoContrato {
  equipamentoId: number;
  descricao: string;
  dataFimContrato: string;
  diasParaVencer: number;
}

export interface DashboardData {
  usuariosAtivos: number;
  licencasAdquiridas: number;
  licencasEmUso: number;
  licencasDisponiveis: number;
  proximosVencimentos: Vencimento[];
  equipamentosEmUso: number;
  equipamentosDisponiveis: number;
  equipamentosLocadosAtivos: number;
  custoMensalLocacaoAtual: number;
  proximosVencimentosContratos: VencimentoContrato[];
}
