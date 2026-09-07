import { DecimalPipe, Location } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { AnexosSecao } from '../../shared/anexos/anexos-secao';
import { Icon } from '../../shared/icons/icon';
import { DataBrPipe } from '../../shared/pipes/data-br.pipe';
import { OrdemCompraDetalhe } from './ordem-compra';
import { OrdemCompraService } from './ordem-compra.service';

@Component({
  selector: 'app-ordem-compra-view',
  imports: [RouterLink, DataBrPipe, DecimalPipe, AnexosSecao, Icon],
  templateUrl: './ordem-compra-view.html',
  styleUrl: './ordem-compra-view.scss',
})
export class OrdemCompraView {
  private readonly ordemCompraService = inject(OrdemCompraService);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);

  protected readonly ordemCompraId = Number(this.route.snapshot.paramMap.get('id'));

  protected readonly ordemCompra = signal<OrdemCompraDetalhe | null>(null);
  protected readonly carregando = signal(true);
  protected readonly erro = signal(false);

  protected readonly processando = signal(false);
  protected readonly erroAcao = signal<string | null>(null);
  protected readonly baixandoPdf = signal(false);

  constructor() {
    this.carregar();
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
