import { Location } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { Fornecedor } from '../fornecedores/fornecedor';
import { FornecedorService } from '../fornecedores/fornecedor.service';
import { Icon } from '../../shared/icons/icon';
import { MetodoProRata, TipoMedicao } from './contrato';
import { ContratoService } from './contrato.service';

@Component({
  selector: 'app-contrato-form',
  imports: [ReactiveFormsModule, Icon],
  templateUrl: './contrato-form.html',
  styleUrl: './contrato-form.scss',
})
export class ContratoForm {
  private readonly fb = inject(FormBuilder);
  private readonly contratoService = inject(ContratoService);
  private readonly fornecedorService = inject(FornecedorService);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  protected readonly fornecedores = signal<Fornecedor[]>([]);
  protected readonly salvando = signal(false);
  protected readonly erro = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    numero: ['', Validators.required],
    fornecedorId: this.fb.control<number | null>(null, Validators.required),
    objeto: ['', Validators.required],
    natureza: [''],
    dataAssinatura: ['', Validators.required],
    dataInicioVigencia: ['', Validators.required],
    dataFimVigenciaOriginal: ['', Validators.required],
    valorOriginal: [0, [Validators.required, Validators.min(0)]],
    observacoes: [''],
    itens: this.fb.array<ReturnType<typeof this.criarLinhaItem>>([]),
    tipoMedicao: ['MensalFixo' as TipoMedicao, Validators.required],
    diaInicioPeriodo: this.fb.control<number | null>(null),
    diaFimPeriodo: this.fb.control<number | null>(null),
    exigeBm: [false],
    exigeAprovacao: [false],
    exigeAssinatura: [false],
    permiteProRata: [false],
    metodoProRata: this.fb.control<MetodoProRata | null>(null),
    diasAntecedenciaAlerta: this.fb.control<number | null>(null),
    diaInicialJanelaNf: [1, [Validators.required, Validators.min(1), Validators.max(31)]],
    diaFinalJanelaNf: [24, [Validators.required, Validators.min(1), Validators.max(31)]],
    exigeBmAprovado: [false],
    exigeBmAssinado: [false],
    prazoPagamentoDias: this.fb.control<number | null>(null),
  });

  protected get itens(): FormArray {
    return this.form.controls.itens;
  }

  protected voltar(): void {
    this.location.back();
  }

  constructor() {
    this.fornecedorService.listar({ ativo: true }).subscribe((fornecedores) => this.fornecedores.set(fornecedores));
    this.adicionarItem();
  }

  private criarLinhaItem() {
    return this.fb.nonNullable.group({
      codigo: [''],
      descricao: ['', Validators.required],
      unidade: ['', Validators.required],
      quantidadeContratada: [0, [Validators.required, Validators.min(0.000001)]],
      valorUnitario: [0, [Validators.required, Validators.min(0)]],
    });
  }

  protected adicionarItem(): void {
    this.itens.push(this.criarLinhaItem());
  }

  protected removerItem(index: number): void {
    this.itens.removeAt(index);
  }

  protected salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valor = this.form.getRawValue();
    const payload = {
      numero: valor.numero,
      fornecedorId: valor.fornecedorId,
      objeto: valor.objeto,
      natureza: valor.natureza || null,
      dataAssinatura: valor.dataAssinatura,
      dataInicioVigencia: valor.dataInicioVigencia,
      dataFimVigenciaOriginal: valor.dataFimVigenciaOriginal,
      valorOriginal: valor.valorOriginal,
      observacoes: valor.observacoes || null,
      itens: valor.itens.map((item) => ({
        codigo: item.codigo || null,
        descricao: item.descricao,
        unidade: item.unidade,
        quantidadeContratada: item.quantidadeContratada,
        valorUnitario: item.valorUnitario,
      })),
      medicaoConfig: {
        tipoMedicao: valor.tipoMedicao,
        diaInicioPeriodo: valor.diaInicioPeriodo,
        diaFimPeriodo: valor.diaFimPeriodo,
        exigeBm: valor.exigeBm,
        exigeAprovacao: valor.exigeAprovacao,
        exigeAssinatura: valor.exigeAssinatura,
        permiteProRata: valor.permiteProRata,
        metodoProRata: valor.metodoProRata,
        diasAntecedenciaAlerta: valor.diasAntecedenciaAlerta,
      },
      faturamentoConfig: {
        diaInicialJanelaNf: valor.diaInicialJanelaNf,
        diaFinalJanelaNf: valor.diaFinalJanelaNf,
        exigeBmAprovado: valor.exigeBmAprovado,
        exigeBmAssinado: valor.exigeBmAssinado,
        prazoPagamentoDias: valor.prazoPagamentoDias,
      },
    };

    this.salvando.set(true);
    this.erro.set(null);

    this.contratoService.criar(payload).subscribe({
      next: (contrato) => this.router.navigate(['/contratos', contrato.id]),
      error: (err) => {
        this.salvando.set(false);
        this.erro.set(err?.error?.message ?? 'Não foi possível salvar o contrato.');
      },
    });
  }
}
