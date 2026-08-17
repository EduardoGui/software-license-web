import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { RelatorioMensalLocacao, RelatorioMensalLocacaoFiltro } from './relatorio-mensal-locacao';

@Injectable({ providedIn: 'root' })
export class RelatorioMensalLocacaoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/equipamentos/relatorio-mensal`;

  gerar(filtro: RelatorioMensalLocacaoFiltro): Observable<RelatorioMensalLocacao> {
    return this.http.get<RelatorioMensalLocacao>(this.baseUrl, { params: this.construirParams(filtro) });
  }

  exportarExcel(filtro: RelatorioMensalLocacaoFiltro): Observable<Blob> {
    const params = this.construirParams(filtro).set('formato', 'xlsx');
    return this.http.get(this.baseUrl, { params, responseType: 'blob' });
  }

  private construirParams(filtro: RelatorioMensalLocacaoFiltro): HttpParams {
    let params = new HttpParams().set('ano', filtro.ano).set('mes', filtro.mes);
    if (filtro.fornecedorNome) params = params.set('fornecedorNome', filtro.fornecedorNome);
    if (filtro.tipoEquipamentoId) params = params.set('tipoEquipamentoId', filtro.tipoEquipamentoId);
    return params;
  }
}
