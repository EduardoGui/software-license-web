import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Icon } from '../../shared/icons/icon';
import { Setor, SetorFiltro } from './setor';
import { SetorService } from './setor.service';

@Component({
  selector: 'app-setores-list',
  imports: [FormsModule, RouterLink, Icon],
  templateUrl: './setores-list.html',
  styleUrl: './setores-list.scss',
})
export class SetoresList {
  private readonly setorService = inject(SetorService);

  protected readonly setores = signal<Setor[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal(false);

  protected filtro: SetorFiltro = { ativo: true };

  constructor() {
    this.buscar();
  }

  protected buscar(): void {
    this.carregando.set(true);
    this.erro.set(false);

    this.setorService.listar(this.filtro).subscribe({
      next: (setores) => {
        this.setores.set(setores);
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
