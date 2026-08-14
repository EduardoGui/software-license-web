import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Icon } from '../../shared/icons/icon';
import { Licenca, LicencaFiltro } from './licenca';
import { LicencaService } from './licenca.service';

@Component({
  selector: 'app-licencas-list',
  imports: [FormsModule, RouterLink, Icon],
  templateUrl: './licencas-list.html',
  styleUrl: './licencas-list.scss',
})
export class LicencasList {
  private readonly licencaService = inject(LicencaService);

  protected readonly licencas = signal<Licenca[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal(false);
  protected readonly desativandoId = signal<number | null>(null);

  protected filtro: LicencaFiltro = { status: 'Ativa' };

  constructor() {
    this.buscar();
  }

  protected buscar(): void {
    this.carregando.set(true);
    this.erro.set(false);

    this.licencaService.listar(this.filtro).subscribe({
      next: (licencas) => {
        this.licencas.set(licencas);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set(true);
        this.carregando.set(false);
      },
    });
  }

  protected limparFiltro(): void {
    this.filtro = { status: 'Ativa' };
    this.buscar();
  }

  protected desativar(licenca: Licenca): void {
    const confirmado = confirm(`Desativar a licença "${licenca.nome}"?`);
    if (!confirmado) {
      return;
    }

    this.desativandoId.set(licenca.id);
    this.licencaService.desativar(licenca.id).subscribe({
      next: () => {
        this.desativandoId.set(null);
        this.buscar();
      },
      error: () => {
        this.desativandoId.set(null);
        alert('Não foi possível desativar a licença.');
      },
    });
  }
}
