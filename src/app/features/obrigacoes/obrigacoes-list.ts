import { DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

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
  imports: [FormsModule, RouterLink, DataBrPipe, DecimalPipe],
  templateUrl: './obrigacoes-list.html',
  styleUrl: './obrigacoes-list.scss',
})
export class ObrigacoesList {
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
  };

  constructor() {
    this.fornecedorService.listar().subscribe((fornecedores) => this.fornecedores.set(fornecedores));
    this.buscar();
  }

  protected buscar(): void {
    this.carregando.set(true);
    this.erro.set(false);

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

  protected totalPrevisto(): number {
    return this.obrigacoes().reduce((soma, o) => soma + o.valorPrevisto, 0);
  }

  protected competenciaBr(iso: string): string {
    const [ano, mes] = iso.split('-');
    return `${mes}/${ano}`;
  }

  protected classeEtapa(etapa: string): string {
    return 'badge--' + etapa.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/\s+/g, '-');
  }
}
