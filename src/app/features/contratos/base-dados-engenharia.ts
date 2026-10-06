import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface BaseDadosEngenhariaFiltro {
  de?: string;
  ate?: string;
  status?: string;
  origem?: string;
}

export interface BaseDadosEngenhariaLinha {
  origem: string;
  documentoId: number;
  contratoNumero: string | null;
  numeroDocumento: number;
  numeroReferencia: string | null;
  periodoInicio: string;
  periodoFim: string | null;
  status: string;
  fornecedorNome: string;
  fornecedorDocumento: string | null;
  valorTotalBm: number;
  valorLiquidoBm: number | null;
  itemDescricao: string | null;
  itemUnidade: string | null;
  valorUnitario: number | null;
  codigoUa: string | null;
  quantidadeUa: number | null;
  valorUa: number | null;
  nfDataEmissao: string | null;
  nfNumero: string | null;
  nfValorTotal: number | null;
}

export interface BaseDadosEngenharia {
  linhas: BaseDadosEngenhariaLinha[];
}

@Injectable({ providedIn: 'root' })
export class BaseDadosEngenhariaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/base-dados/engenharia`;

  gerar(filtro: BaseDadosEngenhariaFiltro): Observable<BaseDadosEngenharia> {
    return this.http.get<BaseDadosEngenharia>(this.baseUrl, { params: this.construirParams(filtro) });
  }

  exportarExcel(filtro: BaseDadosEngenhariaFiltro): Observable<Blob> {
    const params = this.construirParams(filtro).set('formato', 'xlsx');
    return this.http.get(this.baseUrl, { params, responseType: 'blob' });
  }

  private construirParams(filtro: BaseDadosEngenhariaFiltro): HttpParams {
    let params = new HttpParams();
    if (filtro.de) params = params.set('de', filtro.de);
    if (filtro.ate) params = params.set('ate', filtro.ate);
    if (filtro.status) params = params.set('status', filtro.status);
    if (filtro.origem) params = params.set('origem', filtro.origem);
    return params;
  }
}
