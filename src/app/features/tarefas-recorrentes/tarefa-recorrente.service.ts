import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  CreateTarefaRecorrentePayload,
  TarefaRecorrente,
  TarefaRecorrenteFiltro,
  UpdateTarefaRecorrentePayload,
} from './tarefa-recorrente';

@Injectable({ providedIn: 'root' })
export class TarefaRecorrenteService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/tarefas-recorrentes`;

  listar(filtro: TarefaRecorrenteFiltro = {}): Observable<TarefaRecorrente[]> {
    let params = new HttpParams();
    if (filtro.titulo) params = params.set('titulo', filtro.titulo);
    if (filtro.ativa !== undefined) params = params.set('ativa', filtro.ativa);

    return this.http.get<TarefaRecorrente[]>(this.baseUrl, { params });
  }

  obter(id: number): Observable<TarefaRecorrente> {
    return this.http.get<TarefaRecorrente>(`${this.baseUrl}/${id}`);
  }

  criar(payload: CreateTarefaRecorrentePayload): Observable<TarefaRecorrente> {
    return this.http.post<TarefaRecorrente>(this.baseUrl, payload);
  }

  atualizar(id: number, payload: UpdateTarefaRecorrentePayload): Observable<TarefaRecorrente> {
    return this.http.put<TarefaRecorrente>(`${this.baseUrl}/${id}`, payload);
  }
}
