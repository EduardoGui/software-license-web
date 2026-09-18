import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AjusteManualSaldoFeriasPayload, MovimentacaoSaldoFerias, PeriodoFerias, PeriodoFeriasFiltro } from './periodo-ferias';

@Injectable({ providedIn: 'root' })
export class PeriodoFeriasService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/periodos-ferias`;

  listar(filtro: PeriodoFeriasFiltro = {}): Observable<PeriodoFerias[]> {
    let params = new HttpParams();
    if (filtro.usuarioId) params = params.set('usuarioId', filtro.usuarioId);

    return this.http.get<PeriodoFerias[]>(this.baseUrl, { params });
  }

  obter(id: number): Observable<PeriodoFerias> {
    return this.http.get<PeriodoFerias>(`${this.baseUrl}/${id}`);
  }

  listarMovimentacoes(id: number): Observable<MovimentacaoSaldoFerias[]> {
    return this.http.get<MovimentacaoSaldoFerias[]>(`${this.baseUrl}/${id}/movimentacoes`);
  }

  registrarAjusteManual(id: number, payload: AjusteManualSaldoFeriasPayload): Observable<PeriodoFerias> {
    return this.http.post<PeriodoFerias>(`${this.baseUrl}/${id}/ajustes-manuais`, payload);
  }

  gerarProximoPeriodo(usuarioId: number): Observable<PeriodoFerias> {
    return this.http.post<PeriodoFerias>(`${environment.apiUrl}/usuarios/${usuarioId}/periodos-ferias/gerar-proximo`, {});
  }
}
