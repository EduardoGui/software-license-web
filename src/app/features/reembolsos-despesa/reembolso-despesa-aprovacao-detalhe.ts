import { DecimalPipe, Location } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Icon } from '../../shared/icons/icon';
import { DataBrPipe } from '../../shared/pipes/data-br.pipe';
import { ComprovanteItem } from './comprovante-item';
import { ReembolsoDespesa } from './reembolso-despesa';
import { ReembolsoDespesaService } from './reembolso-despesa.service';

const ROTULOS_STATUS: Record<string, string> = {
  Rascunho: 'Rascunho',
  EnviadoParaAprovacao: 'Enviado para aprovação',
  DevolvidoParaRevisao: 'Devolvido para revisão',
  Aprovado: 'Aprovado',
  Reprovado: 'Reprovado',
};

@Component({
  selector: 'app-reembolso-despesa-aprovacao-detalhe',
  imports: [Icon, DataBrPipe, DecimalPipe, ComprovanteItem],
  templateUrl: './reembolso-despesa-aprovacao-detalhe.html',
  styleUrl: './reembolso-despesa-aprovacao-detalhe.scss',
})
export class ReembolsoDespesaAprovacaoDetalhe {
  private readonly reembolsoDespesaService = inject(ReembolsoDespesaService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  private readonly reembolsoId = Number(this.route.snapshot.paramMap.get('id'));

  protected readonly reembolso = signal<ReembolsoDespesa | null>(null);
  protected readonly carregando = signal(true);
  protected readonly erro = signal<string | null>(null);

  constructor() {
    this.reembolsoDespesaService.obter(this.reembolsoId).subscribe({
      next: (reembolso) => {
        this.reembolso.set(reembolso);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set('Não foi possível carregar o reembolso.');
        this.carregando.set(false);
      },
    });
  }

  protected rotuloStatus(status: string): string {
    return ROTULOS_STATUS[status] ?? status;
  }

  protected voltar(): void {
    this.location.back();
  }

  protected aprovar(): void {
    const reembolso = this.reembolso();
    if (!reembolso || !confirm(`Aprovar o reembolso ${reembolso.numero} de ${reembolso.usuarioNome}?`)) {
      return;
    }

    this.reembolsoDespesaService.aprovar(reembolso.id).subscribe({
      next: () => this.router.navigate(['/reembolsos-despesa/pendentes']),
      error: (err) => alert(err?.error?.message ?? 'Não foi possível aprovar o reembolso.'),
    });
  }

  protected devolver(): void {
    const reembolso = this.reembolso();
    if (!reembolso) {
      return;
    }
    this.router.navigate(['/reembolsos-despesa', reembolso.id, 'devolver'], {
      state: { numero: reembolso.numero, usuarioNome: reembolso.usuarioNome },
    });
  }

  protected reprovar(): void {
    const reembolso = this.reembolso();
    if (!reembolso) {
      return;
    }
    this.router.navigate(['/reembolsos-despesa', reembolso.id, 'reprovar'], {
      state: { numero: reembolso.numero, usuarioNome: reembolso.usuarioNome },
    });
  }
}
