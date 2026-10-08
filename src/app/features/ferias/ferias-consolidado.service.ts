import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { FeriasAcompanhamento, FeriasAcompanhamentoFiltro } from './ferias-acompanhamento';
import { FeriasCalendarioFiltro, FeriasCalendarioUsuario } from './ferias-calendario';
import { FeriasDashboard } from './ferias-dashboard';

@Injectable({ providedIn: 'root' })
export class FeriasConsolidadoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/ferias`;

  obterDashboard(): Observable<FeriasDashboard> {
    return this.http.get<FeriasDashboard>(`${this.baseUrl}/dashboard`);
  }

  obterAcompanhamento(filtro: FeriasAcompanhamentoFiltro = {}): Observable<FeriasAcompanhamento> {
    return this.http.get<FeriasAcompanhamento>(`${this.baseUrl}/acompanhamento`, { params: this.paramsAcompanhamento(filtro) });
  }

  exportarAcompanhamentoExcel(filtro: FeriasAcompanhamentoFiltro = {}): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/acompanhamento/excel`, { params: this.paramsAcompanhamento(filtro), responseType: 'blob' });
  }

  private paramsAcompanhamento(filtro: FeriasAcompanhamentoFiltro): HttpParams {
    let params = new HttpParams();
    if (filtro.nome?.trim()) params = params.set('nome', filtro.nome.trim());
    if (filtro.setorId) params = params.set('setorId', filtro.setorId);
    if (filtro.situacao) params = params.set('situacao', filtro.situacao);
    return params;
  }

  obterCalendario(filtro: FeriasCalendarioFiltro = {}): Observable<FeriasCalendarioUsuario[]> {
    let params = new HttpParams();
    if (filtro.de) params = params.set('de', filtro.de);
    if (filtro.ate) params = params.set('ate', filtro.ate);
    if (filtro.setorId) params = params.set('setorId', filtro.setorId);
    if (filtro.usuarioId) params = params.set('usuarioId', filtro.usuarioId);

    return this.http.get<FeriasCalendarioUsuario[]>(`${this.baseUrl}/calendario`, { params });
  }
}
