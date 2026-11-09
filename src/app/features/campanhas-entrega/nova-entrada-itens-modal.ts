import { Component, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { CampanhaEntrega, CampanhaEntregaItem } from './campanha-entrega';
import { CampanhaEntregaService } from './campanha-entrega.service';

interface LinhaEntrada {
  /** Id do item do catálogo; 0 = item novo (informe descrição e tamanho). */
  itemId: number;
  descricao: string;
  tamanho: string;
  quantidade: number | null;
}

// "Nova entrada de itens comprados": soma uma remessa ao estoque da MESMA campanha. O estoque anterior (informado na criação)
// continua valendo; o saldo passa a ser estoque anterior + entradas - o que já foi atribuído.
@Component({
  selector: 'app-nova-entrada-itens-modal',
  imports: [FormsModule],
  templateUrl: './nova-entrada-itens-modal.html',
  styleUrl: './nova-entrada-itens-modal.scss',
})
export class NovaEntradaItensModal {
  private readonly campanhaEntregaService = inject(CampanhaEntregaService);

  readonly campanha = input.required<CampanhaEntrega>();
  readonly fechar = output<void>();
  readonly registrada = output<CampanhaEntrega>();

  protected data = hojeIso();
  protected observacao = '';
  protected linhas: LinhaEntrada[] = [novaLinha()];
  protected readonly salvando = signal(false);
  protected readonly erro = signal<string | null>(null);

  /** Itens que já controlam estoque (só neles dá para dar entrada; o resto precisa de um estoque anterior, mesmo 0). */
  protected itensComEstoque(): CampanhaEntregaItem[] {
    return this.campanha().itens.filter((i) => i.estoqueTotal !== null);
  }

  protected itensSemEstoque(): CampanhaEntregaItem[] {
    return this.campanha().itens.filter((i) => i.estoqueTotal === null);
  }

  protected rotulo(item: CampanhaEntregaItem): string {
    return item.tamanho ? `${item.descricao} (${item.tamanho})` : item.descricao;
  }

  protected item(linha: LinhaEntrada): CampanhaEntregaItem | undefined {
    return this.campanha().itens.find((i) => i.id === linha.itemId);
  }

  protected adicionarLinha(): void {
    this.linhas = [...this.linhas, novaLinha()];
  }

  protected removerLinha(indice: number): void {
    this.linhas = this.linhas.filter((_, i) => i !== indice);
    if (this.linhas.length === 0) {
      this.linhas = [novaLinha()];
    }
  }

  protected salvar(): void {
    this.erro.set(null);

    if (!this.data) {
      this.erro.set('Informe a data da entrada.');
      return;
    }

    const preenchidas = this.linhas.filter((l) => l.quantidade !== null && l.quantidade !== undefined);
    if (preenchidas.length === 0 || preenchidas.some((l) => !l.quantidade || l.quantidade < 1)) {
      this.erro.set('Informe a quantidade (maior que zero) de cada item que está entrando.');
      return;
    }

    if (preenchidas.some((l) => l.itemId === 0 && !l.descricao.trim())) {
      this.erro.set('Informe a descrição dos itens novos.');
      return;
    }

    this.salvando.set(true);
    this.campanhaEntregaService
      .registrarEntrada(this.campanha().id, {
        data: this.data,
        observacao: this.observacao.trim() || null,
        itens: preenchidas.map((l) => ({
          campanhaEntregaItemId: l.itemId === 0 ? null : l.itemId,
          descricao: l.itemId === 0 ? l.descricao.trim() : null,
          tamanho: l.itemId === 0 ? l.tamanho.trim() || null : null,
          quantidade: l.quantidade!,
        })),
      })
      .subscribe({
        next: (campanha) => {
          this.salvando.set(false);
          this.registrada.emit(campanha);
        },
        error: (err) => {
          this.salvando.set(false);
          this.erro.set(err?.error?.message ?? 'Não foi possível registrar a entrada.');
        },
      });
  }
}

function novaLinha(): LinhaEntrada {
  return { itemId: -1, descricao: '', tamanho: '', quantidade: null };
}

function hojeIso(): string {
  const d = new Date();
  const dois = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${dois(d.getMonth() + 1)}-${dois(d.getDate())}`;
}
