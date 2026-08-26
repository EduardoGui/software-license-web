export type LicencaPeriodicidade = 'Mensal' | 'Anual';

export interface Licenca {
  id: number;
  nome: string;
  tipo: string | null;
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
  valorVigente: number | null;
  periodicidade: LicencaPeriodicidade | null;
  notaFiscalEntradaId: number | null;
  numeroNotaFiscal: string | null;
  dataCriacao: string;
  dataAtualizacao: string;
}

export interface LicencaPayload {
  nome: string;
  tipo: string | null;
  descricao: string | null;
  quantidadeTotal: number;
  dataInicio: string;
  dataTerminoPrevisto: string;
  diasAntecedenciaAviso: number;
  observacao: string | null;
  ativa: boolean;
  notaFiscalEntradaId: number | null;
}

export interface CreateLicencaPayload extends LicencaPayload {
  valor: number;
  periodicidade: LicencaPeriodicidade;
}

export interface LicencaFiltro {
  nome?: string;
  status?: string;
  vencimentoAte?: string;
}

export interface LicencaValor {
  id: number;
  valor: number;
  periodicidade: LicencaPeriodicidade;
  dataVigenciaInicio: string;
  dataCriacao: string;
}

export interface LicencaValorPayload {
  valor: number;
  periodicidade: LicencaPeriodicidade;
  dataVigenciaInicio: string;
}
