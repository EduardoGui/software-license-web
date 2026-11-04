import { Component, ElementRef, HostListener, computed, inject, input, model, signal } from '@angular/core';

/** Caixa de seleção múltipla para filtros: lista de opções com marcação; nenhuma marcada = "Todas". */
@Component({
  selector: 'app-multi-select-filtro',
  templateUrl: './multi-select-filtro.html',
  styleUrl: './multi-select-filtro.scss',
})
export class MultiSelectFiltro {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly rotulo = input.required<string>();
  readonly opcoes = input.required<readonly string[]>();
  readonly textoVazio = input('Todas');
  readonly selecionados = model<string[]>([]);

  protected readonly aberto = signal(false);

  protected readonly resumo = computed(() => {
    const marcadas = this.selecionados();
    if (marcadas.length === 0) return this.textoVazio();
    return marcadas.length <= 2 ? marcadas.join(', ') : `${marcadas.length} selecionadas`;
  });

  protected estaMarcada(opcao: string): boolean {
    return this.selecionados().includes(opcao);
  }

  protected alternar(opcao: string, marcada: boolean): void {
    const atuais = this.selecionados().filter((o) => o !== opcao);
    // Mantém a ordem original da lista de opções.
    this.selecionados.set(this.opcoes().filter((o) => o === opcao ? marcada : atuais.includes(o)));
  }

  protected limpar(): void {
    this.selecionados.set([]);
  }

  @HostListener('document:click', ['$event'])
  protected fecharAoClicarFora(evento: Event): void {
    if (this.aberto() && !this.host.nativeElement.contains(evento.target as Node)) {
      this.aberto.set(false);
    }
  }

  @HostListener('keydown.escape')
  protected fecharComEsc(): void {
    this.aberto.set(false);
  }
}
