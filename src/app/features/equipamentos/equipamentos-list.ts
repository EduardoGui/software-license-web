import { DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Icon } from '../../shared/icons/icon';
import { TipoEquipamento } from '../tipos-equipamento/tipo-equipamento';
import { TipoEquipamentoService } from '../tipos-equipamento/tipo-equipamento.service';
import { Usuario } from '../usuarios/usuario';
import { UsuarioService } from '../usuarios/usuario.service';
import { Equipamento, EquipamentoFiltro } from './equipamento';
import { EquipamentoService } from './equipamento.service';

@Component({
  selector: 'app-equipamentos-list',
  imports: [FormsModule, RouterLink, Icon, DecimalPipe],
  templateUrl: './equipamentos-list.html',
  styleUrl: './equipamentos-list.scss',
})
export class EquipamentosList {
  private readonly equipamentoService = inject(EquipamentoService);
  private readonly tipoEquipamentoService = inject(TipoEquipamentoService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly route = inject(ActivatedRoute);

  protected readonly equipamentos = signal<Equipamento[]>([]);
  protected readonly tipos = signal<TipoEquipamento[]>([]);
  protected readonly usuarios = signal<Usuario[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal(false);

  protected filtro: EquipamentoFiltro = {};

  constructor() {
    this.tipoEquipamentoService.listar({ ativo: true }).subscribe((tipos) => this.tipos.set(tipos));
    this.usuarioService.listar({ status: 'Ativo' }).subscribe((usuarios) => this.usuarios.set(usuarios));

    const notaFiscalEntradaId = this.route.snapshot.queryParamMap.get('notaFiscalEntradaId');
    if (notaFiscalEntradaId) {
      this.filtro.notaFiscalEntradaId = Number(notaFiscalEntradaId);
    }

    this.buscar();
  }

  protected buscar(): void {
    this.carregando.set(true);
    this.erro.set(false);

    this.equipamentoService.listar(this.filtro).subscribe({
      next: (equipamentos) => {
        this.equipamentos.set(equipamentos);
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

  protected podeBaixar(equipamento: Equipamento): boolean {
    return equipamento.status !== 'EmUso' && equipamento.status !== 'Baixado';
  }
}
