export type EquipamentoOrigem = 'Locado' | 'Comprado';
export type EquipamentoStatus = 'Disponivel' | 'EmUso' | 'Manutencao' | 'Baixado';

export interface Equipamento {
  id: number;
  tipoEquipamentoId: number;
  tipoEquipamentoNome: string;
  notaFiscalItemId: number | null;
  notaFiscalEntradaId: number | null;
  numeroNotaFiscal: string | null;
  marca: string | null;
  modelo: string | null;
  numeroSerie: string | null;
  patrimonio: string | null;
  origem: EquipamentoOrigem;
  fornecedorNome: string | null;
  valorMensal: number | null;
  dataInicioContrato: string | null;
  dataFimContrato: string | null;
  status: EquipamentoStatus;
  dataBaixa: string | null;
  observacao: string | null;
  usuarioAtualId: number | null;
  usuarioAtualNome: string | null;
  dataCriacao: string;
  dataAtualizacao: string;
}

export interface EquipamentoPayload {
  marca: string | null;
  modelo: string | null;
  numeroSerie: string | null;
  patrimonio: string | null;
  fornecedorNome: string | null;
  valorMensal: number | null;
  dataFimContrato: string | null;
  status: 'Disponivel' | 'Manutencao';
  observacao: string | null;
}

export interface EquipamentoFiltro {
  tipoEquipamentoId?: number;
  origem?: string;
  status?: string;
  usuarioId?: number;
  notaFiscalEntradaId?: number;
}
