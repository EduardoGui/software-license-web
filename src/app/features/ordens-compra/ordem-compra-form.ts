import { Location } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Fornecedor } from '../fornecedores/fornecedor';
import { FornecedorService } from '../fornecedores/fornecedor.service';
import { Local } from '../locais/local';
import { LocalService } from '../locais/local.service';
import { Icon } from '../../shared/icons/icon';
import { OrdemCompraService } from './ordem-compra.service';

@Component({
  selector: 'app-ordem-compra-form',
  imports: [ReactiveFormsModule, Icon],
  templateUrl: './ordem-compra-form.html',
  styleUrl: './ordem-compra-form.scss',
})
export class OrdemCompraForm {
  private readonly fb = inject(FormBuilder);
  private readonly ordemCompraService = inject(OrdemCompraService);
  private readonly fornecedorService = inject(FornecedorService);
  private readonly localService = inject(LocalService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  private static readonly ChaveRascunho = 'oc-form-rascunho';

  protected readonly ordemCompraId = signal<number | null>(null);
  protected readonly fornecedores = signal<Fornecedor[]>([]);
  protected readonly locais = signal<Local[]>([]);
  protected readonly carregando = signal(false);
  protected readonly salvando = signal(false);
  protected readonly erro = signal<string | null>(null);
  protected readonly erroValidacao = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    data: ['', Validators.required],
    solicitante: ['', Validators.required],
    localId: this.fb.control<number | null>(null, Validators.required),
    fornecedorId: this.fb.control<number | null>(null, Validators.required),
    condicaoPagamento: ['', Validators.required],
    tipoFrete: [''],
    valorFrete: [0, [Validators.required, Validators.min(0)]],
    localEntrega: [''],
    prazoEntrega: [''],
    observacoesSolicitante: [''],
    observacoesFornecedor: [''],
    itens: this.fb.array<ReturnType<typeof this.criarLinhaItem>>([]),
  });

  protected get itens(): FormArray {
    return this.form.controls.itens;
  }

  protected get editando(): boolean {
    return this.ordemCompraId() !== null;
  }

  protected voltar(): void {
    this.location.back();
  }

  constructor() {
    this.fornecedorService.listar({ ativo: true }).subscribe((fornecedores) => this.fornecedores.set(fornecedores));
    this.localService.listar({ ativo: true }).subscribe((locais) => this.locais.set(locais));

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.ordemCompraId.set(id);
      this.carregar(id);
    } else if (!this.restaurarRascunho()) {
      this.adicionarItem();
    }
  }

  /** Chamado quando o fornecedor desejado ainda não existe: guarda o que já foi
   * preenchido nesta OC e abre o cadastro de fornecedor, voltando para cá depois. */
  protected novoFornecedor(): void {
    sessionStorage.setItem(OrdemCompraForm.ChaveRascunho, JSON.stringify(this.form.getRawValue()));
    this.router.navigate(['/dp/fornecedores/novo'], { queryParams: { retorno: 'nova-oc' } });
  }

  private restaurarRascunho(): boolean {
    const rascunho = sessionStorage.getItem(OrdemCompraForm.ChaveRascunho);
    if (!rascunho) {
      return false;
    }

    sessionStorage.removeItem(OrdemCompraForm.ChaveRascunho);

    try {
      const dados = JSON.parse(rascunho);
      this.itens.clear();
      for (const item of dados.itens ?? []) {
        this.itens.push(
          this.fb.nonNullable.group({
            codigo: [item.codigo ?? ''],
            descricao: [item.descricao ?? '', Validators.required],
            unidade: [item.unidade ?? '', Validators.required],
            marcaReferencia: [item.marcaReferencia ?? ''],
            quantidade: [item.quantidade ?? 0, [Validators.required, Validators.min(0.000001)]],
            valorUnitario: [item.valorUnitario ?? 0, [Validators.required, Validators.min(0)]],
          }),
        );
      }
      if (this.itens.length === 0) {
        this.adicionarItem();
      }

      this.form.patchValue(dados);

      const novoFornecedorId = this.route.snapshot.queryParamMap.get('fornecedorId');
      if (novoFornecedorId) {
        this.form.patchValue({ fornecedorId: Number(novoFornecedorId) });
      }

      return true;
    } catch {
      return false;
    }
  }

  private criarLinhaItem() {
    return this.fb.nonNullable.group({
      codigo: [''],
      descricao: ['', Validators.required],
      unidade: ['', Validators.required],
      marcaReferencia: [''],
      quantidade: [0, [Validators.required, Validators.min(0.000001)]],
      valorUnitario: [0, [Validators.required, Validators.min(0)]],
    });
  }

  protected adicionarItem(): void {
    this.itens.push(this.criarLinhaItem());
  }

  protected removerItem(index: number): void {
    this.itens.removeAt(index);
  }

  private carregar(id: number): void {
    this.carregando.set(true);
    this.ordemCompraService.obter(id).subscribe({
      next: (oc) => {
        this.form.patchValue({
          data: oc.data,
          solicitante: oc.solicitante,
          localId: oc.localId,
          fornecedorId: oc.fornecedorId,
          condicaoPagamento: oc.condicaoPagamento,
          tipoFrete: oc.tipoFrete ?? '',
          valorFrete: oc.valorFrete,
          localEntrega: oc.localEntrega ?? '',
          prazoEntrega: oc.prazoEntrega ?? '',
          observacoesSolicitante: oc.observacoesSolicitante ?? '',
          observacoesFornecedor: oc.observacoesFornecedor ?? '',
        });

        this.itens.clear();
        for (const item of oc.itens) {
          this.itens.push(
            this.fb.nonNullable.group({
              codigo: [item.codigo ?? ''],
              descricao: [item.descricao, Validators.required],
              unidade: [item.unidade, Validators.required],
              marcaReferencia: [item.marcaReferencia ?? ''],
              quantidade: [item.quantidade, [Validators.required, Validators.min(0.000001)]],
              valorUnitario: [item.valorUnitario, [Validators.required, Validators.min(0)]],
            }),
          );
        }

        this.carregando.set(false);
      },
      error: () => {
        this.erro.set('Não foi possível carregar a ordem de compra.');
        this.carregando.set(false);
      },
    });
  }

  protected salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.erroValidacao.set(true);
      return;
    }

    this.erroValidacao.set(false);
    const valor = this.form.getRawValue();
    const payload = {
      data: valor.data,
      solicitante: valor.solicitante,
      localId: valor.localId,
      fornecedorId: valor.fornecedorId,
      condicaoPagamento: valor.condicaoPagamento,
      tipoFrete: valor.tipoFrete || null,
      valorFrete: valor.valorFrete,
      localEntrega: valor.localEntrega || null,
      prazoEntrega: valor.prazoEntrega || null,
      observacoesSolicitante: valor.observacoesSolicitante || null,
      observacoesFornecedor: valor.observacoesFornecedor || null,
      itens: valor.itens.map((item) => ({
        codigo: item.codigo || null,
        descricao: item.descricao,
        unidade: item.unidade,
        marcaReferencia: item.marcaReferencia || null,
        quantidade: item.quantidade,
        valorUnitario: item.valorUnitario,
      })),
    };

    this.salvando.set(true);
    this.erro.set(null);

    const requisicao = this.editando
      ? this.ordemCompraService.atualizar(this.ordemCompraId()!, payload)
      : this.ordemCompraService.criar(payload);

    requisicao.subscribe({
      next: (oc) => this.router.navigate(['/ordens-compra', oc.id]),
      error: (err) => {
        this.salvando.set(false);
        this.erro.set(err?.error?.message ?? 'Não foi possível salvar a ordem de compra.');
      },
    });
  }
}
