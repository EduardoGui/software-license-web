import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { PerfilPayload, Usuario, UsuarioFiltro, UsuarioPayload } from './usuario';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/usuarios`;

  listar(filtro: UsuarioFiltro = {}): Observable<Usuario[]> {
    let params = new HttpParams();
    if (filtro.nome) params = params.set('nome', filtro.nome);
    if (filtro.email) params = params.set('email', filtro.email);
    if (filtro.status) params = params.set('status', filtro.status);

    return this.http.get<Usuario[]>(this.baseUrl, { params });
  }

  obter(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.baseUrl}/${id}`);
  }

  criar(payload: UsuarioPayload): Observable<Usuario> {
    return this.http.post<Usuario>(this.baseUrl, payload);
  }

  atualizar(id: number, payload: UsuarioPayload): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.baseUrl}/${id}`, payload);
  }

  desativar(id: number, dataFim: string | null): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.baseUrl}/${id}/desativar`, { dataFim });
  }

  atualizarPerfil(id: number, payload: PerfilPayload): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.baseUrl}/${id}/perfil`, payload);
  }

  reenviarConvite(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/reenviar-convite`, {});
  }
}
