import { Component, OnInit, inject, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import {
  EmailPagamentoFinanceiro,
  EmailsPagamentoFinanceiroService,
  TipoDestinatario,
} from './emails-pagamento-financeiro';

// Janela de configuração das listas Para/Cc usadas no e-mail de solicitação de pagamento ao financeiro.
@Component({
  selector: 'app-destinatarios-financeiro-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './destinatarios-financeiro-modal.html',
  styleUrl: './destinatarios-financeiro-modal.scss',
})
export class DestinatariosFinanceiroModal implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(EmailsPagamentoFinanceiroService);

  readonly fechar = output<void>();

  protected readonly emails = signal<EmailPagamentoFinanceiro[]>([]);
  protected readonly carregando = signal(true);
  protected readonly salvando = signal(false);
  protected readonly erro = signal<string | null>(null);

  protected readonly tipos: TipoDestinatario[] = ['Para', 'Cc'];

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    tipoDestinatario: ['Para' as TipoDestinatario, Validators.required],
  });

  ngOnInit(): void {
    this.carregar();
  }

  protected porTipo(tipo: TipoDestinatario): EmailPagamentoFinanceiro[] {
    return this.emails().filter((e) => e.tipoDestinatario === tipo);
  }

  protected adicionar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valor = this.form.getRawValue();
    this.salvando.set(true);
    this.erro.set(null);

    this.service.criar({ email: valor.email.trim(), tipoDestinatario: valor.tipoDestinatario, ativo: true }).subscribe({
      next: () => {
        this.salvando.set(false);
        this.form.patchValue({ email: '' });
        this.form.markAsUntouched();
        this.carregar();
      },
      error: (err) => {
        this.salvando.set(false);
        this.erro.set(err?.error?.message ?? 'Não foi possível adicionar o e-mail.');
      },
    });
  }

  protected alternarAtivo(email: EmailPagamentoFinanceiro): void {
    this.erro.set(null);
    this.service
      .atualizar(email.id, { email: email.email, tipoDestinatario: email.tipoDestinatario, ativo: !email.ativo })
      .subscribe({
        next: () => this.carregar(),
        error: (err) => this.erro.set(err?.error?.message ?? 'Não foi possível atualizar o e-mail.'),
      });
  }

  private carregar(): void {
    this.service.listar().subscribe({
      next: (emails) => {
        this.emails.set(emails);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set('Não foi possível carregar os destinatários.');
        this.carregando.set(false);
      },
    });
  }
}
