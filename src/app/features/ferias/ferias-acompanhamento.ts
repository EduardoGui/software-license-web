export type FeriasAcompanhamentoSituacaoFiltro =
  | 'EmFeriasAgora'
  | 'SaemEm60Dias'
  | 'SemProgramar'
  | 'Prazo'
  | 'SaldoNegativo'
  | 'AguardandoAprovacao'
  | 'SemPeriodo';

export interface FeriasAcompanhamentoFiltro {
  nome?: string;
  setorId?: number | null;
  situacao?: FeriasAcompanhamentoSituacaoFiltro | '';
}

export interface FeriasAcompanhamentoResumo {
  total: number;
  emFeriasAgora: number;
  saemEm60Dias: number;
  semProgramar: number;
  prazo: number;
  saldoNegativo: number;
  aguardandoAprovacao: number;
  semPeriodo: number;
}

export interface FeriasAcompanhamentoLinha {
  usuarioId: number;
  usuarioNome: string;
  setorNome: string | null;
  tipo: string;
  periodoFeriasId: number | null;
  fimConcessivo: string | null;
  diasParaVencer: number | null;
  direito: number;
  tirou: number;
  marcado: number;
  recesso: number;
  aSaldo: number;
  feriasInicio: string | null;
  feriasFim: string | null;
  emFeriasAgora: boolean;
  aguardandoAprovacao: boolean;
  mesesSemFerias: number;
  situacao: string;
  situacaoDetalhe: string;
}

export interface FeriasAcompanhamento {
  mesesMeta: number;
  resumo: FeriasAcompanhamentoResumo;
  linhas: FeriasAcompanhamentoLinha[];
}

export const ROTULOS_SITUACAO: Record<string, string> = {
  SemPeriodo: 'Sem período gerado',
  SaldoNegativo: 'Saldo negativo',
  Vencido: 'Prazo vencido',
  VenceEmBreve: 'Prazo vencendo',
  SemProgramar: 'Sem programar',
  AguardandoAprovacao: 'Aguardando aprovação',
  EmFerias: 'Em férias agora',
  ProximasFerias: 'Férias marcadas',
  SemNadaMarcado: 'Sem nada marcado',
  EmDia: 'Em dia',
};

// Cor do selo: vermelho = precisa de ação já; âmbar = atenção; verde-azulado = férias acontecendo/marcadas; cinza = ok.
export const CLASSES_SITUACAO: Record<string, string> = {
  SemPeriodo: 'selo--atencao',
  SaldoNegativo: 'selo--urgente',
  Vencido: 'selo--urgente',
  VenceEmBreve: 'selo--urgente',
  SemProgramar: 'selo--urgente',
  AguardandoAprovacao: 'selo--atencao',
  EmFerias: 'selo--ferias',
  ProximasFerias: 'selo--ferias',
  SemNadaMarcado: 'selo--atencao',
  EmDia: 'selo--ok',
};
