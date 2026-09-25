export interface FaturaOperadoraSaude {
  id: number;
  operadoraSaude: string;
  numeroFatura: string;
  ano: number;
  mes: number;
  dataEmissao: string | null;
  dataVencimento: string | null;
  valorTotal: number | null;
  observacao: string | null;
  quantidadeNotasDebito: number;
  valorTotalNotasDebito: number;
  dataCriacao: string;
  dataAtualizacao: string;
}

export interface CreateFaturaOperadoraSaudePayload {
  operadoraSaude: string;
  numeroFatura: string;
  ano: number;
  mes: number;
  dataEmissao: string | null;
  dataVencimento: string | null;
  valorTotal: number | null;
  observacao: string | null;
}

export type UpdateFaturaOperadoraSaudePayload = Omit<CreateFaturaOperadoraSaudePayload, 'operadoraSaude'>;

export interface FaturaOperadoraSaudeFiltro {
  ano?: number;
  mes?: number;
  operadoraSaude?: string;
}
