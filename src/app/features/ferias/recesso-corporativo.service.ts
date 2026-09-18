import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  CreateRecessoCorporativoPayload,
  RecessoCorporativo,
  RecessoSimulacaoLinha,
  UpdateRecessoCorporativoPayload,
} from './recesso-corporativo';

@Injectable({ providedIn: 'root' })
export class RecessoCorporativoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/recessos-corporativos`;

  listar(): Observable<RecessoCorporativo[]> {
    return this.http.get<RecessoCorporativo[]>(this.baseUrl);
  }

  obter(id: number): Observable<RecessoCorporativo> {
    return this.http.get<RecessoCorporativo>(`${this.baseUrl}/${id}`);
  }

  criar(payload: CreateRecessoCorporativoPayload): Observable<RecessoCorporativo> {
    return this.http.post<RecessoCorporativo>(this.baseUrl, payload);
  }

  atualizar(id: number, payload: UpdateRecessoCorporativoPayload): Observable<RecessoCorporativo> {
    return this.http.put<RecessoCorporativo>(`${this.baseUrl}/${id}`, payload);
  }

  simular(id: number, usuarioIds: number[]): Observable<RecessoSimulacaoLinha[]> {
    return this.http.post<RecessoSimulacaoLinha[]>(`${this.baseUrl}/${id}/simular`, { usuarioIds });
  }

  confirmar(id: number, usuarioIds: number[]): Observable<RecessoCorporativo> {
    return this.http.post<RecessoCorporativo>(`${this.baseUrl}/${id}/confirmar`, { usuarioIds });
  }
}
