import { Location } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { Icon } from '../../shared/icons/icon';
import { Licenca } from '../licencas/licenca';
import { LicencaService } from '../licencas/licenca.service';
import { Usuario } from '../usuarios/usuario';
import { UsuarioService } from '../usuarios/usuario.service';
import { MovimentacaoService } from './movimentacao.service';

@Component({
  selector: 'app-movimentacao-form',
  imports: [ReactiveFormsModule, RouterLink, Icon],
  templateUrl: './movimentacao-form.html',
  styleUrl: './movimentacao-form.scss',
})
export class MovimentacaoForm {
  private readonly fb = inject(FormBuilder);
  private readonly movimentacaoService = inject(MovimentacaoService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly licencaService = inject(LicencaService);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  protected readonly usuarios = signal<Usuario[]>([]);
  protected readonly licencas = signal<Licenca[]>([]);
  protected readonly salvando = signal(false);
  protected readonly erro = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    usuarioId: [0, [Validators.required, Validators.min(1)]],
    licencaId: [0, [Validators.required, Validators.min(1)]],
    dataInicio: ['', Validators.required],
    observacao: [''],
  });

  protected get licencaSelecionada(): Licenca | undefined {
    return this.licencas().find((l) => l.id === this.form.controls.licencaId.value);
  }

  protected voltar(): void {
    this.location.back();
  }

  constructor() {
    this.usuarioService.listar({ status: 'Ativo' }).subscribe((usuarios) => this.usuarios.set(usuarios));
    this.licencaService.listar({ status: 'Ativa' }).subscribe((licencas) => this.licencas.set(licencas));
  }

  protected salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valor = this.form.getRawValue();
    const payload = {
      usuarioId: valor.usuarioId,
      licencaId: valor.licencaId,
      dataInicio: valor.dataInicio,
      observacao: valor.observacao || null,
    };

    this.salvando.set(true);
    this.erro.set(null);

    this.movimentacaoService.alocar(payload).subscribe({
      next: () => this.router.navigate(['/movimentacoes']),
      error: (err) => {
        this.salvando.set(false);
        this.erro.set(err?.error?.message ?? 'Não foi possível registrar a alocação.');
      },
    });
  }
}
