export interface TimelineLicencaItem {
  movimentacaoId: number;
  licencaId: number;
  licencaNome: string;
  dataInicio: string;
  dataFim: string | null;
  status: 'Em uso' | 'Encerrado';
  observacao: string | null;
}

export interface TimelineUsuario {
  usuarioId: number;
  usuarioNome: string;
  dataInicio: string;
  dataFim: string | null;
  status: 'Agendado' | 'Ativo' | 'Inativo';
  licencas: TimelineLicencaItem[];
}

export interface TimelineFiltro {
  usuarioId?: number;
  licencaId?: number;
  status?: string;
  dataInicial?: string;
  dataFinal?: string;
}
