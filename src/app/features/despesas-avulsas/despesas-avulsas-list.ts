import { DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Fornecedor } from '../fornecedores/fornecedor';
import { FornecedorService } from '../fornecedores/fornecedor.service';
import { Icon } from '../../shared/icons/icon';
import { DataBrPipe } from '../../shared/pipes/data-br.pipe';
import { DespesaAvulsa, DespesaAvulsaFiltro } from './despesa-avulsa';
import { DespesaAvulsaService } from './despesa-avulsa.service';

@Component({
  selector: 'app-despesas-avulsas-list',
  imports: [FormsModule, RouterLink, Icon, DataBrPipe, DecimalPipe],
  templateUrl: './despesas-avulsas-list.html',
  styleUrl: './despesas-avulsas-list.scss',
})
export class DespesasAvulsasList {
  private readonly despesaAvulsaService = inject(DespesaAvulsaService);
  private readonly fornecedorService = inject(FornecedorService);

  protected readonly despesas = signal<DespesaAvulsa[]>([]);
  protected readonly fornecedores = signal<Fornecedor[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal(false);

  protected filtro: DespesaAvulsaFiltro = {};

  constructor() {
    this.fornecedorService.listar().subscribe((fornecedores) => this.fornecedores.set(fornecedores));
    this.buscar();
  }

  protected buscar(): void {
    this.carregando.set(true);
    this.erro.set(false);

    this.despesaAvulsaService.listar(this.filtro).subscribe({
      next: (despesas) => {
        this.despesas.set(despesas);
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

  protected totalValor(): number {
    return this.despesas().reduce((soma, d) => soma + d.valor, 0);
  }
}
