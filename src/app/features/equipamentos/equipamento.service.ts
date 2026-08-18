import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Equipamento, EquipamentoFiltro, EquipamentoPayload } from './equipamento';
import { Inventario } from './inventario';

@Injectable({ providedIn: 'root' })
export class EquipamentoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/equipamentos`;

  listar(filtro: EquipamentoFiltro = {}): Observable<Equipamento[]> {
    let params = new HttpParams();
    if (filtro.tipoEquipamentoId) params = params.set('tipoEquipamentoId', filtro.tipoEquipamentoId);
    if (filtro.origem) params = params.set('origem', filtro.origem);
    if (filtro.status) params = params.set('status', filtro.status);
    if (filtro.usuarioId) params = params.set('usuarioId', filtro.usuarioId);
    if (filtro.notaFiscalEntradaId) params = params.set('notaFiscalEntradaId', filtro.notaFiscalEntradaId);

    return this.http.get<Equipamento[]>(this.baseUrl, { params });
  }

  obter(id: number): Observable<Equipamento> {
    return this.http.get<Equipamento>(`${this.baseUrl}/${id}`);
  }

  atualizar(id: number, payload: EquipamentoPayload): Observable<Equipamento> {
    return this.http.put<Equipamento>(`${this.baseUrl}/${id}`, payload);
  }

  baixar(id: number, numeroNotaSaida: string | null): Observable<Equipamento> {
    return this.http.patch<Equipamento>(`${this.baseUrl}/${id}/baixar`, { numeroNotaSaida });
  }

  inventario(): Observable<Inventario> {
    return this.http.get<Inventario>(`${this.baseUrl}/inventario`);
  }
}
