import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { UnidadeOrcamentaria, UnidadeOrcamentariaFiltro, UnidadeOrcamentariaPayload } from './unidade-orcamentaria';

@Injectable({ providedIn: 'root' })
export class UnidadeOrcamentariaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/unidades-orcamentarias`;

  listar(filtro: UnidadeOrcamentariaFiltro = {}): Observable<UnidadeOrcamentaria[]> {
    let params = new HttpParams();
    if (filtro.setorId) params = params.set('setorId', filtro.setorId);
    if (filtro.codigo) params = params.set('codigo', filtro.codigo);
    if (filtro.descricao) params = params.set('descricao', filtro.descricao);
    if (filtro.ativa !== undefined) params = params.set('ativa', filtro.ativa);

    return this.http.get<UnidadeOrcamentaria[]>(this.baseUrl, { params });
  }

  obter(id: number): Observable<UnidadeOrcamentaria> {
    return this.http.get<UnidadeOrcamentaria>(`${this.baseUrl}/${id}`);
  }

  criar(payload: UnidadeOrcamentariaPayload): Observable<UnidadeOrcamentaria> {
    return this.http.post<UnidadeOrcamentaria>(this.baseUrl, payload);
  }

  atualizar(id: number, payload: UnidadeOrcamentariaPayload): Observable<UnidadeOrcamentaria> {
    return this.http.put<UnidadeOrcamentaria>(`${this.baseUrl}/${id}`, payload);
  }
}
