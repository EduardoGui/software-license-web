import { Location } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Icon } from '../../shared/icons/icon';
import { TipoDestinatarioEmail } from './email-notificacao-reembolso';
import { EmailNotificacaoReembolsoService } from './email-notificacao-reembolso.service';

@Component({
  selector: 'app-email-notificacao-reembolso-form',
  imports: [ReactiveFormsModule, RouterLink, Icon],
  templateUrl: './email-notificacao-reembolso-form.html',
  styleUrl: './email-notificacao-reembolso-form.scss',
})
export class EmailNotificacaoReembolsoForm {
  private readonly fb = inject(FormBuilder);
  private readonly emailService = inject(EmailNotificacaoReembolsoService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  protected readonly emailId = signal<number | null>(null);
  protected readonly carregando = signal(false);
  protected readonly salvando = signal(false);
  protected readonly erro = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    tipoDestinatario: ['Para' as TipoDestinatarioEmail, Validators.required],
    ativo: [true, Validators.required],
  });

  protected get editando(): boolean {
    return this.emailId() !== null;
  }

  protected voltar(): void {
    this.location.back();
  }

  constructor() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.emailId.set(id);
      this.carregar(id);
    }
  }

  private carregar(id: number): void {
    this.carregando.set(true);
    this.emailService.obter(id).subscribe({
      next: (email) => {
        this.form.patchValue({ email: email.email, tipoDestinatario: email.tipoDestinatario, ativo: email.ativo });
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set('Não foi possível carregar o e-mail.');
        this.carregando.set(false);
      },
    });
  }

  protected salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.form.getRawValue();

    this.salvando.set(true);
    this.erro.set(null);

    const requisicao = this.editando
      ? this.emailService.atualizar(this.emailId()!, payload)
      : this.emailService.criar(payload);

    requisicao.subscribe({
      next: () => this.router.navigate(['/dp/emails-notificacao-reembolso']),
      error: (err) => {
        this.salvando.set(false);
        this.erro.set(err?.error?.message ?? 'Não foi possível salvar o e-mail.');
      },
    });
  }
}
