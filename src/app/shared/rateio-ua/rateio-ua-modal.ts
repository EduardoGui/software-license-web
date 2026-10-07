import { Component, OnInit, inject, input, output } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { UnidadeOrcamentaria, UnidadeOrcamentariaUsada } from '../../features/unidades-orcamentarias/unidade-orcamentaria';
import { Icon } from '../icons/icon';

export interface RateioUaLinha {
  unidadeOrcamentariaId: number;
  quantidade: number;
}

// Modal de rateio de UA por quantidade, compartilhado entre itens de BM e de Ordem de Compra.
// Quem usa controla a abertura (@if), a chamada HTTP e os sinais de salvando/erro.
@Component({
  selector: 'app-rateio-ua-modal',
  imports: [ReactiveFormsModule, Icon],
  templateUrl: './rateio-ua-modal.html',
  styleUrl: './rateio-ua-modal.scss',
})
export class RateioUaModal implements OnInit {
  private readonly fb = inject(FormBuilder);

  readonly titulo = input.required<string>();
  readonly rotuloQuantidade = input('Quantidade do item');
  readonly quantidadeTotal = input.required<number>();
  // 'valor' = rateio monetário (2 casas, R$); 'quantidade' = rateio por quantidade (até 6 casas).
  readonly modo = input<'quantidade' | 'valor'>('quantidade');
  readonly linhasIniciais = input<RateioUaLinha[]>([]);
  readonly unidades = input<UnidadeOrcamentaria[]>([]);
  // UAs já usadas com o fornecedor do lançamento (histórico), para facilitar a escolha.
  readonly sugestoes = input<UnidadeOrcamentariaUsada[]>([]);
  readonly somenteLeitura = input(false);
  readonly mensagemSomenteLeitura = input<string | null>(null);
  readonly salvando = input(false);
  readonly erro = input<string | null>(null);

  readonly salvar = output<RateioUaLinha[]>();
  readonly fechar = output<void>();

  protected readonly form = this.fb.nonNullable.group({
    itens: this.fb.array<ReturnType<typeof this.criarLinha>>([]),
  });

  protected get itens(): FormArray {
    return this.form.controls.itens;
  }

  ngOnInit(): void {
    const iniciais = this.linhasIniciais();
    if (iniciais.length > 0) {
      for (const linha of iniciais) {
        this.itens.push(this.criarLinha(linha));
      }
    } else {
      this.itens.push(this.criarLinha());
    }
  }

  private criarLinha(linha?: RateioUaLinha) {
    return this.fb.nonNullable.group({
      unidadeOrcamentariaId: this.fb.control<number | null>(linha?.unidadeOrcamentariaId ?? null, Validators.required),
      quantidade: this.fb.control<number | null>(linha?.quantidade ?? null, [Validators.required, Validators.min(0.000001)]),
    });
  }

  protected jaNaLista(uaId: number): boolean {
    return this.itens.controls.some((linha) => linha.value.unidadeOrcamentariaId === uaId);
  }

  // Usa a sugestão na primeira linha ainda sem UA; se não houver, abre uma nova linha.
  protected usarSugestao(sugestao: UnidadeOrcamentariaUsada): void {
    if (this.jaNaLista(sugestao.id)) {
      return;
    }

    const vazia = this.itens.controls.find((linha) => linha.value.unidadeOrcamentariaId == null);
    if (vazia) {
      vazia.patchValue({ unidadeOrcamentariaId: sugestao.id });
    } else {
      const nova = this.criarLinha();
      nova.patchValue({ unidadeOrcamentariaId: sugestao.id });
      this.itens.push(nova);
    }
  }

  protected adicionarLinha(): void {
    this.itens.push(this.criarLinha());
  }

  protected removerLinha(index: number): void {
    this.itens.removeAt(index);
  }

  protected total(): number {
    const soma = this.itens.controls.reduce((acumulado, linha) => acumulado + (Number(linha.value.quantidade) || 0), 0);
    return Number(soma.toFixed(this.modo() === 'valor' ? 2 : 6));
  }

  protected fechado(): boolean {
    return this.total() === Number(this.quantidadeTotal().toFixed(this.modo() === 'valor' ? 2 : 6));
  }

  protected confirmar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.salvar.emit(
      this.itens.getRawValue().map((linha) => ({
        unidadeOrcamentariaId: linha.unidadeOrcamentariaId!,
        quantidade: linha.quantidade!,
      })),
    );
  }
}
