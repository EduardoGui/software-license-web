import { Component, ElementRef, effect, input, output, signal, viewChild } from '@angular/core';

interface Retangulo {
  x: number;
  y: number;
  largura: number;
  altura: number;
}

import { nomeDaCaptura } from './nome-captura';

const TAMANHO_MINIMO_PX = 10;

// Mostra a imagem capturada da tela e deixa o usuário arrastar um retângulo; devolve o recorte como PNG.
@Component({
  selector: 'app-recorte-captura',
  templateUrl: './recorte-captura.html',
  styleUrl: './recorte-captura.scss',
})
export class RecorteCaptura {
  readonly imagem = input.required<HTMLCanvasElement>();

  readonly confirmar = output<File>();
  readonly novaCaptura = output<void>();
  readonly cancelar = output<void>();

  private readonly visor = viewChild.required<ElementRef<HTMLCanvasElement>>('visor');

  // Seleção em pixels da tela (CSS) relativos ao canto do visor; convertida para pixels da imagem ao recortar.
  protected readonly selecao = signal<Retangulo | null>(null);
  protected readonly erro = signal<string | null>(null);
  private inicio: { x: number; y: number } | null = null;

  constructor() {
    effect(() => {
      const origem = this.imagem();
      const destino = this.visor().nativeElement;
      destino.width = origem.width;
      destino.height = origem.height;
      destino.getContext('2d')?.drawImage(origem, 0, 0);
    });
  }

  protected selecaoValida(): boolean {
    const s = this.selecao();
    return !!s && s.largura >= TAMANHO_MINIMO_PX && s.altura >= TAMANHO_MINIMO_PX;
  }

  private ponto(evento: PointerEvent): { x: number; y: number } {
    const caixa = this.visor().nativeElement.getBoundingClientRect();
    return {
      x: Math.min(Math.max(evento.clientX - caixa.left, 0), caixa.width),
      y: Math.min(Math.max(evento.clientY - caixa.top, 0), caixa.height),
    };
  }

  protected iniciar(evento: PointerEvent): void {
    this.erro.set(null);
    this.inicio = this.ponto(evento);
    this.selecao.set({ x: this.inicio.x, y: this.inicio.y, largura: 0, altura: 0 });
    (evento.currentTarget as HTMLElement).setPointerCapture(evento.pointerId);
  }

  protected arrastar(evento: PointerEvent): void {
    if (!this.inicio) {
      return;
    }

    const atual = this.ponto(evento);
    this.selecao.set({
      x: Math.min(this.inicio.x, atual.x),
      y: Math.min(this.inicio.y, atual.y),
      largura: Math.abs(atual.x - this.inicio.x),
      altura: Math.abs(atual.y - this.inicio.y),
    });
  }

  protected soltar(): void {
    this.inicio = null;
  }

  protected usarRecorte(): void {
    const s = this.selecao();
    if (!s || !this.selecaoValida()) {
      return;
    }

    const visor = this.visor().nativeElement;
    const escala = visor.width / visor.getBoundingClientRect().width;
    this.gerarArquivo({ x: s.x * escala, y: s.y * escala, largura: s.largura * escala, altura: s.altura * escala });
  }

  protected usarImagemInteira(): void {
    const origem = this.imagem();
    this.gerarArquivo({ x: 0, y: 0, largura: origem.width, altura: origem.height });
  }

  private gerarArquivo(area: Retangulo): void {
    const origem = this.imagem();
    const largura = Math.max(1, Math.round(area.largura));
    const altura = Math.max(1, Math.round(area.altura));

    const saida = document.createElement('canvas');
    saida.width = largura;
    saida.height = altura;
    saida.getContext('2d')?.drawImage(origem, Math.round(area.x), Math.round(area.y), largura, altura, 0, 0, largura, altura);

    saida.toBlob((blob) => {
      if (!blob) {
        this.erro.set('Não foi possível gerar a imagem do recorte.');
        return;
      }

      this.confirmar.emit(new File([blob], nomeDaCaptura(), { type: 'image/png' }));
    }, 'image/png');
  }
}
