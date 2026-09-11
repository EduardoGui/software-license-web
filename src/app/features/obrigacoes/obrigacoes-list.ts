import { DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { Fornecedor } from '../fornecedores/fornecedor';
import { FornecedorService } from '../fornecedores/fornecedor.service';
import { DataBrPipe } from '../../shared/pipes/data-br.pipe';
import { hojeIso, inicioDoMes } from '../timeline/timeline-datas';
import { Obrigacao, ObrigacaoFiltro } from './obrigacao';
import { ObrigacaoService } from './obrigacao.service';

interface FiltroObrigacoes {
  competenciaDeMes: string;
  competenciaAteMes: string;
  tipoMovimento?: string;
  fornecedorId?: number;
  etapa?: string;
  pago?: boolean;
  incluirCanceladas: boolean;
}

@Component({
  selector: 'app-obrigacoes-list',
  imports: [FormsModule, ReactiveFormsModule, DataBrPipe, DecimalPipe],
  templateUrl: './obrigacoes-list.html',
  styleUrl: './obrigacoes-list.scss',
})
export class ObrigacoesList {
  private readonly fb = inject(FormBuilder);
  private readonly obrigacaoService = inject(ObrigacaoService);
  private readonly fornecedorService = inject(FornecedorService);

  protected readonly obrigacoes = signal<Obrigacao[]>([]);
  protected readonly fornecedores = signal<Fornecedor[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal(false);

  private readonly mesAtual = inicioDoMes(hojeIso()).slice(0, 7);

  protected filtro: FiltroObrigacoes = {
    competenciaDeMes: this.mesAtual,
    competenciaAteMes: this.mesAtual,
    incluirCanceladas: false,
    pago: false,
  };

  // Linha expansível (acompanhamento)
  protected readonly expandidoId = signal<number | null>(null);
  protected readonly salvandoLinha = signal(false);
  protected readonly erroLinha = signal<string | null>(null);
  protected readonly processandoAcao = signal(false);

  protected readonly formLinha = this.fb.nonNullable.group({
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

  // Modal de cadastro rápido de fornecedor
  protected readonly modalFornecedorAberto = signal(false);
  protected readonly salvandoFornecedor = signal(false);
  protected readonly erroFornecedor = signal<string | null>(null);

  protected readonly formFornecedor = this.fb.nonNullable.group({
    nome: ['', Validators.required],
    cnpj: ['', Validators.required],
  });

  constructor() {
    this.fornecedorService.listar().subscribe((fornecedores) => this.fornecedores.set(fornecedores));
    this.buscar();
  }

  protected buscar(): void {
    this.carregando.set(true);
    this.erro.set(false);
    this.expandidoId.set(null);

    const filtroApi: ObrigacaoFiltro = {
      competenciaDe: `${this.filtro.competenciaDeMes}-01`,
      competenciaAte: `${this.filtro.competenciaAteMes}-01`,
      tipoMovimento: this.filtro.tipoMovimento,
      fornecedorId: this.filtro.fornecedorId,
      etapa: this.filtro.etapa,
      pago: this.filtro.pago,
      cancelada: this.filtro.incluirCanceladas ? undefined : false,
    };

    this.obrigacaoService.listar(filtroApi).subscribe({
      next: (obrigacoes) => {
        this.obrigacoes.set(obrigacoes);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set(true);
        this.carregando.set(false);
      },
    });
  }

  protected limparFiltro(): void {
    this.filtro = {
      competenciaDeMes: this.mesAtual,
      competenciaAteMes: this.mesAtual,
      incluirCanceladas: false,
      pago: false,
    };
    this.buscar();
  }

  protected mesAnterior(): void {
    this.filtro.competenciaDeMes = this.deslocarMes(this.filtro.competenciaDeMes, -1);
    this.filtro.competenciaAteMes = this.deslocarMes(this.filtro.competenciaAteMes, -1);
    this.buscar();
  }

  protected proximoMes(): void {
    this.filtro.competenciaDeMes = this.deslocarMes(this.filtro.competenciaDeMes, 1);
    this.filtro.competenciaAteMes = this.deslocarMes(this.filtro.competenciaAteMes, 1);
    this.buscar();
  }

  private deslocarMes(mesIso: string, delta: number): string {
    const [ano, mes] = mesIso.split('-').map(Number);
    const data = new Date(ano, mes - 1 + delta, 1);
    return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
  }

  protected competenciaBr(iso: string): string {
    const [ano, mes] = iso.split('-');
    return `${mes}/${ano}`;
  }

  protected classeEtapa(etapa: string): string {
    return 'badge--' + etapa.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/\s+/g, '-');
  }

  protected identificacao(o: Obrigacao): string {
    const primeiraPalavra = o.fornecedorNome.split(' ')[0];

    if (o.tipoMovimento === 'OC') {
      return `OC-${String(o.ordemCompraNumero).padStart(3, '0')} · ${primeiraPalavra}`;
    }

    if (o.tipoMovimento === 'Medição') {
      return `BM-${String(o.medicaoBmNumero).padStart(3, '0')} · ${primeiraPalavra}`;
    }

    const parteFornecedor = o.fornecedorNome.slice(0, 18);
    const parteDescricao = (o.despesaAvulsaDescricao ?? '').slice(0, 22);
    return parteDescricao ? `${parteFornecedor} · ${parteDescricao}` : parteFornecedor;
  }

  // --- Linha expansível ---

  protected linhaExpandida(o: Obrigacao): boolean {
    return this.expandidoId() === o.id;
  }

  protected alternarLinha(o: Obrigacao): void {
    if (this.linhaExpandida(o)) {
      this.expandidoId.set(null);
      return;
    }

    this.expandidoId.set(o.id);
    this.erroLinha.set(null);
    this.formLinha.reset({
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
  }

  protected salvarLinha(o: Obrigacao): void {
    const valor = this.formLinha.getRawValue();
    this.salvandoLinha.set(true);
    this.erroLinha.set(null);

    this.obrigacaoService
      .atualizar(o.id, {
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
        next: (atualizada) => {
          this.substituir(atualizada);
          this.salvandoLinha.set(false);
          this.expandidoId.set(null);
        },
        error: (err) => {
          this.salvandoLinha.set(false);
          this.erroLinha.set(err?.error?.message ?? 'Não foi possível salvar.');
        },
      });
  }

  protected marcarPaga(o: Obrigacao): void {
    this.processandoAcao.set(true);
    this.erroLinha.set(null);

    this.obrigacaoService.marcarPaga(o.id).subscribe({
      next: (atualizada) => {
        this.substituir(atualizada);
        this.processandoAcao.set(false);
      },
      error: (err) => {
        this.processandoAcao.set(false);
        this.erroLinha.set(err?.error?.message ?? 'Não foi possível marcar como paga.');
      },
    });
  }

  protected desmarcarPaga(o: Obrigacao): void {
    this.processandoAcao.set(true);
    this.erroLinha.set(null);

    this.obrigacaoService.desmarcarPaga(o.id).subscribe({
      next: (atualizada) => {
        this.substituir(atualizada);
        this.processandoAcao.set(false);
      },
      error: (err) => {
        this.processandoAcao.set(false);
        this.erroLinha.set(err?.error?.message ?? 'Não foi possível desmarcar.');
      },
    });
  }

  protected cancelar(o: Obrigacao): void {
    if (!confirm('Cancelar esta obrigação? Essa ação não pode ser desfeita.')) {
      return;
    }

    this.processandoAcao.set(true);
    this.erroLinha.set(null);

    this.obrigacaoService.cancelar(o.id).subscribe({
      next: (atualizada) => {
        this.substituir(atualizada);
        this.processandoAcao.set(false);
        this.expandidoId.set(null);
      },
      error: (err) => {
        this.processandoAcao.set(false);
        this.erroLinha.set(err?.error?.message ?? 'Não foi possível cancelar.');
      },
    });
  }

  private substituir(atualizada: Obrigacao): void {
    this.obrigacoes.set(this.obrigacoes().map((o) => (o.id === atualizada.id ? atualizada : o)));
  }

  // --- Modal de cadastro rápido de fornecedor ---

  protected abrirModalFornecedor(): void {
    this.erroFornecedor.set(null);
    this.formFornecedor.reset({ nome: '', cnpj: '' });
    this.modalFornecedorAberto.set(true);
  }

  protected fecharModalFornecedor(): void {
    this.modalFornecedorAberto.set(false);
  }

  protected salvarFornecedor(): void {
    if (this.formFornecedor.invalid) {
      this.formFornecedor.markAllAsTouched();
      return;
    }

    const valor = this.formFornecedor.getRawValue();
    this.salvandoFornecedor.set(true);
    this.erroFornecedor.set(null);

    this.fornecedorService
      .criar({
        nome: valor.nome.trim(),
        cnpj: valor.cnpj.trim(),
        contato: null,
        telefone: null,
        endereco: null,
        inscricaoEstadual: null,
        inscricaoMunicipal: null,
        email: null,
        dadosBancarios: null,
        ativo: true,
      })
      .subscribe({
        next: (novo) => {
          this.fornecedores.set([...this.fornecedores(), novo].sort((a, b) => a.nome.localeCompare(b.nome)));
          this.filtro.fornecedorId = novo.id;
          this.salvandoFornecedor.set(false);
          this.modalFornecedorAberto.set(false);
          this.buscar();
        },
        error: (err) => {
          this.salvandoFornecedor.set(false);
          this.erroFornecedor.set(err?.error?.message ?? 'Não foi possível cadastrar o fornecedor.');
        },
      });
  }
}
