import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, computed, effect, inject, input, signal, viewChild } from '@angular/core';

import { Icon } from '../../shared/icons/icon';
import { Anexo } from '../../shared/anexos/anexo';
import { AnexoService } from '../../shared/anexos/anexo.service';

@Component({
  selector: 'app-comprovante-item',
  imports: [Icon],
  templateUrl: './comprovante-item.html',
  styleUrl: './comprovante-item.scss',
})
export class ComprovanteItem {
  private readonly anexoService = inject(AnexoService);

  readonly reembolsoId = input.required<number>();
  readonly itemId = input.required<number>();
  readonly somenteLeitura = input(false);

  protected readonly recurso = computed(() => `reembolsos-despesa/${this.reembolsoId()}/itens`);

  // Regra de negócio: no máximo um comprovante por item - por isso guarda um único Anexo, não uma lista.
  protected readonly anexo = signal<Anexo | null>(null);
  protected readonly carregando = signal(true);
  protected readonly enviando = signal(false);
  protected readonly excluindo = signal(false);
  protected readonly erro = signal<string | null>(null);

  private readonly inputArquivo = viewChild<ElementRef<HTMLInputElement>>('inputArquivo');

  constructor() {
    effect(() => {
      this.carregar(this.recurso(), this.itemId());
    });
  }

  private carregar(recurso: string, itemId: number): void {
    this.carregando.set(true);
    this.anexoService.listar(recurso, itemId).subscribe({
      next: (anexos) => {
        this.anexo.set(anexos[0] ?? null);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set('Não foi possível carregar o comprovante.');
        this.carregando.set(false);
      },
    });
  }

  protected abrirSeletorArquivo(): void {
    this.inputArquivo()?.nativeElement.click();
  }

  protected aoSelecionarArquivo(event: Event): void {
    const input = event.target as HTMLInputElement;
    const arquivo = input.files?.[0];
    if (!arquivo) {
      return;
    }

    this.enviando.set(true);
    this.erro.set(null);

    this.anexoService.enviar(this.recurso(), this.itemId(), arquivo).subscribe({
      next: (anexo) => {
        this.anexo.set(anexo);
        this.enviando.set(false);
        input.value = '';
      },
      error: (err: HttpErrorResponse) => {
        this.enviando.set(false);
        this.erro.set(err?.error?.message ?? 'Não foi possível enviar o comprovante.');
        input.value = '';
      },
    });
  }

  protected baixar(anexo: Anexo): void {
    this.anexoService.baixar(this.recurso(), this.itemId(), anexo.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = anexo.nomeArquivo;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => this.erro.set('Não foi possível baixar o comprovante.'),
    });
  }

  protected excluir(anexo: Anexo): void {
    if (!confirm(`Excluir o comprovante "${anexo.nomeArquivo}"?`)) {
      return;
    }

    this.excluindo.set(true);
    this.erro.set(null);

    this.anexoService.excluir(this.recurso(), this.itemId(), anexo.id).subscribe({
      next: () => {
        this.anexo.set(null);
        this.excluindo.set(false);
      },
      error: () => {
        this.excluindo.set(false);
        this.erro.set('Não foi possível excluir o comprovante.');
      },
    });
  }
}
