export interface EmpresaPj {
  id: number;
  razaoSocial: string;
  cnpj: string;
  ativa: boolean;
  dataCriacao: string;
  dataAtualizacao: string;
}

export interface EmpresaPjPayload {
  razaoSocial: string;
  cnpj: string;
  ativa: boolean;
}

export interface EmpresaPjFiltro {
  razaoSocial?: string;
  ativa?: boolean;
}
