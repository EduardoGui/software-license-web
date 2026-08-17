import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  EncerrarEquipamentoAlocacaoPayload,
  EquipamentoAlocacao,
  EquipamentoAlocacaoFiltro,
  EquipamentoAlocacaoPayload,
  PaginaEquipamentoAlocacoes,
} from './equipamento-alocacao';

@Injectable({ providedIn: 'root' })
export class EquipamentoAlocacaoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/equipamento-alocacoes`;

  listar(filtro: EquipamentoAlocacaoFiltro = {}): Observable<PaginaEquipamentoAlocacoes> {
    let params = new HttpParams();
    if (filtro.usuarioId) params = params.set('usuarioId', filtro.usuarioId);
    if (filtro.equipamentoId) params = params.set('equipamentoId', filtro.equipamentoId);
    if (filtro.dataInicial) params = params.set('dataInicial', filtro.dataInicial);
    if (filtro.dataFinal) params = params.set('dataFinal', filtro.dataFinal);
    if (filtro.status) params = params.set('status', filtro.status);
    params = params.set('pagina', filtro.pagina ?? 1);
    params = params.set('tamanhoPagina', filtro.tamanhoPagina ?? 10);

    return this.http.get<PaginaEquipamentoAlocacoes>(this.baseUrl, { params });
  }

  alocar(payload: EquipamentoAlocacaoPayload): Observable<EquipamentoAlocacao> {
    return this.http.post<EquipamentoAlocacao>(this.baseUrl, payload);
  }

  encerrar(id: number, payload: EncerrarEquipamentoAlocacaoPayload): Observable<EquipamentoAlocacao> {
    return this.http.patch<EquipamentoAlocacao>(`${this.baseUrl}/${id}/encerrar`, payload);
  }
}
