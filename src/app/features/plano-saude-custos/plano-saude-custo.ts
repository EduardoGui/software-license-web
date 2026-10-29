import { UsuarioTipo } from '../usuarios/usuario';

export interface PlanoSaudeDependenteMes {
  dependenteId: number;
  nome: string;
  lancamentoId: number | null;
  valorMensal: number | null;
  valorCoparticipacao: number | null;
}

export interface PlanoSaudeUsuarioMes {
  usuarioId: number;
  nome: string;
  tipo: UsuarioTipo | null;
  empresaPjNome: string | null;
  lancamentoId: number | null;
  valorMensal: number | null;
  valorCoparticipacao: number | null;
  // Coparticipação total gravada (titular + dependentes) e a nota de débito do mês, se existir.
  coparticipacaoTotal: number;
  notaDebitoId: number | null;
  notaDebitoStatus: 'Rascunho' | 'Enviada' | 'Recebida' | null;
  notaDebitoValor: number | null;
  dependentes: PlanoSaudeDependenteMes[];
}

export interface PlanoSaudeMes {
  ano: number;
  mes: number;
  usuarios: PlanoSaudeUsuarioMes[];
}

export interface PlanoSaudeMesFiltro {
  ano: number;
  mes: number;
  nome?: string;
}

export interface SalvarPlanoSaudeMesItem {
  usuarioId: number;
  dependenteId: number | null;
  valorMensal: number;
  valorCoparticipacao: number;
}

export interface SalvarPlanoSaudeMes {
  ano: number;
  mes: number;
  itens: SalvarPlanoSaudeMesItem[];
}

// --- Importação do demonstrativo analítico da operadora (xlsx) ---

export interface ImportacaoTotais {
  titulares: number;
  dependentes: number;
  valorMensal: number;
  coparticipacao: number;
}

export interface ImportacaoFatura {
  numero: string;
  emissao: string | null;
  vencimento: string | null;
  valorTotal: number;
  cadastradaNoSistema: boolean;
}

export interface ImportacaoPessoa {
  nome: string;
  cpfFinal: string;
  detalhe: string | null;
  valorMensal: number;
  coparticipacao: number;
}

export interface ImportacaoAjuste {
  descricao: string;
  fatura: string;
  valorMensal: number;
  coparticipacao: number;
}

export interface ImportacaoDependenteNovo {
  titular: string;
  nome: string;
}

export interface ImportacaoSobrescrita {
  nome: string;
  valorMensalAtual: number;
  coparticipacaoAtual: number;
  valorMensalNovo: number;
  coparticipacaoNova: number;
}

export interface ImportacaoPlanoSaudePrevia {
  ano: number;
  mes: number;
  arquivo: ImportacaoTotais;
  importavel: ImportacaoTotais;
  faturas: ImportacaoFatura[];
  titularesNaoEncontrados: ImportacaoPessoa[];
  titularesAmbiguos: ImportacaoPessoa[];
  titularesForaDoPeriodo: ImportacaoPessoa[];
  dependentesSemTitular: ImportacaoPessoa[];
  ajustesSemBeneficiario: ImportacaoAjuste[];
  dependentesACriar: ImportacaoDependenteNovo[];
  dependentesAReativar: ImportacaoDependenteNovo[];
  sobrescritas: ImportacaoSobrescrita[];
  avisos: string[];
  assinatura: string;
  podeConfirmar: boolean;
}

export interface ImportacaoPlanoSaudeResultado {
  titularesImportados: number;
  dependentesImportados: number;
  dependentesCriados: number;
  dependentesReativados: number;
  lancamentosCriados: number;
  lancamentosAtualizados: number;
}
