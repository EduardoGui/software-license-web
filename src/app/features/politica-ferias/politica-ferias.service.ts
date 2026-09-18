import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { PoliticaFerias, PoliticaFeriasPayload } from './politica-ferias';

@Injectable({ providedIn: 'root' })
export class PoliticaFeriasService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/politicas-ferias`;

  listar(): Observable<PoliticaFerias[]> {
    return this.http.get<PoliticaFerias[]>(this.baseUrl);
  }

  criar(payload: PoliticaFeriasPayload): Observable<PoliticaFerias> {
    return this.http.post<PoliticaFerias>(this.baseUrl, payload);
  }

  atualizar(id: number, payload: PoliticaFeriasPayload): Observable<PoliticaFerias> {
    return this.http.put<PoliticaFerias>(`${this.baseUrl}/${id}`, payload);
  }
}
