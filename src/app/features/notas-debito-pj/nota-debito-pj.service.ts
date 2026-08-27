import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  CreateNotaDebitoPjPayload,
  NotaDebitoPj,
  NotaDebitoPjFiltro,
  UpdateNotaDebitoPjPayload,
} from './nota-debito-pj';

@Injectable({ providedIn: 'root' })
export class NotaDebitoPjService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/notas-debito-pj`;

  listar(filtro: NotaDebitoPjFiltro = {}): Observable<NotaDebitoPj[]> {
    let params = new HttpParams();
    if (filtro.ano) params = params.set('ano', filtro.ano);
    if (filtro.mes) params = params.set('mes', filtro.mes);
    if (filtro.usuarioId) params = params.set('usuarioId', filtro.usuarioId);
    if (filtro.status) params = params.set('status', filtro.status);

    return this.http.get<NotaDebitoPj[]>(this.baseUrl, { params });
  }

  obter(id: number): Observable<NotaDebitoPj> {
    return this.http.get<NotaDebitoPj>(`${this.baseUrl}/${id}`);
  }

  criar(payload: CreateNotaDebitoPjPayload): Observable<NotaDebitoPj> {
    return this.http.post<NotaDebitoPj>(this.baseUrl, payload);
  }

  atualizar(id: number, payload: UpdateNotaDebitoPjPayload): Observable<NotaDebitoPj> {
    return this.http.put<NotaDebitoPj>(`${this.baseUrl}/${id}`, payload);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  enviar(id: number): Observable<NotaDebitoPj> {
    return this.http.patch<NotaDebitoPj>(`${this.baseUrl}/${id}/enviar`, {});
  }

  pagar(id: number, dataPagamento: string): Observable<NotaDebitoPj> {
    return this.http.patch<NotaDebitoPj>(`${this.baseUrl}/${id}/pagar`, { dataPagamento });
  }

  baixarPdf(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${id}/pdf`, { responseType: 'blob' });
  }
}
