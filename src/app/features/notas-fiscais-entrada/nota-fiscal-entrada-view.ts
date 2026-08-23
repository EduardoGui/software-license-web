import { DecimalPipe, Location } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { AnexosSecao } from '../../shared/anexos/anexos-secao';
import { Icon } from '../../shared/icons/icon';
import { DataBrPipe } from '../../shared/pipes/data-br.pipe';
import { Local } from '../locais/local';
import { LocalService } from '../locais/local.service';
import { TipoEquipamento } from '../tipos-equipamento/tipo-equipamento';
import { TipoEquipamentoService } from '../tipos-equipamento/tipo-equipamento.service';
import { TipoPatrimonio } from '../tipos-patrimonio/tipo-patrimonio';
import { TipoPatrimonioService } from '../tipos-patrimonio/tipo-patrimonio.service';
import { NotaFiscalEntradaDetalhe } from './nota-fiscal-entrada';
import { NotaFiscalEntradaService } from './nota-fiscal-entrada.service';

@Component({
  selector: 'app-nota-fiscal-entrada-view',
  imports: [ReactiveFormsModule, Icon, DataBrPipe, DecimalPipe, RouterLink, AnexosSecao],
  templateUrl: './nota-fiscal-entrada-view.html',
  styleUrl: './nota-fiscal-entrada-view.scss',
})
export class NotaFiscalEntradaView {
  private readonly fb = inject(FormBuilder);
  private readonly notaFiscalEntradaService = inject(NotaFiscalEntradaService);
  private readonly tipoEquipamentoService = inject(TipoEquipamentoService);
  private readonly tipoPatrimonioService = inject(TipoPatrimonioService);
  private readonly localService = inject(LocalService);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);

  protected readonly notaId = Number(this.route.snapshot.paramMap.get('id'));

  protected readonly nota = signal<NotaFiscalEntradaDetalhe | null>(null);
  protected readonly tipos = signal<TipoEquipamento[]>([]);
  protected readonly tiposPatrimonio = signal<TipoPatrimonio[]>([]);
  protected readonly locais = signal<Local[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal(false);
  protected readonly salvandoItem = signal(false);
  protected readonly erroItem = signal<string | null>(null);

  protected readonly temItemEquipamento = computed(() => (this.nota()?.itens ?? []).some((item) => item.destino !== 'Patrimonio'));
  protected readonly temItemPatrimonio = computed(() => (this.nota()?.itens ?? []).some((item) => item.destino === 'Patrimonio'));

  protected readonly formItem = this.fb.nonNullable.group({
    destino: ['Equipamento' as 'Equipamento' | 'Patrimonio', Validators.required],
    tipoEquipamentoId: [0],
    tipoPatrimonioId: [0],
    localId: [null as number | null],
    descricao: [''],
    quantidade: [1, [Validators.required, Validators.min(1)]],
    valorUnitario: [null as number | null],
    origem: ['Comprado' as 'Locado' | 'Comprado', Validators.required],
  });

  constructor() {
    this.tipoEquipamentoService.listar({ ativo: true }).subscribe((tipos) => this.tipos.set(tipos));
    this.tipoPatrimonioService.listar({ ativo: true }).subscribe((tipos) => this.tiposPatrimonio.set(tipos));
    this.localService.listar({ ativo: true }).subscribe((locais) => this.locais.set(locais));
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

    if (valor.destino === 'Equipamento' && !valor.tipoEquipamentoId) {
      this.erroItem.set('Selecione o tipo de equipamento.');
      return;
    }

    if (valor.destino === 'Patrimonio' && !valor.tipoPatrimonioId) {
      this.erroItem.set('Selecione o tipo de patrimônio.');
      return;
    }

    const payload = {
      destino: valor.destino,
      tipoEquipamentoId: valor.destino === 'Equipamento' ? valor.tipoEquipamentoId : null,
      tipoPatrimonioId: valor.destino === 'Patrimonio' ? valor.tipoPatrimonioId : null,
      localId: valor.destino === 'Patrimonio' ? valor.localId : null,
      descricao: valor.descricao || null,
      quantidade: valor.quantidade,
      valorUnitario: valor.valorUnitario,
      origem: valor.destino === 'Equipamento' ? valor.origem : null,
    };

    this.salvandoItem.set(true);
    this.erroItem.set(null);

    this.notaFiscalEntradaService.adicionarItem(this.notaId, payload).subscribe({
      next: () => {
        this.salvandoItem.set(false);
        this.formItem.reset({
          destino: 'Equipamento',
          tipoEquipamentoId: 0,
          tipoPatrimonioId: 0,
          localId: null,
          descricao: '',
          quantidade: 1,
          valorUnitario: null,
          origem: 'Comprado',
        });
        this.carregar();
      },
      error: (err) => {
        this.salvandoItem.set(false);
        this.erroItem.set(err?.error?.message ?? 'Não foi possível adicionar o item.');
      },
    });
  }
}
