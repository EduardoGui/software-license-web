import { Location } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';

import { Icon } from '../../shared/icons/icon';
import { MovimentacaoSaldoFerias, PeriodoFerias, ROTULOS_TIPO_MOVIMENTACAO } from './periodo-ferias';
import { PeriodoFeriasService } from './periodo-ferias.service';
import { ProgramacaoFerias, ROTULOS_STATUS_PROGRAMACAO } from './programacao-ferias';
import { ProgramacaoFeriasService } from './programacao-ferias.service';

@Component({
  selector: 'app-periodo-ferias-detalhe',
  imports: [ReactiveFormsModule, Icon],
  templateUrl: './periodo-ferias-detalhe.html',
  styleUrl: './periodo-ferias-detalhe.scss',
})
export class PeriodoFeriasDetalhe {
  private readonly periodoFeriasService = inject(PeriodoFeriasService);
  private readonly programacaoFeriasService = inject(ProgramacaoFeriasService);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly fb = inject(FormBuilder);

  protected readonly periodoId = Number(this.route.snapshot.paramMap.get('id'));

  protected readonly periodo = signal<PeriodoFerias | null>(null);
  protected readonly movimentacoes = signal<MovimentacaoSaldoFerias[]>([]);
  protected readonly programacoes = signal<ProgramacaoFerias[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal(false);

  protected readonly rotulosTipo = ROTULOS_TIPO_MOVIMENTACAO;
  protected readonly rotulosStatusProgramacao = ROTULOS_STATUS_PROGRAMACAO;

  protected readonly salvandoAjuste = signal(false);
  protected readonly erroAjuste = signal<string | null>(null);

  protected readonly formAjuste = this.fb.nonNullable.group({
    quantidade: this.fb.control<number | null>(null, [Validators.required]),
    observacao: ['', Validators.required],
  });

  protected readonly mostrarFormPrograma = signal(false);
  protected readonly salvandoPrograma = signal(false);
  protected readonly erroPrograma = signal<string | null>(null);

  protected readonly formPrograma = this.fb.nonNullable.group({
    dataInicio: ['', Validators.required],
    quantidadeDias: this.fb.control<number | null>(null, [Validators.required, Validators.min(1), Validators.max(30)]),
    observacao: [''],
    adiantamentoDecimoTerceiro: [false],
    abonoPecuniario: [false],
    diasAbono: this.fb.control<number | null>(null),
  });

  protected readonly acaoEmAndamentoId = signal<number | null>(null);
  protected readonly erroAcao = signal<string | null>(null);

  constructor() {
    this.carregar();
  }

  protected voltar(): void {
    this.location.back();
  }

  private carregar(): void {
    this.carregando.set(true);
    this.erro.set(false);

    this.periodoFeriasService.obter(this.periodoId).subscribe({
      next: (periodo) => {
        this.periodo.set(periodo);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set(true);
        this.carregando.set(false);
      },
    });

    this.recarregarMovimentacoes();
    this.recarregarProgramacoes();
  }

  private recarregarMovimentacoes(): void {
    this.periodoFeriasService.listarMovimentacoes(this.periodoId).subscribe((movimentacoes) => this.movimentacoes.set(movimentacoes));
  }

  private recarregarProgramacoes(): void {
    this.programacaoFeriasService.listarPorPeriodo(this.periodoId).subscribe((programacoes) => this.programacoes.set(programacoes));
  }

  private recarregarPeriodo(): void {
    this.periodoFeriasService.obter(this.periodoId).subscribe((periodo) => this.periodo.set(periodo));
  }

  protected registrarAjuste(): void {
    if (this.formAjuste.invalid) {
      this.formAjuste.markAllAsTouched();
      return;
    }

    const valor = this.formAjuste.getRawValue();
    this.salvandoAjuste.set(true);
    this.erroAjuste.set(null);

    this.periodoFeriasService.registrarAjusteManual(this.periodoId, { quantidade: valor.quantidade!, observacao: valor.observacao }).subscribe({
      next: (periodo) => {
        this.periodo.set(periodo);
        this.salvandoAjuste.set(false);
        this.formAjuste.reset({ quantidade: null, observacao: '' });
        this.recarregarMovimentacoes();
      },
      error: (err) => {
        this.salvandoAjuste.set(false);
        this.erroAjuste.set(err?.error?.message ?? 'Não foi possível registrar o ajuste manual.');
      },
    });
  }

  protected alternarFormPrograma(): void {
    this.mostrarFormPrograma.update((valor) => !valor);
    this.erroPrograma.set(null);
  }

  protected criarPrograma(): void {
    if (this.formPrograma.invalid) {
      this.formPrograma.markAllAsTouched();
      return;
    }

    const valor = this.formPrograma.getRawValue();
    this.salvandoPrograma.set(true);
    this.erroPrograma.set(null);

    this.programacaoFeriasService
      .criar(this.periodoId, {
        dataInicio: valor.dataInicio,
        quantidadeDias: valor.quantidadeDias!,
        observacao: valor.observacao || undefined,
        adiantamentoDecimoTerceiro: valor.adiantamentoDecimoTerceiro,
        abonoPecuniario: valor.abonoPecuniario,
        diasAbono: valor.abonoPecuniario ? (valor.diasAbono ?? 0) : 0,
      })
      .subscribe({
        next: () => {
          this.salvandoPrograma.set(false);
          this.mostrarFormPrograma.set(false);
          this.formPrograma.reset({
            dataInicio: '',
            quantidadeDias: null,
            observacao: '',
            adiantamentoDecimoTerceiro: false,
            abonoPecuniario: false,
            diasAbono: null,
          });
          this.recarregarProgramacoes();
          this.recarregarPeriodo();
        },
        error: (err) => {
          this.salvandoPrograma.set(false);
          this.erroPrograma.set(err?.error?.message ?? 'Não foi possível criar a programação de férias.');
        },
      });
  }

  protected podeSolicitar(p: ProgramacaoFerias): boolean {
    return p.status === 'Rascunho';
  }

  protected podeDecidir(p: ProgramacaoFerias): boolean {
    return p.status === 'Solicitada';
  }

  protected podeCancelar(p: ProgramacaoFerias): boolean {
    return p.status === 'Rascunho' || p.status === 'Solicitada' || p.status === 'Aprovada';
  }

  protected solicitar(p: ProgramacaoFerias): void {
    this.executarAcao(p.id, this.programacaoFeriasService.solicitar(p.id));
  }

  protected aprovar(p: ProgramacaoFerias): void {
    if (!confirm(`Aprovar a programação de ${p.quantidadeDias} dia(s) iniciando em ${p.dataInicio}?`)) {
      return;
    }
    this.executarAcao(p.id, this.programacaoFeriasService.aprovar(p.id));
  }

  protected reprovar(p: ProgramacaoFerias): void {
    const justificativa = prompt('Justificativa para reprovar esta programação:');
    if (!justificativa || !justificativa.trim()) {
      return;
    }
    this.executarAcao(p.id, this.programacaoFeriasService.reprovar(p.id, { observacaoAprovador: justificativa.trim() }));
  }

  protected devolver(p: ProgramacaoFerias): void {
    const justificativa = prompt('Justificativa para devolver esta programação para revisão:');
    if (!justificativa || !justificativa.trim()) {
      return;
    }
    this.executarAcao(p.id, this.programacaoFeriasService.devolver(p.id, { observacaoAprovador: justificativa.trim() }));
  }

  protected cancelar(p: ProgramacaoFerias): void {
    if (!confirm('Cancelar esta programação de férias?')) {
      return;
    }
    this.executarAcao(p.id, this.programacaoFeriasService.cancelar(p.id));
  }

  private executarAcao(id: number, acao: Observable<ProgramacaoFerias>): void {
    this.acaoEmAndamentoId.set(id);
    this.erroAcao.set(null);

    acao.subscribe({
      next: () => {
        this.acaoEmAndamentoId.set(null);
        this.recarregarProgramacoes();
        this.recarregarPeriodo();
        this.recarregarMovimentacoes();
      },
      error: (err) => {
        this.acaoEmAndamentoId.set(null);
        this.erroAcao.set(err?.error?.message ?? 'Não foi possível concluir a ação.');
      },
    });
  }
}
