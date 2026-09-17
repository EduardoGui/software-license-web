export interface UnidadeOrcamentaria {
  id: number;
  setorId: number;
  setorNome: string;
  codigo: string;
  descricao: string;
  apropriacao: string | null;
  ativa: boolean;
  dataCriacao: string;
  dataAtualizacao: string;
}

export interface UnidadeOrcamentariaPayload {
  setorId: number;
  codigo: string;
  descricao: string;
  apropriacao: string | null;
  ativa: boolean;
}

export interface UnidadeOrcamentariaFiltro {
  setorId?: number;
  codigo?: string;
  descricao?: string;
  ativa?: boolean;
}
