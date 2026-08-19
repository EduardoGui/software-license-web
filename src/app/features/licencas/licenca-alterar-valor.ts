import { Location } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Icon } from '../../shared/icons/icon';
import { LicencaPeriodicidade } from './licenca';
import { LicencaService } from './licenca.service';

interface ContextoNavegacao {
  licencaNome?: string;
}

@Component({
  selector: 'app-licenca-alterar-valor',
  imports: [ReactiveFormsModule, RouterLink, Icon],
  templateUrl: './licenca-alterar-valor.html',
  styleUrl: './licenca-alterar-valor.scss',
})
export class LicencaAlterarValor {
  private readonly fb = inject(FormBuilder);
  private readonly licencaService = inject(LicencaService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  private readonly licencaId = Number(this.route.snapshot.paramMap.get('id'));
  protected readonly contexto = (history.state ?? {}) as ContextoNavegacao;
  protected readonly hoje = new Date().toISOString().slice(0, 10);

  protected readonly salvando = signal(false);
  protected readonly erro = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    valor: [0, [Validators.required, Validators.min(0.01)]],
    periodicidade: ['Mensal' as LicencaPeriodicidade, Validators.required],
    dataVigenciaInicio: [this.hoje, Validators.required],
  });

  protected voltar(): void {
    this.location.back();
  }

  protected salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valor = this.form.getRawValue();
    this.salvando.set(true);
    this.erro.set(null);

    this.licencaService
      .adicionarValor(this.licencaId, {
        valor: valor.valor,
        periodicidade: valor.periodicidade,
        dataVigenciaInicio: valor.dataVigenciaInicio,
      })
      .subscribe({
        next: () => this.router.navigate(['/licencas', this.licencaId]),
        error: (err) => {
          this.salvando.set(false);
          this.erro.set(err?.error?.message ?? 'Não foi possível registrar o novo valor.');
        },
      });
  }
}
