export interface RelatorioMensalCustoLicencasItem {
  licencaId: number;
  nome: string;
  periodicidade: string | null;
  valorVigente: number | null;
  diasAtivos: number;
  diasNoMes: number;
  valorNoMes: number;
}

export interface RelatorioMensalCustoLicencas {
  ano: number;
  mes: number;
  itens: RelatorioMensalCustoLicencasItem[];
  totalGeral: number;
}

export interface RelatorioMensalCustoLicencasFiltro {
  ano: number;
  mes: number;
  nome?: string;
}
