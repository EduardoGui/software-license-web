import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { TipoEquipamento, TipoEquipamentoFiltro, TipoEquipamentoPayload } from './tipo-equipamento';

@Injectable({ providedIn: 'root' })
export class TipoEquipamentoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/tipos-equipamento`;

  listar(filtro: TipoEquipamentoFiltro = {}): Observable<TipoEquipamento[]> {
    let params = new HttpParams();
    if (filtro.nome) params = params.set('nome', filtro.nome);
    if (filtro.ativo !== undefined) params = params.set('ativo', filtro.ativo);

    return this.http.get<TipoEquipamento[]>(this.baseUrl, { params });
  }

  obter(id: number): Observable<TipoEquipamento> {
    return this.http.get<TipoEquipamento>(`${this.baseUrl}/${id}`);
  }

  criar(payload: TipoEquipamentoPayload): Observable<TipoEquipamento> {
    return this.http.post<TipoEquipamento>(this.baseUrl, payload);
  }

  atualizar(id: number, payload: TipoEquipamentoPayload): Observable<TipoEquipamento> {
    return this.http.put<TipoEquipamento>(`${this.baseUrl}/${id}`, payload);
  }
}
