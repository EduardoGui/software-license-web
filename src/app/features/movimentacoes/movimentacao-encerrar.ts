import { Location } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Icon } from '../../shared/icons/icon';
import { MovimentacaoService } from './movimentacao.service';

interface ContextoNavegacao {
  usuarioNome?: string;
  licencaNome?: string;
}

@Component({
  selector: 'app-movimentacao-encerrar',
  imports: [ReactiveFormsModule, RouterLink, Icon],
  templateUrl: './movimentacao-encerrar.html',
  styleUrl: './movimentacao-encerrar.scss',
})
export class MovimentacaoEncerrar {
  private readonly fb = inject(FormBuilder);
  private readonly movimentacaoService = inject(MovimentacaoService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  private readonly movimentacaoId = Number(this.route.snapshot.paramMap.get('id'));
  protected readonly contexto = (history.state ?? {}) as ContextoNavegacao;

  protected readonly salvando = signal(false);
  protected readonly erro = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    dataFim: [new Date().toISOString().slice(0, 10), Validators.required],
    observacao: [''],
  });

  protected voltar(): void {
    this.location.back();
  }

  protected salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valor = this.form.getRawValue();
    this.salvando.set(true);
    this.erro.set(null);

    this.movimentacaoService.encerrar(this.movimentacaoId, { dataFim: valor.dataFim, observacao: valor.observacao || null }).subscribe({
      next: () => this.router.navigate(['/movimentacoes']),
      error: (err) => {
        this.salvando.set(false);
        this.erro.set(err?.error?.message ?? 'Não foi possível encerrar a movimentação.');
      },
    });
  }
}
