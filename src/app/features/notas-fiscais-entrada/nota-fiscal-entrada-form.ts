import { Location } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { Fornecedor } from '../fornecedores/fornecedor';
import { FornecedorService } from '../fornecedores/fornecedor.service';
import { Icon } from '../../shared/icons/icon';
import { NotaFiscalEntradaService } from './nota-fiscal-entrada.service';

const CHAVE_RASCUNHO = 'nota-fiscal-entrada-form-rascunho';

@Component({
  selector: 'app-nota-fiscal-entrada-form',
  imports: [ReactiveFormsModule, RouterLink, Icon],
  templateUrl: './nota-fiscal-entrada-form.html',
  styleUrl: './nota-fiscal-entrada-form.scss',
})
export class NotaFiscalEntradaForm {
  private readonly fb = inject(FormBuilder);
  private readonly notaFiscalEntradaService = inject(NotaFiscalEntradaService);
  private readonly fornecedorService = inject(FornecedorService);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  protected readonly salvando = signal(false);
  protected readonly erro = signal<string | null>(null);
  protected readonly fornecedores = signal<Fornecedor[]>([]);

  protected readonly form = this.fb.nonNullable.group({
    numero: ['', Validators.required],
    dataEntrada: ['', Validators.required],
    fornecedorId: [null as number | null],
    observacao: [''],
  });

  constructor() {
    this.fornecedorService.listar({ ativo: true }).subscribe((fornecedores) => this.fornecedores.set(fornecedores));
    this.restaurarRascunho();
  }

  protected voltar(): void {
    this.location.back();
  }

  // Sair pra cadastrar/editar um Fornecedor destrói este componente; guarda o formulário
  // em sessionStorage pra não perder o que já foi preenchido ao voltar.
  protected prepararNavegacaoParaFornecedor(): void {
    sessionStorage.setItem(CHAVE_RASCUNHO, JSON.stringify(this.form.getRawValue()));
  }

  private restaurarRascunho(): void {
    const bruto = sessionStorage.getItem(CHAVE_RASCUNHO);
    if (!bruto) {
      return;
    }
    sessionStorage.removeItem(CHAVE_RASCUNHO);
    this.form.patchValue(JSON.parse(bruto));
  }

  protected salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valor = this.form.getRawValue();
    const payload = {
      numero: valor.numero,
      dataEntrada: valor.dataEntrada,
      fornecedorId: valor.fornecedorId,
      observacao: valor.observacao || null,
    };

    this.salvando.set(true);
    this.erro.set(null);

    this.notaFiscalEntradaService.criar(payload).subscribe({
      next: (nota) => this.router.navigate(['/equipamentos/notas-fiscais', nota.id]),
      error: (err) => {
        this.salvando.set(false);
        this.erro.set(err?.error?.message ?? 'Não foi possível salvar a nota fiscal.');
      },
    });
  }
}
