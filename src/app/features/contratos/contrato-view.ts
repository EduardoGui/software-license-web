import { DecimalPipe, Location, formatDate } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { AnexosSecao } from '../../shared/anexos/anexos-secao';
import { Icon } from '../../shared/icons/icon';
import { DataBrPipe } from '../../shared/pipes/data-br.pipe';
import { adicionarMeses, diasEntre, hojeIso, inicioDoMes, paraData } from '../timeline/timeline-datas';
import { Aditivo, ContratoDetalhe, ContratoStatus, MetodoProRata, TipoMedicao } from './contrato';
import { ContratoService } from './contrato.service';

interface MarcaMes {
  label: string;
  posicaoPx: number;
}

const PX_POR_DIA = 6;

@Component({
  selector: 'app-contrato-view',
  imports: [ReactiveFormsModule, DataBrPipe, DecimalPipe, AnexosSecao, Icon],
  templateUrl: './contrato-view.html',
  styleUrl: './contrato-view.scss',
})
export class ContratoView {
  private readonly fb = inject(FormBuilder);
  private readonly contratoService = inject(ContratoService);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);

  protected readonly contratoId = Number(this.route.snapshot.paramMap.get('id'));

  protected readonly contrato = signal<ContratoDetalhe | null>(null);
  protected readonly carregando = signal(true);
  protected readonly erro = signal(false);

  protected readonly salvandoDados = signal(false);
  protected readonly erroDados = signal<string | null>(null);
  protected readonly salvandoMedicao = signal(false);
  protected readonly erroMedicao = signal<string | null>(null);
  protected readonly salvandoFaturamento = signal(false);
  protected readonly erroFaturamento = signal<string | null>(null);

  protected readonly aditivos = signal<Aditivo[]>([]);
  protected readonly salvandoAditivo = signal(false);
  protected readonly erroAditivo = signal<string | null>(null);
  protected readonly formalizandoId = signal<number | null>(null);

  protected readonly formDados = this.fb.nonNullable.group({
    objeto: ['', Validators.required],
    natureza: [''],
    status: ['Ativo' as ContratoStatus, Validators.required],
    observacoes: [''],
  });

  protected readonly formMedicao = this.fb.nonNullable.group({
    tipoMedicao: ['MensalFixo' as TipoMedicao, Validators.required],
    diaInicioPeriodo: this.fb.control<number | null>(null),
    diaFimPeriodo: this.fb.control<number | null>(null),
    exigeBm: [false],
    exigeAprovacao: [false],
    exigeAssinatura: [false],
    permiteProRata: [false],
    metodoProRata: this.fb.control<MetodoProRata | null>(null),
    diasAntecedenciaAlerta: this.fb.control<number | null>(null),
  });

  protected readonly formFaturamento = this.fb.nonNullable.group({
    diaInicialJanelaNf: [1, [Validators.required, Validators.min(1), Validators.max(31)]],
    diaFinalJanelaNf: [24, [Validators.required, Validators.min(1), Validators.max(31)]],
    exigeBmAprovado: [false],
    exigeBmAssinado: [false],
    prazoPagamentoDias: this.fb.control<number | null>(null),
  });

  protected readonly formAditivo = this.fb.nonNullable.group({
    descricao: ['', Validators.required],
    dataAssinatura: ['', Validators.required],
    dataEfeito: ['', Validators.required],
    deltaValor: this.fb.control<number | null>(null),
    novaDataFimVigencia: this.fb.control<string | null>(null),
    percentualReajuste: this.fb.control<number | null>(null),
    observacao: [''],
    itens: this.fb.array<ReturnType<typeof this.criarLinhaItemAditivo>>([]),
  });

  protected get itensAditivo(): FormArray {
    return this.formAditivo.controls.itens;
  }

  constructor() {
    this.carregar();
    this.carregarAditivos();
  }

  protected voltar(): void {
    this.location.back();
  }

  private carregar(): void {
    this.carregando.set(true);
    this.erro.set(false);

    this.contratoService.obter(this.contratoId).subscribe({
      next: (contrato) => {
        this.contrato.set(contrato);
        this.formDados.reset({
          objeto: contrato.objeto,
          natureza: contrato.natureza ?? '',
          status: contrato.status,
          observacoes: contrato.observacoes ?? '',
        });
        if (contrato.medicaoConfig) {
          this.formMedicao.reset(contrato.medicaoConfig);
        }
        if (contrato.faturamentoConfig) {
          this.formFaturamento.reset(contrato.faturamentoConfig);
        }
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set(true);
        this.carregando.set(false);
      },
    });
  }

  protected salvarDados(): void {
    if (this.formDados.invalid) {
      this.formDados.markAllAsTouched();
      return;
    }

    const valor = this.formDados.getRawValue();
    this.salvandoDados.set(true);
    this.erroDados.set(null);

    this.contratoService
      .atualizar(this.contratoId, {
        objeto: valor.objeto,
        natureza: valor.natureza || null,
        status: valor.status,
        observacoes: valor.observacoes || null,
      })
      .subscribe({
        next: () => {
          this.salvandoDados.set(false);
          this.carregar();
        },
        error: (err) => {
          this.salvandoDados.set(false);
          this.erroDados.set(err?.error?.message ?? 'Não foi possível salvar os dados do contrato.');
        },
      });
  }

  protected salvarMedicao(): void {
    if (this.formMedicao.invalid) {
      this.formMedicao.markAllAsTouched();
      return;
    }

    this.salvandoMedicao.set(true);
    this.erroMedicao.set(null);

    this.contratoService.atualizarMedicaoConfig(this.contratoId, this.formMedicao.getRawValue()).subscribe({
      next: () => {
        this.salvandoMedicao.set(false);
        this.carregar();
      },
      error: (err) => {
        this.salvandoMedicao.set(false);
        this.erroMedicao.set(err?.error?.message ?? 'Não foi possível salvar a configuração de medição.');
      },
    });
  }

  protected salvarFaturamento(): void {
    if (this.formFaturamento.invalid) {
      this.formFaturamento.markAllAsTouched();
      return;
    }

    this.salvandoFaturamento.set(true);
    this.erroFaturamento.set(null);

    this.contratoService.atualizarFaturamentoConfig(this.contratoId, this.formFaturamento.getRawValue()).subscribe({
      next: () => {
        this.salvandoFaturamento.set(false);
        this.carregar();
      },
      error: (err) => {
        this.salvandoFaturamento.set(false);
        this.erroFaturamento.set(err?.error?.message ?? 'Não foi possível salvar a configuração de faturamento.');
      },
    });
  }

  private carregarAditivos(): void {
    this.contratoService.listarAditivos(this.contratoId).subscribe((aditivos) => this.aditivos.set(aditivos));
  }

  private criarLinhaItemAditivo() {
    return this.fb.nonNullable.group({
      tipo: ['existente' as 'existente' | 'novo', Validators.required],
      contratoItemId: this.fb.control<number | null>(null),
      descricaoNovoItem: [''],
      codigoNovoItem: [''],
      unidadeNovoItem: [''],
      deltaQuantidade: [0, Validators.required],
      novoValorUnitario: this.fb.control<number | null>(null),
    });
  }

  protected adicionarItemAditivo(): void {
    this.itensAditivo.push(this.criarLinhaItemAditivo());
  }

  protected removerItemAditivo(index: number): void {
    this.itensAditivo.removeAt(index);
  }

  protected salvarAditivo(): void {
    if (this.formAditivo.invalid) {
      this.formAditivo.markAllAsTouched();
      return;
    }

    const valor = this.formAditivo.getRawValue();
    const payload = {
      descricao: valor.descricao,
      dataAssinatura: valor.dataAssinatura,
      dataEfeito: valor.dataEfeito,
      deltaValor: valor.deltaValor,
      novaDataFimVigencia: valor.novaDataFimVigencia || null,
      percentualReajuste: valor.percentualReajuste,
      observacao: valor.observacao || null,
      itens: valor.itens.map((item) => ({
        contratoItemId: item.tipo === 'existente' ? item.contratoItemId : null,
        descricaoNovoItem: item.tipo === 'novo' ? item.descricaoNovoItem || null : null,
        codigoNovoItem: item.tipo === 'novo' ? item.codigoNovoItem || null : null,
        unidadeNovoItem: item.tipo === 'novo' ? item.unidadeNovoItem || null : null,
        deltaQuantidade: item.deltaQuantidade,
        novoValorUnitario: item.novoValorUnitario,
      })),
    };

    this.salvandoAditivo.set(true);
    this.erroAditivo.set(null);

    this.contratoService.criarAditivo(this.contratoId, payload).subscribe({
      next: () => {
        this.salvandoAditivo.set(false);
        this.formAditivo.reset({
          descricao: '',
          dataAssinatura: '',
          dataEfeito: '',
          deltaValor: null,
          novaDataFimVigencia: null,
          percentualReajuste: null,
          observacao: '',
        });
        this.itensAditivo.clear();
        this.carregarAditivos();
      },
      error: (err) => {
        this.salvandoAditivo.set(false);
        this.erroAditivo.set(err?.error?.message ?? 'Não foi possível salvar o aditivo.');
      },
    });
  }

  protected formalizar(aditivoId: number): void {
    this.formalizandoId.set(aditivoId);

    this.contratoService.formalizarAditivo(this.contratoId, aditivoId).subscribe({
      next: () => {
        this.formalizandoId.set(null);
        this.carregarAditivos();
        this.carregar();
      },
      error: (err) => {
        this.formalizandoId.set(null);
        this.erroAditivo.set(err?.error?.message ?? 'Não foi possível formalizar o aditivo.');
      },
    });
  }

  protected larguraTotalTimelinePx(c: ContratoDetalhe): number {
    return Math.max(1, diasEntre(c.dataInicioVigencia, c.dataFimVigenciaAtual)) * PX_POR_DIA;
  }

  protected posicaoTimelinePx(c: ContratoDetalhe, dataIso: string): number {
    return Math.max(0, diasEntre(c.dataInicioVigencia, dataIso)) * PX_POR_DIA;
  }

  protected larguraBarraTimelinePx(dataInicio: string, dataFim: string): number {
    return Math.max(1, diasEntre(dataInicio, dataFim)) * PX_POR_DIA;
  }

  protected marcasDeMesTimeline(c: ContratoDetalhe): MarcaMes[] {
    const marcas: MarcaMes[] = [];
    let cursor = inicioDoMes(c.dataInicioVigencia);
    const limite = 36;
    let contagem = 0;

    while (cursor <= c.dataFimVigenciaAtual && contagem < limite) {
      marcas.push({
        label: formatDate(paraData(cursor), 'MMM/yyyy', 'pt-BR'),
        posicaoPx: this.posicaoTimelinePx(c, cursor),
      });
      cursor = adicionarMeses(cursor, 1);
      contagem++;
    }

    return marcas;
  }

  protected posicaoHojeTimelinePx(c: ContratoDetalhe): number | null {
    const hoje = hojeIso();
    if (hoje < c.dataInicioVigencia || hoje > c.dataFimVigenciaAtual) {
      return null;
    }
    return this.posicaoTimelinePx(c, hoje);
  }
}
