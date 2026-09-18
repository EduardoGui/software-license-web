import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { FeriasDashboard } from './ferias-dashboard';
import { FeriasConsolidadoService } from './ferias-consolidado.service';

@Component({
  selector: 'app-ferias-dashboard-page',
  imports: [RouterLink],
  templateUrl: './ferias-dashboard-page.html',
  styleUrl: './ferias-dashboard-page.scss',
})
export class FeriasDashboardPage {
  private readonly feriasConsolidadoService = inject(FeriasConsolidadoService);

  protected readonly dashboard = signal<FeriasDashboard | null>(null);
  protected readonly carregando = signal(true);
  protected readonly erro = signal(false);

  constructor() {
    this.feriasConsolidadoService.obterDashboard().subscribe({
      next: (dashboard) => {
        this.dashboard.set(dashboard);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set(true);
        this.carregando.set(false);
      },
    });
  }
}
