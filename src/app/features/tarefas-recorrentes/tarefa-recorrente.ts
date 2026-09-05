export interface TarefaRecorrente {
  id: number;
  titulo: string;
  diaDoMes: number;
  observacao: string | null;
  ativa: boolean;
  dataCriacao: string;
  dataAtualizacao: string;
}

export interface CreateTarefaRecorrentePayload {
  titulo: string;
  diaDoMes: number;
  observacao: string | null;
  ativa: boolean;
}

export interface UpdateTarefaRecorrentePayload {
  titulo: string;
  diaDoMes: number;
  observacao: string | null;
  ativa: boolean;
}

export interface TarefaRecorrenteFiltro {
  titulo?: string;
  ativa?: boolean;
}
