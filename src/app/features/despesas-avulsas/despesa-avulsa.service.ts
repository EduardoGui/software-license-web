import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  CreateDespesaAvulsaPayload,
  DespesaAvulsa,
  DespesaAvulsaFiltro,
  UpdateDespesaAvulsaPayload,
} from './despesa-avulsa';

@Injectable({ providedIn: 'root' })
export class DespesaAvulsaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/despesas-avulsas`;

  listar(filtro: DespesaAvulsaFiltro = {}): Observable<DespesaAvulsa[]> {
    let params = new HttpParams();
    if (filtro.fornecedorId) params = params.set('fornecedorId', filtro.fornecedorId);
    if (filtro.categoria) params = params.set('categoria', filtro.categoria);
    if (filtro.recorrente !== undefined) params = params.set('recorrente', filtro.recorrente);
    if (filtro.dataEmissaoDe) params = params.set('dataEmissaoDe', filtro.dataEmissaoDe);
    if (filtro.dataEmissaoAte) params = params.set('dataEmissaoAte', filtro.dataEmissaoAte);

    return this.http.get<DespesaAvulsa[]>(this.baseUrl, { params });
  }

  obter(id: number): Observable<DespesaAvulsa> {
    return this.http.get<DespesaAvulsa>(`${this.baseUrl}/${id}`);
  }

  criar(payload: CreateDespesaAvulsaPayload): Observable<DespesaAvulsa> {
    return this.http.post<DespesaAvulsa>(this.baseUrl, payload);
  }

  atualizar(id: number, payload: UpdateDespesaAvulsaPayload): Observable<DespesaAvulsa> {
    return this.http.put<DespesaAvulsa>(`${this.baseUrl}/${id}`, payload);
  }
}
