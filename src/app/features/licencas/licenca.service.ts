import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Licenca, LicencaFiltro, LicencaPayload } from './licenca';

@Injectable({ providedIn: 'root' })
export class LicencaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/licencas`;

  listar(filtro: LicencaFiltro = {}): Observable<Licenca[]> {
    let params = new HttpParams();
    if (filtro.nome) params = params.set('nome', filtro.nome);
    if (filtro.status) params = params.set('status', filtro.status);
    if (filtro.vencimentoAte) params = params.set('vencimentoAte', filtro.vencimentoAte);

    return this.http.get<Licenca[]>(this.baseUrl, { params });
  }

  obter(id: number): Observable<Licenca> {
    return this.http.get<Licenca>(`${this.baseUrl}/${id}`);
  }

  criar(payload: LicencaPayload): Observable<Licenca> {
    return this.http.post<Licenca>(this.baseUrl, payload);
  }

  atualizar(id: number, payload: LicencaPayload): Observable<Licenca> {
    return this.http.put<Licenca>(`${this.baseUrl}/${id}`, payload);
  }

  desativar(id: number): Observable<Licenca> {
    return this.http.patch<Licenca>(`${this.baseUrl}/${id}/desativar`, {});
  }
}
