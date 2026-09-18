import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { RecessoCorporativo, ROTULOS_STATUS_RECESSO } from './recesso-corporativo';
import { RecessoCorporativoService } from './recesso-corporativo.service';

@Component({
  selector: 'app-recessos-list',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './recessos-list.html',
  styleUrl: './recessos-list.scss',
})
export class RecessosList {
  private readonly recessoService = inject(RecessoCorporativoService);
  private readonly fb = inject(FormBuilder);

  protected readonly recessos = signal<RecessoCorporativo[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal(false);
  protected readonly rotulosStatus = ROTULOS_STATUS_RECESSO;

  protected readonly mostrarForm = signal(false);
  protected readonly salvando = signal(false);
  protected readonly erroSalvar = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    nome: ['', Validators.required],
    dataInicio: ['', Validators.required],
    dataFim: ['', Validators.required],
  });

  constructor() {
    this.carregar();
  }

  private carregar(): void {
    this.carregando.set(true);
    this.erro.set(false);

    this.recessoService.listar().subscribe({
      next: (recessos) => {
        this.recessos.set(recessos);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set(true);
        this.carregando.set(false);
      },
    });
  }

  protected alternarForm(): void {
    this.mostrarForm.update((valor) => !valor);
    this.erroSalvar.set(null);
  }

  protected criar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.salvando.set(true);
    this.erroSalvar.set(null);

    this.recessoService.criar(this.form.getRawValue()).subscribe({
      next: () => {
        this.salvando.set(false);
        this.mostrarForm.set(false);
        this.form.reset({ nome: '', dataInicio: '', dataFim: '' });
        this.carregar();
      },
      error: (err) => {
        this.salvando.set(false);
        this.erroSalvar.set(err?.error?.message ?? 'Não foi possível criar o recesso.');
      },
    });
  }
}
