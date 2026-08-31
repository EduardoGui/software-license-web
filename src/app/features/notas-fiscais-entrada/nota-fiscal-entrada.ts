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
  destino: 'Equipamento' | 'Patrimonio';
  tipoEquipamentoId: number | null;
  tipoEquipamentoNome: string | null;
  tipoPatrimonioId: number | null;
  tipoPatrimonioNome: string | null;
  localId: number | null;
  localNome: string | null;
  descricao: string | null;
  quantidade: number;
  valorUnitario: number | null;
  origem: 'Locado' | 'Comprado' | null;
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
  fornecedorId: number | null;
  observacao: string | null;
}

export interface NotaFiscalItemPayload {
  destino: 'Equipamento' | 'Patrimonio';
  tipoEquipamentoId: number | null;
  tipoPatrimonioId: number | null;
  localId: number | null;
  descricao: string | null;
  quantidade: number;
  valorUnitario: number | null;
  origem: 'Locado' | 'Comprado' | null;
}

export interface NotaFiscalEntradaFiltro {
  numero?: string;
  fornecedorId?: number;
}
