import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  CreateFaturaOperadoraSaudePayload,
  FaturaOperadoraSaude,
  FaturaOperadoraSaudeFiltro,
  UpdateFaturaOperadoraSaudePayload,
} from './fatura-plano-saude';

@Injectable({ providedIn: 'root' })
export class FaturaOperadoraSaudeService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/faturas-plano-saude`;

  listar(filtro: FaturaOperadoraSaudeFiltro = {}): Observable<FaturaOperadoraSaude[]> {
    let params = new HttpParams();
    if (filtro.ano) params = params.set('ano', filtro.ano);
    if (filtro.mes) params = params.set('mes', filtro.mes);
    if (filtro.operadoraSaude) params = params.set('operadoraSaude', filtro.operadoraSaude);

    return this.http.get<FaturaOperadoraSaude[]>(this.baseUrl, { params });
  }

  obter(id: number): Observable<FaturaOperadoraSaude> {
    return this.http.get<FaturaOperadoraSaude>(`${this.baseUrl}/${id}`);
  }

  criar(payload: CreateFaturaOperadoraSaudePayload): Observable<FaturaOperadoraSaude> {
    return this.http.post<FaturaOperadoraSaude>(this.baseUrl, payload);
  }

  atualizar(id: number, payload: UpdateFaturaOperadoraSaudePayload): Observable<FaturaOperadoraSaude> {
    return this.http.put<FaturaOperadoraSaude>(`${this.baseUrl}/${id}`, payload);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
