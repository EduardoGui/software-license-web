import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { EmailNotificacaoReembolso, EmailNotificacaoReembolsoFiltro, EmailNotificacaoReembolsoPayload } from './email-notificacao-reembolso';

@Injectable({ providedIn: 'root' })
export class EmailNotificacaoReembolsoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/emails-notificacao-reembolso`;

  listar(filtro: EmailNotificacaoReembolsoFiltro = {}): Observable<EmailNotificacaoReembolso[]> {
    let params = new HttpParams();
    if (filtro.ativo !== undefined) params = params.set('ativo', filtro.ativo);

    return this.http.get<EmailNotificacaoReembolso[]>(this.baseUrl, { params });
  }

  obter(id: number): Observable<EmailNotificacaoReembolso> {
    return this.http.get<EmailNotificacaoReembolso>(`${this.baseUrl}/${id}`);
  }

  criar(payload: EmailNotificacaoReembolsoPayload): Observable<EmailNotificacaoReembolso> {
    return this.http.post<EmailNotificacaoReembolso>(this.baseUrl, payload);
  }

  atualizar(id: number, payload: EmailNotificacaoReembolsoPayload): Observable<EmailNotificacaoReembolso> {
    return this.http.put<EmailNotificacaoReembolso>(`${this.baseUrl}/${id}`, payload);
  }
}
