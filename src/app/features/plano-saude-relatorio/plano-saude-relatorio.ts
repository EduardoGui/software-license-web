export interface RelatorioMensalPlanoSaudeItem {
  usuarioId: number;
  nome: string;
  setorNome: string | null;
  empresaPjNome: string | null;
  valorTotal: number;
}

export interface RelatorioMensalPlanoSaude {
  ano: number;
  mes: number;
  itens: RelatorioMensalPlanoSaudeItem[];
  valorTotal: number;
}

export interface RelatorioMensalPlanoSaudeFiltro {
  ano: number;
  mes: number;
  nome?: string;
}
