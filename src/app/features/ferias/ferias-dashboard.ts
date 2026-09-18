import { ProgramacaoFerias } from './programacao-ferias';

export interface ConcessivoVencendo {
  usuarioId: number;
  usuarioNome: string;
  periodoFeriasId: number;
  fimConcessivo: string;
  saldoDisponivel: number;
  diasParaVencer: number;
}

export interface FeriasDashboard {
  colaboradoresPj: number;
  colaboradoresSemPeriodoGerado: number;
  saldoTotalDisponivel: number;
  programacoesPendentesAprovacao: number;
  programacoesEmGozoHoje: number;
  recessosConfirmadosAnoAtual: number;
  concessivosProximosDoVencimento: ConcessivoVencendo[];
  filaAprovacao: ProgramacaoFerias[];
}
