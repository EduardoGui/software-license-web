import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Icon } from '../../shared/icons/icon';
import { Fornecedor, FornecedorFiltro } from './fornecedor';
import { FornecedorService } from './fornecedor.service';

@Component({
  selector: 'app-fornecedores-list',
  imports: [FormsModule, RouterLink, Icon],
  templateUrl: './fornecedores-list.html',
  styleUrl: './fornecedores-list.scss',
})
export class FornecedoresList {
  private readonly fornecedorService = inject(FornecedorService);

  protected readonly fornecedores = signal<Fornecedor[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal(false);

  protected filtro: FornecedorFiltro = { ativo: true };

  constructor() {
    this.buscar();
  }

  protected buscar(): void {
    this.carregando.set(true);
    this.erro.set(false);

    this.fornecedorService.listar(this.filtro).subscribe({
      next: (fornecedores) => {
        this.fornecedores.set(fornecedores);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set(true);
        this.carregando.set(false);
      },
    });
  }

  protected limparFiltro(): void {
    this.filtro = { ativo: true };
    this.buscar();
  }
}
