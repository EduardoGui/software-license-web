import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Recebimento, RegistrarDivergenciaPayload } from './recebimento';

@Injectable({ providedIn: 'root' })
export class RecebimentoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/recebimento`;

  obter(token: string): Observable<Recebimento> {
    return this.http.get<Recebimento>(`${this.baseUrl}/${token}`);
  }

  confirmar(token: string): Observable<Recebimento> {
    return this.http.post<Recebimento>(`${this.baseUrl}/${token}/confirmar`, {});
  }

  registrarDivergencia(token: string, payload: RegistrarDivergenciaPayload): Observable<Recebimento> {
    return this.http.post<Recebimento>(`${this.baseUrl}/${token}/divergencia`, payload);
  }
}
