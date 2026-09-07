import { DecimalPipe, Location } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { AnexosSecao } from '../../shared/anexos/anexos-secao';
import { DataBrPipe } from '../../shared/pipes/data-br.pipe';
import { DespesaAvulsa } from './despesa-avulsa';
import { DespesaAvulsaService } from './despesa-avulsa.service';

@Component({
  selector: 'app-despesa-avulsa-view',
  imports: [RouterLink, DataBrPipe, DecimalPipe, AnexosSecao],
  templateUrl: './despesa-avulsa-view.html',
  styleUrl: './despesa-avulsa-view.scss',
})
export class DespesaAvulsaView {
  private readonly despesaAvulsaService = inject(DespesaAvulsaService);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);

  protected readonly despesaId = Number(this.route.snapshot.paramMap.get('id'));

  protected readonly despesa = signal<DespesaAvulsa | null>(null);
  protected readonly carregando = signal(true);
  protected readonly erro = signal(false);

  constructor() {
    this.carregar();
  }

  protected voltar(): void {
    this.location.back();
  }

  private carregar(): void {
    this.carregando.set(true);
    this.erro.set(false);

    this.despesaAvulsaService.obter(this.despesaId).subscribe({
      next: (d) => {
        this.despesa.set(d);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set(true);
        this.carregando.set(false);
      },
    });
  }
}
