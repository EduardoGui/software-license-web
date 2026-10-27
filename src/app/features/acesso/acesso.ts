export type PapelAcesso = 'Colaborador' | 'Administrativo' | 'Administrador';

export interface AcessoConta {
  contaId: string | null;
  usuarioId: number | null;
  nome: string;
  email: string;
  statusUsuario: 'Agendado' | 'Ativo' | 'Inativo' | null;
  temConta: boolean;
  papeis: string[];
  bloqueada: boolean;
  ehVoce: boolean;
}
