import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ImportacaoPlanoSaudePrevia, ImportacaoPlanoSaudeResultado, PlanoSaudeMes, PlanoSaudeMesFiltro, SalvarPlanoSaudeMes } from './plano-saude-custo';

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

  /** Lê o xlsx do demonstrativo da operadora e devolve a prévia de conferência. Não grava nada. */
  previaImportacao(arquivo: File, ano: number, mes: number): Observable<ImportacaoPlanoSaudePrevia> {
    return this.http.post<ImportacaoPlanoSaudePrevia>(`${this.baseUrl}/importar-fatura/previa`, this.formulario(arquivo, ano, mes));
  }

  /** Reenvia o arquivo com a assinatura da prévia; só grava se o resultado ainda for o mesmo. */
  confirmarImportacao(arquivo: File, ano: number, mes: number, assinatura: string): Observable<ImportacaoPlanoSaudeResultado> {
    const form = this.formulario(arquivo, ano, mes);
    form.append('assinatura', assinatura);
    return this.http.post<ImportacaoPlanoSaudeResultado>(`${this.baseUrl}/importar-fatura/confirmar`, form);
  }

  private formulario(arquivo: File, ano: number, mes: number): FormData {
    const form = new FormData();
    form.append('arquivo', arquivo);
    form.append('ano', String(ano));
    form.append('mes', String(mes));
    return form;
  }

  remover(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  obterUltimoMes(): Observable<{ ano: number | null; mes: number | null }> {
    return this.http.get<{ ano: number | null; mes: number | null }>(`${this.baseUrl}/ultimo-mes`);
  }
}
