export type TarefaOcorrenciaStatus = 'Pendente' | 'Concluida';

export interface TarefaOcorrencia {
  id: number;
  tarefaRecorrenteId: number;
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
