import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface SolicitacaoPagamentoAnexo {
  id: number;
  nomeArquivo: string;
  tipoConteudo: string;
  tamanho: number;
  // Mesmo "recurso" + id usados pela tela de anexos (ex.: 'despesas-avulsas', 'contratos/3/medicoes').
  recurso: string;
  entidadeId: number;
}

// Rascunho do e-mail de solicitação de pagamento (não é enviado pelo sistema).
export interface SolicitacaoPagamento {
  obrigacaoId: number;
  assunto: string;
  corpoTexto: string;
  corpoHtml: string;
  para: string[];
  cc: string[];
  dataPagamentoSugerida: string | null;
  avisos: string[];
  anexos: SolicitacaoPagamentoAnexo[];
}

@Injectable({ providedIn: 'root' })
export class SolicitacaoPagamentoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/obrigacoes`;

  gerar(obrigacaoId: number): Observable<SolicitacaoPagamento> {
    return this.http.get<SolicitacaoPagamento>(`${this.baseUrl}/${obrigacaoId}/solicitacao-pagamento`);
  }

  baixarEml(obrigacaoId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${obrigacaoId}/solicitacao-pagamento/eml`, { responseType: 'blob' });
  }
}
