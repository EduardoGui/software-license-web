export type ProgramacaoFeriasStatus = 'Rascunho' | 'Solicitada' | 'Aprovada' | 'Reprovada' | 'Cancelada';
export type ProgramacaoFeriasStatusEfetivo = ProgramacaoFeriasStatus | 'EmGozo' | 'Concluida';

export interface ProgramacaoFerias {
  id: number;
  periodoFeriasId: number;
  usuarioId: number;
  usuarioNome: string;
  sequencia: number;
  dataInicio: string;
  dataFim: string;
  quantidadeDias: number;
  status: ProgramacaoFeriasStatus;
  statusEfetivo: ProgramacaoFeriasStatusEfetivo;
  solicitanteId: number | null;
  solicitanteNome: string | null;
  dataSolicitacao: string | null;
  aprovadorId: number | null;
  aprovadorNome: string | null;
  dataDecisao: string | null;
  observacaoAprovador: string | null;
  observacao: string | null;
  adiantamentoDecimoTerceiro: boolean;
  abonoPecuniario: boolean;
  diasAbono: number;
  dataCriacao: string;
  dataAtualizacao: string;
}

export interface CreateProgramacaoFeriasPayload {
  dataInicio: string;
  quantidadeDias: number;
  observacao?: string;
  adiantamentoDecimoTerceiro: boolean;
  abonoPecuniario: boolean;
  diasAbono: number;
}

export interface DecisaoProgramacaoFeriasPayload {
  observacaoAprovador: string;
}

export const ROTULOS_STATUS_PROGRAMACAO: Record<ProgramacaoFeriasStatusEfetivo, string> = {
  Rascunho: 'Rascunho',
  Solicitada: 'Solicitada',
  Aprovada: 'Aprovada',
  Reprovada: 'Reprovada',
  Cancelada: 'Cancelada',
  EmGozo: 'Em gozo',
  Concluida: 'Concluída',
};
