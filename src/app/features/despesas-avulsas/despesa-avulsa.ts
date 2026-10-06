export type DespesaAvulsaCategoria =
  | 'Serviços'
  | 'Equipamentos'
  | 'Materiais'
  | 'Licenças'
  | 'Seguros'
  | 'Viagem/Hospedagem'
  | 'Plano de Saúde'
  | 'Estacionamento'
  | 'Outros';

export interface DespesaAvulsaRateioUa {
  unidadeOrcamentariaId: number;
  unidadeOrcamentariaCodigo: string;
  unidadeOrcamentariaDescricao: string;
  valor: number;
}

export interface DespesaAvulsa {
  id: number;
  fornecedorId: number;
  fornecedorNome: string;
  categoria: DespesaAvulsaCategoria;
  descricao: string;
  numeroNf: string | null;
  dataEmissao: string | null;
  vencimento: string | null;
  valor: number;
  recorrente: boolean;
  observacoes: string | null;
  dataCriacao: string;
  dataAtualizacao: string;
  rateioUa: DespesaAvulsaRateioUa[];
}

export interface CreateDespesaAvulsaPayload {
  fornecedorId: number | null;
  categoria: DespesaAvulsaCategoria | '';
  descricao: string;
  numeroNf: string | null;
  dataEmissao: string | null;
  vencimento: string | null;
  valor: number;
  recorrente: boolean;
  observacoes: string | null;
}

export type UpdateDespesaAvulsaPayload = CreateDespesaAvulsaPayload;

export interface DespesaAvulsaFiltro {
  fornecedorId?: number;
  categoria?: string;
  recorrente?: boolean;
  dataEmissaoDe?: string;
  dataEmissaoAte?: string;
}
