import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AuthService } from './auth.service';

@Component({
  selector: 'app-esqueci-senha',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './esqueci-senha.html',
  styleUrl: './login.scss',
})
export class EsqueciSenha {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  protected readonly enviando = signal(false);
  protected readonly enviado = signal(false);
  protected readonly erro = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  protected enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    this.erro.set(null);

    this.authService.esqueciSenha(this.form.getRawValue().email).subscribe({
      next: () => {
        this.enviando.set(false);
        this.enviado.set(true);
      },
      error: (err) => {
        this.enviando.set(false);
        this.erro.set(
          err?.status === 429
            ? 'Muitas tentativas. Aguarde um minuto e tente de novo.'
            : 'Não foi possível enviar o pedido. Tente novamente.',
        );
      },
    });
  }
}
