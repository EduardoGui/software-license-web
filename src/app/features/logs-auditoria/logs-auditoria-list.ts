import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { LogAuditoria, LogAuditoriaFiltro } from './log-auditoria';
import { LogAuditoriaService } from './log-auditoria.service';

function hoje(): string {
  return new Date().toISOString().slice(0, 10);
}

@Component({
  selector: 'app-logs-auditoria-list',
  imports: [FormsModule, DatePipe],
  templateUrl: './logs-auditoria-list.html',
  styleUrl: './logs-auditoria-list.scss',
})
export class LogsAuditoriaList {
  private readonly logAuditoriaService = inject(LogAuditoriaService);

  protected readonly logs = signal<LogAuditoria[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal(false);

  protected filtro: LogAuditoriaFiltro = { dataInicial: hoje(), dataFinal: hoje() };

  constructor() {
    this.buscar();
  }

  protected buscar(): void {
    this.carregando.set(true);
    this.erro.set(false);

    this.logAuditoriaService.listar(this.filtro).subscribe({
      next: (logs) => {
        this.logs.set(logs);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set(true);
        this.carregando.set(false);
      },
    });
  }

  protected limparFiltro(): void {
    this.filtro = { dataInicial: hoje(), dataFinal: hoje() };
    this.buscar();
  }
}
