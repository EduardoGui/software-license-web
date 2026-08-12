import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Licenca } from './licenca';
import { LicencaService } from './licenca.service';

@Component({
  selector: 'app-licenca-view',
  imports: [RouterLink],
  templateUrl: './licenca-view.html',
  styleUrl: './licenca-view.scss',
})
export class LicencaView {
  private readonly licencaService = inject(LicencaService);
  private readonly route = inject(ActivatedRoute);

  protected readonly licenca = signal<Licenca | null>(null);
  protected readonly carregando = signal(true);
  protected readonly erro = signal(false);

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.licencaService.obter(id).subscribe({
      next: (licenca) => {
        this.licenca.set(licenca);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set(true);
        this.carregando.set(false);
      },
    });
  }
}
