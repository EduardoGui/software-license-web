export type TipoMedicao = 'MensalFixo' | 'MensalVariavel' | 'QuantidadeXPrecoUnitario' | 'EtapasPercentuais' | 'ParcelaUnica' | 'Outro';
export type MetodoProRata = 'DiasCorridos' | 'MesComercial30' | 'DiasUteis' | 'FracaoManual' | 'ValorManual';
export type ContratoStatus = 'Ativo' | 'Encerrado' | 'Suspenso';

export interface Contrato {
  id: number;
  numero: string;
  fornecedorId: number;
  fornecedorNome: string;
  objeto: string;
  natureza: string | null;
  dataAssinatura: string;
  dataInicioVigencia: string;
  dataFimVigenciaOriginal: string;
  dataFimVigenciaAtual: string;
  valorOriginal: number;
  valorAtual: number;
  status: ContratoStatus;
  observacoes: string | null;
  quantidadeItens: number;
  dataCriacao: string;
  dataAtualizacao: string;
}

export interface ContratoItem {
  id: number;
  contratoId: number;
  codigo: string | null;
  descricao: string;
  unidade: string;
  quantidadeContratada: number;
  valorUnitario: number;
  valorTotal: number;
}

export interface ContratoMedicaoConfig {
  tipoMedicao: TipoMedicao;
  diaInicioPeriodo: number | null;
  diaFimPeriodo: number | null;
  exigeBm: boolean;
  exigeAprovacao: boolean;
  exigeAssinatura: boolean;
  permiteProRata: boolean;
  metodoProRata: MetodoProRata | null;
  diasAntecedenciaAlerta: number | null;
}

export interface ContratoFaturamentoConfig {
  diaInicialJanelaNf: number;
  diaFinalJanelaNf: number;
  exigeBmAprovado: boolean;
  exigeBmAssinado: boolean;
  prazoPagamentoDias: number | null;
}

export interface ContratoDetalhe extends Contrato {
  itens: ContratoItem[];
  medicaoConfig: ContratoMedicaoConfig | null;
  faturamentoConfig: ContratoFaturamentoConfig | null;
}

export interface CreateContratoItemPayload {
  codigo: string | null;
  descricao: string;
  unidade: string;
  quantidadeContratada: number;
  valorUnitario: number;
}

export interface CreateContratoPayload {
  numero: string;
  fornecedorId: number | null;
  objeto: string;
  natureza: string | null;
  dataAssinatura: string;
  dataInicioVigencia: string;
  dataFimVigenciaOriginal: string;
  valorOriginal: number;
  observacoes: string | null;
  itens: CreateContratoItemPayload[];
  medicaoConfig: ContratoMedicaoConfig;
  faturamentoConfig: ContratoFaturamentoConfig;
}

export interface UpdateContratoPayload {
  objeto: string;
  natureza: string | null;
  status: ContratoStatus;
  observacoes: string | null;
}

export interface ContratoFiltro {
  numero?: string;
  fornecedorId?: number;
  status?: string;
  vigenciaFimAte?: string;
}

export type AditivoStatus = 'Previsto' | 'Formalizado';

export interface AditivoItem {
  id: number;
  contratoItemId: number | null;
  descricaoContratoItem: string | null;
  descricaoNovoItem: string | null;
  codigoNovoItem: string | null;
  unidadeNovoItem: string | null;
  deltaQuantidade: number;
  novoValorUnitario: number | null;
}

export interface Aditivo {
  id: number;
  contratoId: number;
  numero: number;
  descricao: string;
  dataAssinatura: string;
  dataEfeito: string;
  deltaValor: number | null;
  novaDataFimVigencia: string | null;
  percentualReajuste: number | null;
  status: AditivoStatus;
  dataFormalizacao: string | null;
  observacao: string | null;
  dataCriacao: string;
  itens: AditivoItem[];
}

export interface CreateAditivoItemPayload {
  contratoItemId: number | null;
  descricaoNovoItem: string | null;
  codigoNovoItem: string | null;
  unidadeNovoItem: string | null;
  deltaQuantidade: number;
  novoValorUnitario: number | null;
}

