import { Location } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Icon } from '../../shared/icons/icon';
import { Equipamento } from './equipamento';
import { EquipamentoService } from './equipamento.service';

@Component({
  selector: 'app-equipamento-baixar',
  imports: [RouterLink, Icon],
  templateUrl: './equipamento-baixar.html',
  styleUrl: './equipamento-baixar.scss',
})
export class EquipamentoBaixar {
  private readonly equipamentoService = inject(EquipamentoService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  private readonly equipamentoId = Number(this.route.snapshot.paramMap.get('id'));

  protected readonly equipamento = signal<Equipamento | null>(null);
  protected readonly carregando = signal(true);
  protected readonly salvando = signal(false);
  protected readonly erro = signal<string | null>(null);
  protected readonly textoDigitado = signal('');

  protected readonly identificador = computed(() => {
    const eq = this.equipamento();
    return eq ? eq.patrimonio || eq.numeroSerie || null : null;
  });

  protected readonly rotuloIdentificador = computed(() => {
    const eq = this.equipamento();
    return eq?.patrimonio ? 'o patrimônio' : 'o número de série';
  });

  constructor() {
    this.equipamentoService.obter(this.equipamentoId).subscribe({
      next: (equipamento) => {
        this.equipamento.set(equipamento);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set('Não foi possível carregar o equipamento.');
        this.carregando.set(false);
      },
    });
  }

  protected voltar(): void {
    this.location.back();
  }

  protected confirmacaoValida(): boolean {
    const identificador = this.identificador();
    if (!identificador) {
      return true;
    }
    return this.textoDigitado().trim().toUpperCase() === identificador.trim().toUpperCase();
  }

  protected confirmar(): void {
    if (!this.confirmacaoValida()) {
      return;
    }

    this.salvando.set(true);
    this.erro.set(null);

    this.equipamentoService.baixar(this.equipamentoId).subscribe({
      next: () => this.router.navigate(['/equipamentos/lista']),
      error: (err) => {
        this.salvando.set(false);
        this.erro.set(err?.error?.message ?? 'Não foi possível dar baixa no equipamento.');
      },
    });
  }
}
