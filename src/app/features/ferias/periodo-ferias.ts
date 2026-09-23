export interface PeriodoFerias {
  id: number;
  usuarioId: number;
  usuarioNome: string;
  inicioAquisitivo: string;
  fimAquisitivo: string;
  inicioConcessivo: string;
  fimConcessivo: string;
  diasDireito: number;
  aquisitivoFechado: boolean;
  direitoAdquirido: number;
  projecaoProporcional: number;
  antecipado: number;
  comprometido: number;
  consumido: number;
  saldoDisponivel: number;
  aquisicaoMaterializada: boolean;
  dataCriacao: string;
  dataAtualizacao: string;
}

export interface PeriodoFeriasFiltro {
  usuarioId?: number;
}

export type MovimentacaoSaldoFeriasTipo = 'Aquisicao' | 'AjusteManual' | 'ProgramacaoFerias' | 'AbonoPecuniario' | 'Recesso';

export interface MovimentacaoSaldoFerias {
  id: number;
  tipo: MovimentacaoSaldoFeriasTipo;
  quantidade: number;
  data: string;
  usuarioResponsavelId: number | null;
  usuarioResponsavelNome: string;
  observacao: string | null;
  anulada: boolean;
  dataCriacao: string;
}

export interface AjusteManualSaldoFeriasPayload {
  quantidade: number;
  observacao: string;
}

export const ROTULOS_TIPO_MOVIMENTACAO: Record<MovimentacaoSaldoFeriasTipo, string> = {
  Aquisicao: 'Aquisição',
  AjusteManual: 'Ajuste manual',
  ProgramacaoFerias: 'Programação de férias',
  AbonoPecuniario: 'Abono pecuniário',
  Recesso: 'Recesso corporativo',
};
