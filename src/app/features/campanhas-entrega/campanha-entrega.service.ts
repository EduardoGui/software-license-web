import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  CampanhaEntrega,
  CampanhaEntregaFiltro,
  CampanhaEntregaResumo,
  ColaboradorDisponivel,
  ColaboradorDisponivelFiltro,
  CreateCampanhaEntregaPayload,
  CreateEntregaLotePayload,
  CreateEntregaPayload,
  Entrega,
  EntregaFiltro,
  RegistrarEntregaFisicaPayload,
  UpdateCampanhaEntregaPayload,
  UpdateEntregaItensPayload,
} from './campanha-entrega';

@Injectable({ providedIn: 'root' })
export class CampanhaEntregaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/campanhas-entrega`;

  listar(filtro: CampanhaEntregaFiltro = {}): Observable<CampanhaEntrega[]> {
    let params = new HttpParams();
    if (filtro.nome) params = params.set('nome', filtro.nome);
    if (filtro.status) params = params.set('status', filtro.status);

    return this.http.get<CampanhaEntrega[]>(this.baseUrl, { params });
  }

  obter(id: number): Observable<CampanhaEntrega> {
    return this.http.get<CampanhaEntrega>(`${this.baseUrl}/${id}`);
  }

  criar(payload: CreateCampanhaEntregaPayload): Observable<CampanhaEntrega> {
    return this.http.post<CampanhaEntrega>(this.baseUrl, payload);
  }

  atualizar(id: number, payload: UpdateCampanhaEntregaPayload): Observable<CampanhaEntrega> {
    return this.http.put<CampanhaEntrega>(`${this.baseUrl}/${id}`, payload);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  cancelar(id: number): Observable<CampanhaEntrega> {
    return this.http.patch<CampanhaEntrega>(`${this.baseUrl}/${id}/cancelar`, {});
  }

  encerrar(id: number): Observable<CampanhaEntrega> {
    return this.http.patch<CampanhaEntrega>(`${this.baseUrl}/${id}/encerrar`, {});
  }

  obterResumo(id: number): Observable<CampanhaEntregaResumo> {
    return this.http.get<CampanhaEntregaResumo>(`${this.baseUrl}/${id}/resumo`);
  }

  listarColaboradoresDisponiveis(id: number, filtro: ColaboradorDisponivelFiltro = {}): Observable<ColaboradorDisponivel[]> {
    let params = new HttpParams();
    if (filtro.nome) params = params.set('nome', filtro.nome);
    if (filtro.setorId) params = params.set('setorId', filtro.setorId);

    return this.http.get<ColaboradorDisponivel[]>(`${this.baseUrl}/${id}/colaboradores-disponiveis`, { params });
  }

  listarEntregas(id: number, filtro: EntregaFiltro = {}): Observable<Entrega[]> {
    let params = new HttpParams();
    if (filtro.usuarioId) params = params.set('usuarioId', filtro.usuarioId);
    if (filtro.setorId) params = params.set('setorId', filtro.setorId);
    if (filtro.item) params = params.set('item', filtro.item);
    if (filtro.status) params = params.set('status', filtro.status);

    return this.http.get<Entrega[]>(`${this.baseUrl}/${id}/entregas`, { params });
  }

  adicionarEntrega(id: number, payload: CreateEntregaPayload): Observable<Entrega> {
    return this.http.post<Entrega>(`${this.baseUrl}/${id}/entregas`, payload);
  }

  adicionarEntregasLote(id: number, payload: CreateEntregaLotePayload): Observable<Entrega[]> {
    return this.http.post<Entrega[]>(`${this.baseUrl}/${id}/entregas/lote`, payload);
  }

  atualizarItensEntrega(id: number, entregaId: number, payload: UpdateEntregaItensPayload): Observable<Entrega> {
    return this.http.put<Entrega>(`${this.baseUrl}/${id}/entregas/${entregaId}/itens`, payload);
  }

  registrarEntregaFisica(id: number, entregaId: number, payload: RegistrarEntregaFisicaPayload): Observable<Entrega> {
    return this.http.patch<Entrega>(`${this.baseUrl}/${id}/entregas/${entregaId}/registrar-entrega-fisica`, payload);
  }

  cancelarEntrega(id: number, entregaId: number): Observable<Entrega> {
    return this.http.patch<Entrega>(`${this.baseUrl}/${id}/entregas/${entregaId}/cancelar`, {});
  }
}
