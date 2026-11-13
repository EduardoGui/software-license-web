import { DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, input, output, signal } from '@angular/core';

import { Icon } from '../../shared/icons/icon';
import { DataBrPipe } from '../../shared/pipes/data-br.pipe';
import { RelatorioValidacaoContrato, RelatorioValidacaoContratos } from './contrato';
import { ContratoService } from './contrato.service';

// Relatório para enviar ao gerente do contrato validar se há medição. Sem contratoIds traz os contratos com tarefa
// de medição pendente na Agenda hoje; com ids, só esses. Baixa em Excel (uma aba por contrato).
@Component({
  selector: 'app-relatorio-validacao-modal',
  imports: [DataBrPipe, DecimalPipe, Icon],
  templateUrl: './relatorio-validacao-modal.html',
  styleUrl: './relatorio-validacao-modal.scss',
})
export class RelatorioValidacaoModal implements OnInit {
  private readonly contratoService = inject(ContratoService);

  readonly contratoIds = input<number[] | null>(null);
  readonly fechar = output<void>();

  protected readonly relatorio = signal<RelatorioValidacaoContratos | null>(null);
  protected readonly carregando = signal(true);
  protected readonly baixando = signal(false);
  protected readonly erro = signal<string | null>(null);

  ngOnInit(): void {
    this.contratoService.relatorioValidacao(this.contratoIds() ?? []).subscribe({
      next: (relatorio) => {
        this.relatorio.set(relatorio);
        this.carregando.set(false);
      },
      error: (err) => {
        this.erro.set(err?.error?.message ?? 'Não foi possível gerar o relatório.');
        this.carregando.set(false);
      },
    });
  }

  protected baixar(): void {
    const relatorio = this.relatorio();
    if (!relatorio) {
      return;
    }

    this.baixando.set(true);
    this.erro.set(null);
    this.contratoService.exportarRelatorioValidacao(this.contratoIds() ?? []).subscribe({
      next: (blob) => {
        this.baixando.set(false);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = this.nomeArquivo(relatorio);
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.baixando.set(false);
        this.erro.set('Não foi possível baixar o Excel.');
      },
    });
  }

  protected situacao(dias: number | null): string {
    if (dias === null) {
      return '';
    }

    if (dias < 0) {
      return `Vencida há ${-dias} dia(s)`;
    }

    return dias === 0 ? 'Vence hoje' : `Vence em ${dias} dia(s)`;
  }

  protected totalAprovado(contrato: RelatorioValidacaoContrato): number {
    return contrato.medicoes.filter((m) => m.status === 'Aprovado').reduce((soma, m) => soma + m.valorTotalMedido, 0);
  }

  private nomeArquivo(relatorio: RelatorioValidacaoContratos): string {
    if (!relatorio.somentePendentes && relatorio.contratos.length === 1) {
      return `relatorio-validacao-${relatorio.contratos[0].numero}.xlsx`;
    }

    return `relatorio-validacao-${relatorio.geradoEm.slice(0, 10)}.xlsx`;
  }
}
