import { Location } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { Icon } from '../../shared/icons/icon';
import { NotaFiscalEntradaService } from './nota-fiscal-entrada.service';

@Component({
  selector: 'app-nota-fiscal-entrada-form',
  imports: [ReactiveFormsModule, RouterLink, Icon],
  templateUrl: './nota-fiscal-entrada-form.html',
  styleUrl: './nota-fiscal-entrada-form.scss',
})
export class NotaFiscalEntradaForm {
  private readonly fb = inject(FormBuilder);
  private readonly notaFiscalEntradaService = inject(NotaFiscalEntradaService);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  protected readonly salvando = signal(false);
  protected readonly erro = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    numero: ['', Validators.required],
    dataEntrada: ['', Validators.required],
    fornecedorNome: [''],
    observacao: [''],
  });

  protected voltar(): void {
    this.location.back();
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
      fornecedorNome: valor.fornecedorNome || null,
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
