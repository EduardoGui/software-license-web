import { Location } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Icon } from '../../shared/icons/icon';
import { EmpresaPjService } from './empresa-pj.service';

@Component({
  selector: 'app-empresa-pj-form',
  imports: [ReactiveFormsModule, RouterLink, Icon],
  templateUrl: './empresa-pj-form.html',
  styleUrl: './empresa-pj-form.scss',
})
export class EmpresaPjForm {
  private readonly fb = inject(FormBuilder);
  private readonly empresaPjService = inject(EmpresaPjService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  protected readonly empresaId = signal<number | null>(null);
  protected readonly carregando = signal(false);
  protected readonly salvando = signal(false);
  protected readonly erro = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    razaoSocial: ['', Validators.required],
    cnpj: ['', Validators.required],
    ativa: [true, Validators.required],
  });

  protected get editando(): boolean {
    return this.empresaId() !== null;
  }

  protected voltar(): void {
    this.location.back();
  }

  constructor() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.empresaId.set(id);
      this.carregar(id);
    }
  }

  private carregar(id: number): void {
    this.carregando.set(true);
    this.empresaPjService.obter(id).subscribe({
      next: (empresa) => {
        this.form.patchValue({ razaoSocial: empresa.razaoSocial, cnpj: empresa.cnpj, ativa: empresa.ativa });
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set('Não foi possível carregar a empresa PJ.');
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
    const payload = { razaoSocial: valor.razaoSocial, cnpj: valor.cnpj, ativa: valor.ativa };

    this.salvando.set(true);
    this.erro.set(null);

    const requisicao = this.editando
      ? this.empresaPjService.atualizar(this.empresaId()!, payload)
      : this.empresaPjService.criar(payload);

    requisicao.subscribe({
      next: () => this.router.navigate(['/dp/empresas-pj']),
      error: (err) => {
        this.salvando.set(false);
        this.erro.set(err?.error?.message ?? 'Não foi possível salvar a empresa PJ.');
      },
    });
  }
}
