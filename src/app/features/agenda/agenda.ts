export type TarefaOcorrenciaStatus = 'Pendente' | 'Concluida';

export interface TarefaOcorrencia {
  id: number;
  tarefaRecorrenteId: number | null;
  titulo: string;
  dataPrevistaOriginal: string;
  dataPrevistaAtual: string;
  status: TarefaOcorrenciaStatus;
  dataConclusao: string | null;
  observacao: string | null;
  diasParaVencer: number;
}

export interface AdiarTarefaOcorrenciaPayload {
  novaData: string;
  observacao: string | null;
}

export interface CreateTarefaUnicaPayload {
  titulo: string;
  data: string;
  observacao: string | null;
}
