import { Location } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { Icon } from '../../shared/icons/icon';
import { MovimentacaoSaldoFerias, PeriodoFerias, ROTULOS_TIPO_MOVIMENTACAO } from './periodo-ferias';
import { PeriodoFeriasService } from './periodo-ferias.service';

@Component({
  selector: 'app-periodo-ferias-detalhe',
  imports: [ReactiveFormsModule, Icon],
  templateUrl: './periodo-ferias-detalhe.html',
  styleUrl: './periodo-ferias-detalhe.scss',
})
export class PeriodoFeriasDetalhe {
  private readonly periodoFeriasService = inject(PeriodoFeriasService);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly fb = inject(FormBuilder);

  protected readonly periodoId = Number(this.route.snapshot.paramMap.get('id'));

  protected readonly periodo = signal<PeriodoFerias | null>(null);
  protected readonly movimentacoes = signal<MovimentacaoSaldoFerias[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal(false);

  protected readonly rotulosTipo = ROTULOS_TIPO_MOVIMENTACAO;

  protected readonly salvandoAjuste = signal(false);
  protected readonly erroAjuste = signal<string | null>(null);

  protected readonly formAjuste = this.fb.nonNullable.group({
    quantidade: this.fb.control<number | null>(null, [Validators.required]),
    observacao: ['', Validators.required],
  });

  constructor() {
    this.carregar();
  }

  protected voltar(): void {
    this.location.back();
  }

  private carregar(): void {
    this.carregando.set(true);
    this.erro.set(false);

    this.periodoFeriasService.obter(this.periodoId).subscribe({
      next: (periodo) => {
        this.periodo.set(periodo);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set(true);
        this.carregando.set(false);
      },
    });

    this.periodoFeriasService.listarMovimentacoes(this.periodoId).subscribe((movimentacoes) => this.movimentacoes.set(movimentacoes));
  }

  protected registrarAjuste(): void {
    if (this.formAjuste.invalid) {
      this.formAjuste.markAllAsTouched();
      return;
    }

    const valor = this.formAjuste.getRawValue();
    this.salvandoAjuste.set(true);
    this.erroAjuste.set(null);

    this.periodoFeriasService.registrarAjusteManual(this.periodoId, { quantidade: valor.quantidade!, observacao: valor.observacao }).subscribe({
      next: (periodo) => {
        this.periodo.set(periodo);
        this.salvandoAjuste.set(false);
        this.formAjuste.reset({ quantidade: null, observacao: '' });
        this.periodoFeriasService.listarMovimentacoes(this.periodoId).subscribe((movimentacoes) => this.movimentacoes.set(movimentacoes));
      },
      error: (err) => {
        this.salvandoAjuste.set(false);
        this.erroAjuste.set(err?.error?.message ?? 'Não foi possível registrar o ajuste manual.');
      },
    });
  }
}
