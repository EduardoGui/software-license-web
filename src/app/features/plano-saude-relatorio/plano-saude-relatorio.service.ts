import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { RelatorioMensalPlanoSaude, RelatorioMensalPlanoSaudeFiltro } from './plano-saude-relatorio';

@Injectable({ providedIn: 'root' })
export class PlanoSaudeRelatorioService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/plano-saude-custos/relatorio-mensal`;

  gerar(filtro: RelatorioMensalPlanoSaudeFiltro): Observable<RelatorioMensalPlanoSaude> {
    return this.http.get<RelatorioMensalPlanoSaude>(this.baseUrl, { params: this.construirParams(filtro) });
  }

  exportarExcel(filtro: RelatorioMensalPlanoSaudeFiltro): Observable<Blob> {
    const params = this.construirParams(filtro).set('formato', 'xlsx');
    return this.http.get(this.baseUrl, { params, responseType: 'blob' });
  }

  private construirParams(filtro: RelatorioMensalPlanoSaudeFiltro): HttpParams {
    let params = new HttpParams().set('ano', filtro.ano).set('mes', filtro.mes);
    if (filtro.nome) params = params.set('nome', filtro.nome);
    return params;
  }
}
