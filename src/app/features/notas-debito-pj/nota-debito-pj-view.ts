import { DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AnexosSecao } from '../../shared/anexos/anexos-secao';
import { DataBrPipe } from '../../shared/pipes/data-br.pipe';
import { Icon } from '../../shared/icons/icon';
import { NotaDebitoPj } from './nota-debito-pj';
import { NotaDebitoPjService } from './nota-debito-pj.service';

@Component({
  selector: 'app-nota-debito-pj-view',
  imports: [RouterLink, FormsModule, Icon, DecimalPipe, DataBrPipe, AnexosSecao],
  templateUrl: './nota-debito-pj-view.html',
  styleUrl: './nota-debito-pj-view.scss',
})
export class NotaDebitoPjView {
  private readonly notaService = inject(NotaDebitoPjService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly nota = signal<NotaDebitoPj | null>(null);
  protected readonly carregando = signal(true);
  protected readonly erro = signal<string | null>(null);
  protected readonly processando = signal(false);
  protected readonly mostrarFormPagamento = signal(false);
  protected dataPagamento = new Date().toISOString().slice(0, 10);

  protected readonly corrigindoCompetencia = signal(false);
  protected readonly erroCompetencia = signal<string | null>(null);
  protected competenciaAno = 0;
  protected competenciaMes = 0;

  private readonly notaId = Number(this.route.snapshot.paramMap.get('id'));

  private static readonly NOMES_MESES = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];

  protected competencia(nota: NotaDebitoPj): string {
    return `${NotaDebitoPjView.NOMES_MESES[nota.mes - 1]}/${nota.ano}`;
  }

  constructor() {
    this.carregar();
  }

  private carregar(): void {
    this.carregando.set(true);
    this.notaService.obter(this.notaId).subscribe({
      next: (nota) => {
        this.nota.set(nota);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set('Não foi possível carregar a nota de débito.');
        this.carregando.set(false);
      },
    });
  }

  protected baixarPdf(): void {
    this.notaService.baixarPdf(this.notaId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `nota-debito-${String(this.notaId).padStart(4, '0')}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => alert('Não foi possível baixar o PDF.'),
    });
  }

  protected excluir(): void {
    if (!confirm('Excluir esta nota de débito?')) {
      return;
    }

    this.notaService.excluir(this.notaId).subscribe({
      next: () => this.router.navigate(['/dp/plano-saude/notas-debito']),
      error: () => alert('Não foi possível excluir a nota de débito.'),
    });
  }

  protected enviar(): void {
    if (!confirm('Enviar esta nota de débito por e-mail ao colaborador e marcá-la como enviada?')) {
      return;
    }

    this.processando.set(true);
    this.notaService.enviar(this.notaId).subscribe({
      next: (nota) => {
        this.nota.set(nota);
        this.processando.set(false);
        if (nota.avisoEmail) {
          alert(nota.avisoEmail);
        }
      },
      error: (err) => {
        this.processando.set(false);
        alert(err?.error?.message ?? 'Não foi possível marcar como enviada.');
      },
    });
  }

  protected iniciarCorrigirCompetencia(): void {
    const nota = this.nota();
    if (!nota) return;
    this.competenciaAno = nota.ano;
    this.competenciaMes = nota.mes;
    this.erroCompetencia.set(null);
    this.corrigindoCompetencia.set(true);
  }

  protected cancelarCorrigirCompetencia(): void {
    this.corrigindoCompetencia.set(false);
    this.erroCompetencia.set(null);
  }

  protected confirmarCorrigirCompetencia(): void {
    this.processando.set(true);
    this.erroCompetencia.set(null);
    this.notaService.corrigirCompetencia(this.notaId, this.competenciaAno, this.competenciaMes).subscribe({
      next: (nota) => {
        this.nota.set(nota);
        this.processando.set(false);
        this.corrigindoCompetencia.set(false);
      },
      error: (err) => {
        this.processando.set(false);
        this.erroCompetencia.set(err?.error?.message ?? 'Não foi possível corrigir a competência.');
      },
    });
  }

  protected confirmarPagamento(): void {
    this.processando.set(true);
    this.notaService.pagar(this.notaId, this.dataPagamento).subscribe({
      next: (nota) => {
        this.nota.set(nota);
        this.processando.set(false);
        this.mostrarFormPagamento.set(false);
      },
      error: (err) => {
        this.processando.set(false);
        alert(err?.error?.message ?? 'Não foi possível marcar como recebida.');
      },
    });
  }
}
