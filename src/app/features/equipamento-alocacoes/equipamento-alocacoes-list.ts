import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Icon } from '../../shared/icons/icon';
import { DataBrPipe } from '../../shared/pipes/data-br.pipe';
import { Equipamento } from '../equipamentos/equipamento';
import { EquipamentoService } from '../equipamentos/equipamento.service';
import { Usuario } from '../usuarios/usuario';
import { UsuarioService } from '../usuarios/usuario.service';
import { EquipamentoAlocacao, EquipamentoAlocacaoFiltro } from './equipamento-alocacao';
import { EquipamentoAlocacaoService } from './equipamento-alocacao.service';

@Component({
  selector: 'app-equipamento-alocacoes-list',
  imports: [FormsModule, RouterLink, Icon, DataBrPipe],
  templateUrl: './equipamento-alocacoes-list.html',
  styleUrl: './equipamento-alocacoes-list.scss',
})
export class EquipamentoAlocacoesList {
  private readonly equipamentoAlocacaoService = inject(EquipamentoAlocacaoService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly equipamentoService = inject(EquipamentoService);

  protected readonly alocacoes = signal<EquipamentoAlocacao[]>([]);
  protected readonly totalRegistros = signal(0);
  protected readonly usuarios = signal<Usuario[]>([]);
  protected readonly equipamentos = signal<Equipamento[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal(false);

  protected filtro: EquipamentoAlocacaoFiltro = { pagina: 1, tamanhoPagina: 10, status: 'Em uso' };

  protected get totalPaginas(): number {
    const tamanho = this.filtro.tamanhoPagina ?? 10;
    return Math.max(1, Math.ceil(this.totalRegistros() / tamanho));
  }

  constructor() {
    this.usuarioService.listar().subscribe((usuarios) => this.usuarios.set(usuarios));
    this.equipamentoService.listar().subscribe((equipamentos) => this.equipamentos.set(equipamentos));
    this.buscar();
  }

  protected descreverEquipamento(equipamento: Equipamento): string {
    const descricao = [equipamento.tipoEquipamentoNome, equipamento.marca, equipamento.modelo].filter(Boolean).join(' ');
    return equipamento.patrimonio ? `${descricao} (${equipamento.patrimonio})` : descricao;
  }

  protected buscar(): void {
    this.carregando.set(true);
    this.erro.set(false);

    this.equipamentoAlocacaoService.listar(this.filtro).subscribe({
      next: (pagina) => {
        this.alocacoes.set(pagina.itens);
        this.totalRegistros.set(pagina.totalRegistros);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set(true);
        this.carregando.set(false);
      },
    });
  }

  protected filtrar(): void {
    this.filtro.pagina = 1;
    this.buscar();
  }

  protected limparFiltro(): void {
    this.filtro = { pagina: 1, tamanhoPagina: 10, status: 'Em uso' };
    this.buscar();
  }

  protected irParaPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas) {
      return;
    }
    this.filtro.pagina = pagina;
    this.buscar();
  }
}
