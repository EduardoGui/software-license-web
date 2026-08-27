import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Icon } from '../../shared/icons/icon';
import { EmpresaPj, EmpresaPjFiltro } from './empresa-pj';
import { EmpresaPjService } from './empresa-pj.service';

@Component({
  selector: 'app-empresas-pj-list',
  imports: [FormsModule, RouterLink, Icon],
  templateUrl: './empresas-pj-list.html',
  styleUrl: './empresas-pj-list.scss',
})
export class EmpresasPjList {
  private readonly empresaPjService = inject(EmpresaPjService);

  protected readonly empresas = signal<EmpresaPj[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal(false);

  protected filtro: EmpresaPjFiltro = { ativa: true };

  constructor() {
    this.buscar();
  }

  protected buscar(): void {
    this.carregando.set(true);
    this.erro.set(false);

    this.empresaPjService.listar(this.filtro).subscribe({
      next: (empresas) => {
        this.empresas.set(empresas);
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
