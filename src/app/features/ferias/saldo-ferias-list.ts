import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Usuario } from '../usuarios/usuario';
import { UsuarioService } from '../usuarios/usuario.service';
import { PeriodoFerias } from './periodo-ferias';
import { PeriodoFeriasService } from './periodo-ferias.service';

interface LinhaSaldo {
  usuario: Usuario;
  periodo: PeriodoFerias | null;
}

@Component({
  selector: 'app-saldo-ferias-list',
  imports: [RouterLink],
  templateUrl: './saldo-ferias-list.html',
  styleUrl: './saldo-ferias-list.scss',
})
export class SaldoFeriasList {
  private readonly usuarioService = inject(UsuarioService);
  private readonly periodoFeriasService = inject(PeriodoFeriasService);

  protected readonly linhas = signal<LinhaSaldo[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal(false);
  protected readonly gerandoUsuarioId = signal<number | null>(null);
  protected readonly erroGeracao = signal<string | null>(null);

  constructor() {
    this.carregar();
  }

  protected carregar(): void {
    this.carregando.set(true);
    this.erro.set(false);

    this.usuarioService.listar({ status: 'Ativo' }).subscribe({
      next: (usuarios) => {
        const usuariosPj = usuarios.filter((u) => u.tipo === 'Pj' || u.tipo === 'Clt');
        this.periodoFeriasService.listar().subscribe({
          next: (periodos) => {
            const maisRecentePorUsuario = new Map<number, PeriodoFerias>();
            for (const periodo of periodos) {
              if (!maisRecentePorUsuario.has(periodo.usuarioId)) {
                maisRecentePorUsuario.set(periodo.usuarioId, periodo);
              }
            }

            this.linhas.set(
              usuariosPj
                .map((usuario) => ({ usuario, periodo: maisRecentePorUsuario.get(usuario.id) ?? null }))
                .sort((a, b) => a.usuario.nome.localeCompare(b.usuario.nome)),
            );
            this.carregando.set(false);
          },
          error: () => {
            this.erro.set(true);
            this.carregando.set(false);
          },
        });
      },
      error: () => {
        this.erro.set(true);
        this.carregando.set(false);
      },
    });
  }

  protected percentualDisponivel(periodo: PeriodoFerias): number {
    return this.percentualDe(periodo.saldoDisponivel, periodo.diasDireito);
  }

  protected percentualProjecao(periodo: PeriodoFerias): number {
    return this.percentualDe(periodo.projecaoProporcional, periodo.diasDireito);
  }

  private percentualDe(valor: number, diasDireito: number): number {
    if (diasDireito <= 0) return 0;
    return Math.max(0, Math.min(100, Math.round((valor / diasDireito) * 100)));
  }

  protected gerarPeriodo(usuarioId: number): void {
    this.gerandoUsuarioId.set(usuarioId);
    this.erroGeracao.set(null);

    this.periodoFeriasService.gerarProximoPeriodo(usuarioId).subscribe({
      next: () => {
        this.gerandoUsuarioId.set(null);
        this.carregar();
      },
      error: (err) => {
        this.gerandoUsuarioId.set(null);
        this.erroGeracao.set(err?.error?.message ?? 'Não foi possível gerar o período de férias.');
      },
    });
  }
}
