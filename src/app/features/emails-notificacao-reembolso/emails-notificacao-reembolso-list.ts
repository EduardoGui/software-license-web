import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Icon } from '../../shared/icons/icon';
import { EmailNotificacaoReembolso, EmailNotificacaoReembolsoFiltro } from './email-notificacao-reembolso';
import { EmailNotificacaoReembolsoService } from './email-notificacao-reembolso.service';

@Component({
  selector: 'app-emails-notificacao-reembolso-list',
  imports: [FormsModule, RouterLink, Icon],
  templateUrl: './emails-notificacao-reembolso-list.html',
  styleUrl: './emails-notificacao-reembolso-list.scss',
})
export class EmailsNotificacaoReembolsoList {
  private readonly emailService = inject(EmailNotificacaoReembolsoService);

  protected readonly emails = signal<EmailNotificacaoReembolso[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal(false);

  protected filtro: EmailNotificacaoReembolsoFiltro = { ativo: true };

  constructor() {
    this.buscar();
  }

  protected buscar(): void {
    this.carregando.set(true);
    this.erro.set(false);

    this.emailService.listar(this.filtro).subscribe({
      next: (emails) => {
        this.emails.set(emails);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set(true);
        this.carregando.set(false);
      },
    });
  }

  protected limparFiltro(): void {
    this.filtro = { ativo: true };
    this.buscar();
  }
}
