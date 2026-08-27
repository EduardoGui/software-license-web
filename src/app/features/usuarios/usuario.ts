export type UsuarioTipo = 'Pj' | 'Clt' | 'Estagio';

export interface Dependente {
  id: number;
  nome: string;
  ativo: boolean;
}

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  dataInicio: string;
  dataFim: string | null;
  observacao: string | null;
  status: 'Agendado' | 'Ativo' | 'Inativo';
  licencasEmUso: number;
  cpf: string | null;
  cargo: string | null;
  setorId: number | null;
  setorNome: string | null;
  chavePix: string | null;
  banco: string | null;
  agencia: string | null;
  contaBancaria: string | null;
  tipo: UsuarioTipo | null;
  empresaPjId: number | null;
  empresaPjNome: string | null;
  dependentes: Dependente[];
  dataCriacao: string;
  dataAtualizacao: string;
}

export interface UsuarioPayload {
  nome: string;
  email: string;
  dataInicio: string;
  dataFim: string | null;
  observacao: string | null;
  tipo: UsuarioTipo | null;
  empresaPjId: number | null;
}

export interface UsuarioFiltro {
  nome?: string;
  email?: string;
  status?: string;
}

export interface PerfilPayload {
  cpf: string | null;
  cargo: string | null;
  setorId: number | null;
  chavePix: string | null;
  banco: string | null;
  agencia: string | null;
  contaBancaria: string | null;
}
