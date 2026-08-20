import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Icon } from '../../shared/icons/icon';
import { Local, LocalFiltro } from './local';
import { LocalService } from './local.service';

@Component({
  selector: 'app-locais-list',
  imports: [FormsModule, RouterLink, Icon],
  templateUrl: './locais-list.html',
  styleUrl: './locais-list.scss',
})
export class LocaisList {
  private readonly localService = inject(LocalService);

  protected readonly locais = signal<Local[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal(false);

  protected filtro: LocalFiltro = { ativo: true };

  constructor() {
    this.buscar();
  }

  protected buscar(): void {
    this.carregando.set(true);
    this.erro.set(false);

    this.localService.listar(this.filtro).subscribe({
      next: (locais) => {
        this.locais.set(locais);
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
