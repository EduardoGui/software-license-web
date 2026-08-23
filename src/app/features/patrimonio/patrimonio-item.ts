export type PatrimonioItemStatus = 'Ativo' | 'Baixado';

export interface PatrimonioItem {
  id: number;
  notaFiscalItemId: number;
  notaFiscalEntradaId: number | null;
  numeroNotaFiscal: string | null;
  tipoPatrimonioId: number;
  tipoPatrimonioNome: string;
  descricao: string | null;
  numeroPatrimonio: string | null;
  localId: number | null;
  localNome: string | null;
  status: PatrimonioItemStatus;
  observacao: string | null;
  dataCriacao: string;
  dataAtualizacao: string;
}

export interface PatrimonioItemPayload {
  descricao: string | null;
  numeroPatrimonio: string | null;
  localId: number | null;
  observacao: string | null;
}

export interface PatrimonioItemFiltro {
  tipoPatrimonioId?: number;
  localId?: number;
  status?: string;
  notaFiscalEntradaId?: number;
}
