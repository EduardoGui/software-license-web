export type FeriadoAbrangencia = 'Nacional' | 'Estadual' | 'Municipal';

export interface Feriado {
  id: number;
  data: string;
  descricao: string;
  abrangencia: FeriadoAbrangencia;
  uf: string | null;
  municipio: string | null;
  ativo: boolean;
  dataCriacao: string;
  dataAtualizacao: string;
}

export interface FeriadoPayload {
  data: string;
  descricao: string;
  abrangencia: FeriadoAbrangencia;
  uf: string | null;
  municipio: string | null;
  ativo: boolean;
}

export interface FeriadoFiltro {
  ano?: number;
  abrangencia?: string;
  ativo?: boolean;
}
