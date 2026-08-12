export interface Usuario {
  id: number;
  nome: string;
  email: string;
  dataInicio: string;
  dataFim: string | null;
  observacao: string | null;
  status: 'Agendado' | 'Ativo' | 'Inativo';
  dataCriacao: string;
  dataAtualizacao: string;
}

export interface UsuarioPayload {
  nome: string;
  email: string;
  dataInicio: string;
  dataFim: string | null;
  observacao: string | null;
}

export interface UsuarioFiltro {
  nome?: string;
  email?: string;
  status?: string;
}
