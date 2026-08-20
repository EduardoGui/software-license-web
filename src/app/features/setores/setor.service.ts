import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Setor, SetorFiltro, SetorPayload } from './setor';

@Injectable({ providedIn: 'root' })
export class SetorService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/setores`;

  listar(filtro: SetorFiltro = {}): Observable<Setor[]> {
    let params = new HttpParams();
    if (filtro.nome) params = params.set('nome', filtro.nome);
    if (filtro.ativo !== undefined) params = params.set('ativo', filtro.ativo);

    return this.http.get<Setor[]>(this.baseUrl, { params });
  }

  obter(id: number): Observable<Setor> {
    return this.http.get<Setor>(`${this.baseUrl}/${id}`);
  }

  criar(payload: SetorPayload): Observable<Setor> {
    return this.http.post<Setor>(this.baseUrl, payload);
  }

  atualizar(id: number, payload: SetorPayload): Observable<Setor> {
    return this.http.put<Setor>(`${this.baseUrl}/${id}`, payload);
  }

  adicionarAprovador(setorId: number, usuarioId: number): Observable<Setor> {
    return this.http.post<Setor>(`${this.baseUrl}/${setorId}/aprovadores`, { usuarioId });
  }

  removerAprovador(setorId: number, aprovadorId: number): Observable<Setor> {
    return this.http.delete<Setor>(`${this.baseUrl}/${setorId}/aprovadores/${aprovadorId}`);
  }
}
