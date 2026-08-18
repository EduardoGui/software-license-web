export interface Movimentacao {
  id: number;
  usuarioId: number;
  usuarioNome: string;
  licencaId: number;
  licencaNome: string;
  dataInicio: string;
  dataFim: string | null;
  observacao: string | null;
  status: 'Em uso' | 'Encerrado';
  dataCriacao: string;
  dataAtualizacao: string;
}

export interface MovimentacaoPayload {
  usuarioId: number;
  licencaId: number;
  dataInicio: string;
  observacao: string | null;
}

export interface EncerrarMovimentacaoPayload {
  dataFim: string;
  observacao: string | null;
}

export interface EditarMovimentacaoEncerradaPayload {
  dataFim: string | null;
  observacao: string | null;
}

export interface MovimentacaoFiltro {
  usuarioId?: number;
  licencaId?: number;
  dataInicial?: string;
  dataFinal?: string;
  status?: string;
  pagina?: number;
  tamanhoPagina?: number;
}

export interface PaginaMovimentacoes {
  itens: Movimentacao[];
  totalRegistros: number;
  pagina: number;
  tamanhoPagina: number;
}
