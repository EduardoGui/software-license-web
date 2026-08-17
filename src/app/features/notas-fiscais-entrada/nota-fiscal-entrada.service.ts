import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  NotaFiscalEntrada,
  NotaFiscalEntradaDetalhe,
  NotaFiscalEntradaFiltro,
  NotaFiscalEntradaPayload,
  NotaFiscalItem,
  NotaFiscalItemPayload,
} from './nota-fiscal-entrada';

@Injectable({ providedIn: 'root' })
export class NotaFiscalEntradaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/notas-fiscais-entrada`;

  listar(filtro: NotaFiscalEntradaFiltro = {}): Observable<NotaFiscalEntrada[]> {
    let params = new HttpParams();
    if (filtro.numero) params = params.set('numero', filtro.numero);
    if (filtro.fornecedorNome) params = params.set('fornecedorNome', filtro.fornecedorNome);

    return this.http.get<NotaFiscalEntrada[]>(this.baseUrl, { params });
  }

  obter(id: number): Observable<NotaFiscalEntradaDetalhe> {
    return this.http.get<NotaFiscalEntradaDetalhe>(`${this.baseUrl}/${id}`);
  }

  criar(payload: NotaFiscalEntradaPayload): Observable<NotaFiscalEntrada> {
    return this.http.post<NotaFiscalEntrada>(this.baseUrl, payload);
  }

  adicionarItem(notaFiscalEntradaId: number, payload: NotaFiscalItemPayload): Observable<NotaFiscalItem> {
    return this.http.post<NotaFiscalItem>(`${this.baseUrl}/${notaFiscalEntradaId}/itens`, payload);
  }
}
