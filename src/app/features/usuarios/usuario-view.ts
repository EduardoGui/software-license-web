import { Location } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Usuario } from './usuario';
import { UsuarioService } from './usuario.service';

@Component({
  selector: 'app-usuario-view',
  imports: [RouterLink],
  templateUrl: './usuario-view.html',
  styleUrl: './usuario-view.scss',
})
export class UsuarioView {
  private readonly usuarioService = inject(UsuarioService);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);

  protected readonly usuario = signal<Usuario | null>(null);
  protected readonly carregando = signal(true);
  protected readonly erro = signal(false);

  protected voltar(): void {
    this.location.back();
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
  }
}
