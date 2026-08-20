import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Local, LocalFiltro, LocalPayload } from './local';

@Injectable({ providedIn: 'root' })
export class LocalService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/locais`;

  listar(filtro: LocalFiltro = {}): Observable<Local[]> {
    let params = new HttpParams();
    if (filtro.nome) params = params.set('nome', filtro.nome);
    if (filtro.ativo !== undefined) params = params.set('ativo', filtro.ativo);

    return this.http.get<Local[]>(this.baseUrl, { params });
  }

  obter(id: number): Observable<Local> {
    return this.http.get<Local>(`${this.baseUrl}/${id}`);
  }

  criar(payload: LocalPayload): Observable<Local> {
    return this.http.post<Local>(this.baseUrl, payload);
  }

  atualizar(id: number, payload: LocalPayload): Observable<Local> {
    return this.http.put<Local>(`${this.baseUrl}/${id}`, payload);
  }
}
