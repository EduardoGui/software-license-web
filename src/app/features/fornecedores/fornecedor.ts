export interface Fornecedor {
  id: number;
  nome: string;
  cnpj: string | null;
  contato: string | null;
  telefone: string | null;
  endereco: string | null;
  inscricaoEstadual: string | null;
  inscricaoMunicipal: string | null;
  email: string | null;
  dadosBancarios: string | null;
  ativo: boolean;
  dataCriacao: string;
  dataAtualizacao: string;
}

export interface CreateFornecedorPayload {
  nome: string;
  cnpj: string;
  contato: string | null;
  telefone: string | null;
  endereco: string | null;
  inscricaoEstadual: string | null;
  inscricaoMunicipal: string | null;
  email: string | null;
  dadosBancarios: string | null;
  ativo: boolean;
}

export interface UpdateFornecedorPayload {
  nome: string;
  cnpj: string | null;
  contato: string | null;
  telefone: string | null;
  endereco: string | null;
  inscricaoEstadual: string | null;
  inscricaoMunicipal: string | null;
  email: string | null;
  dadosBancarios: string | null;
  ativo: boolean;
}

export interface FornecedorFiltro {
  nome?: string;
  ativo?: boolean;
}
