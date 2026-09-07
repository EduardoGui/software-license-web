import { DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Fornecedor } from '../fornecedores/fornecedor';
import { FornecedorService } from '../fornecedores/fornecedor.service';
import { Local } from '../locais/local';
import { LocalService } from '../locais/local.service';
import { Icon } from '../../shared/icons/icon';
import { DataBrPipe } from '../../shared/pipes/data-br.pipe';
import { OrdemCompra, OrdemCompraFiltro } from './ordem-compra';
import { OrdemCompraService } from './ordem-compra.service';

@Component({
  selector: 'app-ordens-compra-list',
  imports: [FormsModule, RouterLink, Icon, DataBrPipe, DecimalPipe],
  templateUrl: './ordens-compra-list.html',
  styleUrl: './ordens-compra-list.scss',
})
export class OrdensCompraList {
  private readonly ordemCompraService = inject(OrdemCompraService);
  private readonly fornecedorService = inject(FornecedorService);
  private readonly localService = inject(LocalService);

  protected readonly ordens = signal<OrdemCompra[]>([]);
  protected readonly fornecedores = signal<Fornecedor[]>([]);
  protected readonly locais = signal<Local[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal(false);

  protected filtro: OrdemCompraFiltro = {};

  constructor() {
    this.fornecedorService.listar().subscribe((fornecedores) => this.fornecedores.set(fornecedores));
    this.localService.listar().subscribe((locais) => this.locais.set(locais));
    this.buscar();
  }

  protected buscar(): void {
    this.carregando.set(true);
    this.erro.set(false);

    this.ordemCompraService.listar(this.filtro).subscribe({
      next: (ordens) => {
        this.ordens.set(ordens);
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
