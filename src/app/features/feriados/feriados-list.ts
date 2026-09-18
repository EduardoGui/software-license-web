import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { DataBrPipe } from '../../shared/pipes/data-br.pipe';
import { Icon } from '../../shared/icons/icon';
import { Feriado, FeriadoFiltro } from './feriado';
import { FeriadoService } from './feriado.service';

@Component({
  selector: 'app-feriados-list',
  imports: [FormsModule, RouterLink, Icon, DataBrPipe],
  templateUrl: './feriados-list.html',
  styleUrl: './feriados-list.scss',
})
export class FeriadosList {
  private readonly feriadoService = inject(FeriadoService);

  protected readonly feriados = signal<Feriado[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal(false);

  protected filtro: FeriadoFiltro = { ativo: true };

  constructor() {
    this.buscar();
  }

  protected buscar(): void {
    this.carregando.set(true);
    this.erro.set(false);

    this.feriadoService.listar(this.filtro).subscribe({
      next: (feriados) => {
        this.feriados.set(feriados);
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

  protected abrangenciaCompleta(feriado: Feriado): string {
    if (feriado.abrangencia === 'Estadual') return `Estadual (${feriado.uf})`;
    if (feriado.abrangencia === 'Municipal') return `Municipal (${feriado.municipio})`;
    return 'Nacional';
  }
}
