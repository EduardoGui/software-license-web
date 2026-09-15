import { DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { AnexosSecao } from '../../shared/anexos/anexos-secao';
import { DataBrPipe } from '../../shared/pipes/data-br.pipe';
import { Icon } from '../../shared/icons/icon';
import { NotaDebitoPj } from '../notas-debito-pj/nota-debito-pj';
import { NotaDebitoPjService } from '../notas-debito-pj/nota-debito-pj.service';
import { FaturaOperadoraSaude } from './fatura-plano-saude';
import { FaturaOperadoraSaudeService } from './fatura-plano-saude.service';

@Component({
  selector: 'app-fatura-plano-saude-view',
  imports: [RouterLink, Icon, DecimalPipe, DataBrPipe, AnexosSecao],
  templateUrl: './fatura-plano-saude-view.html',
  styleUrl: './fatura-plano-saude-view.scss',
})
export class FaturaPlanoSaudeView {
  private readonly faturaService = inject(FaturaOperadoraSaudeService);
  private readonly notaService = inject(NotaDebitoPjService);
  private readonly route = inject(ActivatedRoute);

  protected readonly fatura = signal<FaturaOperadoraSaude | null>(null);
  protected readonly notasDebito = signal<NotaDebitoPj[]>([]);
  protected readonly carregando = signal(true);
  protected readonly carregandoNotas = signal(true);
  protected readonly erro = signal<string | null>(null);

  private readonly faturaId = Number(this.route.snapshot.paramMap.get('id'));

  constructor() {
    this.carregar();
  }

  private carregar(): void {
    this.carregando.set(true);
    this.faturaService.obter(this.faturaId).subscribe({
      next: (fatura) => {
        this.fatura.set(fatura);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set('Não foi possível carregar a fatura.');
        this.carregando.set(false);
      },
    });

    this.notaService.listar({ faturaOperadoraSaudeId: this.faturaId }).subscribe({
      next: (notas) => {
        this.notasDebito.set(notas);
        this.carregandoNotas.set(false);
      },
      error: () => this.carregandoNotas.set(false),
    });
  }
}
