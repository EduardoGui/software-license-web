import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { CreateProgramacaoFeriasPayload, DecisaoProgramacaoFeriasPayload, ProgramacaoFerias } from './programacao-ferias';

@Injectable({ providedIn: 'root' })
export class ProgramacaoFeriasService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/programacoes-ferias`;

  listarPorPeriodo(periodoFeriasId: number): Observable<ProgramacaoFerias[]> {
    return this.http.get<ProgramacaoFerias[]>(`${environment.apiUrl}/periodos-ferias/${periodoFeriasId}/programacoes`);
  }

  criar(periodoFeriasId: number, payload: CreateProgramacaoFeriasPayload): Observable<ProgramacaoFerias> {
    return this.http.post<ProgramacaoFerias>(`${environment.apiUrl}/periodos-ferias/${periodoFeriasId}/programacoes`, payload);
  }

  solicitar(id: number): Observable<ProgramacaoFerias> {
    return this.http.patch<ProgramacaoFerias>(`${this.baseUrl}/${id}/solicitar`, {});
  }

  aprovar(id: number): Observable<ProgramacaoFerias> {
    return this.http.patch<ProgramacaoFerias>(`${this.baseUrl}/${id}/aprovar`, {});
  }

  reprovar(id: number, payload: DecisaoProgramacaoFeriasPayload): Observable<ProgramacaoFerias> {
    return this.http.patch<ProgramacaoFerias>(`${this.baseUrl}/${id}/reprovar`, payload);
  }

  devolver(id: number, payload: DecisaoProgramacaoFeriasPayload): Observable<ProgramacaoFerias> {
    return this.http.patch<ProgramacaoFerias>(`${this.baseUrl}/${id}/devolver`, payload);
  }

  cancelar(id: number): Observable<ProgramacaoFerias> {
    return this.http.patch<ProgramacaoFerias>(`${this.baseUrl}/${id}/cancelar`, {});
  }
}
