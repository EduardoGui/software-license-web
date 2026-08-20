import { Location } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Icon } from '../../shared/icons/icon';
import { LocalService } from './local.service';

@Component({
  selector: 'app-local-form',
  imports: [ReactiveFormsModule, RouterLink, Icon],
  templateUrl: './local-form.html',
  styleUrl: './local-form.scss',
})
export class LocalForm {
  private readonly fb = inject(FormBuilder);
  private readonly localService = inject(LocalService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  protected readonly localId = signal<number | null>(null);
  protected readonly carregando = signal(false);
  protected readonly salvando = signal(false);
  protected readonly erro = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    nome: ['', Validators.required],
    endereco: [''],
    ativo: [true, Validators.required],
  });

  protected get editando(): boolean {
    return this.localId() !== null;
  }

  protected voltar(): void {
    this.location.back();
  }

  constructor() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.localId.set(id);
      this.carregar(id);
    }
  }

  private carregar(id: number): void {
    this.carregando.set(true);
    this.localService.obter(id).subscribe({
      next: (local) => {
        this.form.patchValue({ nome: local.nome, endereco: local.endereco ?? '', ativo: local.ativo });
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set('Não foi possível carregar o local.');
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
    const payload = { nome: valor.nome, endereco: valor.endereco || null, ativo: valor.ativo };

    this.salvando.set(true);
    this.erro.set(null);

    const requisicao = this.editando
      ? this.localService.atualizar(this.localId()!, payload)
      : this.localService.criar(payload);

    requisicao.subscribe({
      next: () => this.router.navigate(['/dp/locais']),
      error: (err) => {
        this.salvando.set(false);
        this.erro.set(err?.error?.message ?? 'Não foi possível salvar o local.');
      },
    });
  }
}
