import { DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { DataBrPipe } from '../../shared/pipes/data-br.pipe';
import { ReembolsoDespesa } from './reembolso-despesa';
import { ReembolsoDespesaService } from './reembolso-despesa.service';

@Component({
  selector: 'app-reembolsos-despesa-aprovados-list',
  imports: [RouterLink, DataBrPipe, DecimalPipe],
  templateUrl: './reembolsos-despesa-aprovados-list.html',
  styleUrl: './reembolsos-despesa-pendentes-list.scss',
})
export class ReembolsosDespesaAprovadosList {
  private readonly reembolsoDespesaService = inject(ReembolsoDespesaService);

  protected readonly reembolsos = signal<ReembolsoDespesa[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal(false);

  constructor() {
    this.reembolsoDespesaService.listarAprovadosPorMim().subscribe({
      next: (reembolsos) => {
        this.reembolsos.set(reembolsos);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set(true);
        this.carregando.set(false);
      },
    });
  }
}
