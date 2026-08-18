import { Location } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Icon } from '../../shared/icons/icon';
import { MovimentacaoService } from './movimentacao.service';

interface ContextoNavegacao {
  usuarioNome?: string;
  licencaNome?: string;
  dataFim?: string | null;
  observacao?: string | null;
}

@Component({
  selector: 'app-movimentacao-editar-encerramento',
  imports: [ReactiveFormsModule, RouterLink, Icon],
  templateUrl: './movimentacao-editar-encerramento.html',
  styleUrl: './movimentacao-editar-encerramento.scss',
})
export class MovimentacaoEditarEncerramento {
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
    reativar: [false],
    dataFim: [this.contexto.dataFim ?? new Date().toISOString().slice(0, 10)],
    observacao: [this.contexto.observacao ?? ''],
  });

  protected voltar(): void {
    this.location.back();
  }

  protected salvar(): void {
    const valor = this.form.getRawValue();
    this.salvando.set(true);
    this.erro.set(null);

    this.movimentacaoService
      .editarEncerramento(this.movimentacaoId, {
        dataFim: valor.reativar ? null : valor.dataFim,
        observacao: valor.observacao || null,
      })
      .subscribe({
        next: () => this.router.navigate(['/movimentacoes']),
        error: (err) => {
          this.salvando.set(false);
          this.erro.set(err?.error?.message ?? 'Não foi possível editar esta movimentação.');
        },
      });
  }
}
