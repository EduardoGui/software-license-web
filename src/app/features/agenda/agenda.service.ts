import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AdiarTarefaOcorrenciaPayload, CreateTarefaUnicaPayload, TarefaOcorrencia } from './agenda';

@Injectable({ providedIn: 'root' })
export class AgendaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/agenda`;

  listar(): Observable<TarefaOcorrencia[]> {
    return this.http.get<TarefaOcorrencia[]>(this.baseUrl);
  }

  concluir(ocorrenciaId: number): Observable<TarefaOcorrencia> {
    return this.http.patch<TarefaOcorrencia>(`${this.baseUrl}/${ocorrenciaId}/concluir`, {});
  }

  adiar(ocorrenciaId: number, payload: AdiarTarefaOcorrenciaPayload): Observable<TarefaOcorrencia> {
    return this.http.patch<TarefaOcorrencia>(`${this.baseUrl}/${ocorrenciaId}/adiar`, payload);
  }

  criarUnica(payload: CreateTarefaUnicaPayload): Observable<TarefaOcorrencia> {
    return this.http.post<TarefaOcorrencia>(`${this.baseUrl}/tarefa-unica`, payload);
  }
}
