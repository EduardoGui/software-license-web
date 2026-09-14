import { EntregaItem, TipoDivergenciaEntrega } from '../campanhas-entrega/campanha-entrega';

export interface Recebimento {
  campanhaNome: string;
  usuarioNome: string;
  dataEntregaFisica: string | null;
  status: 'Pendente' | 'EmailEnviado' | 'Confirmado' | 'Divergencia' | 'Cancelado';
  itens: EntregaItem[];
  dataConfirmacao: string | null;
  tipoDivergencia: TipoDivergenciaEntrega | null;
  observacaoDivergencia: string | null;
}

export interface RegistrarDivergenciaPayload {
  tipoDivergencia: string;
  observacao: string | null;
}
