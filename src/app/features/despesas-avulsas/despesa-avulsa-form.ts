import { Location } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Fornecedor } from '../fornecedores/fornecedor';
import { FornecedorService } from '../fornecedores/fornecedor.service';
import { DespesaAvulsaCategoria } from './despesa-avulsa';
import { DespesaAvulsaService } from './despesa-avulsa.service';

@Component({
  selector: 'app-despesa-avulsa-form',
  imports: [ReactiveFormsModule],
  templateUrl: './despesa-avulsa-form.html',
  styleUrl: './despesa-avulsa-form.scss',
})
export class DespesaAvulsaForm {
  private readonly fb = inject(FormBuilder);
  private readonly despesaAvulsaService = inject(DespesaAvulsaService);
  private readonly fornecedorService = inject(FornecedorService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  protected readonly despesaId = signal<number | null>(null);
  protected readonly fornecedores = signal<Fornecedor[]>([]);
  protected readonly carregando = signal(false);
  protected readonly salvando = signal(false);
  protected readonly erro = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    fornecedorId: this.fb.control<number | null>(null, Validators.required),
    categoria: this.fb.nonNullable.control<DespesaAvulsaCategoria | ''>('', Validators.required),
    descricao: ['', Validators.required],
    numeroNf: [''],
    dataEmissao: [''],
    vencimento: [''],
    valor: [0, [Validators.required, Validators.min(0.01)]],
    recorrente: [false],
    observacoes: [''],
  });

  protected get editando(): boolean {
    return this.despesaId() !== null;
  }

  protected voltar(): void {
    this.location.back();
  }

  constructor() {
    this.fornecedorService.listar({ ativo: true }).subscribe((fornecedores) => this.fornecedores.set(fornecedores));

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.despesaId.set(id);
      this.carregar(id);
    }
  }

  private carregar(id: number): void {
    this.carregando.set(true);
    this.despesaAvulsaService.obter(id).subscribe({
      next: (d) => {
        this.form.patchValue({
          fornecedorId: d.fornecedorId,
          categoria: d.categoria,
          descricao: d.descricao,
          numeroNf: d.numeroNf ?? '',
          dataEmissao: d.dataEmissao ?? '',
          vencimento: d.vencimento ?? '',
          valor: d.valor,
          recorrente: d.recorrente,
          observacoes: d.observacoes ?? '',
        });
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set('Não foi possível carregar a despesa avulsa.');
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
      fornecedorId: valor.fornecedorId,
      categoria: valor.categoria,
      descricao: valor.descricao,
      numeroNf: valor.numeroNf || null,
      dataEmissao: valor.dataEmissao || null,
      vencimento: valor.vencimento || null,
      valor: valor.valor,
      recorrente: valor.recorrente,
      observacoes: valor.observacoes || null,
    };

    this.salvando.set(true);
    this.erro.set(null);

    const requisicao = this.editando
      ? this.despesaAvulsaService.atualizar(this.despesaId()!, payload)
      : this.despesaAvulsaService.criar(payload);

    requisicao.subscribe({
      next: (d) => this.router.navigate(['/despesas-avulsas', d.id]),
      error: (err) => {
        this.salvando.set(false);
        this.erro.set(err?.error?.message ?? 'Não foi possível salvar a despesa avulsa.');
      },
    });
  }
}
