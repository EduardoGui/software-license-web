import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  CreateOrdemCompraPayload,
  OrdemCompra,
  OrdemCompraDetalhe,
  OrdemCompraFiltro,
  UpdateOrdemCompraPayload,
} from './ordem-compra';

@Injectable({ providedIn: 'root' })
export class OrdemCompraService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/ordens-compra`;

  listar(filtro: OrdemCompraFiltro = {}): Observable<OrdemCompra[]> {
    let params = new HttpParams();
    if (filtro.numero) params = params.set('numero', filtro.numero);
    if (filtro.fornecedorId) params = params.set('fornecedorId', filtro.fornecedorId);
    if (filtro.localId) params = params.set('localId', filtro.localId);
    if (filtro.status) params = params.set('status', filtro.status);

    return this.http.get<OrdemCompra[]>(this.baseUrl, { params });
  }

  obter(id: number): Observable<OrdemCompraDetalhe> {
    return this.http.get<OrdemCompraDetalhe>(`${this.baseUrl}/${id}`);
  }

  criar(payload: CreateOrdemCompraPayload): Observable<OrdemCompra> {
    return this.http.post<OrdemCompra>(this.baseUrl, payload);
  }

  atualizar(id: number, payload: UpdateOrdemCompraPayload): Observable<OrdemCompra> {
    return this.http.put<OrdemCompra>(`${this.baseUrl}/${id}`, payload);
  }

  emitir(id: number): Observable<OrdemCompra> {
    return this.http.patch<OrdemCompra>(`${this.baseUrl}/${id}/emitir`, {});
  }

  marcarAssinada(id: number): Observable<OrdemCompra> {
    return this.http.patch<OrdemCompra>(`${this.baseUrl}/${id}/marcar-assinada`, {});
  }

  cancelar(id: number): Observable<OrdemCompra> {
    return this.http.patch<OrdemCompra>(`${this.baseUrl}/${id}/cancelar`, {});
  }

  baixarPdf(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${id}/pdf`, { responseType: 'blob' });
  }
}
