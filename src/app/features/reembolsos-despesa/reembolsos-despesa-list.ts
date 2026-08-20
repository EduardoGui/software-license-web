import { DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../auth/auth.service';
import { Icon } from '../../shared/icons/icon';
import { DataBrPipe } from '../../shared/pipes/data-br.pipe';
import { ReembolsoDespesa } from './reembolso-despesa';
import { ReembolsoDespesaService } from './reembolso-despesa.service';

const STATUS_EDITAVEIS = ['Rascunho', 'DevolvidoParaRevisao'];

const ROTULOS_STATUS: Record<string, string> = {
  Rascunho: 'Rascunho',
  EnviadoParaAprovacao: 'Enviado para aprovação',
  DevolvidoParaRevisao: 'Devolvido para revisão',
  Aprovado: 'Aprovado',
  Reprovado: 'Reprovado',
};

@Component({
  selector: 'app-reembolsos-despesa-list',
  imports: [RouterLink, Icon, DataBrPipe, DecimalPipe],
  templateUrl: './reembolsos-despesa-list.html',
  styleUrl: './reembolsos-despesa-list.scss',
})
export class ReembolsosDespesaList {
  private readonly reembolsoDespesaService = inject(ReembolsoDespesaService);
  private readonly authService = inject(AuthService);

  protected readonly reembolsos = signal<ReembolsoDespesa[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal(false);
  protected readonly semUsuarioVinculado = signal(false);

  constructor() {
    const usuarioId = this.authService.obterUsuarioId();
    if (usuarioId === null) {
      this.semUsuarioVinculado.set(true);
      this.carregando.set(false);
      return;
    }

    this.reembolsoDespesaService.listar({ usuarioId }).subscribe({
      next: (reembolsos) => {
        this.reembolsos.set(reembolsos);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set(true);
        this.carregando.set(false);
      },
    });
  }

  protected editavel(reembolso: ReembolsoDespesa): boolean {
    return STATUS_EDITAVEIS.includes(reembolso.status);
  }

  protected rotuloStatus(status: string): string {
    return ROTULOS_STATUS[status] ?? status;
  }

  protected excluir(reembolso: ReembolsoDespesa): void {
    if (!confirm(`Excluir o reembolso ${reembolso.numero}?`)) {
      return;
    }

    this.reembolsoDespesaService.excluir(reembolso.id).subscribe({
      next: () => this.reembolsos.update((lista) => lista.filter((r) => r.id !== reembolso.id)),
      error: () => alert('Não foi possível excluir o reembolso.'),
    });
  }

  protected baixarPdf(reembolso: ReembolsoDespesa): void {
    this.reembolsoDespesaService.baixarPdf(reembolso.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `reembolso-${reembolso.numero}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => alert('Não foi possível baixar o PDF.'),
    });
  }

  protected enviar(reembolso: ReembolsoDespesa): void {
    if (!confirm(`Enviar o reembolso ${reembolso.numero} para aprovação?`)) {
      return;
    }

    this.reembolsoDespesaService.enviar(reembolso.id).subscribe({
      next: (atualizado) => this.reembolsos.update((lista) => lista.map((r) => (r.id === atualizado.id ? atualizado : r))),
      error: (err) => alert(err?.error?.message ?? 'Não foi possível enviar o reembolso.'),
    });
  }
}
