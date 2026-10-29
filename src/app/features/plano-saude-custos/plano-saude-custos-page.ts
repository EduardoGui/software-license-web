import { DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Icon } from '../../shared/icons/icon';
import { FaturaOperadoraSaude } from '../faturas-plano-saude/fatura-plano-saude';
import { FaturaOperadoraSaudeService } from '../faturas-plano-saude/fatura-plano-saude.service';
import { NotaDebitoPjService } from '../notas-debito-pj/nota-debito-pj.service';
import { ImportacaoPlanoSaudeResultado, PlanoSaudeMes, PlanoSaudeMesFiltro, PlanoSaudeUsuarioMes, SalvarPlanoSaudeMesItem } from './plano-saude-custo';
import { ImportarFaturaModal } from './importar-fatura-modal';
import { PlanoSaudeCustoService } from './plano-saude-custo.service';

const NOMES_MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const NOMES_TIPO: Record<string, string> = { Pj: 'PJ', Clt: 'CLT', Estagio: 'Estágio' };

@Component({
  selector: 'app-plano-saude-custos-page',
  imports: [FormsModule, RouterLink, DecimalPipe, Icon, ImportarFaturaModal],
  templateUrl: './plano-saude-custos-page.html',
  styleUrl: './plano-saude-custos-page.scss',
})
export class PlanoSaudeCustosPage {
  private readonly custoService = inject(PlanoSaudeCustoService);
  private readonly faturaService = inject(FaturaOperadoraSaudeService);
  private readonly notaDebitoService = inject(NotaDebitoPjService);

  protected readonly nomesMeses = NOMES_MESES;
  protected readonly anosDisponiveis = this.calcularAnosDisponiveis();

  protected readonly mes = signal<PlanoSaudeMes | null>(null);
  protected readonly carregando = signal(true);
  protected readonly erro = signal(false);
  protected readonly salvando = signal(false);
  protected readonly salvo = signal(false);

  protected filtro: PlanoSaudeMesFiltro = this.filtroPadrao();

  // --- Nota de débito (só titulares PJ) ---
  protected somentePendentesNd = false;
  protected readonly faturasDoMes = signal<FaturaOperadoraSaude[]>([]);
  protected readonly criandoNdPara = signal<PlanoSaudeUsuarioMes | null>(null);
  protected readonly salvandoNd = signal(false);
  protected readonly erroNd = signal<string | null>(null);
  protected readonly avisoNd = signal<{ nome: string; notaId: number } | null>(null);
  protected faturaNdId: number | null = null;
  protected descontoNd = 0;
  protected retencaoNd = 0;

  // --- Importação da fatura da operadora ---
  protected readonly importarAberto = signal(false);
  protected readonly resultadoImportacao = signal<ImportacaoPlanoSaudeResultado | null>(null);

  // Valores gravados (mensal|coparticipação) por linha, para saber se há alteração ainda não salva.
  private readonly salvos = new Map<string, string>();

  constructor() {
    this.buscar();
  }

  private filtroPadrao(): PlanoSaudeMesFiltro {
    const hoje = new Date();
    return { ano: hoje.getFullYear(), mes: hoje.getMonth() + 1 };
  }

  private calcularAnosDisponiveis(): number[] {
    const anoAtual = new Date().getFullYear();
    return [anoAtual - 1, anoAtual, anoAtual + 1];
  }

  protected nomeTipo(tipo: string | null): string {
    return tipo ? (NOMES_TIPO[tipo] ?? tipo) : '';
  }

  protected buscar(): void {
    this.carregando.set(true);
    this.erro.set(false);
    this.salvo.set(false);
    this.avisoNd.set(null);

    this.custoService.obterMes(this.filtro).subscribe({
      next: (mes) => {
        this.mes.set(mes);
        this.registrarSalvos(mes);
        this.carregando.set(false);
        this.carregarFaturasDoMes();
      },
      error: () => {
        this.erro.set(true);
        this.carregando.set(false);
      },
    });
  }

  protected limparFiltro(): void {
    this.filtro = this.filtroPadrao();
    this.buscar();
  }

