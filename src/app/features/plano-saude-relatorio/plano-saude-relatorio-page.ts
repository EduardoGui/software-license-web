import { DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Icon } from '../../shared/icons/icon';
import { RelatorioMensalPlanoSaude, RelatorioMensalPlanoSaudeFiltro } from './plano-saude-relatorio';
import { PlanoSaudeRelatorioService } from './plano-saude-relatorio.service';

const NOMES_MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

@Component({
  selector: 'app-plano-saude-relatorio-page',
  imports: [FormsModule, Icon, DecimalPipe],
  templateUrl: './plano-saude-relatorio-page.html',
  styleUrl: './plano-saude-relatorio-page.scss',
})
export class PlanoSaudeRelatorioPage {
  private readonly relatorioService = inject(PlanoSaudeRelatorioService);

  protected readonly nomesMeses = NOMES_MESES;
  protected readonly anosDisponiveis = this.calcularAnosDisponiveis();

  protected readonly relatorio = signal<RelatorioMensalPlanoSaude | null>(null);
  protected readonly carregando = signal(true);
  protected readonly erro = signal(false);
  protected readonly exportando = signal(false);

  protected filtro: RelatorioMensalPlanoSaudeFiltro = this.filtroPadrao();

  constructor() {
    this.buscar();
  }

  private filtroPadrao(): RelatorioMensalPlanoSaudeFiltro {
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
        link.download = `relatorio-plano-saude-${this.filtro.ano}-${String(this.filtro.mes).padStart(2, '0')}.xlsx`;
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
