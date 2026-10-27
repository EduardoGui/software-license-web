import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AcessoConta } from './acesso';

@Injectable({ providedIn: 'root' })
export class AcessoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/acesso`;

  listar(): Observable<AcessoConta[]> {
    return this.http.get<AcessoConta[]>(this.baseUrl);
  }

  definirPapeis(contaId: string, papeis: string[]): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/contas/${contaId}/papeis`, { papeis });
  }

  bloquear(contaId: string): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/contas/${contaId}/bloquear`, {});
  }

  desbloquear(contaId: string): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/contas/${contaId}/desbloquear`, {});
  }
}
