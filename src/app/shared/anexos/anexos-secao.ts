import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, effect, inject, input, signal, viewChild } from '@angular/core';

import { Icon } from '../icons/icon';
import { DataBrPipe } from '../pipes/data-br.pipe';
import { Anexo } from './anexo';
import { AnexoRecurso, AnexoService } from './anexo.service';

@Component({
  selector: 'app-anexos-secao',
  imports: [Icon, DataBrPipe],
  templateUrl: './anexos-secao.html',
  styleUrl: './anexos-secao.scss',
})
export class AnexosSecao {
  private readonly anexoService = inject(AnexoService);

  readonly recurso = input.required<AnexoRecurso>();
  readonly entidadeId = input.required<number>();

  protected readonly anexos = signal<Anexo[]>([]);
  protected readonly carregando = signal(true);
  protected readonly enviando = signal(false);
  protected readonly excluindoId = signal<number | null>(null);
  protected readonly erro = signal<string | null>(null);

  private readonly inputArquivo = viewChild<ElementRef<HTMLInputElement>>('inputArquivo');

  constructor() {
    effect(() => {
      this.carregar(this.recurso(), this.entidadeId());
    });
  }

  private carregar(recurso: AnexoRecurso, entidadeId: number): void {
    this.carregando.set(true);
    this.anexoService.listar(recurso, entidadeId).subscribe({
      next: (anexos) => {
        this.anexos.set(anexos);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set('Não foi possível carregar os anexos.');
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

    this.anexoService.enviar(this.recurso(), this.entidadeId(), arquivo).subscribe({
      next: (anexo) => {
        this.anexos.update((lista) => [...lista, anexo]);
        this.enviando.set(false);
        input.value = '';
      },
      error: (err: HttpErrorResponse) => {
        this.enviando.set(false);
        this.erro.set(err?.error?.message ?? 'Não foi possível enviar o arquivo.');
        input.value = '';
      },
    });
  }

  protected baixar(anexo: Anexo): void {
    this.anexoService.baixar(this.recurso(), this.entidadeId(), anexo.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = anexo.nomeArquivo;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => this.erro.set('Não foi possível baixar o arquivo.'),
    });
  }

  protected abrir(anexo: Anexo): void {
    // A aba precisa abrir aqui, de forma síncrona com o clique — se abrir só depois
    // da resposta da API (assíncrona), o navegador bloqueia como pop-up.
    const aba = window.open('', '_blank');

    this.anexoService.baixar(this.recurso(), this.entidadeId(), anexo.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        if (aba) {
          aba.location.href = url;
        }
        // Revoga só depois de dar tempo da aba carregar o conteúdo.
        setTimeout(() => window.URL.revokeObjectURL(url), 60_000);
      },
      error: () => {
        aba?.close();
        this.erro.set('Não foi possível abrir o arquivo.');
      },
    });
  }

  protected excluir(anexo: Anexo): void {
    if (!confirm(`Excluir o anexo "${anexo.nomeArquivo}"?`)) {
      return;
    }

    this.excluindoId.set(anexo.id);
    this.erro.set(null);

    this.anexoService.excluir(this.recurso(), this.entidadeId(), anexo.id).subscribe({
      next: () => {
        this.anexos.update((lista) => lista.filter((a) => a.id !== anexo.id));
        this.excluindoId.set(null);
      },
      error: () => {
        this.excluindoId.set(null);
        this.erro.set('Não foi possível excluir o anexo.');
      },
    });
  }

  protected formatarTamanho(bytes: number): string {
    if (bytes < 1024) {
      return `${bytes} B`;
    }
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}
