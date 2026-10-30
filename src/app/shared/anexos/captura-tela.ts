import { ViewContainerRef } from '@angular/core';

import { comprimirImagemSeNecessario } from './comprimir-imagem';
import { nomeDaCaptura } from './nome-captura';

// Imagem de captura vai como PNG para manter texto legível; só comprime se ficar muito grande.
const LIMITE_SEM_COMPRESSAO_BYTES = 5 * 1024 * 1024;

// getDisplayMedia / clipboard.read só existem em navegador de computador (não no celular).
export function capturaTelaSuportada(): boolean {
  return typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getDisplayMedia;
}

export function colagemSuportada(): boolean {
  return typeof navigator !== 'undefined' && !!navigator.clipboard?.read;
}

export async function prepararImagem(imagem: File): Promise<File> {
  return imagem.size > LIMITE_SEM_COMPRESSAO_BYTES ? comprimirImagemSeNecessario(imagem) : imagem;
}

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

/**
 * Captura uma tela/janela, mostra o modal de recorte e devolve a imagem escolhida (PNG).
 * Devolve null se a pessoa cancelar; lança Error com mensagem pronta para exibir se a captura falhar.
 * O modal de recorte só é baixado aqui (mantém o bundle inicial pequeno).
 */
export async function capturarTelaRecortada(contenedor: ViewContainerRef): Promise<File | null> {
  for (;;) {
    let quadro: HTMLCanvasElement;
    let fluxo: MediaStream | null = null;
    try {
      fluxo = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      quadro = await quadroDoFluxo(fluxo);
    } catch (e) {
      // Fechar o seletor do navegador sem escolher nada não é erro.
      const nome = (e as DOMException)?.name;
      if (nome === 'NotAllowedError' || nome === 'AbortError') {
        return null;
      }
      throw new Error('Não foi possível capturar a tela.');
    } finally {
      fluxo?.getTracks().forEach((faixa) => faixa.stop());
    }

    const { RecorteCaptura } = await import('./recorte-captura');
    const resultado = await new Promise<File | 'nova' | null>((resolve) => {
      const recorte = contenedor.createComponent(RecorteCaptura);
      const encerrar = (valor: File | 'nova' | null) => {
        recorte.destroy();
        resolve(valor);
      };
      recorte.setInput('imagem', quadro);
      recorte.instance.confirmar.subscribe((arquivo) => encerrar(arquivo));
      recorte.instance.novaCaptura.subscribe(() => encerrar('nova'));
      recorte.instance.cancelar.subscribe(() => encerrar(null));
    });

    if (resultado !== 'nova') {
      return resultado;
    }
  }
}

/** Imagem de um evento de colar (Ctrl+V), renomeada como captura; null se o que foi colado não é imagem. */
export function imagemDoEventoColar(evento: ClipboardEvent): File | null {
  const imagem = Array.from(evento.clipboardData?.files ?? []).find((f) => f.type.startsWith('image/'));
  return imagem ? new File([imagem], nomeDaCaptura(), { type: imagem.type }) : null;
}

/** Imagem na área de transferência (botão "Colar imagem"); null se não houver. Lança se a leitura for negada. */
export async function imagemDaAreaDeTransferencia(): Promise<File | null> {
  for (const item of await navigator.clipboard.read()) {
    const tipo = item.types.find((t) => t.startsWith('image/'));
    if (tipo) {
      return new File([await item.getType(tipo)], nomeDaCaptura(), { type: tipo });
    }
  }

  return null;
}
