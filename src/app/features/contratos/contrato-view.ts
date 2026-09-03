import { DecimalPipe, Location, formatDate } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { AnexosSecao } from '../../shared/anexos/anexos-secao';
import { Icon } from '../../shared/icons/icon';
import { DataBrPipe } from '../../shared/pipes/data-br.pipe';
import { adicionarMeses, diasEntre, hojeIso, inicioDoMes, paraData } from '../timeline/timeline-datas';
import {
  Aditivo,
  ContratoDetalhe,
  ContratoSaldoItem,
  ContratoStatus,
  MedicaoBm,
  MedicaoBmAcerto,
  MedicaoBmImposto,
  MedicaoBmItem,
  MetodoProRata,
  TipoMedicao,
} from './contrato';
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

  protected readonly medicoes = signal<MedicaoBm[]>([]);
  protected readonly medicaoExpandidaId = signal<number | null>(null);
  protected readonly salvandoNovaMedicao = signal(false);
  protected readonly erroNovaMedicao = signal<string | null>(null);
  protected readonly salvandoItensMedicao = signal(false);
  protected readonly erroItensMedicao = signal<string | null>(null);
  protected readonly decidindoMedicaoId = signal<number | null>(null);
  protected readonly reprovandoMedicaoId = signal<number | null>(null);
  protected readonly erroDecisaoMedicao = signal<string | null>(null);
  protected readonly confirmandoExclusaoMedicao = signal(false);
  protected readonly excluindoMedicao = signal(false);
  protected readonly erroExclusaoMedicao = signal<string | null>(null);

  protected readonly saldo = signal<ContratoSaldoItem[]>([]);

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

  protected readonly formNovaMedicao = this.fb.nonNullable.group({
    periodoInicio: ['', Validators.required],
    periodoFim: ['', Validators.required],
    observacao: [''],
  });

  protected readonly formReprovarMedicao = this.fb.nonNullable.group({
    observacaoAprovador: [''],
  });

  protected readonly formItensMedicao = this.fb.nonNullable.group({
    numeroReferencia: [''],
    itens: this.fb.array<ReturnType<typeof this.criarLinhaItemMedicao>>([]),
    acertos: this.fb.array<ReturnType<typeof this.criarLinhaAcerto>>([]),
    impostos: this.fb.array<ReturnType<typeof this.criarLinhaImposto>>([]),
  });

  protected get itensMedicao(): FormArray {
    return this.formItensMedicao.controls.itens;
  }

  protected get acertosMedicao(): FormArray {
    return this.formItensMedicao.controls.acertos;
  }

  protected get impostosMedicao(): FormArray {
    return this.formItensMedicao.controls.impostos;
  }

  constructor() {
    this.carregar();
    this.carregarAditivos();
    this.carregarMedicoes();
    this.carregarSaldo();
  }

  private carregarSaldo(): void {
    this.contratoService.obterSaldo(this.contratoId).subscribe((saldo) => this.saldo.set(saldo));
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
        this.carregarSaldo();
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

  private carregarMedicoes(): void {
    this.contratoService.listarMedicoes(this.contratoId).subscribe((medicoes) => this.medicoes.set(medicoes));
  }

  protected criarMedicaoBm(): void {
    if (this.formNovaMedicao.invalid) {
      this.formNovaMedicao.markAllAsTouched();
      return;
    }

    const valor = this.formNovaMedicao.getRawValue();
    this.salvandoNovaMedicao.set(true);
    this.erroNovaMedicao.set(null);

    this.contratoService
      .criarMedicaoBm(this.contratoId, {
        periodoInicio: valor.periodoInicio,
        periodoFim: valor.periodoFim,
        dataEnvio: null,
        observacao: valor.observacao || null,
      })
      .subscribe({
        next: (bm) => {
          this.salvandoNovaMedicao.set(false);
          this.formNovaMedicao.reset({ periodoInicio: '', periodoFim: '', observacao: '' });
          this.carregarMedicoes();
          this.preencherFormItensMedicao(bm);
        },
        error: (err) => {
          this.salvandoNovaMedicao.set(false);
          this.erroNovaMedicao.set(err?.error?.message ?? 'Não foi possível criar o BM.');
        },
      });
  }

  private criarLinhaItemMedicao(item: MedicaoBmItem) {
    return this.fb.nonNullable.group({
      itemId: [item.id],
      descricaoNoMomento: [item.descricaoNoMomento],
      unidadeNoMomento: [item.unidadeNoMomento],
      saldoAntes: [item.saldoAntes],
      valorUnitarioNoMomento: [item.valorUnitarioNoMomento],
      quantidadeMedidaNestaBm: [item.quantidadeMedidaNestaBm, [Validators.required, Validators.min(0)]],
      inicioEfetivo: this.fb.control<string | null>(item.inicioEfetivo),
      fimEfetivo: this.fb.control<string | null>(item.fimEfetivo),
      percentualProRata: this.fb.control<number | null>(item.percentualProRata),
      ajusteManual: this.fb.control<number | null>(item.ajusteManual),
      justificativaAjuste: [item.justificativaAjuste ?? ''],
    });
  }

  protected medicaoSelecionada(): MedicaoBm | undefined {
    return this.medicoes().find((m) => m.id === this.medicaoExpandidaId());
  }

  protected expandirMedicao(bm: MedicaoBm): void {
    this.preencherFormItensMedicao(bm);
  }

  protected fecharModalMedicao(): void {
    this.medicaoExpandidaId.set(null);
    this.confirmandoExclusaoMedicao.set(false);
    this.erroExclusaoMedicao.set(null);
  }

  private preencherFormItensMedicao(bm: MedicaoBm): void {
    this.medicaoExpandidaId.set(bm.id);
    this.confirmandoExclusaoMedicao.set(false);
    this.erroExclusaoMedicao.set(null);
    this.formItensMedicao.patchValue({ numeroReferencia: bm.numeroReferencia ?? '' });

    this.itensMedicao.clear();
    for (const item of bm.itens) {
      this.itensMedicao.push(this.criarLinhaItemMedicao(item));
    }

    this.acertosMedicao.clear();
    for (const acerto of bm.acertos) {
      this.acertosMedicao.push(this.criarLinhaAcerto(acerto));
    }

    this.impostosMedicao.clear();
    for (const imposto of bm.impostos) {
      this.impostosMedicao.push(this.criarLinhaImposto(imposto));
    }
  }

  private criarLinhaAcerto(acerto?: MedicaoBmAcerto) {
    return this.fb.nonNullable.group({
      descricao: [acerto?.descricao ?? '', Validators.required],
      unidade: [acerto?.unidade ?? ''],
      quantidade: this.fb.control<number | null>(acerto?.quantidade ?? null),
      precoUnitario: this.fb.control<number | null>(acerto?.precoUnitario ?? null),
      precoTotal: [acerto?.precoTotal ?? 0, Validators.required],
    });
  }

  protected adicionarAcerto(): void {
    this.acertosMedicao.push(this.criarLinhaAcerto());
  }

  protected removerAcerto(index: number): void {
    this.acertosMedicao.removeAt(index);
  }

  private criarLinhaImposto(imposto?: MedicaoBmImposto) {
    return this.fb.nonNullable.group({
      descricao: [imposto?.descricao ?? '', Validators.required],
      aliquota: [imposto?.aliquota ?? 0],
      base: [imposto?.base ?? 0],
      valorTotal: [imposto?.valorTotal ?? 0, Validators.required],
    });
  }

  protected adicionarImposto(): void {
    this.impostosMedicao.push(this.criarLinhaImposto());
  }

  protected removerImposto(index: number): void {
    this.impostosMedicao.removeAt(index);
  }

  protected salvarItensMedicao(): void {
    const medicaoId = this.medicaoExpandidaId();
    if (medicaoId === null || this.formItensMedicao.invalid) {
      this.formItensMedicao.markAllAsTouched();
      return;
    }

    const valor = this.formItensMedicao.getRawValue();
    this.salvandoItensMedicao.set(true);
    this.erroItensMedicao.set(null);

    this.contratoService
      .atualizarMedicaoBm(this.contratoId, medicaoId, {
        numeroReferencia: valor.numeroReferencia || null,
        dataEnvio: null,
        observacao: null,
        itens: valor.itens.map((item) => ({
          itemId: item.itemId,
          quantidadeMedidaNestaBm: item.quantidadeMedidaNestaBm,
          inicioEfetivo: item.inicioEfetivo || null,
          fimEfetivo: item.fimEfetivo || null,
          percentualProRata: item.percentualProRata,
          ajusteManual: item.ajusteManual,
          justificativaAjuste: item.justificativaAjuste || null,
        })),
        acertos: valor.acertos.map((a) => ({
          medicaoBmItemId: null,
          descricao: a.descricao,
          unidade: a.unidade || null,
          quantidade: a.quantidade,
          precoUnitario: a.precoUnitario,
          precoTotal: a.precoTotal,
        })),
        impostos: valor.impostos.map((i) => ({
          medicaoBmItemId: null,
          descricao: i.descricao,
          aliquota: i.aliquota,
          base: i.base,
          valorTotal: i.valorTotal,
        })),
      })
      .subscribe({
        next: (bm) => {
          this.salvandoItensMedicao.set(false);
          this.carregarMedicoes();
          this.preencherFormItensMedicao(bm);
        },
        error: (err) => {
          this.salvandoItensMedicao.set(false);
          this.erroItensMedicao.set(err?.error?.message ?? 'Não foi possível salvar a medição.');
        },
      });
  }

  protected aprovarMedicao(bmId: number): void {
    this.decidindoMedicaoId.set(bmId);
    this.erroDecisaoMedicao.set(null);

    this.contratoService.aprovarMedicaoBm(this.contratoId, bmId).subscribe({
      next: (bm) => {
        this.decidindoMedicaoId.set(null);
        this.carregarMedicoes();
        this.carregarSaldo();
        this.preencherFormItensMedicao(bm);
      },
      error: (err) => {
        this.decidindoMedicaoId.set(null);
        this.erroDecisaoMedicao.set(err?.error?.message ?? 'Não foi possível aprovar o BM.');
      },
    });
  }

  protected iniciarReprovarMedicao(bmId: number): void {
    this.reprovandoMedicaoId.set(bmId);
    this.formReprovarMedicao.reset({ observacaoAprovador: '' });
  }

  protected cancelarReprovarMedicao(): void {
    this.reprovandoMedicaoId.set(null);
  }

  protected confirmarReprovarMedicao(bmId: number): void {
    this.decidindoMedicaoId.set(bmId);
    this.erroDecisaoMedicao.set(null);
    const observacaoAprovador = this.formReprovarMedicao.getRawValue().observacaoAprovador || null;

    this.contratoService.reprovarMedicaoBm(this.contratoId, bmId, { observacaoAprovador }).subscribe({
      next: (bm) => {
        this.decidindoMedicaoId.set(null);
        this.reprovandoMedicaoId.set(null);
        this.carregarMedicoes();
        this.preencherFormItensMedicao(bm);
      },
      error: (err) => {
        this.decidindoMedicaoId.set(null);
        this.erroDecisaoMedicao.set(err?.error?.message ?? 'Não foi possível reprovar o BM.');
      },
    });
  }

  protected iniciarExcluirMedicao(): void {
    this.confirmandoExclusaoMedicao.set(true);
  }

  protected cancelarExcluirMedicao(): void {
    this.confirmandoExclusaoMedicao.set(false);
  }

  protected confirmarExcluirMedicao(): void {
    const medicaoId = this.medicaoExpandidaId();
    if (medicaoId === null) {
      return;
    }

    this.excluindoMedicao.set(true);
    this.erroExclusaoMedicao.set(null);

    this.contratoService.excluirMedicaoBm(this.contratoId, medicaoId).subscribe({
      next: () => {
        this.excluindoMedicao.set(false);
        this.fecharModalMedicao();
        this.carregarMedicoes();
      },
      error: (err) => {
        this.excluindoMedicao.set(false);
        this.erroExclusaoMedicao.set(err?.error?.message ?? 'Não foi possível excluir o BM.');
      },
    });
  }
}
