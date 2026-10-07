import { Component, OnInit, inject, input, output, signal } from '@angular/core';

import { Anexo } from '../../shared/anexos/anexo';
import { AnexoService } from '../../shared/anexos/anexo.service';
import { Icon } from '../../shared/icons/icon';
import { Obrigacao } from './obrigacao';
import { ObrigacaoService } from './obrigacao.service';
import { SolicitacaoPagamento, SolicitacaoPagamentoAnexo, SolicitacaoPagamentoService } from './solicitacao-pagamento';

type CampoCopiado = 'para' | 'cc' | 'assunto' | 'corpo';

// Rascunho do e-mail "Solicitação de Pagamento" ao financeiro: mostra o que será enviado, deixa copiar/colar,
// baixar os anexos e o rascunho .eml. O sistema não envia o e-mail.
@Component({
  selector: 'app-solicitacao-pagamento-modal',
  imports: [Icon],
  templateUrl: './solicitacao-pagamento-modal.html',
  styleUrl: './solicitacao-pagamento-modal.scss',
})
export class SolicitacaoPagamentoModal implements OnInit {
  private readonly solicitacaoService = inject(SolicitacaoPagamentoService);
  private readonly obrigacaoService = inject(ObrigacaoService);
  private readonly anexoService = inject(AnexoService);

  readonly obrigacaoId = input.required<number>();
  readonly fechar = output<void>();
  readonly enviada = output<Obrigacao>();

  protected readonly solicitacao = signal<SolicitacaoPagamento | null>(null);
  protected readonly carregando = signal(true);
  protected readonly erro = signal<string | null>(null);
  protected readonly copiado = signal<CampoCopiado | null>(null);
  protected readonly baixando = signal(false);
  protected readonly marcando = signal(false);

  ngOnInit(): void {
    this.solicitacaoService.gerar(this.obrigacaoId()).subscribe({
      next: (s) => {
        this.solicitacao.set(s);
        this.carregando.set(false);
      },
      error: (err) => {
        this.erro.set(err?.error?.message ?? 'Não foi possível gerar a solicitação de pagamento.');
        this.carregando.set(false);
      },
    });
  }

  protected async copiar(campo: CampoCopiado): Promise<void> {
    const s = this.solicitacao();
    if (!s) return;

    const texto = { para: s.para.join('; '), cc: s.cc.join('; '), assunto: s.assunto, corpo: s.corpoTexto }[campo];

    try {
      if (campo === 'corpo' && typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
        // Copia com formatação (negrito) para colar direto no e-mail, com texto puro como alternativa.
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/html': new Blob([s.corpoHtml], { type: 'text/html' }),
            'text/plain': new Blob([s.corpoTexto], { type: 'text/plain' }),
          }),
        ]);
      } else {
        await navigator.clipboard.writeText(texto);
      }
      this.copiado.set(campo);
      setTimeout(() => this.copiado.set(null), 2000);
    } catch {
      this.erro.set('Não foi possível copiar automaticamente. Selecione o texto e copie manualmente.');
    }
  }

  protected baixarAnexo(anexo: SolicitacaoPagamentoAnexo): void {
    this.anexoService.baixar(anexo.recurso, anexo.entidadeId, anexo.id).subscribe({
      next: (blob) => this.salvarArquivo(blob, anexo.nomeArquivo),
      error: () => this.erro.set('Não foi possível baixar o anexo.'),
    });
  }

  protected baixarEml(): void {
    this.baixando.set(true);
    this.solicitacaoService.baixarEml(this.obrigacaoId()).subscribe({
      next: (blob) => {
        this.baixando.set(false);
        this.salvarArquivo(blob, `solicitacao-pagamento-${this.obrigacaoId()}.eml`);
      },
      error: () => {
        this.baixando.set(false);
        this.erro.set('Não foi possível gerar o rascunho (.eml).');
      },
    });
  }

  protected marcarEnviado(): void {
    const s = this.solicitacao();
    if (!s || !confirm('Marcar como enviado ao financeiro? Será gravada a data de hoje e a data de pagamento sugerida.')) {
      return;
    }

    this.marcando.set(true);
    this.erro.set(null);
    this.obrigacaoService.marcarEnviadaFinanceiro(this.obrigacaoId(), s.dataPagamentoSugerida).subscribe({
      next: (obrigacao) => {
        this.marcando.set(false);
        this.enviada.emit(obrigacao);
        this.fechar.emit();
      },
      error: (err) => {
        this.marcando.set(false);
        this.erro.set(err?.error?.message ?? 'Não foi possível marcar como enviado.');
      },
    });
  }

  protected tamanhoLegivel(anexo: Pick<Anexo, 'tamanho'>): string {
    return anexo.tamanho >= 1024 * 1024
      ? `${(anexo.tamanho / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.max(1, Math.round(anexo.tamanho / 1024))} KB`;
  }

  private salvarArquivo(blob: Blob, nome: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nome;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
