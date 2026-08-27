import { DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Icon } from '../../shared/icons/icon';
import { NotaDebitoPj, NotaDebitoPjFiltro } from './nota-debito-pj';
import { NotaDebitoPjService } from './nota-debito-pj.service';

@Component({
  selector: 'app-notas-debito-pj-list',
  imports: [FormsModule, RouterLink, Icon, DecimalPipe],
  templateUrl: './notas-debito-pj-list.html',
  styleUrl: './notas-debito-pj-list.scss',
})
export class NotasDebitoPjList {
  private readonly notaService = inject(NotaDebitoPjService);

  protected readonly notas = signal<NotaDebitoPj[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal(false);

  protected filtro: NotaDebitoPjFiltro = {};

  constructor() {
    this.buscar();
  }

  protected buscar(): void {
    this.carregando.set(true);
    this.erro.set(false);

    this.notaService.listar(this.filtro).subscribe({
      next: (notas) => {
        this.notas.set(notas);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set(true);
        this.carregando.set(false);
      },
    });
  }

  protected limparFiltro(): void {
    this.filtro = {};
    this.buscar();
  }

  protected baixarPdf(nota: NotaDebitoPj): void {
    this.notaService.baixarPdf(nota.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `nota-debito-${String(nota.id).padStart(4, '0')}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => alert('Não foi possível baixar o PDF.'),
    });
  }
}
