import { DecimalPipe } from '@angular/common';
import { Component, ViewContainerRef, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Icon } from '../../shared/icons/icon';
import { AnexoService } from '../../shared/anexos/anexo.service';
import {
  capturaTelaSuportada,
  capturarTelaRecortada,
  colagemSuportada,
  imagemDaAreaDeTransferencia,
  imagemDoEventoColar,
  prepararImagem,
} from '../../shared/anexos/captura-tela';
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
  private readonly notaDebitoService = inject(NotaDebitoPjService);
  private readonly anexoService = inject(AnexoService);
  private readonly contenedor = inject(ViewContainerRef);

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
  protected readonly criandoNdPara = signal<PlanoSaudeUsuarioMes | null>(null);
  protected readonly salvandoNd = signal(false);
  protected readonly erroNd = signal<string | null>(null);
  protected readonly avisoNd = signal<{ nome: string; notaId: number; alerta?: string } | null>(null);
  protected descontoNd = 0;
  protected retencaoNd = 0;
  // Campos livres e opcionais: a nota não se vincula a uma fatura cadastrada.
  protected operadoraNd = '';
  protected numeroFaturaNd = '';
  // Recortes de tela escolhidos antes de a nota existir: sobem como anexos logo após criá-la e vão junto no e-mail.
  protected readonly imagensNd = signal<{ arquivo: File; url: string }[]>([]);
  protected readonly erroImagemNd = signal<string | null>(null);
  protected readonly capturaSuportada = capturaTelaSuportada();
  protected readonly colagemSuportada = colagemSuportada();

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

  protected abrirCriarNd(u: PlanoSaudeUsuarioMes): void {
    this.erroNd.set(null);
    this.descontoNd = 0;
    this.retencaoNd = 0;
    this.operadoraNd = '';
    this.numeroFaturaNd = '';
    this.limparImagensNd();
    this.criandoNdPara.set(u);
  }

  protected fecharCriarNd(): void {
    this.limparImagensNd();
    this.criandoNdPara.set(null);
  }

  // --- recorte de tela para acompanhar o e-mail da nota ---

  private async adicionarImagemNd(imagem: File): Promise<void> {
    const pronta = await prepararImagem(imagem);
    this.imagensNd.update((lista) => [...lista, { arquivo: pronta, url: URL.createObjectURL(pronta) }]);
  }

  private limparImagensNd(): void {
    this.imagensNd().forEach((i) => URL.revokeObjectURL(i.url));
    this.imagensNd.set([]);
    this.erroImagemNd.set(null);
  }

  protected removerImagemNd(indice: number): void {
    const imagem = this.imagensNd()[indice];
    if (imagem) {
      URL.revokeObjectURL(imagem.url);
    }
    this.imagensNd.update((lista) => lista.filter((_, i) => i !== indice));
  }

  protected async capturarTelaNd(): Promise<void> {
    this.erroImagemNd.set(null);
    try {
      const imagem = await capturarTelaRecortada(this.contenedor);
      if (imagem) {
        await this.adicionarImagemNd(imagem);
      }
    } catch (e) {
      this.erroImagemNd.set((e as Error).message);
    }
  }

  protected async colarImagemNd(): Promise<void> {
    this.erroImagemNd.set(null);
    try {
      const imagem = await imagemDaAreaDeTransferencia();
      if (!imagem) {
        this.erroImagemNd.set('Não há imagem na área de transferência. Copie um trecho de tela (ex.: Win+Shift+S) e tente de novo.');
        return;
      }

      await this.adicionarImagemNd(imagem);
    } catch {
      this.erroImagemNd.set('Não foi possível ler a área de transferência. Clique na área do modal e use Ctrl+V.');
    }
  }

  protected async aoColarNd(evento: ClipboardEvent): Promise<void> {
    const imagem = imagemDoEventoColar(evento);
    if (imagem) {
      evento.preventDefault();
      await this.adicionarImagemNd(imagem);
    }
  }

  protected confirmarCriarNd(): void {
    const u = this.criandoNdPara();
    const mes = this.mes();
    if (!u || !mes) {
      return;
    }

    this.salvandoNd.set(true);
    this.erroNd.set(null);

    this.notaDebitoService
      .criar({
        usuarioId: u.usuarioId,
        ano: mes.ano,
        mes: mes.mes,
        operadoraSaude: this.operadoraNd.trim() || null,
        numeroFatura: this.numeroFaturaNd.trim() || null,
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
          u.notaDebitoId = nota.id;
          u.notaDebitoStatus = nota.status as PlanoSaudeUsuarioMes['notaDebitoStatus'];
          u.notaDebitoValor = nota.valorBruto;
          this.enviarImagensDaNota(nota.id, u.nome);
        },
        error: (err) => {
          this.salvandoNd.set(false);
          this.erroNd.set(err?.error?.message ?? 'Não foi possível criar a nota de débito.');
        },
      });
  }

  // A nota já existe aqui; se algum recorte falhar ao subir, ela continua criada e a pessoa é avisada.
  private enviarImagensDaNota(notaId: number, nome: string): void {
    const imagens = this.imagensNd();
    const concluir = (falhas: number) => {
      this.salvandoNd.set(false);
      this.limparImagensNd();
      this.criandoNdPara.set(null);
      this.avisoNd.set({
        nome,
        notaId,
        alerta: falhas > 0 ? `${falhas} recorte(s) não subiram; adicione-os em Anexos da nota antes de enviar.` : undefined,
      });
    };

    if (imagens.length === 0) {
      concluir(0);
      return;
    }

    let pendentes = imagens.length;
    let falhas = 0;
    for (const imagem of imagens) {
      this.anexoService.enviar('notas-debito-pj', notaId, imagem.arquivo).subscribe({
        next: () => undefined,
        error: () => {
          falhas++;
          if (--pendentes === 0) concluir(falhas);
        },
        complete: () => {
          if (--pendentes === 0) concluir(falhas);
        },
      });
    }
  }
}
