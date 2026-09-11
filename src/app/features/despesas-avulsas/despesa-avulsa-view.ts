import { DecimalPipe, Location } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

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
  private readonly router = inject(Router);

  protected readonly despesaId = Number(this.route.snapshot.paramMap.get('id'));

  protected readonly despesa = signal<DespesaAvulsa | null>(null);
  protected readonly carregando = signal(true);
  protected readonly erro = signal(false);

  protected readonly excluindo = signal(false);
  protected readonly erroExclusao = signal<string | null>(null);

  constructor() {
    this.carregar();
  }

  protected voltar(): void {
    this.location.back();
  }

  protected excluir(): void {
    if (!confirm('Excluir esta despesa avulsa? Essa ação não pode ser desfeita.')) {
      return;
    }

    this.excluindo.set(true);
    this.erroExclusao.set(null);

    this.despesaAvulsaService.excluir(this.despesaId).subscribe({
      next: () => {
        this.router.navigate(['/despesas-avulsas']);
      },
      error: (err) => {
        this.excluindo.set(false);
        this.erroExclusao.set(err?.error?.message ?? 'Não foi possível excluir.');
      },
    });
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
