import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-contratos-painel',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './contratos-painel.html',
  styleUrl: './contratos-painel.scss',
})
export class ContratosPainel {
  private readonly router = inject(Router);
  private readonly urlAtual = signal(this.router.url);

  constructor() {
    this.router.events.pipe(filter((evento) => evento instanceof NavigationEnd)).subscribe(() => this.urlAtual.set(this.router.url));
  }

  // A aba "Contratos" cobre a lista, o cadastro e o detalhe de cada contrato; só não vale nas outras duas abas.
  protected abaContratosAtiva(): boolean {
    const url = this.urlAtual();
    return !url.startsWith('/contratos/timeline') && !url.startsWith('/contratos/base-dados');
  }
}
