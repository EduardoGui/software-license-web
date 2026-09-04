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

export interface EquipamentoContagemPorTipo {
  tipoEquipamentoNome: string;
  quantidade: number;
}

export interface LicencaContagemPorNome {
  nome: string;
  quantidade: number;
}

export interface AlertaMedicao {
  contratoId: number;
  contratoNumero: string;
  fornecedorNome: string;
  periodoFim: string;
  diasParaVencer: number;
}

export interface DashboardData {
  usuariosAtivos: number;
  licencasAdquiridas: number;
  licencasEmUso: number;
  licencasDisponiveis: number;
  proximosVencimentos: Vencimento[];
  licencasEmUsoPorNome: LicencaContagemPorNome[];
  licencasDisponiveisPorNome: LicencaContagemPorNome[];
  equipamentosEmUsoPorTipo: EquipamentoContagemPorTipo[];
  equipamentosDisponiveisPorTipo: EquipamentoContagemPorTipo[];
  equipamentosLocadosAtivosPorTipo: EquipamentoContagemPorTipo[];
  custoMensalLocacaoAtual: number;
  proximosVencimentosContratos: VencimentoContrato[];
  alertasMedicao: AlertaMedicao[];
}
