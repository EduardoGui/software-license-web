import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { TimelineFiltro, TimelineUsuario } from './timeline';

@Injectable({ providedIn: 'root' })
export class TimelineService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/timeline`;

  listar(filtro: TimelineFiltro): Observable<TimelineUsuario[]> {
    let params = new HttpParams();
    if (filtro.usuarioId) params = params.set('usuarioId', filtro.usuarioId);
    if (filtro.licencaId) params = params.set('licencaId', filtro.licencaId);
    if (filtro.status) params = params.set('status', filtro.status);
    if (filtro.dataInicial) params = params.set('dataInicial', filtro.dataInicial);
    if (filtro.dataFinal) params = params.set('dataFinal', filtro.dataFinal);

    return this.http.get<TimelineUsuario[]>(this.baseUrl, { params });
  }
}
