import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  Aditivo,
  Contrato,
  ContratoDetalhe,
  ContratoFaturamentoConfig,
  ContratoFiltro,
  ContratoMedicaoConfig,
  ContratoSaldoItem,
  CreateAditivoPayload,
  CreateContratoPayload,
  CreateMedicaoBmPayload,
  MedicaoBm,
  ReprovarMedicaoBmPayload,
  UpdateContratoPayload,
  UpdateMedicaoBmPayload,
} from './contrato';

@Injectable({ providedIn: 'root' })
export class ContratoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/contratos`;

  listar(filtro: ContratoFiltro = {}): Observable<Contrato[]> {
    let params = new HttpParams();
    if (filtro.numero) params = params.set('numero', filtro.numero);
    if (filtro.fornecedorId) params = params.set('fornecedorId', filtro.fornecedorId);
    if (filtro.status) params = params.set('status', filtro.status);
    if (filtro.vigenciaFimAte) params = params.set('vigenciaFimAte', filtro.vigenciaFimAte);

    return this.http.get<Contrato[]>(this.baseUrl, { params });
  }

  obter(id: number): Observable<ContratoDetalhe> {
    return this.http.get<ContratoDetalhe>(`${this.baseUrl}/${id}`);
  }

  criar(payload: CreateContratoPayload): Observable<Contrato> {
    return this.http.post<Contrato>(this.baseUrl, payload);
  }

  atualizar(id: number, payload: UpdateContratoPayload): Observable<Contrato> {
    return this.http.put<Contrato>(`${this.baseUrl}/${id}`, payload);
  }

  atualizarMedicaoConfig(id: number, payload: ContratoMedicaoConfig): Observable<ContratoMedicaoConfig> {
    return this.http.put<ContratoMedicaoConfig>(`${this.baseUrl}/${id}/medicao-config`, payload);
  }

  atualizarFaturamentoConfig(id: number, payload: ContratoFaturamentoConfig): Observable<ContratoFaturamentoConfig> {
    return this.http.put<ContratoFaturamentoConfig>(`${this.baseUrl}/${id}/faturamento-config`, payload);
  }

  listarAditivos(contratoId: number): Observable<Aditivo[]> {
    return this.http.get<Aditivo[]>(`${this.baseUrl}/${contratoId}/aditivos`);
  }

  criarAditivo(contratoId: number, payload: CreateAditivoPayload): Observable<Aditivo> {
    return this.http.post<Aditivo>(`${this.baseUrl}/${contratoId}/aditivos`, payload);
  }

  formalizarAditivo(contratoId: number, aditivoId: number): Observable<Aditivo> {
    return this.http.patch<Aditivo>(`${this.baseUrl}/${contratoId}/aditivos/${aditivoId}/formalizar`, {});
  }

  listarMedicoes(contratoId: number): Observable<MedicaoBm[]> {
    return this.http.get<MedicaoBm[]>(`${this.baseUrl}/${contratoId}/medicoes`);
  }

  criarMedicaoBm(contratoId: number, payload: CreateMedicaoBmPayload): Observable<MedicaoBm> {
    return this.http.post<MedicaoBm>(`${this.baseUrl}/${contratoId}/medicoes`, payload);
  }

  obterMedicao(contratoId: number, medicaoId: number): Observable<MedicaoBm> {
    return this.http.get<MedicaoBm>(`${this.baseUrl}/${contratoId}/medicoes/${medicaoId}`);
  }

  atualizarMedicaoBm(contratoId: number, medicaoId: number, payload: UpdateMedicaoBmPayload): Observable<MedicaoBm> {
    return this.http.put<MedicaoBm>(`${this.baseUrl}/${contratoId}/medicoes/${medicaoId}`, payload);
  }

  excluirMedicaoBm(contratoId: number, medicaoId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${contratoId}/medicoes/${medicaoId}`);
  }

  aprovarMedicaoBm(contratoId: number, medicaoId: number): Observable<MedicaoBm> {
    return this.http.patch<MedicaoBm>(`${this.baseUrl}/${contratoId}/medicoes/${medicaoId}/aprovar`, {});
  }

  reprovarMedicaoBm(contratoId: number, medicaoId: number, payload: ReprovarMedicaoBmPayload): Observable<MedicaoBm> {
    return this.http.patch<MedicaoBm>(`${this.baseUrl}/${contratoId}/medicoes/${medicaoId}/reprovar`, payload);
  }

  obterSaldo(contratoId: number): Observable<ContratoSaldoItem[]> {
    return this.http.get<ContratoSaldoItem[]>(`${this.baseUrl}/${contratoId}/saldo`);
  }
}
