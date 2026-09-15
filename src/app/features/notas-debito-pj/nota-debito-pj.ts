export type NotaDebitoPjStatus = 'Rascunho' | 'Enviada' | 'Recebida';

export interface NotaDebitoPjItem {
  dependenteId: number | null;
  nomeBeneficiario: string;
  valorMensalidade: number;
  valorCoparticipacao: number;
}

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
  numeroFatura: string | null;
  descricao: string | null;
  dataEmissao: string | null;
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
  itens: NotaDebitoPjItem[];
  avisoEmail: string | null;
}

export interface CreateNotaDebitoPjPayload {
  usuarioId: number;
  ano: number;
  mes: number;
  operadoraSaude: string;
  numeroFatura: string | null;
  descricao: string | null;
  desconto: number;
  retencaoTributaria: number;
  dataEmissao: string | null;
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