  protected salvar(): void {
    const mes = this.mes();
    if (!mes) {
      return;
    }

    const itens: SalvarPlanoSaudeMesItem[] = [];
    for (const usuario of mes.usuarios) {
      if (usuario.lancamentoId !== null || usuario.valorMensal !== null || usuario.valorCoparticipacao !== null) {
        itens.push({
          usuarioId: usuario.usuarioId,
          dependenteId: null,
          valorMensal: usuario.valorMensal ?? 0,
          valorCoparticipacao: usuario.valorCoparticipacao ?? 0,
        });
      }

      for (const dependente of usuario.dependentes) {
        if (dependente.lancamentoId !== null || dependente.valorMensal !== null || dependente.valorCoparticipacao !== null) {
          itens.push({
            usuarioId: usuario.usuarioId,
            dependenteId: dependente.dependenteId,
            valorMensal: dependente.valorMensal ?? 0,
            valorCoparticipacao: dependente.valorCoparticipacao ?? 0,
          });
        }
      }
    }

    const afetados = mes.usuarios.filter(
      (u) => u.notaDebitoId !== null && u.notaDebitoStatus !== 'Rascunho' && this.coparticipacaoDigitada(u) !== u.notaDebitoValor,
    );
    if (afetados.length > 0) {
      const nomes = afetados.map((u) => u.nome).join(', ');
      const ok = confirm(
        `Já existe nota de débito enviada/recebida para: ${nomes}.\nA nota NÃO é atualizada quando a coparticipação muda (o valor dela é congelado). Salvar mesmo assim?`,
      );
      if (!ok) {
        return;
      }
    }

    this.salvando.set(true);
    this.salvo.set(false);

    this.custoService.salvarMes({ ano: mes.ano, mes: mes.mes, itens }).subscribe({
      next: (atualizado) => {
        this.mes.set(atualizado);
        this.registrarSalvos(atualizado);
        this.salvando.set(false);
        this.salvo.set(true);
      },
      error: () => {
        this.salvando.set(false);
        alert('Não foi possível salvar os lançamentos.');
      },
    });
  }

  protected removerLancamentoTitular(usuarioId: number, lancamentoId: number): void {
    if (!confirm('Remover este lançamento?')) {
      return;
    }

    this.custoService.remover(lancamentoId).subscribe({
      next: () => {
        const mes = this.mes();
        const usuario = mes?.usuarios.find((u) => u.usuarioId === usuarioId);
        if (usuario) {
          this.aposRemocao(usuario, 't' + usuarioId);
          usuario.lancamentoId = null;
          usuario.valorMensal = null;
          usuario.valorCoparticipacao = null;
        }
      },
      error: () => alert('Não foi possível remover o lançamento.'),
    });
  }

  protected removerLancamentoDependente(dependenteId: number, lancamentoId: number): void {
    if (!confirm('Remover este lançamento?')) {
      return;
    }

    this.custoService.remover(lancamentoId).subscribe({
      next: () => {
        const mes = this.mes();
        for (const usuario of mes?.usuarios ?? []) {
          const dependente = usuario.dependentes.find((d) => d.dependenteId === dependenteId);
          if (dependente) {
            this.aposRemocao(usuario, 'd' + dependenteId);
            dependente.lancamentoId = null;
            dependente.valorMensal = null;
            dependente.valorCoparticipacao = null;
          }
        }
      },
      error: () => alert('Não foi possível remover o lançamento.'),
    });
  }

  protected abrirImportacao(): void {
    if (this.temAlteracoes() && !confirm('Há alterações não salvas neste mês. Depois da importação a tela é recarregada e elas se perdem. Continuar?')) {
      return;
    }

    this.resultadoImportacao.set(null);
    this.importarAberto.set(true);
  }

  protected aposImportar(resultado: ImportacaoPlanoSaudeResultado): void {
    this.importarAberto.set(false);
    this.resultadoImportacao.set(resultado);
    this.buscar();
  }

  // --- Nota de débito ---

  private chaveTitular(u: PlanoSaudeUsuarioMes): string {
    return 't' + u.usuarioId;
  }

  private par(mensal: number | null, copart: number | null): string {
    return `${mensal ?? ''}|${copart ?? ''}`;
  }

  private registrarSalvos(mes: PlanoSaudeMes): void {
    this.salvos.clear();
    for (const u of mes.usuarios) {
      this.salvos.set(this.chaveTitular(u), this.par(u.valorMensal, u.valorCoparticipacao));
      for (const d of u.dependentes) {
        this.salvos.set('d' + d.dependenteId, this.par(d.valorMensal, d.valorCoparticipacao));
      }
    }
  }

