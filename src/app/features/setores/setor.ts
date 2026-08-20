export interface SetorAprovador {
  id: number;
  usuarioId: number;
  usuarioNome: string;
}

export interface Setor {
  id: number;
  nome: string;
  ativo: boolean;
  aprovadores: SetorAprovador[];
  dataCriacao: string;
  dataAtualizacao: string;
}

export interface SetorPayload {
  nome: string;
  ativo: boolean;
}

export interface SetorFiltro {
  nome?: string;
  ativo?: boolean;
}
