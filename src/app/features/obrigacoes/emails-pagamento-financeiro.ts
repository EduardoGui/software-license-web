import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export type TipoDestinatario = 'Para' | 'Cc';

export interface EmailPagamentoFinanceiro {
  id: number;
  email: string;
  tipoDestinatario: TipoDestinatario;
  ativo: boolean;
}

export interface EmailPagamentoFinanceiroPayload {
  email: string;
  tipoDestinatario: TipoDestinatario;
  ativo: boolean;
}

// Lista de destinatários (Para/Cc) do e-mail de solicitação de pagamento ao financeiro.
@Injectable({ providedIn: 'root' })
export class EmailsPagamentoFinanceiroService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/emails-pagamento-financeiro`;

  listar(): Observable<EmailPagamentoFinanceiro[]> {
    return this.http.get<EmailPagamentoFinanceiro[]>(this.baseUrl);
  }

  criar(payload: EmailPagamentoFinanceiroPayload): Observable<EmailPagamentoFinanceiro> {
    return this.http.post<EmailPagamentoFinanceiro>(this.baseUrl, payload);
  }

  atualizar(id: number, payload: EmailPagamentoFinanceiroPayload): Observable<EmailPagamentoFinanceiro> {
    return this.http.put<EmailPagamentoFinanceiro>(`${this.baseUrl}/${id}`, payload);
  }
}
