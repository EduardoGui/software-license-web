import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Icon } from '../../shared/icons/icon';
import { Usuario, UsuarioFiltro } from './usuario';
import { UsuarioService } from './usuario.service';

@Component({
  selector: 'app-usuarios-list',
  imports: [FormsModule, RouterLink, Icon],
  templateUrl: './usuarios-list.html',
  styleUrl: './usuarios-list.scss',
})
export class UsuariosList {
  private readonly usuarioService = inject(UsuarioService);

  protected readonly usuarios = signal<Usuario[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal(false);
  protected readonly desativandoId = signal<number | null>(null);

  protected filtro: UsuarioFiltro = { status: 'Ativo' };

  constructor() {
    this.buscar();
  }

  protected buscar(): void {
    this.carregando.set(true);
    this.erro.set(false);

    this.usuarioService.listar(this.filtro).subscribe({
      next: (usuarios) => {
        this.usuarios.set(usuarios);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set(true);
        this.carregando.set(false);
      },
    });
  }

  protected limparFiltro(): void {
    this.filtro = { status: 'Ativo' };
    this.buscar();
  }

  protected desativar(usuario: Usuario): void {
    const confirmado = confirm(`Desativar o usuário "${usuario.nome}"? A data de fim será preenchida com hoje.`);
    if (!confirmado) {
      return;
    }

    this.desativandoId.set(usuario.id);
    this.usuarioService.desativar(usuario.id, null).subscribe({
      next: () => {
        this.desativandoId.set(null);
        this.buscar();
      },
      error: () => {
        this.desativandoId.set(null);
        alert('Não foi possível desativar o usuário.');
      },
    });
  }
}
