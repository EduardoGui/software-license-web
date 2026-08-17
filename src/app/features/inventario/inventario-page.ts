import { Component, inject, signal } from '@angular/core';

import { Inventario } from '../equipamentos/inventario';
import { EquipamentoService } from '../equipamentos/equipamento.service';

@Component({
  selector: 'app-inventario-page',
  imports: [],
  templateUrl: './inventario-page.html',
  styleUrl: './inventario-page.scss',
})
export class InventarioPage {
  private readonly equipamentoService = inject(EquipamentoService);

  protected readonly inventario = signal<Inventario | null>(null);
  protected readonly carregando = signal(true);
  protected readonly erro = signal(false);

  constructor() {
    this.equipamentoService.inventario().subscribe({
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
}
