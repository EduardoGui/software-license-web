import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { PlanoSaudeMes, PlanoSaudeMesFiltro, SalvarPlanoSaudeMes } from './plano-saude-custo';

@Injectable({ providedIn: 'root' })
export class PlanoSaudeCustoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/plano-saude-custos`;

  obterMes(filtro: PlanoSaudeMesFiltro): Observable<PlanoSaudeMes> {
    let params = new HttpParams().set('ano', filtro.ano).set('mes', filtro.mes);
    if (filtro.nome) params = params.set('nome', filtro.nome);

    return this.http.get<PlanoSaudeMes>(`${this.baseUrl}/mes`, { params });
  }

  salvarMes(payload: SalvarPlanoSaudeMes): Observable<PlanoSaudeMes> {
    return this.http.post<PlanoSaudeMes>(`${this.baseUrl}/mes`, payload);
  }

  remover(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
