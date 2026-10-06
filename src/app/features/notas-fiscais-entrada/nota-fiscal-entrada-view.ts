import { DecimalPipe, Location } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { AnexosSecao } from '../../shared/anexos/anexos-secao';
import { Icon } from '../../shared/icons/icon';
import { DataBrPipe } from '../../shared/pipes/data-br.pipe';
import { RateioUaLinha, RateioUaModal } from '../../shared/rateio-ua/rateio-ua-modal';
import { UnidadeOrcamentaria } from '../unidades-orcamentarias/unidade-orcamentaria';
import { UnidadeOrcamentariaService } from '../unidades-orcamentarias/unidade-orcamentaria.service';
import { Local } from '../locais/local';
import { LocalService } from '../locais/local.service';
import { TipoEquipamento } from '../tipos-equipamento/tipo-equipamento';
import { TipoEquipamentoService } from '../tipos-equipamento/tipo-equipamento.service';
import { TipoPatrimonio } from '../tipos-patrimonio/tipo-patrimonio';
import { TipoPatrimonioService } from '../tipos-patrimonio/tipo-patrimonio.service';
import { NotaFiscalEntradaDetalhe, NotaFiscalItem } from './nota-fiscal-entrada';
import { NotaFiscalEntradaService } from './nota-fiscal-entrada.service';

