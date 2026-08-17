import { DecimalPipe, Location } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { Icon } from '../../shared/icons/icon';
import { DataBrPipe } from '../../shared/pipes/data-br.pipe';
import { TipoEquipamento } from '../tipos-equipamento/tipo-equipamento';
import { TipoEquipamentoService } from '../tipos-equipamento/tipo-equipamento.service';
import { NotaFiscalEntradaDetalhe } from './nota-fiscal-entrada';
import { NotaFiscalEntradaService } from './nota-fiscal-entrada.service';

@Component({
  selector: 'app-nota-fiscal-entrada-view',
  imports: [ReactiveFormsModule, Icon, DataBrPipe, DecimalPipe],
  templateUrl: './nota-fiscal-entrada-view.html',
  styleUrl: './nota-fiscal-entrada-view.scss',
})
export class NotaFiscalEntradaView {
  private readonly fb = inject(FormBuilder);
  private readonly notaFiscalEntradaService = inject(NotaFiscalEntradaService);
  private readonly tipoEquipamentoService = inject(TipoEquipamentoService);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);

  private readonly notaId = Number(this.route.snapshot.paramMap.get('id'));

  protected readonly nota = signal<NotaFiscalEntradaDetalhe | null>(null);
  protected readonly tipos = signal<TipoEquipamento[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal(false);
  protected readonly salvandoItem = signal(false);
  protected readonly erroItem = signal<string | null>(null);

  protected readonly formItem = this.fb.nonNullable.group({
    tipoEquipamentoId: [0, [Validators.required, Validators.min(1)]],
    descricao: [''],
    quantidade: [1, [Validators.required, Validators.min(1)]],
    valorUnitario: [null as number | null],
    origem: ['Comprado' as 'Locado' | 'Comprado', Validators.required],
  });

  constructor() {
    this.tipoEquipamentoService.listar({ ativo: true }).subscribe((tipos) => this.tipos.set(tipos));
    this.carregar();
  }

  protected voltar(): void {
    this.location.back();
  }

  private carregar(): void {
    this.carregando.set(true);
    this.erro.set(false);

    this.notaFiscalEntradaService.obter(this.notaId).subscribe({
      next: (nota) => {
        this.nota.set(nota);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set(true);
        this.carregando.set(false);
      },
    });
  }

  protected adicionarItem(): void {
    if (this.formItem.invalid) {
      this.formItem.markAllAsTouched();
      return;
    }

    const valor = this.formItem.getRawValue();
    const payload = {
      tipoEquipamentoId: valor.tipoEquipamentoId,
      descricao: valor.descricao || null,
      quantidade: valor.quantidade,
      valorUnitario: valor.valorUnitario,
      origem: valor.origem,
    };

    this.salvandoItem.set(true);
    this.erroItem.set(null);

    this.notaFiscalEntradaService.adicionarItem(this.notaId, payload).subscribe({
      next: () => {
        this.salvandoItem.set(false);
        this.formItem.reset({ tipoEquipamentoId: 0, descricao: '', quantidade: 1, valorUnitario: null, origem: 'Comprado' });
        this.carregar();
      },
      error: (err) => {
        this.salvandoItem.set(false);
        this.erroItem.set(err?.error?.message ?? 'Não foi possível adicionar o item.');
      },
    });
  }
}
