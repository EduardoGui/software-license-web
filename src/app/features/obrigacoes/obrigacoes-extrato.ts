import { DecimalPipe } from '@angular/common';
import { Component, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { DataBrPipe } from '../../shared/pipes/data-br.pipe';
import { Obrigacao } from './obrigacao';
import { ObrigacaoService } from './obrigacao.service';

@Component({
  selector: 'app-obrigacoes-extrato',
  imports: [DataBrPipe, DecimalPipe, RouterLink],
  templateUrl: './obrigacoes-extrato.html',
  styleUrl: './obrigacoes-extrato.scss',
})
export class ObrigacoesExtrato {
  private readonly obrigacaoService = inject(ObrigacaoService);

  readonly contratoId = input<number>();
  readonly ordemCompraId = input<number>();

  protected readonly obrigacoes = signal<Obrigacao[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal(false);
  protected readonly mostrarCanceladas = signal(false);

  constructor() {
    effect(() => {
      this.carregar(this.contratoId(), this.ordemCompraId(), this.mostrarCanceladas());
    });
  }

  private carregar(contratoId: number | undefined, ordemCompraId: number | undefined, mostrarCanceladas: boolean): void {
    this.carregando.set(true);
    this.erro.set(false);

    this.obrigacaoService
      .listar({ contratoId, ordemCompraId, cancelada: mostrarCanceladas ? undefined : false })
      .subscribe({
        next: (obrigacoes) => {
          this.obrigacoes.set(obrigacoes);
          this.carregando.set(false);
        },
        error: () => {
          this.erro.set(true);
          this.carregando.set(false);
        },
      });
  }

  protected alternarCanceladas(): void {
    this.mostrarCanceladas.set(!this.mostrarCanceladas());
  }

  /** Chamado pela tela que a incorpora (Contrato/OC) sempre que uma ação lá fora pode ter criado, alterado ou cancelado uma Obrigação. */
  recarregar(): void {
    this.carregar(this.contratoId(), this.ordemCompraId(), this.mostrarCanceladas());
  }

  // Ordem de Compra em várias parcelas: soma dos boletos x valor da NF (ou total da OC, se a NF ainda não chegou).
  protected resumoParcelas(): { soma: number; referencia: number; rotulo: string; divergente: boolean } | null {
    const comParcelas = this.obrigacoes().find((o) => o.somaParcelas !== null && o.valorReferenciaParcelas !== null);
    if (!comParcelas) {
      return null;
    }

    const soma = comParcelas.somaParcelas!;
    const referencia = comParcelas.valorReferenciaParcelas!;
    return {
      soma,
      referencia,
      rotulo: comParcelas.valorNota !== null ? 'valor da NF' : 'total da OC',
      divergente: Math.abs(soma - referencia) >= 0.005,
    };
  }

  protected classeEtapa(etapa: string): string {
    return 'badge--' + etapa.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/\s+/g, '-');
  }

  protected competenciaBr(iso: string): string {
    const [ano, mes] = iso.split('-');
    return `${mes}/${ano}`;
  }
}
