import { Location } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Icon } from '../../shared/icons/icon';
import { FeriadoAbrangencia } from './feriado';
import { FeriadoService } from './feriado.service';

@Component({
  selector: 'app-feriado-form',
  imports: [ReactiveFormsModule, RouterLink, Icon],
  templateUrl: './feriado-form.html',
  styleUrl: './feriado-form.scss',
})
export class FeriadoForm {
  private readonly fb = inject(FormBuilder);
  private readonly feriadoService = inject(FeriadoService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  protected readonly feriadoId = signal<number | null>(null);
  protected readonly carregando = signal(false);
  protected readonly salvando = signal(false);
  protected readonly erro = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    data: ['', Validators.required],
    descricao: ['', Validators.required],
    abrangencia: ['Nacional' as FeriadoAbrangencia, Validators.required],
    uf: [''],
    municipio: [''],
    ativo: [true, Validators.required],
  });

  protected get editando(): boolean {
    return this.feriadoId() !== null;
  }

  protected voltar(): void {
    this.location.back();
  }

  constructor() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.feriadoId.set(id);
      this.carregar(id);
    }
  }

  private carregar(id: number): void {
    this.carregando.set(true);
    this.feriadoService.obter(id).subscribe({
      next: (feriado) => {
        this.form.patchValue({
          data: feriado.data,
          descricao: feriado.descricao,
          abrangencia: feriado.abrangencia,
          uf: feriado.uf ?? '',
          municipio: feriado.municipio ?? '',
          ativo: feriado.ativo,
        });
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set('Não foi possível carregar o feriado.');
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
      data: valor.data,
      descricao: valor.descricao,
      abrangencia: valor.abrangencia,
      uf: valor.abrangencia === 'Estadual' ? valor.uf || null : null,
      municipio: valor.abrangencia === 'Municipal' ? valor.municipio || null : null,
      ativo: valor.ativo,
    };

    this.salvando.set(true);
    this.erro.set(null);

    const requisicao = this.editando
      ? this.feriadoService.atualizar(this.feriadoId()!, payload)
      : this.feriadoService.criar(payload);

    requisicao.subscribe({
      next: () => this.router.navigate(['/dp/feriados']),
      error: (err) => {
        this.salvando.set(false);
        this.erro.set(err?.error?.message ?? 'Não foi possível salvar o feriado.');
      },
    });
  }
}
