export interface NotaFiscalEntrada {
  id: number;
  numero: string;
  dataEntrada: string;
  fornecedorNome: string | null;
  observacao: string | null;
  quantidadeItens: number;
  dataCriacao: string;
  dataAtualizacao: string;
}

export interface NotaFiscalItem {
  id: number;
  notaFiscalEntradaId: number;
  tipoEquipamentoId: number;
  tipoEquipamentoNome: string;
  descricao: string | null;
  quantidade: number;
  valorUnitario: number | null;
  origem: 'Locado' | 'Comprado';
  dataCriacao: string;
}

export interface NotaFiscalEntradaDetalhe {
  id: number;
  numero: string;
  dataEntrada: string;
  fornecedorNome: string | null;
  observacao: string | null;
  dataCriacao: string;
  dataAtualizacao: string;
  itens: NotaFiscalItem[];
}

export interface NotaFiscalEntradaPayload {
  numero: string;
  dataEntrada: string;
  fornecedorNome: string | null;
  observacao: string | null;
}

export interface NotaFiscalItemPayload {
  tipoEquipamentoId: number;
  descricao: string | null;
  quantidade: number;
  valorUnitario: number | null;
  origem: 'Locado' | 'Comprado';
}

export interface NotaFiscalEntradaFiltro {
  numero?: string;
  fornecedorNome?: string;
}
