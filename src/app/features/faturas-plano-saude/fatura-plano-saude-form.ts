import { Location } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Icon } from '../../shared/icons/icon';
import { FaturaOperadoraSaude } from './fatura-plano-saude';
import { FaturaOperadoraSaudeService } from './fatura-plano-saude.service';

@Component({
  selector: 'app-fatura-plano-saude-form',
  imports: [ReactiveFormsModule, RouterLink, Icon],
  templateUrl: './fatura-plano-saude-form.html',
  styleUrl: './fatura-plano-saude-form.scss',
})
export class FaturaPlanoSaudeForm {
  private readonly fb = inject(FormBuilder);
  private readonly faturaService = inject(FaturaOperadoraSaudeService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  protected readonly faturaId = signal<number | null>(null);
  protected readonly fatura = signal<FaturaOperadoraSaude | null>(null);
  protected readonly carregando = signal(false);
  protected readonly salvando = signal(false);
  protected readonly erro = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    operadoraSaude: ['', Validators.required],
    numeroFatura: ['', Validators.required],
    ano: [new Date().getFullYear(), Validators.required],
    mes: [new Date().getMonth() + 1, Validators.required],
    dataEmissao: [''],
    dataVencimento: [''],
    valorTotal: [null as number | null],
    observacao: [''],
  });

  protected get editando(): boolean {
    return this.faturaId() !== null;
  }

  constructor() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.faturaId.set(id);
      this.carregar(id);
    }
  }

  protected voltar(): void {
    this.location.back();
  }

  private carregar(id: number): void {
    this.carregando.set(true);
    this.faturaService.obter(id).subscribe({
      next: (fatura) => {
        this.fatura.set(fatura);
        this.form.patchValue({
          operadoraSaude: fatura.operadoraSaude,
          numeroFatura: fatura.numeroFatura,
          ano: fatura.ano,
          mes: fatura.mes,
          dataEmissao: fatura.dataEmissao ?? '',
          dataVencimento: fatura.dataVencimento ?? '',
          valorTotal: fatura.valorTotal,
          observacao: fatura.observacao ?? '',
        });
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set('Não foi possível carregar a fatura.');
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

    const camposComuns = {
      numeroFatura: valor.numeroFatura,
      dataEmissao: valor.dataEmissao || null,
      dataVencimento: valor.dataVencimento || null,
      valorTotal: valor.valorTotal,
      observacao: valor.observacao || null,
    };

    const requisicao = this.editando
      ? this.faturaService.atualizar(this.faturaId()!, camposComuns)
      : this.faturaService.criar({ operadoraSaude: valor.operadoraSaude, ano: valor.ano, mes: valor.mes, ...camposComuns });

    requisicao.subscribe({
      next: (fatura) => this.router.navigate(['/dp/plano-saude/faturas', fatura.id]),
      error: (err) => {
        this.salvando.set(false);
        this.erro.set(err?.error?.message ?? 'Não foi possível salvar a fatura.');
      },
    });
  }
}
