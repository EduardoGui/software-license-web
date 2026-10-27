import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { AuthService } from './auth.service';

@Component({
  selector: 'app-alterar-senha',
  imports: [ReactiveFormsModule],
  templateUrl: './alterar-senha.html',
  styleUrl: './alterar-senha.scss',
})
export class AlterarSenha {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  protected readonly salvando = signal(false);
  protected readonly sucesso = signal(false);
  protected readonly erro = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    senhaAtual: ['', Validators.required],
    novaSenha: ['', [Validators.required, Validators.minLength(6)]],
    confirmarSenha: ['', Validators.required],
  });

  protected salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valor = this.form.getRawValue();
    if (valor.novaSenha !== valor.confirmarSenha) {
      this.erro.set('As senhas não coincidem.');
      return;
    }

    this.salvando.set(true);
    this.erro.set(null);
    this.sucesso.set(false);

    this.authService.alterarSenha(valor.senhaAtual, valor.novaSenha).subscribe({
      next: () => {
        this.salvando.set(false);
        this.sucesso.set(true);
        this.form.reset();
      },
      error: (err) => {
        this.salvando.set(false);
        this.erro.set(
          err?.status === 429
            ? 'Muitas tentativas. Aguarde um minuto e tente de novo.'
            : (err?.error?.message ?? 'Não foi possível alterar a senha.'),
        );
      },
    });
  }
}
