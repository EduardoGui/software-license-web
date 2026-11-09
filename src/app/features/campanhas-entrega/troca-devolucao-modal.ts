import { Component, OnInit, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  CampanhaEntrega,
  CampanhaEntregaItem,
  Entrega,
  EntregaItem,
  MotivoDevolucaoEntrega,
  ROTULOS_MOTIVO_DEVOLUCAO,
} from './campanha-entrega';
import { CampanhaEntregaService } from './campanha-entrega.service';

interface LinhaDevolvida {
  item: EntregaItem;
  /** O que a pessoa tem hoje deste item. */
  atual: number;
  quantidade: number | null;
  voltaAoEstoque: boolean;
}

interface LinhaRetirada {
  /** Id do item do catálogo; -1 = ainda não escolhido; 0 = outro item (texto livre, só campanha Kit). */
  itemId: number;
  descricao: string;
  tamanho: string;
  quantidade: number | null;
}

// Troca/devolução em entrega já Confirmada (ex.: pegou camisa G, devolveu a G e levou a P). A entrega continua Confirmada;
// fica o histórico e o saldo é recalculado: a peça devolvida que volta ao estoque libera saldo, a retirada consome.
@Component({
  selector: 'app-troca-devolucao-modal',
  imports: [FormsModule],
  templateUrl: './troca-devolucao-modal.html',
  styleUrl: './troca-devolucao-modal.scss',
})
export class TrocaDevolucaoModal implements OnInit {
  private readonly campanhaEntregaService = inject(CampanhaEntregaService);

  readonly campanha = input.required<CampanhaEntrega>();
  readonly entrega = input.required<Entrega>();
  readonly fechar = output<void>();
  readonly registrada = output<Entrega>();

  protected readonly motivos = Object.entries(ROTULOS_MOTIVO_DEVOLUCAO) as [MotivoDevolucaoEntrega, string][];

  protected data = hojeIso();
  protected motivo: MotivoDevolucaoEntrega = 'Troca';
  protected observacao = '';
  protected devolvidos: LinhaDevolvida[] = [];
  protected retirados: LinhaRetirada[] = [];
  protected readonly salvando = signal(false);
  protected readonly erro = signal<string | null>(null);

  ngOnInit(): void {
    this.devolvidos = this.entrega()
      .itens.filter((i) => i.quantidade - i.quantidadeDevolvida > 0)
      .map((item) => ({ item, atual: item.quantidade - item.quantidadeDevolvida, quantidade: null, voltaAoEstoque: true }));
    this.retirados = [novaRetirada()];
  }

  protected rotulo(descricao: string, tamanho: string | null): string {
    return tamanho ? `${descricao} (${tamanho})` : descricao;
  }

  protected ehKit(): boolean {
    return this.campanha().tipo === 'Kit';
  }

  protected itemCatalogo(linha: LinhaRetirada): CampanhaEntregaItem | undefined {
    return this.campanha().itens.find((i) => i.id === linha.itemId);
  }

  /** Quanto da peça devolvida (que volta ao estoque) libera saldo para este item do catálogo na mesma operação. */
  protected credito(itemCatalogoId: number): number {
    return this.devolvidos
      .filter((d) => d.voltaAoEstoque && d.item.campanhaEntregaItemId === itemCatalogoId)
      .reduce((soma, d) => soma + (d.quantidade ?? 0), 0);
  }

  protected adicionarRetirada(): void {
    this.retirados = [...this.retirados, novaRetirada()];
  }

  protected removerRetirada(indice: number): void {
    this.retirados = this.retirados.filter((_, i) => i !== indice);
    if (this.retirados.length === 0) {
      this.retirados = [novaRetirada()];
    }
  }

  protected salvar(): void {
    this.erro.set(null);

    if (!this.data) {
      this.erro.set('Informe a data.');
      return;
    }

    const devolvidos = this.devolvidos.filter((d) => d.quantidade !== null && d.quantidade !== undefined && d.quantidade !== 0);
    if (devolvidos.length === 0) {
      this.erro.set('Informe a quantidade devolvida de ao menos um item.');
      return;
    }

    const excesso = devolvidos.find((d) => !d.quantidade || d.quantidade < 1 || d.quantidade > d.atual);
    if (excesso) {
      this.erro.set(`Quantidade inválida para ${this.rotulo(excesso.item.descricao, excesso.item.tamanho)}: a pessoa tem ${excesso.atual}.`);
      return;
    }

    const retirados = this.retirados.filter((r) => r.quantidade !== null && r.quantidade !== undefined && r.quantidade !== 0);
    if (retirados.some((r) => !r.quantidade || r.quantidade < 1 || r.itemId === -1 || (r.itemId === 0 && !r.descricao.trim()))) {
      this.erro.set('Em cada item retirado, escolha o item (ou descreva) e informe a quantidade.');
      return;
    }

    this.salvando.set(true);
    this.campanhaEntregaService
      .registrarDevolucao(this.campanha().id, this.entrega().id, {
        data: this.data,
        motivo: this.motivo,
        observacao: this.observacao.trim() || null,
        devolvidos: devolvidos.map((d) => ({ entregaItemId: d.item.id, quantidade: d.quantidade!, voltaAoEstoque: d.voltaAoEstoque })),
        retirados: retirados.map((r) =>
          r.itemId === 0
            ? { campanhaEntregaItemId: null, descricao: r.descricao.trim(), tamanho: r.tamanho.trim() || null, quantidade: r.quantidade! }
            : { campanhaEntregaItemId: r.itemId, quantidade: r.quantidade! },
        ),
      })
      .subscribe({
        next: (entrega) => {
          this.salvando.set(false);
          this.registrada.emit(entrega);
        },
        error: (err) => {
          this.salvando.set(false);
          this.erro.set(err?.error?.message ?? 'Não foi possível registrar a troca/devolução.');
        },
      });
  }
}

function novaRetirada(): LinhaRetirada {
  return { itemId: -1, descricao: '', tamanho: '', quantidade: null };
}

function hojeIso(): string {
  const d = new Date();
  const dois = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${dois(d.getMonth() + 1)}-${dois(d.getDate())}`;
}
