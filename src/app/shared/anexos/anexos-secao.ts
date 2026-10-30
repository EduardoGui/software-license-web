import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, ViewContainerRef, effect, inject, input, signal, viewChild } from '@angular/core';

import { Icon } from '../icons/icon';
import { DataBrPipe } from '../pipes/data-br.pipe';
import { Anexo } from './anexo';
import { AnexoRecurso, AnexoService } from './anexo.service';
import {
  capturaTelaSuportada,
  capturarTelaRecortada,
  colagemSuportada,
  imagemDaAreaDeTransferencia,
  imagemDoEventoColar,
  prepararImagem,
} from './captura-tela';
import { comprimirImagemSeNecessario } from './comprimir-imagem';

@Component({
  selector: 'app-anexos-secao',
  imports: [Icon, DataBrPipe],
  templateUrl: './anexos-secao.html',
  styleUrl: './anexos-secao.scss',
})
export class AnexosSecao {
  private readonly anexoService = inject(AnexoService);
  private readonly contenedor = inject(ViewContainerRef);

  readonly recurso = input.required<AnexoRecurso>();
  readonly entidadeId = input.required<number>();

  protected readonly anexos = signal<Anexo[]>([]);
  protected readonly carregando = signal(true);
  protected readonly enviando = signal(false);
  protected readonly excluindoId = signal<number | null>(null);
  protected readonly erro = signal<string | null>(null);

  protected readonly capturaSuportada = capturaTelaSuportada();
  protected readonly colagemSuportada = colagemSuportada();

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

  protected async aoSelecionarArquivo(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const arquivoOriginal = input.files?.[0];
    if (!arquivoOriginal) {
      return;
    }

    this.enviando.set(true);
    this.erro.set(null);

    const arquivo = await comprimirImagemSeNecessario(arquivoOriginal);
    this.enviarArquivo(arquivo, () => (input.value = ''));
  }

  private enviarArquivo(arquivo: File, aoTerminar?: () => void): void {
    this.enviando.set(true);
    this.anexoService.enviar(this.recurso(), this.entidadeId(), arquivo).subscribe({
      next: (anexo) => {
        this.anexos.update((lista) => [...lista, anexo]);
        this.enviando.set(false);
        aoTerminar?.();
      },
      error: (err: HttpErrorResponse) => {
        this.enviando.set(false);
        this.erro.set(err?.error?.message ?? 'Não foi possível enviar o arquivo.');
        aoTerminar?.();
      },
    });
  }

  // --- anexo a partir de imagem (captura de parte da tela ou Ctrl+V), sem passar por arquivo salvo ---

  private async enviarImagem(imagem: File): Promise<void> {
    this.erro.set(null);
    this.enviando.set(true);
    this.enviarArquivo(await prepararImagem(imagem));
  }

  protected async aoColar(evento: ClipboardEvent): Promise<void> {
    const imagem = imagemDoEventoColar(evento);
    if (!imagem) {
      return;
    }

    evento.preventDefault();
    await this.enviarImagem(imagem);
  }

  protected async colarImagem(): Promise<void> {
    this.erro.set(null);
    try {
      const imagem = await imagemDaAreaDeTransferencia();
      if (!imagem) {
        this.erro.set('Não há imagem na área de transferência. Copie um trecho de tela (ex.: Win+Shift+S) e tente de novo.');
        return;
      }

      await this.enviarImagem(imagem);
    } catch {
      this.erro.set('Não foi possível ler a área de transferência. Clique na área de anexos e use Ctrl+V.');
    }
  }

  protected async capturarTela(): Promise<void> {
    this.erro.set(null);
    try {
      const imagem = await capturarTelaRecortada(this.contenedor);
      if (imagem) {
        await this.enviarImagem(imagem);
      }
    } catch (e) {
      this.erro.set((e as Error).message);
    }
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
