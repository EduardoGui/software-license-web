import { UsuarioTipo } from '../usuarios/usuario';

export interface PlanoSaudeDependenteMes {
  dependenteId: number;
  nome: string;
  lancamentoId: number | null;
  valorMensal: number | null;
  valorCoparticipacao: number | null;
}

export interface PlanoSaudeUsuarioMes {
  usuarioId: number;
  nome: string;
  tipo: UsuarioTipo | null;
  empresaPjNome: string | null;
  lancamentoId: number | null;
  valorMensal: number | null;
  valorCoparticipacao: number | null;
  dependentes: PlanoSaudeDependenteMes[];
}

export interface PlanoSaudeMes {
  ano: number;
  mes: number;
  usuarios: PlanoSaudeUsuarioMes[];
}

export interface PlanoSaudeMesFiltro {
  ano: number;
  mes: number;
  nome?: string;
}

export interface SalvarPlanoSaudeMesItem {
  usuarioId: number;
  dependenteId: number | null;
  valorMensal: number;
  valorCoparticipacao: number;
}

export interface SalvarPlanoSaudeMes {
  ano: number;
  mes: number;
  itens: SalvarPlanoSaudeMesItem[];
}
