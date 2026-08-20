import { DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { DataBrPipe } from '../../shared/pipes/data-br.pipe';
import { ReembolsoDespesa } from './reembolso-despesa';
import { ReembolsoDespesaService } from './reembolso-despesa.service';

@Component({
  selector: 'app-reembolsos-despesa-pendentes-list',
  imports: [RouterLink, DataBrPipe, DecimalPipe],
  templateUrl: './reembolsos-despesa-pendentes-list.html',
  styleUrl: './reembolsos-despesa-pendentes-list.scss',
})
export class ReembolsosDespesaPendentesList {
  private readonly reembolsoDespesaService = inject(ReembolsoDespesaService);

  protected readonly reembolsos = signal<ReembolsoDespesa[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal(false);

  constructor() {
    this.buscar();
  }

  private buscar(): void {
    this.carregando.set(true);
    this.erro.set(false);

    this.reembolsoDespesaService.listarPendentesAprovacao().subscribe({
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

  protected aprovar(reembolso: ReembolsoDespesa): void {
    if (!confirm(`Aprovar o reembolso ${reembolso.numero} de ${reembolso.usuarioNome}?`)) {
      return;
    }

    this.reembolsoDespesaService.aprovar(reembolso.id).subscribe({
      next: () => this.reembolsos.update((lista) => lista.filter((r) => r.id !== reembolso.id)),
      error: (err) => alert(err?.error?.message ?? 'Não foi possível aprovar o reembolso.'),
    });
  }
}
