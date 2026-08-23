export interface TipoPatrimonio {
  id: number;
  nome: string;
  ativo: boolean;
  dataCriacao: string;
  dataAtualizacao: string;
}

export interface TipoPatrimonioPayload {
  nome: string;
  ativo: boolean;
}

export interface TipoPatrimonioFiltro {
  nome?: string;
  ativo?: boolean;
}
