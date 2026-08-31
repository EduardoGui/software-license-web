import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Fornecedor } from '../fornecedores/fornecedor';
import { FornecedorService } from '../fornecedores/fornecedor.service';
import { Icon } from '../../shared/icons/icon';
import { DataBrPipe } from '../../shared/pipes/data-br.pipe';
import { NotaFiscalEntrada, NotaFiscalEntradaFiltro } from './nota-fiscal-entrada';
import { NotaFiscalEntradaService } from './nota-fiscal-entrada.service';

@Component({
  selector: 'app-notas-fiscais-entrada-list',
  imports: [FormsModule, RouterLink, Icon, DataBrPipe],
  templateUrl: './notas-fiscais-entrada-list.html',
  styleUrl: './notas-fiscais-entrada-list.scss',
})
export class NotasFiscaisEntradaList {
  private readonly notaFiscalEntradaService = inject(NotaFiscalEntradaService);
  private readonly fornecedorService = inject(FornecedorService);

  protected readonly notas = signal<NotaFiscalEntrada[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal(false);
  protected readonly fornecedores = signal<Fornecedor[]>([]);

  protected filtro: NotaFiscalEntradaFiltro = {};

  constructor() {
    this.fornecedorService.listar().subscribe((fornecedores) => this.fornecedores.set(fornecedores));
    this.buscar();
  }

  protected buscar(): void {
    this.carregando.set(true);
    this.erro.set(false);

    this.notaFiscalEntradaService.listar(this.filtro).subscribe({
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
}
