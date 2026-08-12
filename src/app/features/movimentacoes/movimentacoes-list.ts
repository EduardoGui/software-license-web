import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Licenca } from '../licencas/licenca';
import { LicencaService } from '../licencas/licenca.service';
import { Usuario } from '../usuarios/usuario';
import { UsuarioService } from '../usuarios/usuario.service';
import { Movimentacao, MovimentacaoFiltro } from './movimentacao';
import { MovimentacaoService } from './movimentacao.service';

@Component({
  selector: 'app-movimentacoes-list',
  imports: [FormsModule, RouterLink],
  templateUrl: './movimentacoes-list.html',
  styleUrl: './movimentacoes-list.scss',
})
export class MovimentacoesList {
  private readonly movimentacaoService = inject(MovimentacaoService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly licencaService = inject(LicencaService);

  protected readonly movimentacoes = signal<Movimentacao[]>([]);
  protected readonly totalRegistros = signal(0);
  protected readonly usuarios = signal<Usuario[]>([]);
  protected readonly licencas = signal<Licenca[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal(false);
  protected readonly encerrandoId = signal<number | null>(null);

  protected filtro: MovimentacaoFiltro = { pagina: 1, tamanhoPagina: 10 };

  protected get totalPaginas(): number {
    const tamanho = this.filtro.tamanhoPagina ?? 10;
    return Math.max(1, Math.ceil(this.totalRegistros() / tamanho));
  }

  constructor() {
    this.usuarioService.listar().subscribe((usuarios) => this.usuarios.set(usuarios));
    this.licencaService.listar().subscribe((licencas) => this.licencas.set(licencas));
    this.buscar();
  }

  protected buscar(): void {
    this.carregando.set(true);
    this.erro.set(false);

    this.movimentacaoService.listar(this.filtro).subscribe({
      next: (pagina) => {
        this.movimentacoes.set(pagina.itens);
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
    this.filtro = { pagina: 1, tamanhoPagina: 10 };
    this.buscar();
  }

  protected irParaPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas) {
      return;
    }
    this.filtro.pagina = pagina;
    this.buscar();
  }

  protected encerrar(movimentacao: Movimentacao): void {
    const hoje = new Date().toISOString().slice(0, 10);
    const dataFim = prompt(
      `Data de fim para encerrar "${movimentacao.licencaNome}" de ${movimentacao.usuarioNome}:`,
      hoje,
    );
    if (!dataFim) {
      return;
    }

    const observacao = prompt('Observação (opcional):', '');

    this.encerrandoId.set(movimentacao.id);
    this.movimentacaoService.encerrar(movimentacao.id, { dataFim, observacao: observacao || null }).subscribe({
      next: () => {
        this.encerrandoId.set(null);
        this.buscar();
      },
      error: (err) => {
        this.encerrandoId.set(null);
        alert(err?.error?.message ?? 'Não foi possível encerrar a movimentação.');
      },
    });
  }
}
