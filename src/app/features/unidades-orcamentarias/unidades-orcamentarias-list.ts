import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Setor } from '../setores/setor';
import { SetorService } from '../setores/setor.service';
import { Icon } from '../../shared/icons/icon';
import { UnidadeOrcamentaria, UnidadeOrcamentariaFiltro } from './unidade-orcamentaria';
import { UnidadeOrcamentariaService } from './unidade-orcamentaria.service';

@Component({
  selector: 'app-unidades-orcamentarias-list',
  imports: [FormsModule, RouterLink, Icon],
  templateUrl: './unidades-orcamentarias-list.html',
  styleUrl: './unidades-orcamentarias-list.scss',
})
export class UnidadesOrcamentariasList {
  private readonly unidadeOrcamentariaService = inject(UnidadeOrcamentariaService);
  private readonly setorService = inject(SetorService);

  protected readonly unidades = signal<UnidadeOrcamentaria[]>([]);
  protected readonly setores = signal<Setor[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal(false);

  protected filtro: UnidadeOrcamentariaFiltro = { ativa: true };

  constructor() {
    this.setorService.listar().subscribe((setores) => this.setores.set(setores));
    this.buscar();
  }

  protected buscar(): void {
    this.carregando.set(true);
    this.erro.set(false);

    this.unidadeOrcamentariaService.listar(this.filtro).subscribe({
      next: (unidades) => {
        this.unidades.set(unidades);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set(true);
        this.carregando.set(false);
      },
    });
  }

  protected limparFiltro(): void {
    this.filtro = { ativa: true };
    this.buscar();
  }
}
