import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { PatrimonioItem, PatrimonioItemFiltro, PatrimonioItemPayload } from './patrimonio-item';

@Injectable({ providedIn: 'root' })
export class PatrimonioItemService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/patrimonio-itens`;

  listar(filtro: PatrimonioItemFiltro = {}): Observable<PatrimonioItem[]> {
    return this.http.get<PatrimonioItem[]>(this.baseUrl, { params: this.construirParams(filtro) });
  }

  exportarExcel(filtro: PatrimonioItemFiltro = {}): Observable<Blob> {
    const params = this.construirParams(filtro).set('formato', 'xlsx');
    return this.http.get(this.baseUrl, { params, responseType: 'blob' });
  }

  private construirParams(filtro: PatrimonioItemFiltro): HttpParams {
    let params = new HttpParams();
    if (filtro.tipoPatrimonioId) params = params.set('tipoPatrimonioId', filtro.tipoPatrimonioId);
    if (filtro.localId) params = params.set('localId', filtro.localId);
    if (filtro.status) params = params.set('status', filtro.status);
    if (filtro.notaFiscalEntradaId) params = params.set('notaFiscalEntradaId', filtro.notaFiscalEntradaId);
    return params;
  }

  obter(id: number): Observable<PatrimonioItem> {
    return this.http.get<PatrimonioItem>(`${this.baseUrl}/${id}`);
  }

  atualizar(id: number, payload: PatrimonioItemPayload): Observable<PatrimonioItem> {
    return this.http.put<PatrimonioItem>(`${this.baseUrl}/${id}`, payload);
  }

  baixar(id: number): Observable<PatrimonioItem> {
    return this.http.patch<PatrimonioItem>(`${this.baseUrl}/${id}/baixar`, {});
  }
}
