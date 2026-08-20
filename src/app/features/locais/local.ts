export interface Local {
  id: number;
  nome: string;
  endereco?: string | null;
  ativo: boolean;
  dataCriacao: string;
  dataAtualizacao: string;
}

export interface LocalPayload {
  nome: string;
  endereco?: string | null;
  ativo: boolean;
}

export interface LocalFiltro {
  nome?: string;
  ativo?: boolean;
}