@Component({
  selector: 'app-nota-fiscal-entrada-view',
  imports: [ReactiveFormsModule, Icon, DataBrPipe, DecimalPipe, RouterLink, AnexosSecao, RateioUaModal],
  templateUrl: './nota-fiscal-entrada-view.html',
  styleUrl: './nota-fiscal-entrada-view.scss',
})
export class NotaFiscalEntradaView {
  private readonly fb = inject(FormBuilder);
  private readonly notaFiscalEntradaService = inject(NotaFiscalEntradaService);
  private readonly tipoEquipamentoService = inject(TipoEquipamentoService);
  private readonly tipoPatrimonioService = inject(TipoPatrimonioService);
  private readonly localService = inject(LocalService);
  private readonly unidadeOrcamentariaService = inject(UnidadeOrcamentariaService);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);

  protected readonly notaId = Number(this.route.snapshot.paramMap.get('id'));

  protected readonly nota = signal<NotaFiscalEntradaDetalhe | null>(null);
  protected readonly tipos = signal<TipoEquipamento[]>([]);
  protected readonly tiposPatrimonio = signal<TipoPatrimonio[]>([]);
  protected readonly locais = signal<Local[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal(false);
  protected readonly salvandoItem = signal(false);
  protected readonly erroItem = signal<string | null>(null);

  protected readonly temItemEquipamento = computed(() => (this.nota()?.itens ?? []).some((item) => item.destino !== 'Patrimonio'));
  protected readonly temItemPatrimonio = computed(() => (this.nota()?.itens ?? []).some((item) => item.destino === 'Patrimonio'));

  protected readonly formItem = this.fb.nonNullable.group({
    destino: ['Equipamento' as 'Equipamento' | 'Patrimonio', Validators.required],
    tipoEquipamentoId: [0],
    tipoPatrimonioId: [0],
    localId: [null as number | null],
    descricao: [''],
    quantidade: [1, [Validators.required, Validators.min(1)]],
    valorUnitario: [null as number | null],
    origem: ['Comprado' as 'Locado' | 'Comprado', Validators.required],
  });

  protected readonly unidadesOrcamentarias = signal<UnidadeOrcamentaria[]>([]);
  // Rateio do item que está sendo adicionado (UA obrigatória: soma == quantidade do formulário).
  protected readonly rateioNovoItem = signal<RateioUaLinha[]>([]);
  protected readonly modalRateioNovoAberto = signal(false);
  // Rateio de um item já salvo (itens antigos / correção).
  protected readonly itemRateioEmEdicao = signal<NotaFiscalItem | null>(null);
  protected readonly salvandoRateio = signal(false);
  protected readonly erroRateio = signal<string | null>(null);

  constructor() {
    this.unidadeOrcamentariaService.listar({ ativa: true }).subscribe((unidades) => this.unidadesOrcamentarias.set(unidades));
    this.tipoEquipamentoService.listar({ ativo: true }).subscribe((tipos) => this.tipos.set(tipos));
    this.tipoPatrimonioService.listar({ ativo: true }).subscribe((tipos) => this.tiposPatrimonio.set(tipos));
    this.localService.listar({ ativo: true }).subscribe((locais) => this.locais.set(locais));
    this.carregar();
  }

  protected voltar(): void {
    this.location.back();
  }

  private carregar(): void {
    this.carregando.set(true);
    this.erro.set(false);

    this.notaFiscalEntradaService.obter(this.notaId).subscribe({
      next: (nota) => {
        this.nota.set(nota);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set(true);
        this.carregando.set(false);
      },
    });
  }

  protected rateioNovoCompleto(): boolean {
    const linhas = this.rateioNovoItem();
    const quantidade = Number(this.formItem.value.quantidade) || 0;
    return linhas.length > 0 && linhas.reduce((soma, linha) => soma + linha.quantidade, 0) === quantidade;
  }

  protected limparRateioNovo(): void {
    this.rateioNovoItem.set([]);
  }

  protected linhasIniciaisRateioNovo(): RateioUaLinha[] {
    return this.rateioNovoCompleto() ? this.rateioNovoItem() : [];
  }

  protected abrirRateioNovo(): void {
    if (!(Number(this.formItem.value.quantidade) >= 1)) {
      this.erroItem.set('Informe a quantidade antes de definir a UA.');
      return;
    }

    this.erroItem.set(null);
    this.modalRateioNovoAberto.set(true);
  }

  protected confirmarRateioNovo(linhas: RateioUaLinha[]): void {
    this.rateioNovoItem.set(linhas);
    this.modalRateioNovoAberto.set(false);
  }

  protected abrirRateioItem(item: NotaFiscalItem): void {
    this.erroRateio.set(null);
    this.itemRateioEmEdicao.set(item);
  }

  protected fecharRateioItem(): void {
    this.itemRateioEmEdicao.set(null);
  }

  protected salvarRateioItem(linhas: RateioUaLinha[]): void {
    const item = this.itemRateioEmEdicao();
    if (!item) {
      return;
    }

    this.salvandoRateio.set(true);
    this.erroRateio.set(null);

    this.notaFiscalEntradaService.definirRateioUa(this.notaId, item.id, linhas).subscribe({
      next: () => {
        this.salvandoRateio.set(false);
        this.itemRateioEmEdicao.set(null);
        this.carregar();
      },
      error: (err) => {
        this.salvandoRateio.set(false);
        this.erroRateio.set(err?.error?.message ?? 'Não foi possível salvar o rateio de UA.');
      },
    });
  }

  protected adicionarItem(): void {
    if (this.formItem.invalid) {
      this.formItem.markAllAsTouched();
      return;
    }

    // UA é opcional; mas se começou a definir, o rateio precisa fechar com a quantidade.
    if (this.rateioNovoItem().length > 0 && !this.rateioNovoCompleto()) {
      this.erroItem.set('A soma do rateio de UA deve ser igual à quantidade do item (ou limpe a UA).');
      return;
    }

    const valor = this.formItem.getRawValue();

    if (valor.destino === 'Equipamento' && !valor.tipoEquipamentoId) {
      this.erroItem.set('Selecione o tipo de equipamento.');
      return;
    }

    if (valor.destino === 'Patrimonio' && !valor.tipoPatrimonioId) {
      this.erroItem.set('Selecione o tipo de patrimônio.');
      return;
    }

    const payload = {
      destino: valor.destino,
      tipoEquipamentoId: valor.destino === 'Equipamento' ? valor.tipoEquipamentoId : null,
      tipoPatrimonioId: valor.destino === 'Patrimonio' ? valor.tipoPatrimonioId : null,
      localId: valor.destino === 'Patrimonio' ? valor.localId : null,
      descricao: valor.descricao || null,
      quantidade: valor.quantidade,
      valorUnitario: valor.valorUnitario,
      origem: valor.destino === 'Equipamento' ? valor.origem : null,
      rateioUa: this.rateioNovoItem(),
    };

    this.salvandoItem.set(true);
    this.erroItem.set(null);

    this.notaFiscalEntradaService.adicionarItem(this.notaId, payload).subscribe({
      next: () => {
        this.salvandoItem.set(false);
        this.rateioNovoItem.set([]);
        this.formItem.reset({
          destino: 'Equipamento',
          tipoEquipamentoId: 0,
          tipoPatrimonioId: 0,
          localId: null,
          descricao: '',
          quantidade: 1,
          valorUnitario: null,
          origem: 'Comprado',
        });
        this.carregar();
      },
      error: (err) => {
        this.salvandoItem.set(false);
        this.erroItem.set(err?.error?.message ?? 'Não foi possível adicionar o item.');
      },
    });
  }
}
