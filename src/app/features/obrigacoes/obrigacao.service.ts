import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Obrigacao, ObrigacaoFiltro, UpdateObrigacaoPayload } from './obrigacao';

@Injectable({ providedIn: 'root' })
export class ObrigacaoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/obrigacoes`;

  listar(filtro: ObrigacaoFiltro = {}): Observable<Obrigacao[]> {
    let params = new HttpParams();
    if (filtro.competenciaDe) params = params.set('competenciaDe', filtro.competenciaDe);
    if (filtro.competenciaAte) params = params.set('competenciaAte', filtro.competenciaAte);
    if (filtro.tipoMovimento) params = params.set('tipoMovimento', filtro.tipoMovimento);
    if (filtro.fornecedorId) params = params.set('fornecedorId', filtro.fornecedorId);
    if (filtro.etapa) params = params.set('etapa', filtro.etapa);
    if (filtro.pago !== undefined) params = params.set('pago', filtro.pago);
    if (filtro.cancelada !== undefined) params = params.set('cancelada', filtro.cancelada);

    return this.http.get<Obrigacao[]>(this.baseUrl, { params });
  }

  obter(id: number): Observable<Obrigacao> {
    return this.http.get<Obrigacao>(`${this.baseUrl}/${id}`);
  }

  atualizar(id: number, payload: UpdateObrigacaoPayload): Observable<Obrigacao> {
    return this.http.put<Obrigacao>(`${this.baseUrl}/${id}`, payload);
  }

  marcarPaga(id: number): Observable<Obrigacao> {
    return this.http.patch<Obrigacao>(`${this.baseUrl}/${id}/marcar-paga`, {});
  }

  desmarcarPaga(id: number): Observable<Obrigacao> {
    return this.http.patch<Obrigacao>(`${this.baseUrl}/${id}/desmarcar-paga`, {});
  }

  cancelar(id: number): Observable<Obrigacao> {
    return this.http.patch<Obrigacao>(`${this.baseUrl}/${id}/cancelar`, {});
  }
}
