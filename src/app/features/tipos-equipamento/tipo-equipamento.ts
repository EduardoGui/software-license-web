export interface TipoEquipamento {
  id: number;
  nome: string;
  ativo: boolean;
  dataCriacao: string;
  dataAtualizacao: string;
}

export interface TipoEquipamentoPayload {
  nome: string;
  ativo: boolean;
}

export interface TipoEquipamentoFiltro {
  nome?: string;
  ativo?: boolean;
}
