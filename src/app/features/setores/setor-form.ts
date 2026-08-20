import { Location } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Icon } from '../../shared/icons/icon';
import { Usuario } from '../usuarios/usuario';
import { UsuarioService } from '../usuarios/usuario.service';
import { Setor } from './setor';
import { SetorService } from './setor.service';

@Component({
  selector: 'app-setor-form',
  imports: [ReactiveFormsModule, FormsModule, RouterLink, Icon],
  templateUrl: './setor-form.html',
  styleUrl: './setor-form.scss',
})
export class SetorForm {
  private readonly fb = inject(FormBuilder);
  private readonly setorService = inject(SetorService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  protected readonly setorId = signal<number | null>(null);
  protected readonly setor = signal<Setor | null>(null);
  protected readonly usuarios = signal<Usuario[]>([]);
  protected readonly carregando = signal(false);
  protected readonly salvando = signal(false);
  protected readonly erro = signal<string | null>(null);

  protected readonly erroAprovador = signal<string | null>(null);
  protected readonly salvandoAprovador = signal(false);
  protected usuarioSelecionado: number | null = null;

  protected readonly form = this.fb.nonNullable.group({
    nome: ['', Validators.required],
    ativo: [true, Validators.required],
  });

  protected get editando(): boolean {
    return this.setorId() !== null;
  }

  protected voltar(): void {
    this.location.back();
  }

  constructor() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.setorId.set(id);
      this.carregar(id);
      this.usuarioService.listar({ status: 'Ativo' }).subscribe((usuarios) => this.usuarios.set(usuarios));
    }
  }

  private carregar(id: number): void {
    this.carregando.set(true);
    this.setorService.obter(id).subscribe({
      next: (setor) => {
        this.setor.set(setor);
        this.form.patchValue({ nome: setor.nome, ativo: setor.ativo });
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set('Não foi possível carregar o setor.');
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
    const payload = { nome: valor.nome, ativo: valor.ativo };

    this.salvando.set(true);
    this.erro.set(null);

    const requisicao = this.editando
      ? this.setorService.atualizar(this.setorId()!, payload)
      : this.setorService.criar(payload);

    requisicao.subscribe({
      next: () => this.router.navigate(['/dp/setores']),
      error: (err) => {
        this.salvando.set(false);
        this.erro.set(err?.error?.message ?? 'Não foi possível salvar o setor.');
      },
    });
  }

  protected adicionarAprovador(): void {
    if (!this.usuarioSelecionado || !this.setorId()) {
      return;
    }

    this.salvandoAprovador.set(true);
    this.erroAprovador.set(null);

    this.setorService.adicionarAprovador(this.setorId()!, this.usuarioSelecionado).subscribe({
      next: (setor) => {
        this.setor.set(setor);
        this.usuarioSelecionado = null;
        this.salvandoAprovador.set(false);
      },
      error: (err) => {
        this.salvandoAprovador.set(false);
        this.erroAprovador.set(err?.error?.message ?? 'Não foi possível adicionar o aprovador.');
      },
    });
  }

  protected removerAprovador(aprovadorId: number): void {
    if (!this.setorId()) {
      return;
    }

    this.setorService.removerAprovador(this.setorId()!, aprovadorId).subscribe({
      next: (setor) => this.setor.set(setor),
      error: (err) => this.erroAprovador.set(err?.error?.message ?? 'Não foi possível remover o aprovador.'),
    });
  }
}
