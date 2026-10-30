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
  medicaoBmNumero: number | null;
  medicaoBmNumeroReferencia: string | null;
  contratoId: number | null;
  contratoNumero: string | null;
  ordemCompraId: number | null;
  ordemCompraNumero: number | null;
  despesaAvulsaId: number | null;
  despesaAvulsaDescricao: string | null;
  fornecedorId: number;
  fornecedorNome: string;
  competencia: string;
  valorPrevisto: number;
  /** Ordem de Compra paga em várias parcelas (uma NF, vários boletos): nº desta parcela e total de parcelas ativas. */
  numeroParcela: number;
  totalParcelas: number;
  /** Só com 2+ parcelas: soma dos valores previstos e o valor que ela deveria fechar (valor da NF, senão total da OC). */
  somaParcelas: number | null;
  valorReferenciaParcelas: number | null;
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
  // Andamento documental da origem (OC ou BM); parcelas da mesma OC compartilham as datas.
  dataSolicitacaoEspelho: string | null;
  dataEnvioAssinatura: string | null;
  dataEnvioFornecedor: string | null;
  dataChegadaMaterial: string | null;
  dataLiberacaoNf: string | null;
  exigeAssinatura: boolean;
  ordemCompraAssinada: boolean;
  criadoPorNome: string | null;
  /** Usuário Administrativo a quem o Administrador atribuiu a obrigação para acompanhar e agir. */
  responsavelUsuarioId: number | null;
  responsavelNome: string | null;
  dataAtribuicao: string | null;
  observacoes: string | null;
  dataCriacao: string;
  dataAtualizacao: string;
}

export interface ResponsavelObrigacao {
  usuarioId: number;
  nome: string;
}

export interface UpdateObrigacaoPayload {
  /** Só é aceito em OC com 2+ parcelas (parcela ainda não paga). */
  valorPrevisto?: number | null;
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
  contratoId?: number;
  ordemCompraId?: number;
  responsavelUsuarioId?: number;
  etapa?: string;
  pago?: boolean;
  cancelada?: boolean;
}

export type CampoAndamento =
  | 'dataSolicitacaoEspelho'
  | 'dataEnvioAssinatura'
  | 'dataEnvioFornecedor'
  | 'dataChegadaMaterial'
  | 'dataLiberacaoNf';

export type AtualizarAndamentoPayload = Record<CampoAndamento, string | null>;
