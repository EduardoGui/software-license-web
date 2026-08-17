import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Icon } from '../../shared/icons/icon';
import { DataBrPipe } from '../../shared/pipes/data-br.pipe';
import { Movimentacao } from '../movimentacoes/movimentacao';
import { MovimentacaoService } from '../movimentacoes/movimentacao.service';
import { Licenca, LicencaFiltro } from './licenca';
import { LicencaService } from './licenca.service';

@Component({
  selector: 'app-licencas-list',
  imports: [FormsModule, RouterLink, Icon, DataBrPipe],
  templateUrl: './licencas-list.html',
  styleUrl: './licencas-list.scss',
})
export class LicencasList {
  private readonly licencaService = inject(LicencaService);
  private readonly movimentacaoService = inject(MovimentacaoService);

  protected readonly licencas = signal<Licenca[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal(false);
  protected readonly desativandoId = signal<number | null>(null);

  protected readonly expandidos = signal<Set<number>>(new Set());
  protected readonly carregandoUsuarios = signal<Set<number>>(new Set());
  protected readonly usuariosPorLicenca = signal<Map<number, Movimentacao[]>>(new Map());

  protected filtro: LicencaFiltro = { status: 'Ativa' };

  constructor() {
    this.buscar();
  }

  protected buscar(): void {
    this.carregando.set(true);
    this.erro.set(false);

    this.licencaService.listar(this.filtro).subscribe({
      next: (licencas) => {
        this.licencas.set(licencas);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set(true);
        this.carregando.set(false);
      },
    });
  }

  protected limparFiltro(): void {
    this.filtro = { status: 'Ativa' };
    this.buscar();
  }

  protected expandido(licencaId: number): boolean {
    return this.expandidos().has(licencaId);
  }

  protected alternarExpandir(licenca: Licenca): void {
    const novo = new Set(this.expandidos());

    if (novo.has(licenca.id)) {
      novo.delete(licenca.id);
      this.expandidos.set(novo);
      return;
    }

    novo.add(licenca.id);
    this.expandidos.set(novo);

    if (!this.usuariosPorLicenca().has(licenca.id)) {
      this.carregarUsuarios(licenca.id);
    }
  }

  private carregarUsuarios(licencaId: number): void {
    const carregando = new Set(this.carregandoUsuarios());
    carregando.add(licencaId);
    this.carregandoUsuarios.set(carregando);

    this.movimentacaoService.listar({ licencaId, status: 'Em uso', tamanhoPagina: 50 }).subscribe({
      next: (pagina) => {
        const mapa = new Map(this.usuariosPorLicenca());
        mapa.set(licencaId, pagina.itens);
        this.usuariosPorLicenca.set(mapa);

        const aindaCarregando = new Set(this.carregandoUsuarios());
        aindaCarregando.delete(licencaId);
        this.carregandoUsuarios.set(aindaCarregando);
      },
      error: () => {
        const aindaCarregando = new Set(this.carregandoUsuarios());
        aindaCarregando.delete(licencaId);
        this.carregandoUsuarios.set(aindaCarregando);
      },
    });
  }

  protected desativar(licenca: Licenca): void {
    const confirmado = confirm(`Desativar a licença "${licenca.nome}"?`);
    if (!confirmado) {
      return;
    }

    this.desativandoId.set(licenca.id);
    this.licencaService.desativar(licenca.id).subscribe({
      next: () => {
        this.desativandoId.set(null);
        this.buscar();
      },
      error: () => {
        this.desativandoId.set(null);
        alert('Não foi possível desativar a licença.');
      },
    });
  }
}
