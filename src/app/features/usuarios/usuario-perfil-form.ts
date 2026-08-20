import { Location } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Icon } from '../../shared/icons/icon';
import { Setor } from '../setores/setor';
import { SetorService } from '../setores/setor.service';
import { UsuarioService } from './usuario.service';

@Component({
  selector: 'app-usuario-perfil-form',
  imports: [ReactiveFormsModule, RouterLink, Icon],
  templateUrl: './usuario-perfil-form.html',
  styleUrl: './usuario-perfil-form.scss',
})
export class UsuarioPerfilForm {
  private readonly fb = inject(FormBuilder);
  private readonly usuarioService = inject(UsuarioService);
  private readonly setorService = inject(SetorService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  protected readonly usuarioId = Number(this.route.snapshot.paramMap.get('id'));

  protected readonly setores = signal<Setor[]>([]);
  protected readonly carregando = signal(true);
  protected readonly salvando = signal(false);
  protected readonly erro = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    cpf: [''],
    cargo: [''],
    setorId: this.fb.control<number | null>(null),
    chavePix: [''],
    banco: [''],
    agencia: [''],
    contaBancaria: [''],
  });

  protected voltar(): void {
    this.location.back();
  }

  constructor() {
    this.setorService.listar({ ativo: true }).subscribe((setores) => this.setores.set(setores));

    this.usuarioService.obter(this.usuarioId).subscribe({
      next: (usuario) => {
        this.form.patchValue({
          cpf: usuario.cpf ?? '',
          cargo: usuario.cargo ?? '',
          setorId: usuario.setorId,
          chavePix: usuario.chavePix ?? '',
          banco: usuario.banco ?? '',
          agencia: usuario.agencia ?? '',
          contaBancaria: usuario.contaBancaria ?? '',
        });
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set('Não foi possível carregar os dados do usuário.');
        this.carregando.set(false);
      },
    });
  }

  protected salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valor = this.form.getRawValue();
    const payload = {
      cpf: valor.cpf || null,
      cargo: valor.cargo || null,
      setorId: valor.setorId,
      chavePix: valor.chavePix || null,
      banco: valor.banco || null,
      agencia: valor.agencia || null,
      contaBancaria: valor.contaBancaria || null,
    };

    this.salvando.set(true);
    this.erro.set(null);

    this.usuarioService.atualizarPerfil(this.usuarioId, payload).subscribe({
      next: () => this.router.navigate(['/usuarios', this.usuarioId]),
      error: (err) => {
        this.salvando.set(false);
        this.erro.set(err?.error?.message ?? 'Não foi possível salvar os dados.');
      },
    });
  }
}
