import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Local } from '../locais/local';
import { LocalService } from '../locais/local.service';
import { Icon } from '../../shared/icons/icon';
import { TipoPatrimonio } from '../tipos-patrimonio/tipo-patrimonio';
import { TipoPatrimonioService } from '../tipos-patrimonio/tipo-patrimonio.service';
import { PatrimonioItem, PatrimonioItemFiltro } from './patrimonio-item';
import { PatrimonioItemService } from './patrimonio-item.service';

@Component({
  selector: 'app-patrimonio-itens-list',
  imports: [FormsModule, RouterLink, Icon],
  templateUrl: './patrimonio-itens-list.html',
  styleUrl: './patrimonio-itens-list.scss',
})
export class PatrimonioItensList {
  private readonly patrimonioItemService = inject(PatrimonioItemService);
  private readonly tipoPatrimonioService = inject(TipoPatrimonioService);
  private readonly localService = inject(LocalService);
  private readonly route = inject(ActivatedRoute);

  protected readonly itens = signal<PatrimonioItem[]>([]);
  protected readonly tipos = signal<TipoPatrimonio[]>([]);
  protected readonly locais = signal<Local[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal(false);
  protected readonly baixandoId = signal<number | null>(null);
  protected readonly exportando = signal(false);

  protected filtro: PatrimonioItemFiltro = { status: 'Ativo' };

  constructor() {
    this.tipoPatrimonioService.listar({ ativo: true }).subscribe((tipos) => this.tipos.set(tipos));
    this.localService.listar({ ativo: true }).subscribe((locais) => this.locais.set(locais));

    const notaFiscalEntradaId = this.route.snapshot.queryParamMap.get('notaFiscalEntradaId');
    if (notaFiscalEntradaId) {
      this.filtro = { notaFiscalEntradaId: Number(notaFiscalEntradaId) };
    }

    this.buscar();
  }

  protected buscar(): void {
    this.carregando.set(true);
    this.erro.set(false);

    this.patrimonioItemService.listar(this.filtro).subscribe({
      next: (itens) => {
        this.itens.set(itens);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set(true);
        this.carregando.set(false);
      },
    });
  }

  protected exportar(): void {
    this.exportando.set(true);
    this.patrimonioItemService.exportarExcel(this.filtro).subscribe({
      next: (blob) => {
        this.exportando.set(false);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `patrimonio-${new Date().toISOString().slice(0, 10)}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.exportando.set(false);
        alert('Não foi possível exportar o relatório.');
      },
    });
  }

  protected limparFiltro(): void {
    this.filtro = { status: 'Ativo' };
    this.buscar();
  }

  protected baixar(item: PatrimonioItem): void {
    const confirmado = confirm(`Dar baixa no item "${item.tipoPatrimonioNome}${item.numeroPatrimonio ? ' (' + item.numeroPatrimonio + ')' : ''}"?`);
    if (!confirmado) {
      return;
    }

    this.baixandoId.set(item.id);
    this.patrimonioItemService.baixar(item.id).subscribe({
      next: () => {
        this.baixandoId.set(null);
        this.buscar();
      },
      error: () => {
        this.baixandoId.set(null);
        alert('Não foi possível dar baixa no item.');
      },
    });
  }
}
