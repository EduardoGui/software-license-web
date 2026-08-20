import { Location } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { AuthService } from '../auth/auth.service';
import { Icon } from '../../shared/icons/icon';
import { DataBrPipe } from '../../shared/pipes/data-br.pipe';
import { EquipamentoAlocacao } from '../equipamento-alocacoes/equipamento-alocacao';
import { EquipamentoAlocacaoService } from '../equipamento-alocacoes/equipamento-alocacao.service';
import { Movimentacao } from '../movimentacoes/movimentacao';
import { MovimentacaoService } from '../movimentacoes/movimentacao.service';
import { Usuario } from './usuario';
import { UsuarioService } from './usuario.service';

@Component({
  selector: 'app-usuario-view',
  imports: [RouterLink, Icon, DataBrPipe],
  templateUrl: './usuario-view.html',
  styleUrl: './usuario-view.scss',
})
export class UsuarioView {
  private readonly usuarioService = inject(UsuarioService);
  private readonly movimentacaoService = inject(MovimentacaoService);
  private readonly equipamentoAlocacaoService = inject(EquipamentoAlocacaoService);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  protected readonly authService = inject(AuthService);

  protected readonly usuario = signal<Usuario | null>(null);
  protected readonly carregando = signal(true);
  protected readonly erro = signal(false);

  protected readonly reenviandoConvite = signal(false);
  protected readonly conviteReenviado = signal(false);
  protected readonly erroReenvioConvite = signal<string | null>(null);

  protected readonly licencas = signal<Movimentacao[]>([]);
  protected readonly carregandoLicencas = signal(true);
  protected readonly equipamentos = signal<EquipamentoAlocacao[]>([]);
  protected readonly carregandoEquipamentos = signal(true);

  protected voltar(): void {
    this.location.back();
  }

  protected reenviarConvite(): void {
    const id = this.usuario()?.id;
    if (!id) {
      return;
    }

    this.reenviandoConvite.set(true);
    this.conviteReenviado.set(false);
    this.erroReenvioConvite.set(null);

    this.usuarioService.reenviarConvite(id).subscribe({
      next: () => {
        this.reenviandoConvite.set(false);
        this.conviteReenviado.set(true);
      },
      error: (err) => {
        this.reenviandoConvite.set(false);
        this.erroReenvioConvite.set(err?.error?.message ?? 'Não foi possível reenviar o convite.');
      },
    });
  }

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.usuarioService.obter(id).subscribe({
      next: (usuario) => {
        this.usuario.set(usuario);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set(true);
        this.carregando.set(false);
      },
    });

    this.movimentacaoService.listar({ usuarioId: id, status: 'Em uso', tamanhoPagina: 50 }).subscribe({
      next: (pagina) => {
        this.licencas.set(pagina.itens);
        this.carregandoLicencas.set(false);
      },
      error: () => this.carregandoLicencas.set(false),
    });

    this.equipamentoAlocacaoService.listar({ usuarioId: id, status: 'Em uso', tamanhoPagina: 50 }).subscribe({
      next: (pagina) => {
        this.equipamentos.set(pagina.itens);
        this.carregandoEquipamentos.set(false);
      },
      error: () => this.carregandoEquipamentos.set(false),
    });
  }
}
