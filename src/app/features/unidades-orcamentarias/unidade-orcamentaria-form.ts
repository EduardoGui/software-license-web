import { Location } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Setor } from '../setores/setor';
import { SetorService } from '../setores/setor.service';
import { Icon } from '../../shared/icons/icon';
import { UnidadeOrcamentariaService } from './unidade-orcamentaria.service';

@Component({
  selector: 'app-unidade-orcamentaria-form',
  imports: [ReactiveFormsModule, RouterLink, Icon],
  templateUrl: './unidade-orcamentaria-form.html',
  styleUrl: './unidade-orcamentaria-form.scss',
})
export class UnidadeOrcamentariaForm {
  private readonly fb = inject(FormBuilder);
  private readonly unidadeOrcamentariaService = inject(UnidadeOrcamentariaService);
  private readonly setorService = inject(SetorService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  protected readonly unidadeId = signal<number | null>(null);
  protected readonly setores = signal<Setor[]>([]);
  protected readonly carregando = signal(false);
  protected readonly salvando = signal(false);
  protected readonly erro = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    setorId: this.fb.control<number | null>(null, Validators.required),
    codigo: ['', Validators.required],
    descricao: ['', Validators.required],
    apropriacao: [''],
    ativa: [true, Validators.required],
  });

  protected get editando(): boolean {
    return this.unidadeId() !== null;
  }

  protected voltar(): void {
    this.location.back();
  }

  constructor() {
    this.setorService.listar({ ativo: true }).subscribe((setores) => this.setores.set(setores));

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.unidadeId.set(id);
      this.carregar(id);
    }
  }

  private carregar(id: number): void {
    this.carregando.set(true);
    this.unidadeOrcamentariaService.obter(id).subscribe({
      next: (unidade) => {
        this.form.patchValue({
          setorId: unidade.setorId,
          codigo: unidade.codigo,
          descricao: unidade.descricao,
          apropriacao: unidade.apropriacao ?? '',
          ativa: unidade.ativa,
        });
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set('Não foi possível carregar a Unidade Orçamentária.');
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
      setorId: valor.setorId!,
      codigo: valor.codigo,
      descricao: valor.descricao,
      apropriacao: valor.apropriacao || null,
      ativa: valor.ativa,
    };

    this.salvando.set(true);
    this.erro.set(null);

    const requisicao = this.editando
      ? this.unidadeOrcamentariaService.atualizar(this.unidadeId()!, payload)
      : this.unidadeOrcamentariaService.criar(payload);

    requisicao.subscribe({
      next: () => this.router.navigate(['/dp/unidades-orcamentarias']),
      error: (err) => {
        this.salvando.set(false);
        this.erro.set(err?.error?.message ?? 'Não foi possível salvar a Unidade Orçamentária.');
      },
    });
  }
}
