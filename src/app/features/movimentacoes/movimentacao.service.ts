import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  EditarMovimentacaoEncerradaPayload,
  EncerrarMovimentacaoPayload,
  Movimentacao,
  MovimentacaoFiltro,
  MovimentacaoPayload,
  PaginaMovimentacoes,
} from './movimentacao';

@Injectable({ providedIn: 'root' })
export class MovimentacaoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/movimentacoes`;

  listar(filtro: MovimentacaoFiltro = {}): Observable<PaginaMovimentacoes> {
    let params = new HttpParams();
    if (filtro.usuarioId) params = params.set('usuarioId', filtro.usuarioId);
    if (filtro.licencaId) params = params.set('licencaId', filtro.licencaId);
    if (filtro.dataInicial) params = params.set('dataInicial', filtro.dataInicial);
    if (filtro.dataFinal) params = params.set('dataFinal', filtro.dataFinal);
    if (filtro.status) params = params.set('status', filtro.status);
    params = params.set('pagina', filtro.pagina ?? 1);
    params = params.set('tamanhoPagina', filtro.tamanhoPagina ?? 10);

    return this.http.get<PaginaMovimentacoes>(this.baseUrl, { params });
  }

  alocar(payload: MovimentacaoPayload): Observable<Movimentacao> {
    return this.http.post<Movimentacao>(this.baseUrl, payload);
  }

  encerrar(id: number, payload: EncerrarMovimentacaoPayload): Observable<Movimentacao> {
    return this.http.patch<Movimentacao>(`${this.baseUrl}/${id}/encerrar`, payload);
  }

  editarEncerramento(id: number, payload: EditarMovimentacaoEncerradaPayload): Observable<Movimentacao> {
    return this.http.patch<Movimentacao>(`${this.baseUrl}/${id}/editar-encerramento`, payload);
  }
}
