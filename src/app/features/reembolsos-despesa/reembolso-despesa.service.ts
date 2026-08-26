import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ReembolsoDespesa, ReembolsoDespesaFiltro, ReembolsoDespesaPayload } from './reembolso-despesa';

@Injectable({ providedIn: 'root' })
export class ReembolsoDespesaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/reembolsos-despesa`;

  listar(filtro: ReembolsoDespesaFiltro = {}): Observable<ReembolsoDespesa[]> {
    let params = new HttpParams();
    if (filtro.usuarioId !== undefined) params = params.set('usuarioId', filtro.usuarioId);
    if (filtro.status) params = params.set('status', filtro.status);

    return this.http.get<ReembolsoDespesa[]>(this.baseUrl, { params });
  }

  obter(id: number): Observable<ReembolsoDespesa> {
    return this.http.get<ReembolsoDespesa>(`${this.baseUrl}/${id}`);
  }

  criar(payload: ReembolsoDespesaPayload): Observable<ReembolsoDespesa> {
    return this.http.post<ReembolsoDespesa>(this.baseUrl, payload);
  }

  atualizar(id: number, payload: ReembolsoDespesaPayload): Observable<ReembolsoDespesa> {
    return this.http.put<ReembolsoDespesa>(`${this.baseUrl}/${id}`, payload);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  enviar(id: number): Observable<ReembolsoDespesa> {
    return this.http.patch<ReembolsoDespesa>(`${this.baseUrl}/${id}/enviar`, {});
  }

  listarPendentesAprovacao(): Observable<ReembolsoDespesa[]> {
    return this.http.get<ReembolsoDespesa[]>(`${this.baseUrl}/pendentes-aprovacao`);
  }

  listarAprovadosPorMim(): Observable<ReembolsoDespesa[]> {
    return this.http.get<ReembolsoDespesa[]>(`${this.baseUrl}/aprovados-por-mim`);
  }

  aprovar(id: number): Observable<ReembolsoDespesa> {
    return this.http.patch<ReembolsoDespesa>(`${this.baseUrl}/${id}/aprovar`, {});
  }

  devolver(id: number, observacaoAprovador: string): Observable<ReembolsoDespesa> {
    return this.http.patch<ReembolsoDespesa>(`${this.baseUrl}/${id}/devolver`, { observacaoAprovador });
  }

  reprovar(id: number, observacaoAprovador: string | null): Observable<ReembolsoDespesa> {
    return this.http.patch<ReembolsoDespesa>(`${this.baseUrl}/${id}/reprovar`, { observacaoAprovador });
  }

  baixarPdf(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${id}/pdf`, { responseType: 'blob' });
  }
}
