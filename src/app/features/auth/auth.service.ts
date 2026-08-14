import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { LoginPayload, LoginResponse } from './auth';

const CHAVE_TOKEN = 'licencas.token';
const CHAVE_EMAIL = 'licencas.email';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  login(payload: LoginPayload): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, payload).pipe(
      tap((resposta) => {
        localStorage.setItem(CHAVE_TOKEN, resposta.token);
        localStorage.setItem(CHAVE_EMAIL, resposta.email);
      }),
    );
  }

  logout(): void {
    localStorage.removeItem(CHAVE_TOKEN);
    localStorage.removeItem(CHAVE_EMAIL);
  }

  obterToken(): string | null {
    return localStorage.getItem(CHAVE_TOKEN);
  }

  obterEmail(): string | null {
    return localStorage.getItem(CHAVE_EMAIL);
  }

  estaAutenticado(): boolean {
    return !!this.obterToken();
  }
}
