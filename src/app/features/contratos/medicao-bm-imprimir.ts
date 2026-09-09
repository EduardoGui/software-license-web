import { DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';

import { Fornecedor } from '../fornecedores/fornecedor';
import { FornecedorService } from '../fornecedores/fornecedor.service';
import { DataBrPipe } from '../../shared/pipes/data-br.pipe';
import { ContratoDetalhe, MedicaoBm, MedicaoBmItem } from './contrato';
import { ContratoService } from './contrato.service';

@Component({
  selector: 'app-medicao-bm-imprimir',
  imports: [DataBrPipe, DecimalPipe],
  templateUrl: './medicao-bm-imprimir.html',
  styleUrl: './medicao-bm-imprimir.scss',
})
export class MedicaoBmImprimir {
  private readonly route = inject(ActivatedRoute);
  private readonly contratoService = inject(ContratoService);
  private readonly fornecedorService = inject(FornecedorService);
  private readonly title = inject(Title);

  protected readonly contratoId = Number(this.route.snapshot.paramMap.get('id'));
  protected readonly medicaoId = Number(this.route.snapshot.paramMap.get('medicaoId'));

  protected readonly carregando = signal(true);
  protected readonly erro = signal(false);
  protected readonly contrato = signal<ContratoDetalhe | null>(null);
  protected readonly fornecedor = signal<Fornecedor | null>(null);
  protected readonly bm = signal<MedicaoBm | null>(null);

  constructor() {
    forkJoin({
      contrato: this.contratoService.obter(this.contratoId),
      bm: this.contratoService.obterMedicao(this.contratoId, this.medicaoId),
    }).subscribe({
      next: ({ contrato, bm }) => {
        this.contrato.set(contrato);
        this.bm.set(bm);
        this.fornecedorService.obter(contrato.fornecedorId).subscribe({
          next: (fornecedor) => {
            this.fornecedor.set(fornecedor);
            this.carregando.set(false);
            // Vira o nome sugerido ao salvar como PDF pela impressão do navegador.
            const numeroBm = bm.numero.toString().padStart(3, '0');
            this.title.setTitle(`BM-${numeroBm} - ${contrato.numero} - ${fornecedor.nome.toUpperCase()}`);
          },
          error: () => this.carregando.set(false),
        });
      },
      error: () => {
        this.erro.set(true);
        this.carregando.set(false);
      },
    });
  }

  protected imprimir(): void {
    window.print();
  }

  protected numeroBmExibicao(m: MedicaoBm): string {
    return m.numeroReferencia || m.numero.toString().padStart(3, '0');
  }

  protected somaSaldoValor(itens: MedicaoBmItem[]): number {
    return itens.reduce((acumulado, item) => acumulado + item.saldoValorDepois, 0);
  }
}
