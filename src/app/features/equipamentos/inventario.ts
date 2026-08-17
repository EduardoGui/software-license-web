import { Equipamento } from './equipamento';

export interface InventarioGrupo {
  tipoEquipamentoId: number;
  tipoEquipamentoNome: string;
  itens: Equipamento[];
  totalDisponivel: number;
  totalEmUso: number;
  totalManutencao: number;
  totalBaixado: number;
}

export interface Inventario {
  grupos: InventarioGrupo[];
  totalGeral: number;
}
