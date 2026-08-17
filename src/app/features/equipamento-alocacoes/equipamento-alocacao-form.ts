import { Location } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { Icon } from '../../shared/icons/icon';
import { Equipamento } from '../equipamentos/equipamento';
import { EquipamentoService } from '../equipamentos/equipamento.service';
import { Usuario } from '../usuarios/usuario';
import { UsuarioService } from '../usuarios/usuario.service';
import { EquipamentoAlocacaoService } from './equipamento-alocacao.service';

@Component({
  selector: 'app-equipamento-alocacao-form',
  imports: [ReactiveFormsModule, RouterLink, Icon],
  templateUrl: './equipamento-alocacao-form.html',
  styleUrl: './equipamento-alocacao-form.scss',
})
export class EquipamentoAlocacaoForm {
  private readonly fb = inject(FormBuilder);
  private readonly equipamentoAlocacaoService = inject(EquipamentoAlocacaoService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly equipamentoService = inject(EquipamentoService);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  protected readonly usuarios = signal<Usuario[]>([]);
  protected readonly equipamentosDisponiveis = signal<Equipamento[]>([]);
  protected readonly salvando = signal(false);
  protected readonly erro = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    usuarioId: [0, [Validators.required, Validators.min(1)]],
    equipamentoId: [0, [Validators.required, Validators.min(1)]],
    dataInicio: ['', Validators.required],
    observacao: [''],
  });

  protected voltar(): void {
    this.location.back();
  }

  constructor() {
    this.usuarioService.listar({ status: 'Ativo' }).subscribe((usuarios) => this.usuarios.set(usuarios));
    this.equipamentoService.listar({ status: 'Disponivel' }).subscribe((equipamentos) => this.equipamentosDisponiveis.set(equipamentos));
  }

  protected descreverEquipamento(equipamento: Equipamento): string {
    return equipamento.patrimonio
      ? `${equipamento.tipoEquipamentoNome} (${equipamento.patrimonio})`
      : `${equipamento.tipoEquipamentoNome} — sem patrimônio`;
  }

  protected salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valor = this.form.getRawValue();
    const payload = {
      usuarioId: valor.usuarioId,
      equipamentoId: valor.equipamentoId,
      dataInicio: valor.dataInicio,
      observacao: valor.observacao || null,
    };

    this.salvando.set(true);
    this.erro.set(null);

    this.equipamentoAlocacaoService.alocar(payload).subscribe({
      next: () => this.router.navigate(['/equipamentos/alocacoes']),
      error: (err) => {
        this.salvando.set(false);
        this.erro.set(err?.error?.message ?? 'Não foi possível registrar a alocação.');
      },
    });
  }
}
