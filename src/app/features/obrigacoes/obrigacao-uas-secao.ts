import { DecimalPipe } from '@angular/common';
import { Component, effect, inject, input, signal } from '@angular/core';

import { RateioUaLinha, RateioUaModal } from '../../shared/rateio-ua/rateio-ua-modal';
import { UnidadeOrcamentaria, UnidadeOrcamentariaUsada } from '../unidades-orcamentarias/unidade-orcamentaria';
import { UnidadeOrcamentariaService } from '../unidades-orcamentarias/unidade-orcamentaria.service';
import { ObrigacaoUaItem, ObrigacaoUas } from './obrigacao';
import { ObrigacaoService } from './obrigacao.service';

// UAs do documento de origem (BM, OC ou despesa avulsa) dentro da linha expandida da obrigação.
// O rateio é por item; a edição reaproveita o modal de rateio e vale até a obrigação ser paga ou cancelada.
@Component({
  selector: 'app-obrigacao-uas-secao',
  imports: [DecimalPipe, RateioUaModal],
  templateUrl: './obrigacao-uas-secao.html',
  styleUrl: './obrigacao-uas-secao.scss',
})
export class ObrigacaoUasSecao {
  private readonly obrigacaoService = inject(ObrigacaoService);
  private readonly unidadeOrcamentariaService = inject(UnidadeOrcamentariaService);

  readonly obrigacaoId = input.required<number>();
  readonly fornecedorId = input.required<number>();

  protected readonly uas = signal<ObrigacaoUas | null>(null);
  protected readonly carregando = signal(true);
  protected readonly erro = signal<string | null>(null);

  protected readonly itemEmEdicao = signal<ObrigacaoUaItem | null>(null);
  protected readonly unidades = signal<UnidadeOrcamentaria[]>([]);
  protected readonly sugestoes = signal<UnidadeOrcamentariaUsada[]>([]);
  protected readonly salvando = signal(false);
  protected readonly erroRateio = signal<string | null>(null);

  constructor() {
    effect(() => {
      this.carregar(this.obrigacaoId());
    });
  }

  private carregar(id: number): void {
    this.carregando.set(true);
    this.erro.set(null);
    this.obrigacaoService.obterUas(id).subscribe({
      next: (uas) => {
        this.uas.set(uas);
        this.carregando.set(false);
      },
      error: (err) => {
        this.erro.set(err?.error?.message ?? 'Não foi possível carregar as UAs.');
        this.carregando.set(false);
      },
    });
  }

  protected rotuloItem(item: ObrigacaoUaItem, uas: ObrigacaoUas): string {
    return uas.origem === 'DespesaAvulsa' ? 'Despesa' : item.descricao;
  }

  protected itemSemUa(item: ObrigacaoUaItem): boolean {
    return item.linhas.length === 0;
  }

  protected abrirEdicao(item: ObrigacaoUaItem): void {
    this.erroRateio.set(null);
    // A lista de UAs ativas e as sugestões do fornecedor só são buscadas quando alguém vai editar.
    if (this.unidades().length === 0) {
      this.unidadeOrcamentariaService.listar({ ativa: true }).subscribe((unidades) => this.unidades.set(unidades));
      this.unidadeOrcamentariaService.usadasPorFornecedor(this.fornecedorId()).subscribe((usadas) => this.sugestoes.set(usadas));
    }

    this.itemEmEdicao.set(item);
  }

  protected fecharEdicao(): void {
    this.itemEmEdicao.set(null);
  }

  protected linhasIniciais(item: ObrigacaoUaItem): RateioUaLinha[] {
    return item.linhas.map((l) => ({ unidadeOrcamentariaId: l.unidadeOrcamentariaId, quantidade: l.quantidade }));
  }

  protected salvar(linhas: RateioUaLinha[]): void {
    const item = this.itemEmEdicao();
    if (!item) {
      return;
    }

    this.salvando.set(true);
    this.erroRateio.set(null);
    this.obrigacaoService.definirUas(this.obrigacaoId(), item.itemId, linhas).subscribe({
      next: (uas) => {
        this.salvando.set(false);
        this.itemEmEdicao.set(null);
        this.uas.set(uas);
      },
      error: (err) => {
        this.salvando.set(false);
        this.erroRateio.set(err?.error?.message ?? 'Não foi possível salvar as UAs.');
      },
    });
  }
}
