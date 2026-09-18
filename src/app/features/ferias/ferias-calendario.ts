export type FeriasCalendarioEventoTipo = 'Programacao' | 'Recesso';

export interface FeriasCalendarioEvento {
  tipo: FeriasCalendarioEventoTipo;
  dataInicio: string;
  dataFim: string;
  descricao: string;
}

export interface FeriasCalendarioUsuario {
  usuarioId: number;
  usuarioNome: string;
  eventos: FeriasCalendarioEvento[];
}

export interface FeriasCalendarioFiltro {
  de?: string;
  ate?: string;
  setorId?: number;
  usuarioId?: number;
}
