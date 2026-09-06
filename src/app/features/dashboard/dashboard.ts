export interface EquipamentoContagemPorTipo {
  tipoEquipamentoNome: string;
  quantidade: number;
}

export interface LicencaContagemPorNome {
  nome: string;
  quantidade: number;
}

export type PendenciaOrigem = 'Tarefa' | 'Licença' | 'Equipamento' | 'Medição';

export interface Pendencia {
  origem: PendenciaOrigem;
  titulo: string;
  observacao: string | null;
  data: string;
  diasParaVencer: number;
  tarefaOcorrenciaId: number | null;
  licencaId: number | null;
  equipamentoId: number | null;
  contratoId: number | null;
}

export interface DashboardData {
  usuariosAtivos: number;
  licencasEmUsoPorNome: LicencaContagemPorNome[];
  licencasDisponiveisPorNome: LicencaContagemPorNome[];
  equipamentosEmUsoPorTipo: EquipamentoContagemPorTipo[];
  equipamentosDisponiveisPorTipo: EquipamentoContagemPorTipo[];
  equipamentosLocadosAtivosPorTipo: EquipamentoContagemPorTipo[];
  custoMensalLocacaoAtual: number;
  pendencias: Pendencia[];
}
