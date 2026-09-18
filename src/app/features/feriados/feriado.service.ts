import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Feriado, FeriadoFiltro, FeriadoPayload } from './feriado';

@Injectable({ providedIn: 'root' })
export class FeriadoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/feriados`;

  listar(filtro: FeriadoFiltro = {}): Observable<Feriado[]> {
    let params = new HttpParams();
    if (filtro.ano) params = params.set('ano', filtro.ano);
    if (filtro.abrangencia) params = params.set('abrangencia', filtro.abrangencia);
    if (filtro.ativo !== undefined) params = params.set('ativo', filtro.ativo);

    return this.http.get<Feriado[]>(this.baseUrl, { params });
  }

  obter(id: number): Observable<Feriado> {
    return this.http.get<Feriado>(`${this.baseUrl}/${id}`);
  }

  criar(payload: FeriadoPayload): Observable<Feriado> {
    return this.http.post<Feriado>(this.baseUrl, payload);
  }

  atualizar(id: number, payload: FeriadoPayload): Observable<Feriado> {
    return this.http.put<Feriado>(`${this.baseUrl}/${id}`, payload);
  }
}
