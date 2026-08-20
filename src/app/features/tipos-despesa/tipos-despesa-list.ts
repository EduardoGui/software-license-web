import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Icon } from '../../shared/icons/icon';
import { TipoDespesa, TipoDespesaFiltro } from './tipo-despesa';
import { TipoDespesaService } from './tipo-despesa.service';

@Component({
  selector: 'app-tipos-despesa-list',
  imports: [FormsModule, RouterLink, Icon],
  templateUrl: './tipos-despesa-list.html',
  styleUrl: './tipos-despesa-list.scss',
})
export class TiposDespesaList {
  private readonly tipoDespesaService = inject(TipoDespesaService);

  protected readonly tipos = signal<TipoDespesa[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal(false);

  protected filtro: TipoDespesaFiltro = { ativo: true };

  constructor() {
    this.buscar();
  }

  protected buscar(): void {
    this.carregando.set(true);
    this.erro.set(false);

    this.tipoDespesaService.listar(this.filtro).subscribe({
      next: (tipos) => {
        this.tipos.set(tipos);
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
