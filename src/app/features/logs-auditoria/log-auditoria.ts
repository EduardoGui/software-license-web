export interface LogAuditoria {
  id: number;
  dataHora: string;
  usuarioId: number | null;
  usuarioNome: string;
  entidade: string;
  entidadeId: number;
  acao: string;
  detalhe: string | null;
}

export interface LogAuditoriaFiltro {
  dataInicial?: string;
  dataFinal?: string;
  entidade?: string;
  usuarioId?: number;
}
