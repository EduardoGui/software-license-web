export type ObrigacaoTipoMovimento = 'Medição' | 'OC' | 'Despesa Avulsa';

export type ObrigacaoEtapa =
  | 'Aguardar Aprovação BM'
  | 'Aguardar NF'
  | 'Criar Requisição'
  | 'Criar Assist Pgto'
  | 'Aguardando Pagamento'
  | 'Pago'
  | 'Cancelada';

export interface Obrigacao {
  id: number;
  tipoMovimento: ObrigacaoTipoMovimento;
  medicaoBmId: number | null;
  contratoId: number | null;
  contratoNumero: string | null;
  ordemCompraId: number | null;
  ordemCompraNumero: number | null;
  despesaAvulsaId: number | null;
  fornecedorId: number;
  fornecedorNome: string;
  competencia: string;
  valorPrevisto: number;
  dataNf: string | null;
  numeroNf: string | null;
  valorNota: number | null;
  vencimento: string | null;
  dataRequisicao: string | null;
  dataAssistPgto: string | null;
  dataEnvioFinanceiro: string | null;
  dataPrevistaPagamento: string | null;
  pago: boolean;
  cancelada: boolean;
  etapa: ObrigacaoEtapa;
  observacoes: string | null;
  dataCriacao: string;
  dataAtualizacao: string;
}

export interface UpdateObrigacaoPayload {
  dataNf: string | null;
  numeroNf: string | null;
  valorNota: number | null;
  vencimento: string | null;
  dataRequisicao: string | null;
  dataAssistPgto: string | null;
  dataEnvioFinanceiro: string | null;
  dataPrevistaPagamento: string | null;
  observacoes: string | null;
}

export interface ObrigacaoFiltro {
  competenciaDe?: string;
  competenciaAte?: string;
  tipoMovimento?: string;
  fornecedorId?: number;
  etapa?: string;
  pago?: boolean;
  cancelada?: boolean;
}
