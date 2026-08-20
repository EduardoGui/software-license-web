import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { TipoDespesa, TipoDespesaFiltro, TipoDespesaPayload } from './tipo-despesa';

@Injectable({ providedIn: 'root' })
export class TipoDespesaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/tipos-despesa`;

  listar(filtro: TipoDespesaFiltro = {}): Observable<TipoDespesa[]> {
    let params = new HttpParams();
    if (filtro.nome) params = params.set('nome', filtro.nome);
    if (filtro.ativo !== undefined) params = params.set('ativo', filtro.ativo);

    return this.http.get<TipoDespesa[]>(this.baseUrl, { params });
  }

  obter(id: number): Observable<TipoDespesa> {
    return this.http.get<TipoDespesa>(`${this.baseUrl}/${id}`);
  }

  criar(payload: TipoDespesaPayload): Observable<TipoDespesa> {
    return this.http.post<TipoDespesa>(this.baseUrl, payload);
  }

  atualizar(id: number, payload: TipoDespesaPayload): Observable<TipoDespesa> {
    return this.http.put<TipoDespesa>(`${this.baseUrl}/${id}`, payload);
  }
}
