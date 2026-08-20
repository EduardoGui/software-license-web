export interface TipoDespesa {
  id: number;
  nome: string;
  ativo: boolean;
  dataCriacao: string;
  dataAtualizacao: string;
}

export interface TipoDespesaPayload {
  nome: string;
  ativo: boolean;
}

export interface TipoDespesaFiltro {
  nome?: string;
  ativo?: boolean;
}