export interface CreateAditivoPayload {
  descricao: string;
  dataAssinatura: string;
  dataEfeito: string;
  deltaValor: number | null;
  novaDataFimVigencia: string | null;
  percentualReajuste: number | null;
  observacao: string | null;
  itens: CreateAditivoItemPayload[];
}

export type MedicaoBmStatus = 'Rascunho' | 'AguardandoAprovacao' | 'Aprovado' | 'Reprovado';

export interface MedicaoBmItem {
  id: number;
  contratoItemId: number | null;
  aditivoItemId: number | null;
  descricaoNoMomento: string;
  unidadeNoMomento: string;
  quantidadeContratadaNoMomento: number;
  quantidadeJaMedidaAntes: number;
  saldoAntes: number;
  quantidadeMedidaNestaBm: number;
  saldoDepois: number;
  valorUnitarioNoMomento: number;
  valorTotalItem: number;
  saldoValorAntes: number;
  saldoValorDepois: number;
  inicioEfetivo: string | null;
  fimEfetivo: string | null;
  diasBase: number | null;
  diasMedidos: number | null;
  percentualProRata: number | null;
  ajusteManual: number | null;
  justificativaAjuste: string | null;
}

export interface MedicaoBmAcerto {
  id: number;
  medicaoBmItemId: number | null;
  descricao: string;
  unidade: string | null;
  quantidade: number | null;
  precoUnitario: number | null;
  precoTotal: number;
}

export interface MedicaoBmImposto {
  id: number;
  medicaoBmItemId: number | null;
  descricao: string;
  aliquota: number;
  base: number;
  valorTotal: number;
}

export interface MedicaoBm {
  id: number;
  contratoId: number;
  numero: number;
  numeroReferencia: string | null;
  periodoInicio: string;
  periodoFim: string;
  dataEnvio: string | null;
  status: MedicaoBmStatus;
  aprovadorId: number | null;
  aprovadorNome: string | null;
  observacaoAprovador: string | null;
  dataDecisao: string | null;
  valorTotalMedido: number;
  valorTotalAcertos: number;
  valorTotalImpostos: number;
  valorLiquido: number;
  observacao: string | null;
  dataCriacao: string;
  itens: MedicaoBmItem[];
  acertos: MedicaoBmAcerto[];
  impostos: MedicaoBmImposto[];
}

export interface CreateMedicaoBmPayload {
  periodoInicio: string;
  periodoFim: string;
  dataEnvio: string | null;
  observacao: string | null;
}

export interface UpdateMedicaoBmItemPayload {
  itemId: number;
  quantidadeMedidaNestaBm: number;
  inicioEfetivo: string | null;
  fimEfetivo: string | null;
  percentualProRata: number | null;
  ajusteManual: number | null;
  justificativaAjuste: string | null;
}

export interface UpdateMedicaoBmAcertoPayload {
  medicaoBmItemId: number | null;
  descricao: string;
  unidade: string | null;
  quantidade: number | null;
  precoUnitario: number | null;
  precoTotal: number;
}

export interface UpdateMedicaoBmImpostoPayload {
  medicaoBmItemId: number | null;
  descricao: string;
  aliquota: number;
  base: number;
  valorTotal: number;
}

export interface UpdateMedicaoBmPayload {
  numeroReferencia: string | null;
  dataEnvio: string | null;
  observacao: string | null;
  itens: UpdateMedicaoBmItemPayload[];
  acertos: UpdateMedicaoBmAcertoPayload[];
  impostos: UpdateMedicaoBmImpostoPayload[];
}

export interface ReprovarMedicaoBmPayload {
  observacaoAprovador: string | null;
}

export interface ContratoSaldoItem {
  contratoItemId: number | null;
  aditivoItemId: number | null;
  descricao: string;
  unidade: string;
  quantidadeContratadaAtual: number;
  quantidadeJaMedida: number;
  saldoQuantidade: number;
  valorUnitario: number;
  valorContratadoAtual: number;
  saldoValor: number;
}
