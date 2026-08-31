export interface Fornecedor {
  id: number;
  nome: string;
  cnpj: string | null;
  ativo: boolean;
  dataCriacao: string;
  dataAtualizacao: string;
}

export interface CreateFornecedorPayload {
  nome: string;
  cnpj: string;
  ativo: boolean;
}

export interface UpdateFornecedorPayload {
  nome: string;
  cnpj: string | null;
  ativo: boolean;
}

export interface FornecedorFiltro {
  nome?: string;
  ativo?: boolean;
}
