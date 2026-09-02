import { DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Fornecedor } from '../fornecedores/fornecedor';
import { FornecedorService } from '../fornecedores/fornecedor.service';
import { Icon } from '../../shared/icons/icon';
import { DataBrPipe } from '../../shared/pipes/data-br.pipe';
import { Contrato, ContratoFiltro } from './contrato';
import { ContratoService } from './contrato.service';

@Component({
  selector: 'app-contratos-list',
  imports: [FormsModule, RouterLink, Icon, DataBrPipe, DecimalPipe],
  templateUrl: './contratos-list.html',
  styleUrl: './contratos-list.scss',
})
export class ContratosList {
  private readonly contratoService = inject(ContratoService);
  private readonly fornecedorService = inject(FornecedorService);

  protected readonly contratos = signal<Contrato[]>([]);
  protected readonly fornecedores = signal<Fornecedor[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal(false);

  protected filtro: ContratoFiltro = { status: 'Ativo' };

  constructor() {
    this.fornecedorService.listar().subscribe((fornecedores) => this.fornecedores.set(fornecedores));
    this.buscar();
  }

  protected buscar(): void {
    this.carregando.set(true);
    this.erro.set(false);

    this.contratoService.listar(this.filtro).subscribe({
      next: (contratos) => {
        this.contratos.set(contratos);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set(true);
        this.carregando.set(false);
      },
    });
  }

  protected limparFiltro(): void {
    this.filtro = { status: 'Ativo' };
    this.buscar();
  }
}
