export interface PoliticaFerias {
  id: number;
  tipoVinculo: string | null;
  diasDireitoPorAno: number;
  maxFracionamentos: number;
  diasMinimoUltimoFracionamento: number;
  diasMinimoDemaisFracionamentos: number;
  diasAntecedenciaRemarcacao: number;
  diasAntecedenciaMarcacaoCompulsoria: number;
  permiteAbonoPecuniario: boolean;
  maxDiasAbono: number;
  diasMinimosAntesFeriadoOuFimDeSemana: number;
  ativa: boolean;
  dataCriacao: string;
  dataAtualizacao: string;
}

export interface PoliticaFeriasPayload {
  tipoVinculo: string | null;
  diasDireitoPorAno: number;
  maxFracionamentos: number;
  diasMinimoUltimoFracionamento: number;
  diasMinimoDemaisFracionamentos: number;
  diasAntecedenciaRemarcacao: number;
  diasAntecedenciaMarcacaoCompulsoria: number;
  permiteAbonoPecuniario: boolean;
  maxDiasAbono: number;
  diasMinimosAntesFeriadoOuFimDeSemana: number;
  ativa: boolean;
}
