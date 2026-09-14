import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { DataBrPipe } from '../../shared/pipes/data-br.pipe';
import { CampanhaEntrega, CampanhaEntregaFiltro } from './campanha-entrega';
import { CampanhaEntregaService } from './campanha-entrega.service';

@Component({
  selector: 'app-campanhas-entrega-list',
  imports: [FormsModule, ReactiveFormsModule, RouterLink, DataBrPipe],
  templateUrl: './campanhas-entrega-list.html',
  styleUrl: './campanhas-entrega-list.scss',
})
export class CampanhasEntregaList {
  private readonly campanhaEntregaService = inject(CampanhaEntregaService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  protected readonly campanhas = signal<CampanhaEntrega[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal(false);

  protected filtro: CampanhaEntregaFiltro = {};

  protected readonly modalAberto = signal(false);
  protected readonly salvando = signal(false);
  protected readonly erroSalvar = signal<string | null>(null);

  protected readonly formNovaCampanha = this.fb.nonNullable.group({
    nome: ['', Validators.required],
    descricao: [''],
  });

  constructor() {
    this.buscar();
  }

  protected buscar(): void {
    this.carregando.set(true);
    this.erro.set(false);

    this.campanhaEntregaService.listar(this.filtro).subscribe({
      next: (campanhas) => {
        this.campanhas.set(campanhas);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set(true);
        this.carregando.set(false);
      },
    });
  }

  protected limparFiltro(): void {
    this.filtro = {};
    this.buscar();
  }

  protected classeStatus(status: string): string {
    return 'badge--' + status.toLowerCase();
  }

  protected abrirModal(): void {
    this.erroSalvar.set(null);
    this.formNovaCampanha.reset({ nome: '', descricao: '' });
    this.modalAberto.set(true);
  }

  protected fecharModal(): void {
    this.modalAberto.set(false);
  }

  protected salvarNovaCampanha(): void {
    if (this.formNovaCampanha.invalid) {
      this.formNovaCampanha.markAllAsTouched();
      return;
    }

    const valor = this.formNovaCampanha.getRawValue();
    this.salvando.set(true);
    this.erroSalvar.set(null);

    this.campanhaEntregaService
      .criar({ nome: valor.nome.trim(), descricao: valor.descricao?.trim() || null })
      .subscribe({
        next: (campanha) => {
          this.salvando.set(false);
          this.modalAberto.set(false);
          this.router.navigate(['/campanhas-entrega', campanha.id]);
        },
        error: (err) => {
          this.salvando.set(false);
          this.erroSalvar.set(err?.error?.message ?? 'Não foi possível criar a campanha.');
        },
      });
  }
}
