import { DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Icon } from '../../shared/icons/icon';
import { DataBrPipe } from '../../shared/pipes/data-br.pipe';
import {
  BaseDadosEngenharia,
  BaseDadosEngenhariaFiltro,
  BaseDadosEngenhariaService,
} from './base-dados-engenharia';

const ROTULOS_STATUS: Record<string, string> = {
  Rascunho: 'Rascunho',
  AguardandoAprovacao: 'Aguardando aprovação',
  Aprovado: 'Aprovado',
  Reprovado: 'Reprovado',
  Emitida: 'Emitida',
  Assinada: 'Assinada',
  Cancelada: 'Cancelada',
  Registrada: 'Registrada',
  Paga: 'Paga',
  Recebida: 'Recebida',
};

const ROTULOS_ORIGEM: Record<string, string> = {
  Medicao: 'Medição',
  OrdemCompra: 'Ordem de Compra',
  DespesaAvulsa: 'Despesa Avulsa',
  NotaFiscalEntrada: 'NF de Entrada',
};

@Component({
  selector: 'app-base-dados-engenharia-page',
  imports: [FormsModule, Icon, DecimalPipe, DataBrPipe],
  templateUrl: './base-dados-engenharia-page.html',
  styleUrl: './base-dados-engenharia-page.scss',
})
export class BaseDadosEngenhariaPage {
  private readonly baseDadosService = inject(BaseDadosEngenhariaService);

  protected readonly statusOpcoes = Object.entries(ROTULOS_STATUS);
  protected readonly origemOpcoes = Object.entries(ROTULOS_ORIGEM);
  protected readonly relatorio = signal<BaseDadosEngenharia | null>(null);
  protected readonly carregando = signal(true);
  protected readonly erro = signal(false);
  protected readonly exportando = signal(false);

  protected filtro: BaseDadosEngenhariaFiltro = {};

  constructor() {
    this.buscar();
  }

  protected rotuloOrigem(origem: string): string {
    return ROTULOS_ORIGEM[origem] ?? origem;
  }

  protected rotuloStatus(status: string): string {
    return ROTULOS_STATUS[status] ?? status;
  }

  protected buscar(): void {
    this.carregando.set(true);
    this.erro.set(false);

    this.baseDadosService.gerar(this.filtro).subscribe({
      next: (relatorio) => {
        this.relatorio.set(relatorio);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set(true);
        this.carregando.set(false);
      },
    });
  }

  protected limparFiltro(): void {
    this.filtro = {};
    this.buscar();
  }

  protected exportar(): void {
    this.exportando.set(true);

    this.baseDadosService.exportarExcel(this.filtro).subscribe({
      next: (blob) => {
        this.exportando.set(false);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `base-dados-engenharia-${new Date().toISOString().slice(0, 10)}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.exportando.set(false);
        alert('Não foi possível exportar a base de dados.');
      },
    });
  }
}
