import { Location } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Icon } from '../../shared/icons/icon';
import { cnpjValidator } from '../../shared/validators/cnpj-validator';
import { FornecedorService } from './fornecedor.service';

@Component({
  selector: 'app-fornecedor-form',
  imports: [ReactiveFormsModule, RouterLink, Icon],
  templateUrl: './fornecedor-form.html',
  styleUrl: './fornecedor-form.scss',
})
export class FornecedorForm {
  private readonly fb = inject(FormBuilder);
  private readonly fornecedorService = inject(FornecedorService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  /** Quando viemos do formulário de Ordem de Compra porque o fornecedor desejado não existia. */
  protected readonly retornoParaNovaOc = this.route.snapshot.queryParamMap.get('retorno') === 'nova-oc';

  protected readonly fornecedorId = signal<number | null>(null);
  protected readonly carregando = signal(false);
  protected readonly salvando = signal(false);
  protected readonly erro = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    nome: ['', Validators.required],
    cnpj: ['', cnpjValidator],
    cpf: [''],
    contato: [''],
    telefone: [''],
    endereco: [''],
    inscricaoEstadual: [''],
    inscricaoMunicipal: [''],
    email: [''],
    dadosBancarios: [''],
    ativo: [true, Validators.required],
  });

  protected get editando(): boolean {
    return this.fornecedorId() !== null;
  }

  protected voltar(): void {
    this.location.back();
  }

  constructor() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.fornecedorId.set(id);
      this.carregar(id);
    }
  }

  private carregar(id: number): void {
    this.carregando.set(true);
    this.fornecedorService.obter(id).subscribe({
      next: (fornecedor) => {
        this.form.patchValue({
          nome: fornecedor.nome,
          cnpj: fornecedor.cnpj ?? '',
          cpf: fornecedor.cpf ?? '',
          contato: fornecedor.contato ?? '',
          telefone: fornecedor.telefone ?? '',
          endereco: fornecedor.endereco ?? '',
          inscricaoEstadual: fornecedor.inscricaoEstadual ?? '',
          inscricaoMunicipal: fornecedor.inscricaoMunicipal ?? '',
          email: fornecedor.email ?? '',
          dadosBancarios: fornecedor.dadosBancarios ?? '',
          ativo: fornecedor.ativo,
        });
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set('Não foi possível carregar o fornecedor.');
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

    if (!valor.cnpj.trim() && !valor.cpf.trim()) {
      this.erro.set('Informe o CNPJ (pessoa jurídica) ou o CPF (pessoa física) do fornecedor.');
      return;
    }

    this.salvando.set(true);
    this.erro.set(null);

    const camposComuns = {
      cpf: valor.cpf || null,
      contato: valor.contato || null,
      telefone: valor.telefone || null,
      endereco: valor.endereco || null,
      inscricaoEstadual: valor.inscricaoEstadual || null,
      inscricaoMunicipal: valor.inscricaoMunicipal || null,
      email: valor.email || null,
      dadosBancarios: valor.dadosBancarios || null,
    };

    const requisicao = this.editando
      ? this.fornecedorService.atualizar(this.fornecedorId()!, {
          nome: valor.nome,
          cnpj: valor.cnpj || null,
          ativo: valor.ativo,
          ...camposComuns,
        })
      : this.fornecedorService.criar({
          nome: valor.nome,
          cnpj: valor.cnpj || null,
          ativo: valor.ativo,
          ...camposComuns,
        });

    requisicao.subscribe({
      next: (fornecedor) => {
        if (this.retornoParaNovaOc && !this.editando) {
          this.router.navigate(['/ordens-compra/novo'], { queryParams: { fornecedorId: fornecedor.id } });
        } else {
          this.location.back();
        }
      },
      error: (err) => {
        this.salvando.set(false);
        this.erro.set(err?.error?.message ?? 'Não foi possível salvar o fornecedor.');
      },
    });
  }
}
