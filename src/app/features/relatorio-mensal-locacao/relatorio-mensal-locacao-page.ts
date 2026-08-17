import { DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Icon } from '../../shared/icons/icon';
import { TipoEquipamento } from '../tipos-equipamento/tipo-equipamento';
import { TipoEquipamentoService } from '../tipos-equipamento/tipo-equipamento.service';
import { RelatorioMensalLocacao, RelatorioMensalLocacaoFiltro } from './relatorio-mensal-locacao';
import { RelatorioMensalLocacaoService } from './relatorio-mensal-locacao.service';

const NOMES_MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

@Component({
  selector: 'app-relatorio-mensal-locacao-page',
  imports: [FormsModule, Icon, DecimalPipe],
  templateUrl: './relatorio-mensal-locacao-page.html',
  styleUrl: './relatorio-mensal-locacao-page.scss',
})
export class RelatorioMensalLocacaoPage {
  private readonly relatorioService = inject(RelatorioMensalLocacaoService);
  private readonly tipoEquipamentoService = inject(TipoEquipamentoService);

  protected readonly nomesMeses = NOMES_MESES;
  protected readonly anosDisponiveis = this.calcularAnosDisponiveis();

  protected readonly tipos = signal<TipoEquipamento[]>([]);
  protected readonly relatorio = signal<RelatorioMensalLocacao | null>(null);
  protected readonly carregando = signal(true);
  protected readonly erro = signal(false);
  protected readonly exportando = signal(false);

  protected filtro: RelatorioMensalLocacaoFiltro = this.filtroPadrao();

  constructor() {
    this.tipoEquipamentoService.listar({ ativo: true }).subscribe((tipos) => this.tipos.set(tipos));
    this.buscar();
  }

  private filtroPadrao(): RelatorioMensalLocacaoFiltro {
    const hoje = new Date();
    return { ano: hoje.getFullYear(), mes: hoje.getMonth() + 1 };
  }

  private calcularAnosDisponiveis(): number[] {
    const anoAtual = new Date().getFullYear();
    return [anoAtual - 1, anoAtual, anoAtual + 1];
  }

  protected buscar(): void {
    this.carregando.set(true);
    this.erro.set(false);

    this.relatorioService.gerar(this.filtro).subscribe({
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
    this.filtro = this.filtroPadrao();
    this.buscar();
  }

  protected exportar(): void {
    this.exportando.set(true);

    this.relatorioService.exportarExcel(this.filtro).subscribe({
      next: (blob) => {
        this.exportando.set(false);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `relatorio-locacao-${this.filtro.ano}-${String(this.filtro.mes).padStart(2, '0')}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.exportando.set(false);
        alert('Não foi possível exportar o relatório.');
      },
    });
  }
}
