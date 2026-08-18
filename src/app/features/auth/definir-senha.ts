import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AuthService } from './auth.service';

@Component({
  selector: 'app-definir-senha',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './definir-senha.html',
  styleUrl: './login.scss',
})
export class DefinirSenha {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly email = this.route.snapshot.queryParamMap.get('email') ?? '';
  private readonly token = this.route.snapshot.queryParamMap.get('token') ?? '';

  protected readonly linkInvalido = !this.email || !this.token;
  protected readonly salvando = signal(false);
  protected readonly erro = signal<string | null>(null);
  protected readonly sucesso = signal(false);

  protected readonly form = this.fb.nonNullable.group({
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

    this.authService.definirSenha({ email: this.email, token: this.token, novaSenha: valor.novaSenha }).subscribe({
      next: () => {
        this.salvando.set(false);
        this.sucesso.set(true);
      },
      error: (err) => {
        this.salvando.set(false);
        this.erro.set(err?.error?.message ?? 'Não foi possível definir a senha.');
      },
    });
  }

  protected irParaLogin(): void {
    this.router.navigate(['/login']);
  }
}
