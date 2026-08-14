import { Location } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Icon } from '../../shared/icons/icon';
import { UsuarioService } from './usuario.service';

@Component({
  selector: 'app-usuario-form',
  imports: [ReactiveFormsModule, RouterLink, Icon],
  templateUrl: './usuario-form.html',
  styleUrl: './usuario-form.scss',
})
export class UsuarioForm {
  private readonly fb = inject(FormBuilder);
  private readonly usuarioService = inject(UsuarioService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  protected readonly usuarioId = signal<number | null>(null);
  protected readonly carregando = signal(false);
  protected readonly salvando = signal(false);
  protected readonly erro = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    nome: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    dataInicio: ['', Validators.required],
    dataFim: [''],
    observacao: [''],
  });

  protected get editando(): boolean {
    return this.usuarioId() !== null;
  }

  protected voltar(): void {
    this.location.back();
  }

  constructor() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.usuarioId.set(id);
      this.carregar(id);
    }
  }

  private carregar(id: number): void {
    this.carregando.set(true);
    this.usuarioService.obter(id).subscribe({
      next: (usuario) => {
        this.form.patchValue({
          nome: usuario.nome,
          email: usuario.email,
          dataInicio: usuario.dataInicio,
          dataFim: usuario.dataFim ?? '',
          observacao: usuario.observacao ?? '',
        });
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set('Não foi possível carregar o usuário.');
        this.carregando.set(false);
      },
    });
  }

  protected salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valor = this.form.getRawValue();
    const payload = {
      nome: valor.nome,
      email: valor.email,
      dataInicio: valor.dataInicio,
      dataFim: valor.dataFim || null,
      observacao: valor.observacao || null,
    };

    this.salvando.set(true);
    this.erro.set(null);

    const requisicao = this.editando
      ? this.usuarioService.atualizar(this.usuarioId()!, payload)
      : this.usuarioService.criar(payload);

    requisicao.subscribe({
      next: () => this.router.navigate(['/usuarios']),
      error: (err) => {
        this.salvando.set(false);
        this.erro.set(err?.error?.message ?? 'Não foi possível salvar o usuário.');
      },
    });
  }
}
