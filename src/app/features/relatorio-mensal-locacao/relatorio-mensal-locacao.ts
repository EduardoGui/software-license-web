export interface RelatorioMensalLocacaoItem {
  equipamentoId: number;
  tipoEquipamentoNome: string;
  patrimonio: string | null;
  numeroSerie: string | null;
  fornecedorNome: string | null;
  valorMensal: number;
  diasAtivos: number;
  diasNoMes: number;
  valorNoMes: number;
}

export interface RelatorioMensalLocacao {
  ano: number;
  mes: number;
  itens: RelatorioMensalLocacaoItem[];
  totalGeral: number;
}

export interface RelatorioMensalLocacaoFiltro {
  ano: number;
  mes: number;
  fornecedorNome?: string;
  tipoEquipamentoId?: number;
}
