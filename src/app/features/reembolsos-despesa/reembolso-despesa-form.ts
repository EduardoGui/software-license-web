import { DecimalPipe, Location } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Icon } from '../../shared/icons/icon';
import { Local } from '../locais/local';
import { LocalService } from '../locais/local.service';
import { TipoDespesa } from '../tipos-despesa/tipo-despesa';
import { TipoDespesaService } from '../tipos-despesa/tipo-despesa.service';
import { ComprovanteItem } from './comprovante-item';
import { ReembolsoDespesaService } from './reembolso-despesa.service';

@Component({
  selector: 'app-reembolso-despesa-form',
  imports: [ReactiveFormsModule, RouterLink, Icon, DecimalPipe, ComprovanteItem],
  templateUrl: './reembolso-despesa-form.html',
  styleUrl: './reembolso-despesa-form.scss',
})
export class ReembolsoDespesaForm {
  private readonly fb = inject(FormBuilder);
  private readonly reembolsoDespesaService = inject(ReembolsoDespesaService);
  private readonly tipoDespesaService = inject(TipoDespesaService);
  private readonly localService = inject(LocalService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  protected readonly reembolsoId = signal<number | null>(null);
  protected readonly tiposDespesa = signal<TipoDespesa[]>([]);
  protected readonly locais = signal<Local[]>([]);
  protected readonly carregando = signal(false);
  protected readonly salvando = signal(false);
  protected readonly erro = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    finalidade: ['', Validators.required],
    formaPagamento: ['PIX'],
    localId: this.fb.control<number | null>(null),
    observacao: [''],
    itens: this.fb.array<ReturnType<typeof this.criarLinhaItem>>([]),
  });

  protected get editando(): boolean {
    return this.reembolsoId() !== null;
  }

  protected get itens(): FormArray {
    return this.form.controls.itens;
  }

  protected voltar(): void {
    this.location.back();
  }

  constructor() {
    this.tipoDespesaService.listar({ ativo: true }).subscribe((tipos) => this.tiposDespesa.set(tipos));
    this.localService.listar({ ativo: true }).subscribe((locais) => this.locais.set(locais));

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.reembolsoId.set(id);
      this.carregar(id);
    } else {
      this.adicionarItem();
    }
  }

  private criarLinhaItem(id: number | null = null) {
    return this.fb.nonNullable.group({
      id: this.fb.control<number | null>(id),
      data: ['', Validators.required],
      tipoDespesaId: this.fb.control<number | null>(null, Validators.required),
      descricao: [''],
      numeroDocumento: [''],
      valor: [0, [Validators.required, Validators.min(0.01)]],
    });
  }

  protected adicionarItem(): void {
    this.itens.push(this.criarLinhaItem());
  }

  protected removerItem(index: number): void {
    this.itens.removeAt(index);
  }

  protected calcularTotal(): number {
    return this.itens.controls.reduce((soma, controle) => soma + (Number(controle.get('valor')?.value) || 0), 0);
  }

  private carregar(id: number): void {
    this.carregando.set(true);
    this.reembolsoDespesaService.obter(id).subscribe({
      next: (reembolso) => {
        this.form.patchValue({
          finalidade: reembolso.finalidade,
          formaPagamento: reembolso.formaPagamento ?? '',
          localId: reembolso.localId,
          observacao: reembolso.observacao ?? '',
        });
        for (const item of reembolso.itens) {
          const linha = this.criarLinhaItem(item.id);
          linha.patchValue({
            data: item.data,
            tipoDespesaId: item.tipoDespesaId,
            descricao: item.descricao ?? '',
            numeroDocumento: item.numeroDocumento ?? '',
            valor: item.valor,
          });
          this.itens.push(linha);
        }
        if (reembolso.itens.length === 0) {
          this.adicionarItem();
        }
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set('Não foi possível carregar o reembolso.');
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
      finalidade: valor.finalidade,
      formaPagamento: valor.formaPagamento || null,
      localId: valor.localId,
      observacao: valor.observacao || null,
      itens: valor.itens.map((item) => ({
        id: item.id,
        data: item.data,
        tipoDespesaId: item.tipoDespesaId,
        descricao: item.descricao || null,
        numeroDocumento: item.numeroDocumento || null,
        valor: item.valor,
      })),
    };

    this.salvando.set(true);
    this.erro.set(null);

    const requisicao = this.editando
      ? this.reembolsoDespesaService.atualizar(this.reembolsoId()!, payload)
      : this.reembolsoDespesaService.criar(payload);

    requisicao.subscribe({
      next: () => this.router.navigate(['/reembolsos-despesa']),
      error: (err) => {
        this.salvando.set(false);
        this.erro.set(err?.error?.message ?? 'Não foi possível salvar o reembolso.');
      },
    });
  }
}
