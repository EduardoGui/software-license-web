import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { LogAuditoria, LogAuditoriaFiltro } from './log-auditoria';

@Injectable({ providedIn: 'root' })
export class LogAuditoriaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/logs-auditoria`;

  listar(filtro: LogAuditoriaFiltro = {}): Observable<LogAuditoria[]> {
    let params = new HttpParams();
    if (filtro.dataInicial) params = params.set('dataInicial', filtro.dataInicial);
    if (filtro.dataFinal) params = params.set('dataFinal', filtro.dataFinal);
    if (filtro.entidade) params = params.set('entidade', filtro.entidade);
    if (filtro.usuarioId) params = params.set('usuarioId', filtro.usuarioId);

    return this.http.get<LogAuditoria[]>(this.baseUrl, { params });
  }
}
