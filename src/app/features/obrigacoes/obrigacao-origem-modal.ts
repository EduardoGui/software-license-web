import { DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { DataBrPipe } from '../../shared/pipes/data-br.pipe';
import { AuthService } from '../auth/auth.service';
import { ObrigacaoOrigem } from './obrigacao';
import { ObrigacaoService } from './obrigacao.service';

const ROTULO_STATUS_BM: Record<string, string> = {
  Rascunho: 'Rascunho',
  AguardandoAprovacao: 'Aguardando aprovação',
  Aprovado: 'Aprovado',
  Reprovado: 'Reprovado',
};

// Resumo somente leitura do BM ou da OC de origem, para consultar sem sair do Controle de Obrigações.
@Component({
  selector: 'app-obrigacao-origem-modal',
  imports: [RouterLink, DecimalPipe, DataBrPipe],
  templateUrl: './obrigacao-origem-modal.html',
  styleUrl: './obrigacao-origem-modal.scss',
})
export class ObrigacaoOrigemModal implements OnInit {
  private readonly obrigacaoService = inject(ObrigacaoService);
  // A tela de Contratos é só do Administrador; o link do BM só aparece para ele.
  protected readonly authService = inject(AuthService);

  readonly obrigacaoId = input.required<number>();
  readonly fechar = output<void>();

  protected readonly origem = signal<ObrigacaoOrigem | null>(null);
  protected readonly carregando = signal(true);
  protected readonly erro = signal<string | null>(null);

  ngOnInit(): void {
    this.obrigacaoService.obterOrigem(this.obrigacaoId()).subscribe({
      next: (origem) => {
        this.origem.set(origem);
        this.carregando.set(false);
      },
      error: (err) => {
        this.erro.set(err?.error?.message ?? 'Não foi possível carregar os dados.');
        this.carregando.set(false);
      },
    });
  }

  protected rotuloStatus(origem: ObrigacaoOrigem): string {
    return origem.origem === 'MedicaoBm' ? (ROTULO_STATUS_BM[origem.status] ?? origem.status) : origem.status;
  }
}
