import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Icon } from '../../shared/icons/icon';
import { PlanoSaudeMes, PlanoSaudeMesFiltro, SalvarPlanoSaudeMesItem } from './plano-saude-custo';
import { PlanoSaudeCustoService } from './plano-saude-custo.service';

const NOMES_MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const NOMES_TIPO: Record<string, string> = { Pj: 'PJ', Clt: 'CLT', Estagio: 'Estágio' };

@Component({
  selector: 'app-plano-saude-custos-page',
  imports: [FormsModule, Icon],
  templateUrl: './plano-saude-custos-page.html',
  styleUrl: './plano-saude-custos-page.scss',
})
export class PlanoSaudeCustosPage {
  private readonly custoService = inject(PlanoSaudeCustoService);

  protected readonly nomesMeses = NOMES_MESES;
  protected readonly anosDisponiveis = this.calcularAnosDisponiveis();

  protected readonly mes = signal<PlanoSaudeMes | null>(null);
  protected readonly carregando = signal(true);
  protected readonly erro = signal(false);
  protected readonly salvando = signal(false);
  protected readonly salvo = signal(false);

  protected filtro: PlanoSaudeMesFiltro = this.filtroPadrao();

  constructor() {
    this.buscar();
  }

  private filtroPadrao(): PlanoSaudeMesFiltro {
    const hoje = new Date();
    return { ano: hoje.getFullYear(), mes: hoje.getMonth() + 1 };
  }

  private calcularAnosDisponiveis(): number[] {
    const anoAtual = new Date().getFullYear();
    return [anoAtual - 1, anoAtual, anoAtual + 1];
  }

  protected nomeTipo(tipo: string | null): string {
    return tipo ? (NOMES_TIPO[tipo] ?? tipo) : '';
  }

  protected buscar(): void {
    this.carregando.set(true);
    this.erro.set(false);
    this.salvo.set(false);

    this.custoService.obterMes(this.filtro).subscribe({
      next: (mes) => {
        this.mes.set(mes);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set(true);
        this.carregando.set(false);
      },
    });
  }

  protected limparFiltro(): void {
    this.filtro = this.filtroPadrao();
    this.buscar();
  }

  protected salvar(): void {
    const mes = this.mes();
    if (!mes) {
      return;
    }

    const itens: SalvarPlanoSaudeMesItem[] = [];
    for (const usuario of mes.usuarios) {
      if (usuario.lancamentoId !== null || usuario.valorMensal !== null || usuario.valorCoparticipacao !== null) {
        itens.push({
          usuarioId: usuario.usuarioId,
          dependenteId: null,
          valorMensal: usuario.valorMensal ?? 0,
          valorCoparticipacao: usuario.valorCoparticipacao ?? 0,
        });
      }

      for (const dependente of usuario.dependentes) {
        if (dependente.lancamentoId !== null || dependente.valorMensal !== null || dependente.valorCoparticipacao !== null) {
          itens.push({
            usuarioId: usuario.usuarioId,
            dependenteId: dependente.dependenteId,
            valorMensal: dependente.valorMensal ?? 0,
            valorCoparticipacao: dependente.valorCoparticipacao ?? 0,
          });
        }
      }
    }

    this.salvando.set(true);
    this.salvo.set(false);

    this.custoService.salvarMes({ ano: mes.ano, mes: mes.mes, itens }).subscribe({
      next: (atualizado) => {
        this.mes.set(atualizado);
        this.salvando.set(false);
        this.salvo.set(true);
      },
      error: () => {
        this.salvando.set(false);
        alert('Não foi possível salvar os lançamentos.');
      },
    });
  }

  protected removerLancamentoTitular(usuarioId: number, lancamentoId: number): void {
    if (!confirm('Remover este lançamento?')) {
      return;
    }

    this.custoService.remover(lancamentoId).subscribe({
      next: () => {
        const mes = this.mes();
        const usuario = mes?.usuarios.find((u) => u.usuarioId === usuarioId);
        if (usuario) {
          usuario.lancamentoId = null;
          usuario.valorMensal = null;
          usuario.valorCoparticipacao = null;
        }
      },
      error: () => alert('Não foi possível remover o lançamento.'),
    });
  }

  protected removerLancamentoDependente(dependenteId: number, lancamentoId: number): void {
    if (!confirm('Remover este lançamento?')) {
      return;
    }

    this.custoService.remover(lancamentoId).subscribe({
      next: () => {
        const mes = this.mes();
        for (const usuario of mes?.usuarios ?? []) {
          const dependente = usuario.dependentes.find((d) => d.dependenteId === dependenteId);
          if (dependente) {
            dependente.lancamentoId = null;
            dependente.valorMensal = null;
            dependente.valorCoparticipacao = null;
          }
        }
      },
      error: () => alert('Não foi possível remover o lançamento.'),
    });
  }
}
