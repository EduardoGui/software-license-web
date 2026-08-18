import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { DefinirSenhaPayload, LoginPayload, LoginResponse } from './auth';

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

  definirSenha(payload: DefinirSenhaPayload): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/definir-senha`, payload);
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

  ehAdministrador(): boolean {
    return this.obterClaims()?.['role'] === 'Administrador';
  }

  ehColaborador(): boolean {
    return this.obterClaims()?.['role'] === 'Colaborador';
  }

  obterUsuarioId(): number | null {
    const valor = this.obterClaims()?.['usuarioId'];
    return typeof valor === 'string' ? Number(valor) : null;
  }

  private obterClaims(): Record<string, unknown> | null {
    const token = this.obterToken();
    const payload = token?.split('.')[1];
    if (!payload) {
      return null;
    }

    try {
      const normalizado = payload.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(normalizado));
    } catch {
      return null;
    }
  }
}
