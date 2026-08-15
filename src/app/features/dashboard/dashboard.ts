export interface Vencimento {
  licencaId: number;
  nome: string;
  dataTerminoPrevisto: string;
  diasParaVencer: number;
}

export interface DashboardData {
  usuariosAtivos: number;
  licencasAdquiridas: number;
  licencasEmUso: number;
  licencasDisponiveis: number;
  proximosVencimentos: Vencimento[];
}
