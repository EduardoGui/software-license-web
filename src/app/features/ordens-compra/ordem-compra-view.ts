import { DecimalPipe, Location } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { AnexosSecao } from '../../shared/anexos/anexos-secao';
import { Icon } from '../../shared/icons/icon';
import { DataBrPipe } from '../../shared/pipes/data-br.pipe';
import { ObrigacoesExtrato } from '../obrigacoes/obrigacoes-extrato';
import { RateioUaLinha, RateioUaModal } from '../../shared/rateio-ua/rateio-ua-modal';
import { UnidadeOrcamentaria, UnidadeOrcamentariaUsada } from '../unidades-orcamentarias/unidade-orcamentaria';
import { UnidadeOrcamentariaService } from '../unidades-orcamentarias/unidade-orcamentaria.service';
import { OrdemCompraDetalhe, OrdemCompraItem } from './ordem-compra';
import { OrdemCompraService } from './ordem-compra.service';

@Component({
  selector: 'app-ordem-compra-view',
  imports: [RouterLink, DataBrPipe, DecimalPipe, AnexosSecao, Icon, ObrigacoesExtrato, RateioUaModal],
  templateUrl: './ordem-compra-view.html',
  styleUrl: './ordem-compra-view.scss',
})
export class OrdemCompraView {
  private readonly ordemCompraService = inject(OrdemCompraService);
  private readonly unidadeOrcamentariaService = inject(UnidadeOrcamentariaService);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);

  protected readonly ordemCompraId = Number(this.route.snapshot.paramMap.get('id'));

  protected readonly ordemCompra = signal<OrdemCompraDetalhe | null>(null);
  protected readonly carregando = signal(true);
  protected readonly erro = signal(false);

  protected readonly processando = signal(false);
  protected readonly erroAcao = signal<string | null>(null);
  protected readonly baixandoPdf = signal(false);

  protected readonly unidadesOrcamentarias = signal<UnidadeOrcamentaria[]>([]);
  protected readonly sugestoesUa = signal<UnidadeOrcamentariaUsada[]>([]);
  protected readonly itemRateioUaEmEdicao = signal<OrdemCompraItem | null>(null);
  protected readonly salvandoRateioUa = signal(false);
  protected readonly erroRateioUa = signal<string | null>(null);

  constructor() {
    this.carregar();
    this.unidadeOrcamentariaService.listar({ ativa: true }).subscribe((unidades) => this.unidadesOrcamentarias.set(unidades));
  }

  protected itensSemUa(oc: OrdemCompraDetalhe): number {
    return oc.itens.filter((item) => item.rateioUa.length === 0).length;
  }

  protected abrirRateioUa(item: OrdemCompraItem): void {
    this.itemRateioUaEmEdicao.set(item);
    this.erroRateioUa.set(null);
    const fornecedorId = this.ordemCompra()?.fornecedorId;
    if (fornecedorId) {
      this.unidadeOrcamentariaService.usadasPorFornecedor(fornecedorId).subscribe((usadas) => this.sugestoesUa.set(usadas));
    }
  }

  protected fecharRateioUa(): void {
    this.itemRateioUaEmEdicao.set(null);
  }

  protected salvarRateioUa(linhas: RateioUaLinha[]): void {
    const item = this.itemRateioUaEmEdicao();
    if (!item) {
      return;
    }

    this.salvandoRateioUa.set(true);
    this.erroRateioUa.set(null);

    this.ordemCompraService.definirRateioUa(this.ordemCompraId, item.id, linhas).subscribe({
      next: () => {
        this.salvandoRateioUa.set(false);
        this.itemRateioUaEmEdicao.set(null);
        this.carregar();
      },
      error: (err) => {
        this.salvandoRateioUa.set(false);
        this.erroRateioUa.set(err?.error?.message ?? 'Não foi possível salvar o rateio de UA.');
      },
    });
  }

  protected voltar(): void {
    this.location.back();
  }

  private carregar(): void {
    this.carregando.set(true);
    this.erro.set(false);

    this.ordemCompraService.obter(this.ordemCompraId).subscribe({
      next: (oc) => {
        this.ordemCompra.set(oc);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set(true);
        this.carregando.set(false);
      },
    });
  }

  protected emitir(): void {
    this.processando.set(true);
    this.erroAcao.set(null);

    this.ordemCompraService.emitir(this.ordemCompraId).subscribe({
      next: () => {
        this.processando.set(false);
        this.carregar();
      },
      error: (err) => {
        this.processando.set(false);
        this.erroAcao.set(err?.error?.message ?? 'Não foi possível emitir a ordem de compra.');
      },
    });
  }

  protected reabrir(): void {
    if (!confirm('Reabrir esta ordem de compra para edição? Ela volta a Rascunho e precisará ser emitida de novo.')) {
      return;
    }

    this.processando.set(true);
    this.erroAcao.set(null);

    this.ordemCompraService.reabrir(this.ordemCompraId).subscribe({
      next: () => {
        this.processando.set(false);
        this.carregar();
      },
      error: (err) => {
        this.processando.set(false);
        this.erroAcao.set(err?.error?.message ?? 'Não foi possível reabrir a ordem de compra.');
      },
    });
  }

  protected marcarAssinada(): void {
    this.processando.set(true);
    this.erroAcao.set(null);

    this.ordemCompraService.marcarAssinada(this.ordemCompraId).subscribe({
      next: () => {
        this.processando.set(false);
        this.carregar();
      },
      error: (err) => {
        this.processando.set(false);
        this.erroAcao.set(err?.error?.message ?? 'Não foi possível marcar a ordem de compra como assinada.');
      },
    });
  }

  protected cancelar(): void {
    if (!confirm('Cancelar esta ordem de compra? Essa ação não pode ser desfeita.')) {
      return;
    }

    this.processando.set(true);
    this.erroAcao.set(null);

    this.ordemCompraService.cancelar(this.ordemCompraId).subscribe({
      next: () => {
        this.processando.set(false);
        this.carregar();
      },
      error: (err) => {
        this.processando.set(false);
        this.erroAcao.set(err?.error?.message ?? 'Não foi possível cancelar a ordem de compra.');
      },
    });
  }

  protected baixarPdf(): void {
    this.baixandoPdf.set(true);

    this.ordemCompraService.baixarPdf(this.ordemCompraId).subscribe({
      next: (blob) => {
        this.baixandoPdf.set(false);
        const numero = this.ordemCompra()?.numero.toString().padStart(3, '0') ?? this.ordemCompraId;
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `OC-${numero}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.baixandoPdf.set(false);
        this.erroAcao.set('Não foi possível gerar o PDF.');
      },
    });
  }
}
