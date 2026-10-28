import { NgTemplateOutlet } from '@angular/common';
import { Component, effect, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Icon } from '../icons/icon';

const PREFIXO_STORAGE = 'licencas.entrada-nota.';

// Explica, nas telas de Patrimônio e Equipamentos, que os itens não são cadastrados direto: entram
// pela nota fiscal de entrada. Na variante "faixa" (acima da lista) pode ser dispensada - a escolha
// fica só no navegador de cada pessoa; na variante "vazio" (lista sem itens) aparece sempre.
@Component({
  selector: 'app-entrada-por-nota',
  imports: [NgTemplateOutlet, RouterLink, Icon],
  templateUrl: './entrada-por-nota.html',
  styleUrl: './entrada-por-nota.scss',
})
export class EntradaPorNota {
  readonly chave = input.required<string>();
  readonly variante = input<'faixa' | 'vazio'>('faixa');

  protected readonly dispensada = signal(false);

  constructor() {
    effect(() => {
      try {
        this.dispensada.set(localStorage.getItem(PREFIXO_STORAGE + this.chave()) === '1');
      } catch {
        // Sem acesso ao armazenamento do navegador: a faixa simplesmente continua visível.
      }
    });
  }

  protected dispensar(): void {
    this.dispensada.set(true);
    try {
      localStorage.setItem(PREFIXO_STORAGE + this.chave(), '1');
    } catch {
      // Só não lembra da escolha na próxima visita.
    }
  }
}
