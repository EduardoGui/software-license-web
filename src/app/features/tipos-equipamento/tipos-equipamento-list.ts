import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Icon } from '../../shared/icons/icon';
import { TipoEquipamento, TipoEquipamentoFiltro } from './tipo-equipamento';
import { TipoEquipamentoService } from './tipo-equipamento.service';

@Component({
  selector: 'app-tipos-equipamento-list',
  imports: [FormsModule, RouterLink, Icon],
  templateUrl: './tipos-equipamento-list.html',
  styleUrl: './tipos-equipamento-list.scss',
})
export class TiposEquipamentoList {
  private readonly tipoEquipamentoService = inject(TipoEquipamentoService);

  protected readonly tipos = signal<TipoEquipamento[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal(false);

  protected filtro: TipoEquipamentoFiltro = { ativo: true };

  constructor() {
    this.buscar();
  }

  protected buscar(): void {
    this.carregando.set(true);
    this.erro.set(false);

    this.tipoEquipamentoService.listar(this.filtro).subscribe({
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
