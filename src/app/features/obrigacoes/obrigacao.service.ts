import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AtualizarAndamentoPayload, Obrigacao, ObrigacaoFiltro, ResponsavelObrigacao, UpdateObrigacaoPayload } from './obrigacao';

@Injectable({ providedIn: 'root' })
export class ObrigacaoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/obrigacoes`;

  listar(filtro: ObrigacaoFiltro = {}): Observable<Obrigacao[]> {
    let params = new HttpParams();
    if (filtro.competenciaDe) params = params.set('competenciaDe', filtro.competenciaDe);
    if (filtro.competenciaAte) params = params.set('competenciaAte', filtro.competenciaAte);
    if (filtro.tipoMovimento) params = params.set('tipoMovimento', filtro.tipoMovimento);
    if (filtro.fornecedorId) params = params.set('fornecedorId', filtro.fornecedorId);
    if (filtro.contratoId) params = params.set('contratoId', filtro.contratoId);
    if (filtro.ordemCompraId) params = params.set('ordemCompraId', filtro.ordemCompraId);
    if (filtro.responsavelUsuarioId) params = params.set('responsavelUsuarioId', filtro.responsavelUsuarioId);
    if (filtro.etapa) params = params.set('etapa', filtro.etapa);
    if (filtro.pago !== undefined) params = params.set('pago', filtro.pago);
    if (filtro.cancelada !== undefined) params = params.set('cancelada', filtro.cancelada);

    return this.http.get<Obrigacao[]>(this.baseUrl, { params });
  }

  obter(id: number): Observable<Obrigacao> {
    return this.http.get<Obrigacao>(`${this.baseUrl}/${id}`);
  }

  atualizar(id: number, payload: UpdateObrigacaoPayload): Observable<Obrigacao> {
    return this.http.put<Obrigacao>(`${this.baseUrl}/${id}`, payload);
  }

  /** Andamento documental (datas gravadas na OC ou na BM de origem). Envio completo: data nula limpa o campo. */
  atualizarAndamento(id: number, payload: AtualizarAndamentoPayload): Observable<Obrigacao> {
    return this.http.patch<Obrigacao>(`${this.baseUrl}/${id}/andamento`, payload);
  }

  /** Ordem de Compra paga em várias vezes: cria mais uma obrigação (parcela) ligada à mesma OC, copiando a NF. */
  adicionarParcela(id: number, valor: number): Observable<Obrigacao> {
    return this.http.post<Obrigacao>(`${this.baseUrl}/${id}/parcelas`, { valor });
  }

  /** Usuários Administrativos que podem receber obrigações (só Administrador). */
  listarResponsaveis(): Observable<ResponsavelObrigacao[]> {
    return this.http.get<ResponsavelObrigacao[]>(`${this.baseUrl}/responsaveis`);
  }

  /** Atribui a obrigação a um usuário Administrativo; null remove o responsável (só Administrador). */
  atribuirResponsavel(id: number, usuarioId: number | null): Observable<Obrigacao> {
    return this.http.patch<Obrigacao>(`${this.baseUrl}/${id}/responsavel`, { usuarioId });
  }

  marcarEnviadaFinanceiro(id: number, dataPrevistaPagamento: string | null): Observable<Obrigacao> {
    return this.http.patch<Obrigacao>(`${this.baseUrl}/${id}/marcar-enviada-financeiro`, { dataPrevistaPagamento });
  }

  marcarPaga(id: number): Observable<Obrigacao> {
    return this.http.patch<Obrigacao>(`${this.baseUrl}/${id}/marcar-paga`, {});
  }

  desmarcarPaga(id: number): Observable<Obrigacao> {
    return this.http.patch<Obrigacao>(`${this.baseUrl}/${id}/desmarcar-paga`, {});
  }

  cancelar(id: number): Observable<Obrigacao> {
    return this.http.patch<Obrigacao>(`${this.baseUrl}/${id}/cancelar`, {});
  }

  reativar(id: number): Observable<Obrigacao> {
    return this.http.patch<Obrigacao>(`${this.baseUrl}/${id}/reativar`, {});
  }
}
