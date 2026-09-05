import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Icon } from '../../shared/icons/icon';
import { TarefaRecorrente, TarefaRecorrenteFiltro } from './tarefa-recorrente';
import { TarefaRecorrenteService } from './tarefa-recorrente.service';

@Component({
  selector: 'app-tarefas-recorrentes-list',
  imports: [FormsModule, RouterLink, Icon],
  templateUrl: './tarefas-recorrentes-list.html',
  styleUrl: './tarefas-recorrentes-list.scss',
})
export class TarefasRecorrentesList {
  private readonly tarefaRecorrenteService = inject(TarefaRecorrenteService);

  protected readonly tarefas = signal<TarefaRecorrente[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal(false);

  protected filtro: TarefaRecorrenteFiltro = { ativa: true };

  constructor() {
    this.buscar();
  }

  protected buscar(): void {
    this.carregando.set(true);
    this.erro.set(false);

    this.tarefaRecorrenteService.listar(this.filtro).subscribe({
      next: (tarefas) => {
        this.tarefas.set(tarefas);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set(true);
        this.carregando.set(false);
      },
    });
  }

  protected limparFiltro(): void {
    this.filtro = { ativa: true };
    this.buscar();
  }
}
