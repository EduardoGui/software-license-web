import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { TipoPatrimonio, TipoPatrimonioFiltro, TipoPatrimonioPayload } from './tipo-patrimonio';

@Injectable({ providedIn: 'root' })
export class TipoPatrimonioService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/tipos-patrimonio`;

  listar(filtro: TipoPatrimonioFiltro = {}): Observable<TipoPatrimonio[]> {
    let params = new HttpParams();
    if (filtro.nome) params = params.set('nome', filtro.nome);
    if (filtro.ativo !== undefined) params = params.set('ativo', filtro.ativo);

    return this.http.get<TipoPatrimonio[]>(this.baseUrl, { params });
  }

  obter(id: number): Observable<TipoPatrimonio> {
    return this.http.get<TipoPatrimonio>(`${this.baseUrl}/${id}`);
  }

  criar(payload: TipoPatrimonioPayload): Observable<TipoPatrimonio> {
    return this.http.post<TipoPatrimonio>(this.baseUrl, payload);
  }

  atualizar(id: number, payload: TipoPatrimonioPayload): Observable<TipoPatrimonio> {
    return this.http.put<TipoPatrimonio>(`${this.baseUrl}/${id}`, payload);
  }
}
