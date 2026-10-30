import { HttpErrorResponse } from '@angular/common/http';
import { Component, ComponentRef, ElementRef, ViewContainerRef, effect, inject, input, signal, viewChild } from '@angular/core';

import { Icon } from '../icons/icon';
import { DataBrPipe } from '../pipes/data-br.pipe';
import { Anexo } from './anexo';
import { AnexoRecurso, AnexoService } from './anexo.service';
import { comprimirImagemSeNecessario } from './comprimir-imagem';
import { nomeDaCaptura } from './nome-captura';
import type { RecorteCaptura } from './recorte-captura';

const LIMITE_SEM_COMPRESSAO_BYTES = 5 * 1024 * 1024;

// Congela um quadro do fluxo de captura de tela num canvas, na resolução real da tela/janela escolhida.
async function quadroDoFluxo(fluxo: MediaStream): Promise<HTMLCanvasElement> {
  const video = document.createElement('video');
  video.muted = true;
  video.srcObject = fluxo;
  await video.play();
  // Espera um quadro de verdade: o primeiro desenho logo após o play() pode sair vazio.
  await new Promise<void>((resolve) => {
    if ('requestVideoFrameCallback' in video) {
      video.requestVideoFrameCallback(() => resolve());
    } else {
      setTimeout(resolve, 300);
    }
  });

  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d')?.drawImage(video, 0, 0);
  video.srcObject = null;
  return canvas;
}

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

  // getDisplayMedia só existe em navegador de computador (não no celular).
  protected readonly capturaSuportada = typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getDisplayMedia;
  protected readonly colagemSuportada = typeof navigator !== 'undefined' && !!navigator.clipboard?.read;
  private readonly contenedor = inject(ViewContainerRef);
  private recorteAberto: ComponentRef<RecorteCaptura> | null = null;

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

  // Imagem de captura vai como PNG para manter texto legível; só comprime se ficar muito grande.
  private async enviarImagem(imagem: File): Promise<void> {
    this.erro.set(null);
    this.enviando.set(true);
    const pronto = imagem.size > LIMITE_SEM_COMPRESSAO_BYTES ? await comprimirImagemSeNecessario(imagem) : imagem;
    this.enviarArquivo(pronto);
  }

  protected async aoColar(evento: ClipboardEvent): Promise<void> {
    const imagem = Array.from(evento.clipboardData?.files ?? []).find((f) => f.type.startsWith('image/'));
    if (!imagem) {
      return;
    }

    evento.preventDefault();
    await this.enviarImagem(new File([imagem], nomeDaCaptura(), { type: imagem.type }));
  }

  protected async colarImagem(): Promise<void> {
    this.erro.set(null);
    try {
      const itens = await navigator.clipboard.read();
      for (const item of itens) {
        const tipo = item.types.find((t) => t.startsWith('image/'));
        if (tipo) {
          const blob = await item.getType(tipo);
          await this.enviarImagem(new File([blob], nomeDaCaptura(), { type: tipo }));
          return;
        }
      }
      this.erro.set('Não há imagem na área de transferência. Copie um trecho de tela (ex.: Win+Shift+S) e tente de novo.');
    } catch {
      this.erro.set('Não foi possível ler a área de transferência. Clique na área de anexos e use Ctrl+V.');
    }
  }

  protected async capturarTela(): Promise<void> {
    this.erro.set(null);
    let fluxo: MediaStream | null = null;
    try {
      fluxo = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      await this.abrirRecorte(await quadroDoFluxo(fluxo));
    } catch (e) {
      // Fechar o seletor do navegador sem escolher nada não é erro.
      if ((e as DOMException)?.name !== 'NotAllowedError' && (e as DOMException)?.name !== 'AbortError') {
        this.erro.set('Não foi possível capturar a tela.');
      }
    } finally {
      fluxo?.getTracks().forEach((faixa) => faixa.stop());
    }
  }

  // O modal de recorte só é baixado quando alguém captura a tela (mantém o bundle inicial pequeno).
  private async abrirRecorte(imagem: HTMLCanvasElement): Promise<void> {
    const { RecorteCaptura } = await import('./recorte-captura');
    this.fecharRecorte();

    const recorte = this.contenedor.createComponent(RecorteCaptura);
    recorte.setInput('imagem', imagem);
    recorte.instance.confirmar.subscribe((arquivo) => {
      this.fecharRecorte();
      void this.enviarImagem(arquivo);
    });
    recorte.instance.novaCaptura.subscribe(() => {
      this.fecharRecorte();
      void this.capturarTela();
    });
    recorte.instance.cancelar.subscribe(() => this.fecharRecorte());
    this.recorteAberto = recorte;
  }

  private fecharRecorte(): void {
    this.recorteAberto?.destroy();
    this.recorteAberto = null;
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
