import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { RelatorioMensalCustoLicencas, RelatorioMensalCustoLicencasFiltro } from './licenca-custo-mensal';

@Injectable({ providedIn: 'root' })
export class LicencaCustoMensalService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/licencas/relatorio-mensal`;

  gerar(filtro: RelatorioMensalCustoLicencasFiltro): Observable<RelatorioMensalCustoLicencas> {
    return this.http.get<RelatorioMensalCustoLicencas>(this.baseUrl, { params: this.construirParams(filtro) });
  }

  exportarExcel(filtro: RelatorioMensalCustoLicencasFiltro): Observable<Blob> {
    const params = this.construirParams(filtro).set('formato', 'xlsx');
    return this.http.get(this.baseUrl, { params, responseType: 'blob' });
  }

  private construirParams(filtro: RelatorioMensalCustoLicencasFiltro): HttpParams {
    let params = new HttpParams().set('ano', filtro.ano).set('mes', filtro.mes);
    if (filtro.nome) params = params.set('nome', filtro.nome);
    return params;
  }
}
