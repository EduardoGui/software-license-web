import { Location } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Icon } from '../../shared/icons/icon';
import { EquipamentoAlocacaoService } from './equipamento-alocacao.service';

interface ContextoNavegacao {
  usuarioNome?: string;
  equipamentoDescricao?: string;
  dataFim?: string | null;
  observacao?: string | null;
}

@Component({
  selector: 'app-equipamento-alocacao-editar-encerramento',
  imports: [ReactiveFormsModule, RouterLink, Icon],
  templateUrl: './equipamento-alocacao-editar-encerramento.html',
  styleUrl: './equipamento-alocacao-editar-encerramento.scss',
})
export class EquipamentoAlocacaoEditarEncerramento {
  private readonly fb = inject(FormBuilder);
  private readonly equipamentoAlocacaoService = inject(EquipamentoAlocacaoService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  private readonly alocacaoId = Number(this.route.snapshot.paramMap.get('id'));
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

    this.equipamentoAlocacaoService
      .editarEncerramento(this.alocacaoId, {
        dataFim: valor.reativar ? null : valor.dataFim,
        observacao: valor.observacao || null,
      })
      .subscribe({
        next: () => this.router.navigate(['/equipamentos/alocacoes']),
        error: (err) => {
          this.salvando.set(false);
          this.erro.set(err?.error?.message ?? 'Não foi possível editar esta alocação.');
        },
      });
  }
}
