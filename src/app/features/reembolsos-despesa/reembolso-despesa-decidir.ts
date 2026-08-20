import { Location } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Icon } from '../../shared/icons/icon';
import { ReembolsoDespesaService } from './reembolso-despesa.service';

@Component({
  selector: 'app-reembolso-despesa-decidir',
  imports: [ReactiveFormsModule, RouterLink, Icon],
  templateUrl: './reembolso-despesa-decidir.html',
  styleUrl: './reembolso-despesa-decidir.scss',
})
export class ReembolsoDespesaDecidir {
  private readonly fb = inject(FormBuilder);
  private readonly reembolsoDespesaService = inject(ReembolsoDespesaService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  private readonly reembolsoId = Number(this.route.snapshot.paramMap.get('id'));
  protected readonly acao = this.route.snapshot.data['acao'] as 'devolver' | 'reprovar';
  protected readonly contexto = (history.state ?? {}) as { numero?: string; usuarioNome?: string };

  protected readonly salvando = signal(false);
  protected readonly erro = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    observacaoAprovador: ['', this.acao === 'devolver' ? Validators.required : []],
  });

  protected get titulo(): string {
    return this.acao === 'devolver' ? 'Devolver para revisão' : 'Reprovar reembolso';
  }

  protected voltar(): void {
    this.location.back();
  }

  protected salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const observacao = this.form.getRawValue().observacaoAprovador || null;

    this.salvando.set(true);
    this.erro.set(null);

    const requisicao =
      this.acao === 'devolver'
        ? this.reembolsoDespesaService.devolver(this.reembolsoId, observacao!)
        : this.reembolsoDespesaService.reprovar(this.reembolsoId, observacao);

    requisicao.subscribe({
      next: () => this.router.navigate(['/reembolsos-despesa/pendentes']),
      error: (err) => {
        this.salvando.set(false);
        this.erro.set(err?.error?.message ?? 'Não foi possível registrar a decisão.');
      },
    });
  }
}
