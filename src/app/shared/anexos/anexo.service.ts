import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Anexo } from './anexo';

export type AnexoRecurso = 'equipamentos' | 'notas-fiscais-entrada';

@Injectable({ providedIn: 'root' })
export class AnexoService {
  private readonly http = inject(HttpClient);

  private baseUrl(recurso: AnexoRecurso, entidadeId: number): string {
    return `${environment.apiUrl}/${recurso}/${entidadeId}/anexos`;
  }

  listar(recurso: AnexoRecurso, entidadeId: number): Observable<Anexo[]> {
    return this.http.get<Anexo[]>(this.baseUrl(recurso, entidadeId));
  }

  enviar(recurso: AnexoRecurso, entidadeId: number, arquivo: File): Observable<Anexo> {
    const formData = new FormData();
    formData.append('arquivo', arquivo, arquivo.name);
    return this.http.post<Anexo>(this.baseUrl(recurso, entidadeId), formData);
  }

  baixar(recurso: AnexoRecurso, entidadeId: number, anexoId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl(recurso, entidadeId)}/${anexoId}`, { responseType: 'blob' });
  }

  excluir(recurso: AnexoRecurso, entidadeId: number, anexoId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl(recurso, entidadeId)}/${anexoId}`);
  }
}
