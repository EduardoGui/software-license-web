import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { DataBrPipe } from '../../shared/pipes/data-br.pipe';
import { Inventario } from '../equipamentos/inventario';
import { EquipamentoService } from '../equipamentos/equipamento.service';

@Component({
  selector: 'app-inventario-page',
  imports: [FormsModule, DataBrPipe],
  templateUrl: './inventario-page.html',
  styleUrl: './inventario-page.scss',
})
export class InventarioPage {
  private readonly equipamentoService = inject(EquipamentoService);

  protected readonly inventario = signal<Inventario | null>(null);
  protected readonly carregando = signal(true);
  protected readonly erro = signal(false);

  protected dataChegadaInicio = '';
  protected dataChegadaFim = '';

  constructor() {
    this.carregar();
  }

  protected carregar(): void {
    this.carregando.set(true);
    this.erro.set(false);

    this.equipamentoService
      .inventario({
        dataChegadaInicio: this.dataChegadaInicio || undefined,
        dataChegadaFim: this.dataChegadaFim || undefined,
      })
      .subscribe({
        next: (inventario) => {
          this.inventario.set(inventario);
          this.carregando.set(false);
        },
        error: () => {
          this.erro.set(true);
          this.carregando.set(false);
        },
      });
  }

  protected limparFiltro(): void {
    this.dataChegadaInicio = '';
    this.dataChegadaFim = '';
    this.carregar();
  }
}
