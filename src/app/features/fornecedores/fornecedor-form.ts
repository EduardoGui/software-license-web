import { Location } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Icon } from '../../shared/icons/icon';
import { FornecedorService } from './fornecedor.service';

@Component({
  selector: 'app-fornecedor-form',
  imports: [ReactiveFormsModule, RouterLink, Icon],
  templateUrl: './fornecedor-form.html',
  styleUrl: './fornecedor-form.scss',
})
export class FornecedorForm {
  private readonly fb = inject(FormBuilder);
  private readonly fornecedorService = inject(FornecedorService);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);

  protected readonly fornecedorId = signal<number | null>(null);
  protected readonly carregando = signal(false);
  protected readonly salvando = signal(false);
  protected readonly erro = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    nome: ['', Validators.required],
    cnpj: ['', Validators.required],
    ativo: [true, Validators.required],
  });

  protected get editando(): boolean {
    return this.fornecedorId() !== null;
  }

  protected voltar(): void {
    this.location.back();
  }

  constructor() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.fornecedorId.set(id);
      // CNPJ nunca foi capturado em fornecedores migrados de notas fiscais antigas —
      // só é exigido ao cadastrar um fornecedor novo, não ao editar um já existente.
      this.form.controls.cnpj.clearValidators();
      this.form.controls.cnpj.updateValueAndValidity();
      this.carregar(id);
    }
  }

  private carregar(id: number): void {
    this.carregando.set(true);
    this.fornecedorService.obter(id).subscribe({
      next: (fornecedor) => {
        this.form.patchValue({
          nome: fornecedor.nome,
          cnpj: fornecedor.cnpj ?? '',
          ativo: fornecedor.ativo,
        });
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set('Não foi possível carregar o fornecedor.');
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
    this.salvando.set(true);
    this.erro.set(null);

    const requisicao = this.editando
      ? this.fornecedorService.atualizar(this.fornecedorId()!, {
          nome: valor.nome,
          cnpj: valor.cnpj || null,
          ativo: valor.ativo,
        })
      : this.fornecedorService.criar({
          nome: valor.nome,
          cnpj: valor.cnpj,
          ativo: valor.ativo,
        });

    requisicao.subscribe({
      next: () => this.location.back(),
      error: (err) => {
        this.salvando.set(false);
        this.erro.set(err?.error?.message ?? 'Não foi possível salvar o fornecedor.');
      },
    });
  }
}
