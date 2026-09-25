import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AgendaService } from '../agenda/agenda.service';
import { TarefaRecorrenteService } from '../tarefas-recorrentes/tarefa-recorrente.service';
import { Icon } from '../../shared/icons/icon';
import { DataBrPipe } from '../../shared/pipes/data-br.pipe';
import { DashboardData, Pendencia } from './dashboard';
import { DashboardService } from './dashboard.service';

@Component({
  selector: 'app-dashboard-page',
  imports: [RouterLink, DataBrPipe, ReactiveFormsModule, Icon],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss',
})
export class DashboardPage {
  private readonly fb = inject(FormBuilder);
  private readonly dashboardService = inject(DashboardService);
  private readonly agendaService = inject(AgendaService);
  private readonly tarefaRecorrenteService = inject(TarefaRecorrenteService);

  protected readonly dados = signal<DashboardData | null>(null);
  protected readonly carregando = signal(true);
  protected readonly erro = signal(false);

  protected readonly erroAcaoTarefa = signal<string | null>(null);
  protected readonly concluindoId = signal<number | null>(null);
  protected readonly editandoTarefaId = signal<number | null>(null);
  protected readonly editandoObservacaoId = signal<number | null>(null);
  protected readonly salvandoObservacao = signal(false);

  protected readonly criandoUnica = signal(false);
  protected readonly salvandoUnica = signal(false);
  protected readonly criandoRecorrente = signal(false);
  protected readonly salvandoRecorrente = signal(false);

  protected readonly formEditarTarefa = this.fb.nonNullable.group({
    titulo: ['', Validators.required],
    novaData: ['', Validators.required],
    observacao: [''],
  });

  protected readonly formObservacao = this.fb.nonNullable.group({
    observacao: [''],
  });

  protected readonly formUnica = this.fb.nonNullable.group({
    titulo: ['', Validators.required],
    data: ['', Validators.required],
    observacao: [''],
  });

  protected readonly formRecorrente = this.fb.nonNullable.group({
    titulo: ['', Validators.required],
    diaDoMes: [1, [Validators.required, Validators.min(1), Validators.max(31)]],
    observacao: [''],
  });

  constructor() {
    this.carregar();
  }

  private carregar(): void {
    this.carregando.set(true);
    this.erro.set(false);

    this.dashboardService.obter().subscribe({
      next: (dados) => {
        this.dados.set(dados);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set(true);
        this.carregando.set(false);
      },
    });
  }

  protected concluirTarefa(tarefaOcorrenciaId: number): void {
    this.concluindoId.set(tarefaOcorrenciaId);
    this.erroAcaoTarefa.set(null);

    this.agendaService.concluir(tarefaOcorrenciaId).subscribe({
      next: () => {
        this.concluindoId.set(null);
        this.carregar();
      },
      error: (err) => {
        this.concluindoId.set(null);
        this.erroAcaoTarefa.set(err?.error?.message ?? 'Não foi possível concluir a tarefa.');
      },
    });
  }

  protected iniciarEditarTarefa(pendencia: Pendencia): void {
    if (pendencia.tarefaOcorrenciaId === null) {
      return;
    }

    this.editandoTarefaId.set(pendencia.tarefaOcorrenciaId);
    this.erroAcaoTarefa.set(null);
    this.formEditarTarefa.reset({ titulo: pendencia.titulo, novaData: pendencia.data, observacao: pendencia.observacao ?? '' });
  }

  protected cancelarEditarTarefa(): void {
    this.editandoTarefaId.set(null);
  }

  protected confirmarEditarTarefa(tarefaOcorrenciaId: number): void {
    if (this.formEditarTarefa.invalid) {
      this.formEditarTarefa.markAllAsTouched();
      return;
    }

    const valor = this.formEditarTarefa.getRawValue();

    this.agendaService
      .editar(tarefaOcorrenciaId, { titulo: valor.titulo, novaData: valor.novaData, observacao: valor.observacao || null })
      .subscribe({
        next: () => {
          this.editandoTarefaId.set(null);
          this.carregar();
        },
        error: (err) => {
          this.erroAcaoTarefa.set(err?.error?.message ?? 'Não foi possível editar a tarefa.');
        },
      });
  }

  protected iniciarEditarObservacao(pendencia: Pendencia): void {
    if (pendencia.tarefaOcorrenciaId === null) {
      return;
    }

    this.editandoObservacaoId.set(pendencia.tarefaOcorrenciaId);
    this.erroAcaoTarefa.set(null);
    this.formObservacao.reset({ observacao: pendencia.observacao ?? '' });
  }

  protected cancelarEditarObservacao(): void {
    this.editandoObservacaoId.set(null);
  }

  protected confirmarEditarObservacao(tarefaOcorrenciaId: number): void {
    const valor = this.formObservacao.getRawValue();
    this.salvandoObservacao.set(true);
    this.erroAcaoTarefa.set(null);

    this.agendaService.atualizarObservacao(tarefaOcorrenciaId, { observacao: valor.observacao || null }).subscribe({
      next: () => {
        this.salvandoObservacao.set(false);
        this.editandoObservacaoId.set(null);
        this.carregar();
      },
      error: (err) => {
        this.salvandoObservacao.set(false);
        this.erroAcaoTarefa.set(err?.error?.message ?? 'Não foi possível salvar a observação.');
      },
    });
  }

  protected iniciarNovaUnica(): void {
    this.criandoRecorrente.set(false);
    this.criandoUnica.set(true);
    this.erroAcaoTarefa.set(null);
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
    this.erroAcaoTarefa.set(null);

    this.agendaService.criarUnica({ titulo: valor.titulo, data: valor.data, observacao: valor.observacao || null }).subscribe({
      next: () => {
        this.salvandoUnica.set(false);
        this.criandoUnica.set(false);
        this.carregar();
      },
      error: (err) => {
        this.salvandoUnica.set(false);
        this.erroAcaoTarefa.set(err?.error?.message ?? 'Não foi possível criar a tarefa.');
      },
    });
  }

  protected iniciarNovaRecorrente(): void {
    this.criandoUnica.set(false);
    this.criandoRecorrente.set(true);
    this.erroAcaoTarefa.set(null);
    this.formRecorrente.reset({ titulo: '', diaDoMes: 1, observacao: '' });
  }

  protected cancelarNovaRecorrente(): void {
    this.criandoRecorrente.set(false);
  }

  protected confirmarNovaRecorrente(): void {
    if (this.formRecorrente.invalid) {
      this.formRecorrente.markAllAsTouched();
      return;
    }

    const valor = this.formRecorrente.getRawValue();
    this.salvandoRecorrente.set(true);
    this.erroAcaoTarefa.set(null);

    this.tarefaRecorrenteService
      .criar({ titulo: valor.titulo, diaDoMes: valor.diaDoMes, observacao: valor.observacao || null, ativa: true })
      .subscribe({
        next: () => {
          this.salvandoRecorrente.set(false);
          this.criandoRecorrente.set(false);
          this.carregar();
        },
        error: (err) => {
          this.salvandoRecorrente.set(false);
          this.erroAcaoTarefa.set(err?.error?.message ?? 'Não foi possível criar a tarefa recorrente.');
        },
      });
  }
}
