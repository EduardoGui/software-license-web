import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { CreateFornecedorPayload, Fornecedor, FornecedorFiltro, UpdateFornecedorPayload } from './fornecedor';

@Injectable({ providedIn: 'root' })
export class FornecedorService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/fornecedores`;

  listar(filtro: FornecedorFiltro = {}): Observable<Fornecedor[]> {
    let params = new HttpParams();
    if (filtro.nome) params = params.set('nome', filtro.nome);
    if (filtro.ativo !== undefined) params = params.set('ativo', filtro.ativo);

    return this.http.get<Fornecedor[]>(this.baseUrl, { params });
  }

  obter(id: number): Observable<Fornecedor> {
    return this.http.get<Fornecedor>(`${this.baseUrl}/${id}`);
  }

  criar(payload: CreateFornecedorPayload): Observable<Fornecedor> {
    return this.http.post<Fornecedor>(this.baseUrl, payload);
  }

  atualizar(id: number, payload: UpdateFornecedorPayload): Observable<Fornecedor> {
    return this.http.put<Fornecedor>(`${this.baseUrl}/${id}`, payload);
  }
}
