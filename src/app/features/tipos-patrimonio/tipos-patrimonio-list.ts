import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Icon } from '../../shared/icons/icon';
import { TipoPatrimonio, TipoPatrimonioFiltro } from './tipo-patrimonio';
import { TipoPatrimonioService } from './tipo-patrimonio.service';

@Component({
  selector: 'app-tipos-patrimonio-list',
  imports: [FormsModule, RouterLink, Icon],
  templateUrl: './tipos-patrimonio-list.html',
  styleUrl: './tipos-patrimonio-list.scss',
})
export class TiposPatrimonioList {
  private readonly tipoPatrimonioService = inject(TipoPatrimonioService);

  protected readonly tipos = signal<TipoPatrimonio[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal(false);

  protected filtro: TipoPatrimonioFiltro = { ativo: true };

  constructor() {
    this.buscar();
  }

  protected buscar(): void {
    this.carregando.set(true);
    this.erro.set(false);

    this.tipoPatrimonioService.listar(this.filtro).subscribe({
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
