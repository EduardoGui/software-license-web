export type RecessoCorporativoStatus = 'Rascunho' | 'Confirmado' | 'Cancelado';
export type RecessoColaboradorSituacao = 'Normal' | 'SaldoInsuficiente';

export interface RecessoColaborador {
  id: number;
  usuarioId: number;
  usuarioNome: string;
  periodoFeriasId: number;
  saldoAnterior: number;
  diasAbatidos: number;
  saldoPosterior: number;
  situacao: RecessoColaboradorSituacao;
  dataCriacao: string;
}

export interface RecessoCorporativo {
  id: number;
  nome: string;
  dataInicio: string;
  dataFim: string;
  diasCorridos: number;
  diasADescontar: number;
  status: RecessoCorporativoStatus;
  colaboradores: RecessoColaborador[];
  dataCriacao: string;
  dataAtualizacao: string;
}

export interface CreateRecessoCorporativoPayload {
  nome: string;
  dataInicio: string;
  dataFim: string;
}

export interface UpdateRecessoCorporativoPayload {
  nome: string;
  dataInicio: string;
  dataFim: string;
  diasADescontar: number;
}

export interface RecessoSimulacaoLinha {
  usuarioId: number;
  usuarioNome: string;
  periodoFeriasId: number | null;
  saldoAnterior: number;
  diasAbatidos: number;
  saldoPosterior: number;
  situacao: RecessoColaboradorSituacao;
}

export const ROTULOS_STATUS_RECESSO: Record<RecessoCorporativoStatus, string> = {
  Rascunho: 'Rascunho',
  Confirmado: 'Confirmado',
  Cancelado: 'Cancelado',
};
