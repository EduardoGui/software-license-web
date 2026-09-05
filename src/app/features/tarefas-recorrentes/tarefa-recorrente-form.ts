import { Location } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Icon } from '../../shared/icons/icon';
import { TarefaRecorrenteService } from './tarefa-recorrente.service';

@Component({
  selector: 'app-tarefa-recorrente-form',
  imports: [ReactiveFormsModule, RouterLink, Icon],
  templateUrl: './tarefa-recorrente-form.html',
  styleUrl: './tarefa-recorrente-form.scss',
})
export class TarefaRecorrenteForm {
  private readonly fb = inject(FormBuilder);
  private readonly tarefaRecorrenteService = inject(TarefaRecorrenteService);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);

  protected readonly tarefaId = signal<number | null>(null);
  protected readonly carregando = signal(false);
  protected readonly salvando = signal(false);
  protected readonly erro = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    titulo: ['', Validators.required],
    diaDoMes: this.fb.control<number | null>(null, [Validators.required, Validators.min(1), Validators.max(31)]),
    observacao: [''],
    ativa: [true, Validators.required],
  });

  protected get editando(): boolean {
    return this.tarefaId() !== null;
  }

  protected voltar(): void {
    this.location.back();
  }

  constructor() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.tarefaId.set(id);
      this.carregar(id);
    }
  }

  private carregar(id: number): void {
    this.carregando.set(true);
    this.tarefaRecorrenteService.obter(id).subscribe({
      next: (tarefa) => {
        this.form.patchValue({
          titulo: tarefa.titulo,
          diaDoMes: tarefa.diaDoMes,
          observacao: tarefa.observacao ?? '',
          ativa: tarefa.ativa,
        });
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set('Não foi possível carregar a tarefa.');
        this.carregando.set(false);
      },
    });
  }

  protected salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valor = this.form.getRawValue();
    this.salvando.set(true);
    this.erro.set(null);

    const payload = {
      titulo: valor.titulo,
      diaDoMes: valor.diaDoMes!,
      observacao: valor.observacao || null,
      ativa: valor.ativa,
    };

    const requisicao = this.editando
      ? this.tarefaRecorrenteService.atualizar(this.tarefaId()!, payload)
      : this.tarefaRecorrenteService.criar(payload);

    requisicao.subscribe({
      next: () => this.location.back(),
      error: (err) => {
        this.salvando.set(false);
        this.erro.set(err?.error?.message ?? 'Não foi possível salvar a tarefa.');
      },
    });
  }
}
