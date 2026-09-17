export type CampanhaEntregaStatus = 'Rascunho' | 'EmAndamento' | 'Encerrada' | 'Cancelada';

export type EntregaStatus = 'Pendente' | 'EmailEnviado' | 'Confirmado' | 'Divergencia' | 'Cancelado';

export type TipoDivergenciaEntrega = 'NaoRecebi' | 'QuantidadeIncorreta' | 'ItemDiferente' | 'ItemDanificado' | 'Outro';

export interface CampanhaEntrega {
  id: number;
  nome: string;
  descricao: string | null;
  status: CampanhaEntregaStatus;
  itens: CampanhaEntregaItem[];
  dataCriacao: string;
  dataAtualizacao: string;
}

export interface CampanhaEntregaItem {
  id: number;
  descricao: string;
  tamanho: string | null;
  quantidade: number;
  validade: string | null;
  quantidadeDisponivel: number | null;
  quantidadeEntregue: number;
  saldoDisponivel: number | null;
}

export interface CampanhaEntregaItemPayload {
  descricao: string;
  tamanho: string | null;
  quantidade: number;
  validade: string | null;
  quantidadeDisponivel: number | null;
}

export interface UpdateCampanhaEntregaItensPayload {
  itens: CampanhaEntregaItemPayload[];
}

export interface CreateCampanhaEntregaPayload {
  nome: string;
  descricao: string | null;
}

export interface UpdateCampanhaEntregaPayload {
  nome: string;
  descricao: string | null;
}

export interface CampanhaEntregaFiltro {
  nome?: string;
  status?: string;
}

export interface CampanhaEntregaResumo {
  total: number;
  pendentes: number;
  emailEnviado: number;
  confirmados: number;
  divergencias: number;
  cancelados: number;
}

export interface EntregaItem {
  id: number;
  descricao: string;
  tamanho: string | null;
  quantidade: number;
  validade: string | null;
}

export interface CreateEntregaItemPayload {
  descricao: string;
  tamanho: string | null;
  quantidade: number;
  validade: string | null;
}

export interface Entrega {
  id: number;
  campanhaEntregaId: number;
  usuarioId: number;
  usuarioNome: string;
  emailDestino: string;

  dataEntregaFisica: string | null;
  responsavelEntregaId: number | null;
  responsavelEntregaNome: string | null;

  status: EntregaStatus;

  dataEnvioEmail: string | null;
  dataAcessoLink: string | null;
  ipAcessoLink: string | null;
  userAgentAcessoLink: string | null;
  dataConfirmacao: string | null;
  ipConfirmacao: string | null;
  userAgentConfirmacao: string | null;

  tipoDivergencia: TipoDivergenciaEntrega | null;
  observacaoDivergencia: string | null;

  quantidadeKits: number;
  observacao: string | null;

  avisoEmail: string | null;

  itens: EntregaItem[];

  dataCriacao: string;
  dataAtualizacao: string;
}

export interface CreateEntregaPayload {
  usuarioId: number;
  quantidadeKits?: number;
  observacao?: string | null;
}

export interface CreateEntregaLotePayload {
  usuarioIds: number[];
  quantidadeKits?: number;
  observacao?: string | null;
}

export interface UpdateEntregaItensPayload {
  itens: CreateEntregaItemPayload[];
}

export interface RegistrarEntregaFisicaPayload {
  dataEntregaFisica: string;
  responsavelEntregaId: number;
}

export interface EntregaFiltro {
  usuarioId?: number;
  setorId?: number;
  item?: string;
  status?: string;
}

export interface ColaboradorDisponivel {
  id: number;
  nome: string;
  email: string;
  setorNome: string | null;
}

export interface ColaboradorDisponivelFiltro {
  nome?: string;
  setorId?: number;
}

export const ROTULOS_STATUS_ENTREGA: Record<EntregaStatus, string> = {
  Pendente: 'Pendente',
  EmailEnviado: 'E-mail enviado',
  Confirmado: 'Confirmado',
  Divergencia: 'Divergência',
  Cancelado: 'Cancelado',
};

export const ROTULOS_TIPO_DIVERGENCIA: Record<TipoDivergenciaEntrega, string> = {
  NaoRecebi: 'Não recebi',
  QuantidadeIncorreta: 'Quantidade incorreta',
  ItemDiferente: 'Item diferente',
  ItemDanificado: 'Item danificado',
  Outro: 'Outro',
};
