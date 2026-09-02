import { Location } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AnexosSecao } from '../../shared/anexos/anexos-secao';
import { Icon } from '../../shared/icons/icon';
import { DataBrPipe } from '../../shared/pipes/data-br.pipe';
import { EquipamentoAlocacao } from '../equipamento-alocacoes/equipamento-alocacao';
import { EquipamentoAlocacaoService } from '../equipamento-alocacoes/equipamento-alocacao.service';
import { Equipamento } from './equipamento';
import { EquipamentoService } from './equipamento.service';

@Component({
  selector: 'app-equipamento-form',
  imports: [ReactiveFormsModule, RouterLink, Icon, AnexosSecao, DataBrPipe],
  templateUrl: './equipamento-form.html',
  styleUrl: './equipamento-form.scss',
})
export class EquipamentoForm {
  private readonly fb = inject(FormBuilder);
  private readonly equipamentoService = inject(EquipamentoService);
  private readonly equipamentoAlocacaoService = inject(EquipamentoAlocacaoService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  protected readonly equipamentoId = Number(this.route.snapshot.paramMap.get('id'));

  protected readonly equipamento = signal<Equipamento | null>(null);
  protected readonly carregando = signal(true);
  protected readonly salvando = signal(false);
  protected readonly erro = signal<string | null>(null);
  protected readonly historicoAlocacoes = signal<EquipamentoAlocacao[]>([]);
  protected readonly carregandoHistorico = signal(true);

  protected readonly form = this.fb.nonNullable.group({
    marca: [''],
    modelo: [''],
    numeroSerie: [''],
    patrimonio: [''],
    fornecedorNome: [''],
    valorMensal: [null as number | null],
    dataFimContrato: [''],
    status: ['Disponivel' as 'Disponivel' | 'Manutencao', Validators.required],
    observacao: [''],
  });

  protected voltar(): void {
    this.location.back();
  }

  constructor() {
    this.equipamentoService.obter(this.equipamentoId).subscribe({
      next: (equipamento) => {
        this.equipamento.set(equipamento);
        this.form.patchValue({
          marca: equipamento.marca ?? '',
          modelo: equipamento.modelo ?? '',
          numeroSerie: equipamento.numeroSerie ?? '',
          patrimonio: equipamento.patrimonio ?? '',
          fornecedorNome: equipamento.fornecedorNome ?? '',
          valorMensal: equipamento.valorMensal,
          dataFimContrato: equipamento.dataFimContrato ?? '',
          status: equipamento.status === 'Manutencao' ? 'Manutencao' : 'Disponivel',
          observacao: equipamento.observacao ?? '',
        });
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set('Não foi possível carregar o equipamento.');
        this.carregando.set(false);
      },
    });

    this.equipamentoAlocacaoService.listar({ equipamentoId: this.equipamentoId, status: 'Encerrado', tamanhoPagina: 50 }).subscribe({
      next: (pagina) => {
        this.historicoAlocacoes.set(pagina.itens);
        this.carregandoHistorico.set(false);
      },
      error: () => this.carregandoHistorico.set(false),
    });
  }

  protected salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valor = this.form.getRawValue();
    const payload = {
      marca: valor.marca || null,
      modelo: valor.modelo || null,
      numeroSerie: valor.numeroSerie || null,
      patrimonio: valor.patrimonio || null,
      fornecedorNome: valor.fornecedorNome || null,
      valorMensal: valor.valorMensal,
      dataFimContrato: valor.dataFimContrato || null,
      status: valor.status,
      observacao: valor.observacao || null,
    };

    this.salvando.set(true);
    this.erro.set(null);

    this.equipamentoService.atualizar(this.equipamentoId, payload).subscribe({
      next: () => this.router.navigate(['/equipamentos/lista']),
      error: (err) => {
        this.salvando.set(false);
        this.erro.set(err?.error?.message ?? 'Não foi possível salvar o equipamento.');
      },
    });
  }
}
