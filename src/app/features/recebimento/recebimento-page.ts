import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { DataBrPipe } from '../../shared/pipes/data-br.pipe';
import { ROTULOS_TIPO_DIVERGENCIA } from '../campanhas-entrega/campanha-entrega';
import { Recebimento } from './recebimento';
import { RecebimentoService } from './recebimento.service';

@Component({
  selector: 'app-recebimento-page',
  imports: [ReactiveFormsModule, DataBrPipe],
  templateUrl: './recebimento-page.html',
  styleUrl: './recebimento-page.scss',
})
export class RecebimentoPage {
  private readonly recebimentoService = inject(RecebimentoService);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  private readonly token = this.route.snapshot.paramMap.get('token') ?? '';

  protected readonly recebimento = signal<Recebimento | null>(null);
  protected readonly carregando = signal(true);
  protected readonly erro = signal<string | null>(null);
  protected readonly processando = signal(false);
  protected readonly erroAcao = signal<string | null>(null);

  protected readonly divergenciaAberta = signal(false);
  protected readonly rotulosDivergencia = ROTULOS_TIPO_DIVERGENCIA;

  protected readonly formDivergencia = this.fb.nonNullable.group({
    tipoDivergencia: ['', Validators.required],
    observacao: [''],
  });

  constructor() {
    this.carregar();
  }

  private carregar(): void {
    if (!this.token) {
      this.erro.set('Link inválido.');
      this.carregando.set(false);
      return;
    }

    this.recebimentoService.obter(this.token).subscribe({
      next: (r) => {
        this.recebimento.set(r);
        this.carregando.set(false);
      },
      error: (err) => {
        this.erro.set(err?.error?.message ?? 'Link inválido ou expirado.');
        this.carregando.set(false);
      },
    });
  }

  protected confirmar(): void {
    this.processando.set(true);
    this.erroAcao.set(null);

    this.recebimentoService.confirmar(this.token).subscribe({
      next: (r) => {
        this.recebimento.set(r);
        this.processando.set(false);
      },
      error: (err) => {
        this.processando.set(false);
        this.erroAcao.set(err?.error?.message ?? 'Não foi possível confirmar. Tente novamente.');
      },
    });
  }

  protected abrirDivergencia(): void {
    this.erroAcao.set(null);
    this.formDivergencia.reset({ tipoDivergencia: '', observacao: '' });
    this.divergenciaAberta.set(true);
  }

  protected fecharDivergencia(): void {
    this.divergenciaAberta.set(false);
  }

  protected enviarDivergencia(): void {
    if (this.formDivergencia.invalid) {
      this.formDivergencia.markAllAsTouched();
      return;
    }

    const valor = this.formDivergencia.getRawValue();
    this.processando.set(true);
    this.erroAcao.set(null);

    this.recebimentoService
      .registrarDivergencia(this.token, { tipoDivergencia: valor.tipoDivergencia, observacao: valor.observacao || null })
      .subscribe({
        next: (r) => {
          this.recebimento.set(r);
          this.processando.set(false);
          this.divergenciaAberta.set(false);
        },
        error: (err) => {
          this.processando.set(false);
          this.erroAcao.set(err?.error?.message ?? 'Não foi possível registrar a divergência. Tente novamente.');
        },
      });
  }
}
