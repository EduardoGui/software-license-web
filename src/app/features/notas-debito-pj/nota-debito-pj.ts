export type NotaDebitoPjStatus = 'Rascunho' | 'Enviada' | 'Paga';

export interface NotaDebitoPj {
  id: number;
  usuarioId: number;
  usuarioNome: string;
  empresaPjNome: string | null;
  empresaPjCnpj: string | null;
  ano: number;
  mes: number;
  valorBruto: number;
  desconto: number;
  retencaoTributaria: number;
  valorLiquido: number;
  operadoraSaude: string;
  numeroDocumento: string | null;
  descricao: string | null;
  dataVencimento: string | null;
  formaPagamento: string | null;
  centroCusto: string | null;
  area: string | null;
  contaContabil: string | null;
  projetoContrato: string | null;
  status: NotaDebitoPjStatus;
  dataEnvio: string | null;
  dataPagamento: string | null;
  dataCriacao: string;
  dataAtualizacao: string;
  avisoEmail: string | null;
}

export interface CreateNotaDebitoPjPayload {
  usuarioId: number;
  ano: number;
  mes: number;
  operadoraSaude: string;
  numeroDocumento: string | null;
  descricao: string | null;
  desconto: number;
  retencaoTributaria: number;
  dataVencimento: string | null;
  formaPagamento: string | null;
  centroCusto: string | null;
  area: string | null;
  contaContabil: string | null;
  projetoContrato: string | null;
}

export type UpdateNotaDebitoPjPayload = Omit<CreateNotaDebitoPjPayload, 'usuarioId' | 'ano' | 'mes'>;

export interface NotaDebitoPjFiltro {
  ano?: number;
  mes?: number;
  usuarioId?: number;
  status?: string;
}
