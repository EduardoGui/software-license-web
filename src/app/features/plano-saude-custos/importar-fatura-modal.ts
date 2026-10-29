import { DecimalPipe } from '@angular/common';
import { Component, inject, input, output, signal } from '@angular/core';

import { ImportacaoPlanoSaudePrevia, ImportacaoPlanoSaudeResultado } from './plano-saude-custo';
import { PlanoSaudeCustoService } from './plano-saude-custo.service';

// Importa o demonstrativo analítico da operadora (xlsx): gera uma prévia de conferência (sem gravar nada) e,
// só depois de a pessoa confirmar, grava os lançamentos do mês.
@Component({
  selector: 'app-importar-fatura-modal',
  imports: [DecimalPipe],
  templateUrl: './importar-fatura-modal.html',
  styleUrl: './importar-fatura-modal.scss',
})
export class ImportarFaturaModal {
  private readonly custoService = inject(PlanoSaudeCustoService);

  readonly ano = input.required<number>();
  readonly mes = input.required<number>();
  readonly fechar = output<void>();
  readonly importado = output<ImportacaoPlanoSaudeResultado>();

  protected readonly arquivo = signal<File | null>(null);
  protected readonly previa = signal<ImportacaoPlanoSaudePrevia | null>(null);
  protected readonly gerandoPrevia = signal(false);
  protected readonly importando = signal(false);
  protected readonly erro = signal<string | null>(null);

  protected escolherArquivo(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const arquivo = input.files?.[0] ?? null;
    this.arquivo.set(arquivo);
    this.previa.set(null);
    this.erro.set(null);

    if (!arquivo) {
      return;
    }

    this.gerandoPrevia.set(true);
    this.custoService.previaImportacao(arquivo, this.ano(), this.mes()).subscribe({
      next: (previa) => {
        this.previa.set(previa);
        this.gerandoPrevia.set(false);
      },
      error: (err) => {
        this.gerandoPrevia.set(false);
        this.erro.set(err?.error?.message ?? 'Não foi possível ler o arquivo.');
      },
    });
  }

  protected confirmar(): void {
    const arquivo = this.arquivo();
    const previa = this.previa();
    if (!arquivo || !previa || !previa.podeConfirmar) {
      return;
    }

    this.importando.set(true);
    this.erro.set(null);
    this.custoService.confirmarImportacao(arquivo, this.ano(), this.mes(), previa.assinatura).subscribe({
      next: (resultado) => {
        this.importando.set(false);
        this.importado.emit(resultado);
      },
      error: (err) => {
        this.importando.set(false);
        this.erro.set(err?.error?.message ?? 'Não foi possível importar.');
      },
    });
  }
}
