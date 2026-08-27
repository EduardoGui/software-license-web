import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { EmpresaPj, EmpresaPjFiltro, EmpresaPjPayload } from './empresa-pj';

@Injectable({ providedIn: 'root' })
export class EmpresaPjService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/empresas-pj`;

  listar(filtro: EmpresaPjFiltro = {}): Observable<EmpresaPj[]> {
    let params = new HttpParams();
    if (filtro.razaoSocial) params = params.set('razaoSocial', filtro.razaoSocial);
    if (filtro.ativa !== undefined) params = params.set('ativa', filtro.ativa);

    return this.http.get<EmpresaPj[]>(this.baseUrl, { params });
  }

  obter(id: number): Observable<EmpresaPj> {
    return this.http.get<EmpresaPj>(`${this.baseUrl}/${id}`);
  }

  criar(payload: EmpresaPjPayload): Observable<EmpresaPj> {
    return this.http.post<EmpresaPj>(this.baseUrl, payload);
  }

  atualizar(id: number, payload: EmpresaPjPayload): Observable<EmpresaPj> {
    return this.http.put<EmpresaPj>(`${this.baseUrl}/${id}`, payload);
  }
}