  // Ao remover um lançamento, tira o valor gravado dele do total e zera o "gravado" da linha.
  private aposRemocao(usuario: PlanoSaudeUsuarioMes, chave: string): void {
    const gravado = Number((this.salvos.get(chave) ?? '|').split('|')[1] || 0);
    usuario.coparticipacaoTotal = Math.max(0, Math.round((usuario.coparticipacaoTotal - gravado) * 100) / 100);
    this.salvos.set(chave, '|');
  }

  protected temAlteracoes(): boolean {
    const mes = this.mes();
    if (!mes) {
      return false;
    }

    return mes.usuarios.some(
      (u) =>
        this.par(u.valorMensal, u.valorCoparticipacao) !== (this.salvos.get(this.chaveTitular(u)) ?? '|') ||
        u.dependentes.some((d) => this.par(d.valorMensal, d.valorCoparticipacao) !== (this.salvos.get('d' + d.dependenteId) ?? '|')),
    );
  }

  // Coparticipação como está digitada agora (titular + dependentes), para comparar com a nota congelada.
  private coparticipacaoDigitada(u: PlanoSaudeUsuarioMes): number {
    const soma = (u.valorCoparticipacao ?? 0) + u.dependentes.reduce((t, d) => t + (d.valorCoparticipacao ?? 0), 0);
    return Math.round(soma * 100) / 100;
  }

  protected ehPj(u: PlanoSaudeUsuarioMes): boolean {
    return u.tipo === 'Pj';
  }

  protected ndPendente(u: PlanoSaudeUsuarioMes): boolean {
    return this.ehPj(u) && u.notaDebitoId === null && u.coparticipacaoTotal > 0;
  }

  protected ndDivergente(u: PlanoSaudeUsuarioMes): boolean {
    return u.notaDebitoId !== null && u.notaDebitoValor !== null && Math.abs(u.notaDebitoValor - u.coparticipacaoTotal) >= 0.005;
  }

  protected totalPendentesNd(): number {
    return (this.mes()?.usuarios ?? []).filter((u) => this.ndPendente(u)).length;
  }

  protected usuariosVisiveis(): PlanoSaudeUsuarioMes[] {
    const usuarios = this.mes()?.usuarios ?? [];
    return this.somentePendentesNd ? usuarios.filter((u) => this.ndPendente(u)) : usuarios;
  }

  private carregarFaturasDoMes(): void {
    this.faturaService.listar({ ano: this.filtro.ano, mes: this.filtro.mes }).subscribe({
      next: (faturas) => this.faturasDoMes.set(faturas),
      error: () => this.faturasDoMes.set([]),
    });
  }

  protected abrirCriarNd(u: PlanoSaudeUsuarioMes): void {
    this.erroNd.set(null);
    this.descontoNd = 0;
    this.retencaoNd = 0;
    // Com uma única fatura no mês ela já vem escolhida; com várias, a pessoa escolhe.
    this.faturaNdId = this.faturasDoMes().length === 1 ? this.faturasDoMes()[0].id : null;
    this.criandoNdPara.set(u);
  }

  protected fecharCriarNd(): void {
    this.criandoNdPara.set(null);
  }

  protected confirmarCriarNd(): void {
    const u = this.criandoNdPara();
    const mes = this.mes();
    if (!u || !mes) {
      return;
    }

    if (this.faturaNdId === null) {
      this.erroNd.set('Escolha a fatura da operadora.');
      return;
    }

    this.salvandoNd.set(true);
    this.erroNd.set(null);

    this.notaDebitoService
      .criar({
        usuarioId: u.usuarioId,
        ano: mes.ano,
        mes: mes.mes,
        faturaOperadoraSaudeId: this.faturaNdId,
        operadoraSaude: null,
        numeroFatura: null,
        descricao: null,
        desconto: this.descontoNd || 0,
        retencaoTributaria: this.retencaoNd || 0,
        dataEmissao: null,
        dataVencimento: null,
        formaPagamento: null,
        centroCusto: null,
        area: null,
        contaContabil: null,
        projetoContrato: null,
      })
      .subscribe({
        next: (nota) => {
          this.salvandoNd.set(false);
          u.notaDebitoId = nota.id;
          u.notaDebitoStatus = nota.status as PlanoSaudeUsuarioMes['notaDebitoStatus'];
          u.notaDebitoValor = nota.valorBruto;
          this.criandoNdPara.set(null);
          this.avisoNd.set({ nome: u.nome, notaId: nota.id });
        },
        error: (err) => {
          this.salvandoNd.set(false);
          this.erroNd.set(err?.error?.message ?? 'Não foi possível criar a nota de débito.');
        },
      });
  }
}
