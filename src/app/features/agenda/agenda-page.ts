import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Icon } from '../../shared/icons/icon';
import { DataBrPipe } from '../../shared/pipes/data-br.pipe';
import { TarefaOcorrencia } from './agenda';
import { AgendaService } from './agenda.service';

@Component({
  selector: 'app-agenda-page',
  imports: [ReactiveFormsModule, RouterLink, DataBrPipe, Icon],
  templateUrl: './agenda-page.html',
  styleUrl: './agenda-page.scss',
})
export class AgendaPage {
  private readonly fb = inject(FormBuilder);
  private readonly agendaService = inject(AgendaService);

  protected readonly ocorrencias = signal<TarefaOcorrencia[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal<string | null>(null);
  protected readonly erroAcao = signal<string | null>(null);
  protected readonly concluindoId = signal<number | null>(null);
  protected readonly adiandoId = signal<number | null>(null);
  protected readonly criandoUnica = signal(false);
  protected readonly salvandoUnica = signal(false);

  protected readonly formAdiar = this.fb.nonNullable.group({
    novaData: ['', Validators.required],
    observacao: [''],
  });

  protected readonly formUnica = this.fb.nonNullable.group({
    titulo: ['', Validators.required],
    data: ['', Validators.required],
    observacao: [''],
  });

  constructor() {
    this.carregar();
  }

  private carregar(): void {
    this.carregando.set(true);
    this.erro.set(null);

    this.agendaService.listar().subscribe({
      next: (ocorrencias) => {
        this.ocorrencias.set(ocorrencias);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set('Não foi possível carregar a agenda.');
        this.carregando.set(false);
      },
    });
  }

  protected concluir(id: number): void {
    this.concluindoId.set(id);
    this.erroAcao.set(null);

    this.agendaService.concluir(id).subscribe({
      next: () => {
        this.concluindoId.set(null);
        this.ocorrencias.update((lista) => lista.filter((o) => o.id !== id));
      },
      error: (err) => {
        this.concluindoId.set(null);
        this.erroAcao.set(err?.error?.message ?? 'Não foi possível concluir a tarefa.');
      },
    });
  }

  protected iniciarAdiar(ocorrencia: TarefaOcorrencia): void {
    this.adiandoId.set(ocorrencia.id);
    this.erroAcao.set(null);
    this.formAdiar.reset({ novaData: ocorrencia.dataPrevistaAtual, observacao: ocorrencia.observacao ?? '' });
  }

  protected cancelarAdiar(): void {
    this.adiandoId.set(null);
  }

  protected confirmarAdiar(id: number): void {
    if (this.formAdiar.invalid) {
      this.formAdiar.markAllAsTouched();
      return;
    }

    const valor = this.formAdiar.getRawValue();

    this.agendaService.adiar(id, { novaData: valor.novaData, observacao: valor.observacao || null }).subscribe({
      next: (atualizada) => {
        this.adiandoId.set(null);
        this.ocorrencias.update((lista) =>
          lista
            .map((o) => (o.id === id ? atualizada : o))
            .sort((a, b) => a.dataPrevistaAtual.localeCompare(b.dataPrevistaAtual)),
        );
      },
      error: (err) => {
        this.erroAcao.set(err?.error?.message ?? 'Não foi possível adiar a tarefa.');
      },
    });
  }

  protected iniciarNovaUnica(): void {
    this.criandoUnica.set(true);
    this.erroAcao.set(null);
    this.formUnica.reset({ titulo: '', data: '', observacao: '' });
  }

  protected cancelarNovaUnica(): void {
    this.criandoUnica.set(false);
  }

  protected confirmarNovaUnica(): void {
    if (this.formUnica.invalid) {
      this.formUnica.markAllAsTouched();
      return;
    }

    const valor = this.formUnica.getRawValue();
    this.salvandoUnica.set(true);
    this.erroAcao.set(null);

    this.agendaService.criarUnica({ titulo: valor.titulo, data: valor.data, observacao: valor.observacao || null }).subscribe({
      next: (criada) => {
        this.salvandoUnica.set(false);
        this.criandoUnica.set(false);
        this.ocorrencias.update((lista) =>
          [...lista, criada].sort((a, b) => a.dataPrevistaAtual.localeCompare(b.dataPrevistaAtual)),
        );
      },
      error: (err) => {
        this.salvandoUnica.set(false);
        this.erroAcao.set(err?.error?.message ?? 'Não foi possível criar a tarefa.');
      },
    });
  }
}
