import { Location } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Icon } from '../../shared/icons/icon';
import { TipoEquipamentoService } from './tipo-equipamento.service';

@Component({
  selector: 'app-tipo-equipamento-form',
  imports: [ReactiveFormsModule, RouterLink, Icon],
  templateUrl: './tipo-equipamento-form.html',
  styleUrl: './tipo-equipamento-form.scss',
})
export class TipoEquipamentoForm {
  private readonly fb = inject(FormBuilder);
  private readonly tipoEquipamentoService = inject(TipoEquipamentoService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  protected readonly tipoId = signal<number | null>(null);
  protected readonly carregando = signal(false);
  protected readonly salvando = signal(false);
  protected readonly erro = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    nome: ['', Validators.required],
    ativo: [true, Validators.required],
  });

  protected get editando(): boolean {
    return this.tipoId() !== null;
  }

  protected voltar(): void {
    this.location.back();
  }

  constructor() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.tipoId.set(id);
      this.carregar(id);
    }
  }

  private carregar(id: number): void {
    this.carregando.set(true);
    this.tipoEquipamentoService.obter(id).subscribe({
      next: (tipo) => {
        this.form.patchValue({ nome: tipo.nome, ativo: tipo.ativo });
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set('Não foi possível carregar o tipo de equipamento.');
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
    const payload = { nome: valor.nome, ativo: valor.ativo };

    this.salvando.set(true);
    this.erro.set(null);

    const requisicao = this.editando
      ? this.tipoEquipamentoService.atualizar(this.tipoId()!, payload)
      : this.tipoEquipamentoService.criar(payload);

    requisicao.subscribe({
      next: () => this.router.navigate(['/equipamentos/tipos']),
      error: (err) => {
        this.salvando.set(false);
        this.erro.set(err?.error?.message ?? 'Não foi possível salvar o tipo de equipamento.');
      },
    });
  }
}
