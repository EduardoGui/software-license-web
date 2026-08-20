export interface ReembolsoDespesaItem {
  id: number;
  data: string;
  tipoDespesaId: number;
  tipoDespesaNome: string;
  descricao: string | null;
  numeroDocumento: string | null;
  valor: number;
}

export interface ReembolsoDespesa {
  id: number;
  numero: string;
  usuarioId: number;
  usuarioNome: string;
  setorId: number | null;
  setorNome: string | null;
  localId: number | null;
  localNome: string | null;
  dataSolicitacao: string;
  finalidade: string;
  formaPagamento: string | null;
  status: 'Rascunho' | 'EnviadoParaAprovacao' | 'DevolvidoParaRevisao' | 'Aprovado' | 'Reprovado';
  aprovadorId: number | null;
  aprovadorNome: string | null;
  observacaoAprovador: string | null;
  dataDecisao: string | null;
  observacao: string | null;
  itens: ReembolsoDespesaItem[];
  valorTotal: number;
  dataCriacao: string;
  dataAtualizacao: string;
}

export interface ReembolsoDespesaItemPayload {
  data: string;
  tipoDespesaId: number | null;
  descricao: string | null;
  numeroDocumento: string | null;
  valor: number;
}

export interface ReembolsoDespesaPayload {
  finalidade: string;
  formaPagamento: string | null;
  localId: number | null;
  observacao: string | null;
  itens: ReembolsoDespesaItemPayload[];
}

export interface ReembolsoDespesaFiltro {
  usuarioId?: number;
  status?: string;
}
