import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { LicencaService } from './licenca.service';

@Component({
  selector: 'app-licenca-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './licenca-form.html',
  styleUrl: './licenca-form.scss',
})
export class LicencaForm {
  private readonly fb = inject(FormBuilder);
  private readonly licencaService = inject(LicencaService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly licencaId = signal<number | null>(null);
  protected readonly carregando = signal(false);
  protected readonly salvando = signal(false);
  protected readonly erro = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    nome: ['', Validators.required],
    descricao: [''],
    quantidadeTotal: [1, [Validators.required, Validators.min(1)]],
    dataInicio: ['', Validators.required],
    dataTerminoPrevisto: ['', Validators.required],
    diasAntecedenciaAviso: [30, [Validators.required, Validators.min(0)]],
    observacao: [''],
    ativa: [true, Validators.required],
  });

  protected get editando(): boolean {
    return this.licencaId() !== null;
  }

  constructor() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.licencaId.set(id);
      this.carregar(id);
    }
  }

  private carregar(id: number): void {
    this.carregando.set(true);
    this.licencaService.obter(id).subscribe({
      next: (licenca) => {
        this.form.patchValue({
          nome: licenca.nome,
          descricao: licenca.descricao ?? '',
          quantidadeTotal: licenca.quantidadeTotal,
          dataInicio: licenca.dataInicio,
          dataTerminoPrevisto: licenca.dataTerminoPrevisto,
          diasAntecedenciaAviso: licenca.diasAntecedenciaAviso,
          observacao: licenca.observacao ?? '',
          ativa: licenca.ativa,
        });
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set('Não foi possível carregar a licença.');
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
      nome: valor.nome,
      descricao: valor.descricao || null,
      quantidadeTotal: valor.quantidadeTotal,
      dataInicio: valor.dataInicio,
      dataTerminoPrevisto: valor.dataTerminoPrevisto,
      diasAntecedenciaAviso: valor.diasAntecedenciaAviso,
      observacao: valor.observacao || null,
      ativa: valor.ativa,
    };

    this.salvando.set(true);
    this.erro.set(null);

    const requisicao = this.editando
      ? this.licencaService.atualizar(this.licencaId()!, payload)
      : this.licencaService.criar(payload);

    requisicao.subscribe({
      next: () => this.router.navigate(['/licencas']),
      error: (err) => {
        this.salvando.set(false);
        this.erro.set(err?.error?.message ?? 'Não foi possível salvar a licença.');
      },
    });
  }
}
