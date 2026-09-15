import { DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Icon } from '../../shared/icons/icon';
import { DataBrPipe } from '../../shared/pipes/data-br.pipe';
import { FaturaOperadoraSaude, FaturaOperadoraSaudeFiltro } from './fatura-plano-saude';
import { FaturaOperadoraSaudeService } from './fatura-plano-saude.service';

@Component({
  selector: 'app-faturas-plano-saude-list',
  imports: [FormsModule, RouterLink, Icon, DecimalPipe, DataBrPipe],
  templateUrl: './faturas-plano-saude-list.html',
  styleUrl: './faturas-plano-saude-list.scss',
})
export class FaturasPlanoSaudeList {
  private readonly faturaService = inject(FaturaOperadoraSaudeService);

  protected readonly faturas = signal<FaturaOperadoraSaude[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal(false);

  protected filtro: FaturaOperadoraSaudeFiltro = {};

  constructor() {
    this.buscar();
  }

  protected buscar(): void {
    this.carregando.set(true);
    this.erro.set(false);

    this.faturaService.listar(this.filtro).subscribe({
      next: (faturas) => {
        this.faturas.set(faturas);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set(true);
        this.carregando.set(false);
      },
    });
  }

  protected limparFiltro(): void {
    this.filtro = {};
    this.buscar();
  }
}
