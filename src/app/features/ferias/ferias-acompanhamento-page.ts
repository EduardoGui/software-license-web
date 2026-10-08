import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Setor } from '../setores/setor';
import { SetorService } from '../setores/setor.service';
import {
  CLASSES_SITUACAO,
  FeriasAcompanhamento,
  FeriasAcompanhamentoFiltro,
  FeriasAcompanhamentoLinha,
  FeriasAcompanhamentoSituacaoFiltro,
  ROTULOS_SITUACAO,
} from './ferias-acompanhamento';
import { FeriasConsolidadoService } from './ferias-consolidado.service';
import { PeriodoFeriasService } from './periodo-ferias.service';

interface CartaoResumo {
  filtro: FeriasAcompanhamentoSituacaoFiltro | '';
  rotulo: string;
  valor: number;
  urgente: boolean;
}

@Component({
  selector: 'app-ferias-acompanhamento-page',
  imports: [FormsModule, RouterLink, DatePipe],
  templateUrl: './ferias-acompanhamento-page.html',
  styleUrl: './ferias-acompanhamento-page.scss',
})
export class FeriasAcompanhamentoPage {
  private readonly feriasService = inject(FeriasConsolidadoService);
  private readonly periodoFeriasService = inject(PeriodoFeriasService);
  private readonly setorService = inject(SetorService);

  protected readonly dados = signal<FeriasAcompanhamento | null>(null);
  protected readonly setores = signal<Setor[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal(false);
  protected readonly exportando = signal(false);
  protected readonly gerandoUsuarioId = signal<number | null>(null);
  protected readonly erroGeracao = signal<string | null>(null);

  protected filtro: FeriasAcompanhamentoFiltro = { nome: '', setorId: null, situacao: '' };
  private temporizadorBusca: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.setorService.listar({ ativo: true }).subscribe((setores) => this.setores.set(setores));
    this.buscar();
  }

  protected buscar(): void {
    this.carregando.set(true);
    this.erro.set(false);

    this.feriasService.obterAcompanhamento(this.filtro).subscribe({
      next: (dados) => {
        this.dados.set(dados);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set(true);
        this.carregando.set(false);
      },
    });
  }

  // Digitar no campo de nome busca sozinho, sem uma requisição por tecla.
  protected buscarComAtraso(): void {
    if (this.temporizadorBusca) clearTimeout(this.temporizadorBusca);
    this.temporizadorBusca = setTimeout(() => this.buscar(), 300);
  }

  protected cartoes(resumo: FeriasAcompanhamento['resumo']): CartaoResumo[] {
    return [
      { filtro: '', rotulo: 'Todos', valor: resumo.total, urgente: false },
      { filtro: 'EmFeriasAgora', rotulo: 'De férias agora', valor: resumo.emFeriasAgora, urgente: false },
      { filtro: 'SaemEm60Dias', rotulo: 'Saem em 60 dias', valor: resumo.saemEm60Dias, urgente: false },
      { filtro: 'AguardandoAprovacao', rotulo: 'Aguardando aprovação', valor: resumo.aguardandoAprovacao, urgente: resumo.aguardandoAprovacao > 0 },
      { filtro: 'SemProgramar', rotulo: 'Sem programar (meta)', valor: resumo.semProgramar, urgente: resumo.semProgramar > 0 },
      { filtro: 'Prazo', rotulo: 'Prazo vencendo', valor: resumo.prazo, urgente: resumo.prazo > 0 },
      { filtro: 'SaldoNegativo', rotulo: 'Saldo negativo', valor: resumo.saldoNegativo, urgente: resumo.saldoNegativo > 0 },
      { filtro: 'SemPeriodo', rotulo: 'Sem período', valor: resumo.semPeriodo, urgente: resumo.semPeriodo > 0 },
    ];
  }

  protected selecionarCartao(filtro: FeriasAcompanhamentoSituacaoFiltro | ''): void {
    this.filtro.situacao = this.filtro.situacao === filtro ? '' : filtro;
    this.buscar();
  }

  protected limpar(): void {
    this.filtro = { nome: '', setorId: null, situacao: '' };
    this.buscar();
  }

  protected temFiltro(): boolean {
    return !!(this.filtro.nome?.trim() || this.filtro.setorId || this.filtro.situacao);
  }

  protected rotulo(linha: FeriasAcompanhamentoLinha): string {
    return ROTULOS_SITUACAO[linha.situacao] ?? linha.situacao;
  }

  protected classe(linha: FeriasAcompanhamentoLinha): string {
    return CLASSES_SITUACAO[linha.situacao] ?? '';
  }

  protected exportar(): void {
    this.exportando.set(true);

    this.feriasService.exportarAcompanhamentoExcel(this.filtro).subscribe({
      next: (blob) => {
        this.exportando.set(false);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'acompanhamento-ferias.xlsx';
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.exportando.set(false);
        alert('Não foi possível exportar o acompanhamento.');
      },
    });
  }

  protected gerarPeriodo(usuarioId: number): void {
    this.gerandoUsuarioId.set(usuarioId);
    this.erroGeracao.set(null);

    this.periodoFeriasService.gerarProximoPeriodo(usuarioId).subscribe({
      next: () => {
        this.gerandoUsuarioId.set(null);
        this.buscar();
      },
      error: (err) => {
        this.gerandoUsuarioId.set(null);
        this.erroGeracao.set(err?.error?.message ?? 'Não foi possível gerar o período de férias.');
      },
    });
  }
}
