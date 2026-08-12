export interface Licenca {
  id: number;
  nome: string;
  descricao: string | null;
  quantidadeTotal: number;
  quantidadeEmUso: number;
  quantidadeDisponivel: number;
  dataInicio: string;
  dataTerminoPrevisto: string;
  diasAntecedenciaAviso: number;
  observacao: string | null;
  ativa: boolean;
  status: 'Ativa' | 'Inativa';
  dataCriacao: string;
  dataAtualizacao: string;
}

export interface LicencaPayload {
  nome: string;
  descricao: string | null;
  quantidadeTotal: number;
  dataInicio: string;
  dataTerminoPrevisto: string;
  diasAntecedenciaAviso: number;
  observacao: string | null;
  ativa: boolean;
}

export interface LicencaFiltro {
  nome?: string;
  status?: string;
  vencimentoAte?: string;
}
