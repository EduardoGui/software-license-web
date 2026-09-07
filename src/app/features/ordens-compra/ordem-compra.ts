export type OrdemCompraStatus = 'Rascunho' | 'Emitida' | 'Assinada' | 'Cancelada';

export interface OrdemCompra {
  id: number;
  numero: number;
  data: string;
  solicitante: string;
  localId: number;
  localNome: string;
  fornecedorId: number;
  fornecedorNome: string;
  condicaoPagamento: string;
  status: OrdemCompraStatus;
  valorTotal: number;
  quantidadeItens: number;
  dataCriacao: string;
  dataAtualizacao: string;
}

export interface OrdemCompraItem {
  id: number;
  ordemCompraId: number;
  codigo: string | null;
  descricao: string;
  unidade: string;
  marcaReferencia: string | null;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
}

export interface OrdemCompraDetalhe {
  id: number;
  numero: number;
  data: string;
  solicitante: string;
  localId: number;
  localNome: string;
  fornecedorId: number;
  fornecedorNome: string;
  condicaoPagamento: string;
  tipoFrete: string | null;
  valorFrete: number;
  localEntrega: string | null;
  prazoEntrega: string | null;
  observacoesSolicitante: string | null;
  observacoesFornecedor: string | null;
  status: OrdemCompraStatus;
  valorTotal: number;
  dataCriacao: string;
  dataAtualizacao: string;
  itens: OrdemCompraItem[];
}

export interface CreateOrdemCompraItemPayload {
  codigo: string | null;
  descricao: string;
  unidade: string;
  marcaReferencia: string | null;
  quantidade: number;
  valorUnitario: number;
}

export interface CreateOrdemCompraPayload {
  data: string;
  solicitante: string;
  localId: number | null;
  fornecedorId: number | null;
  condicaoPagamento: string;
  tipoFrete: string | null;
  valorFrete: number;
  localEntrega: string | null;
  prazoEntrega: string | null;
  observacoesSolicitante: string | null;
  observacoesFornecedor: string | null;
  itens: CreateOrdemCompraItemPayload[];
}

export type UpdateOrdemCompraPayload = CreateOrdemCompraPayload;

export interface OrdemCompraFiltro {
  numero?: number;
  fornecedorId?: number;
  localId?: number;
  status?: string;
}
