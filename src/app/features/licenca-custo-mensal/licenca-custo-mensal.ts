export interface RelatorioMensalCustoLicencasUsuario {
  usuarioId: number | null;
  usuarioNome: string;
  diasAtivos: number;
  valorProporcional: number;
}

export interface RelatorioMensalCustoLicencasItem {
  licencaId: number;
  nome: string;
  diasNoMes: number;
  usuarios: RelatorioMensalCustoLicencasUsuario[];
  subtotal: number;
}

export interface RelatorioMensalCustoLicencasGrupo {
  tipo: string;
  licencas: RelatorioMensalCustoLicencasItem[];
  subtotal: number;
}

export interface RelatorioMensalCustoLicencas {
  ano: number;
  mes: number;
  grupos: RelatorioMensalCustoLicencasGrupo[];
  valorTotal: number;
}

export interface RelatorioMensalCustoLicencasFiltro {
  ano: number;
  mes: number;
  nome?: string;
}
