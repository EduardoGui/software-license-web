import { DecimalPipe, Location } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Obrigacao } from './obrigacao';
import { ObrigacaoService } from './obrigacao.service';

@Component({
  selector: 'app-obrigacao-view',
  imports: [ReactiveFormsModule, RouterLink, DecimalPipe],
  templateUrl: './obrigacao-view.html',
  styleUrl: './obrigacao-view.scss',
})
export class ObrigacaoView {
  private readonly fb = inject(FormBuilder);
  private readonly obrigacaoService = inject(ObrigacaoService);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);

  protected readonly obrigacaoId = Number(this.route.snapshot.paramMap.get('id'));

  protected readonly obrigacao = signal<Obrigacao | null>(null);
  protected readonly carregando = signal(true);
  protected readonly erro = signal(false);

  protected readonly salvando = signal(false);
  protected readonly erroSalvar = signal<string | null>(null);
  protected readonly processando = signal(false);
  protected readonly erroAcao = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    dataNf: [''],
    numeroNf: [''],
    valorNota: this.fb.control<number | null>(null),
    vencimento: [''],
    dataRequisicao: [''],
    dataAssistPgto: [''],
    dataEnvioFinanceiro: [''],
    dataPrevistaPagamento: [''],
    observacoes: [''],
  });

  constructor() {
    this.carregar();
  }

  protected voltar(): void {
    this.location.back();
  }

  protected competenciaBr(iso: string): string {
    const [ano, mes] = iso.split('-');
    return `${mes}/${ano}`;
  }

  private carregar(): void {
    this.carregando.set(true);
    this.erro.set(false);

    this.obrigacaoService.obter(this.obrigacaoId).subscribe({
      next: (o) => {
        this.obrigacao.set(o);
        this.form.reset({
          dataNf: o.dataNf ?? '',
          numeroNf: o.numeroNf ?? '',
          valorNota: o.valorNota,
          vencimento: o.vencimento ?? '',
          dataRequisicao: o.dataRequisicao ?? '',
          dataAssistPgto: o.dataAssistPgto ?? '',
          dataEnvioFinanceiro: o.dataEnvioFinanceiro ?? '',
          dataPrevistaPagamento: o.dataPrevistaPagamento ?? '',
          observacoes: o.observacoes ?? '',
        });
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set(true);
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
    this.erroSalvar.set(null);

    this.obrigacaoService
      .atualizar(this.obrigacaoId, {
        dataNf: valor.dataNf || null,
        numeroNf: valor.numeroNf || null,
        valorNota: valor.valorNota,
        vencimento: valor.vencimento || null,
        dataRequisicao: valor.dataRequisicao || null,
        dataAssistPgto: valor.dataAssistPgto || null,
        dataEnvioFinanceiro: valor.dataEnvioFinanceiro || null,
        dataPrevistaPagamento: valor.dataPrevistaPagamento || null,
        observacoes: valor.observacoes || null,
      })
      .subscribe({
        next: (o) => {
          this.obrigacao.set(o);
          this.salvando.set(false);
        },
        error: (err) => {
          this.salvando.set(false);
          this.erroSalvar.set(err?.error?.message ?? 'Não foi possível salvar.');
        },
      });
  }

  protected marcarPaga(): void {
    this.processando.set(true);
    this.erroAcao.set(null);

    this.obrigacaoService.marcarPaga(this.obrigacaoId).subscribe({
      next: (o) => {
        this.obrigacao.set(o);
        this.processando.set(false);
      },
      error: (err) => {
        this.processando.set(false);
        this.erroAcao.set(err?.error?.message ?? 'Não foi possível marcar como paga.');
      },
    });
  }

  protected desmarcarPaga(): void {
    this.processando.set(true);
    this.erroAcao.set(null);

    this.obrigacaoService.desmarcarPaga(this.obrigacaoId).subscribe({
      next: (o) => {
        this.obrigacao.set(o);
        this.processando.set(false);
      },
      error: (err) => {
        this.processando.set(false);
        this.erroAcao.set(err?.error?.message ?? 'Não foi possível desmarcar.');
      },
    });
  }

  protected cancelar(): void {
    if (!confirm('Cancelar esta obrigação? Essa ação não pode ser desfeita.')) {
      return;
    }

    this.processando.set(true);
    this.erroAcao.set(null);

    this.obrigacaoService.cancelar(this.obrigacaoId).subscribe({
      next: (o) => {
        this.obrigacao.set(o);
        this.processando.set(false);
      },
      error: (err) => {
        this.processando.set(false);
        this.erroAcao.set(err?.error?.message ?? 'Não foi possível cancelar.');
      },
    });
  }
}
