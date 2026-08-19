import { DecimalPipe, Location } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Icon } from '../../shared/icons/icon';
import { DataBrPipe } from '../../shared/pipes/data-br.pipe';
import { Licenca, LicencaValor } from './licenca';
import { LicencaService } from './licenca.service';

@Component({
  selector: 'app-licenca-view',
  imports: [RouterLink, Icon, DataBrPipe, DecimalPipe],
  templateUrl: './licenca-view.html',
  styleUrl: './licenca-view.scss',
})
export class LicencaView {
  private readonly licencaService = inject(LicencaService);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);

  protected readonly licenca = signal<Licenca | null>(null);
  protected readonly valores = signal<LicencaValor[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal(false);

  protected voltar(): void {
    this.location.back();
  }

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
    this.licencaService.listarValores(id).subscribe((valores) => this.valores.set(valores));
  }
}
