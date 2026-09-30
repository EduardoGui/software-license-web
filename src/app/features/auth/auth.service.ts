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
    return !!this.obterToken() && !this.tokenExpirado();
  }

  tokenExpirado(): boolean {
    const exp = this.obterClaims()?.['exp'];
    return typeof exp === 'number' && exp * 1000 <= Date.now();
  }

  ehAdministrador(): boolean {
    return this.obterPapeis().includes('Administrador');
  }

  ehAdministrativo(): boolean {
    return this.obterPapeis().includes('Administrativo');
  }

  ehColaborador(): boolean {
    return this.obterPapeis().includes('Colaborador');
  }

  // Administrativo tem o mesmo nível de operação de um Administrador nas telas liberadas pra
  // ele (DP, Patrimônio, Locais/Empresas PJ/Notas Fiscais) - ver core/admin-guard.ts e app.html.
  podeAcessarAdministrativo(): boolean {
    return this.ehAdministrador() || this.ehAdministrativo();
  }

  // Uma conta pode ter mais de um papel (ex.: colaborador que também é Administrativo) - o claim
  // "role" no token vem como string quando só tem um papel, ou array quando tem mais de um.
  private obterPapeis(): string[] {
    const valor = this.obterClaims()?.['role'];
    if (Array.isArray(valor)) {
      return valor;
    }
    return typeof valor === 'string' ? [valor] : [];
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
