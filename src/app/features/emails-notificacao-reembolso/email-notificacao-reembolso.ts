export type TipoDestinatarioEmail = 'Para' | 'Cc';

export interface EmailNotificacaoReembolso {
  id: number;
  email: string;
  tipoDestinatario: TipoDestinatarioEmail;
  ativo: boolean;
  dataCriacao: string;
  dataAtualizacao: string;
}

export interface EmailNotificacaoReembolsoPayload {
  email: string;
  tipoDestinatario: TipoDestinatarioEmail;
  ativo: boolean;
}

export interface EmailNotificacaoReembolsoFiltro {
  ativo?: boolean;
}
