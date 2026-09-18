import { formatDate } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Setor } from '../setores/setor';
import { SetorService } from '../setores/setor.service';
import { adicionarMeses, diasEntre, hojeIso, inicioDoMes, paraData } from '../timeline/timeline-datas';
import { Usuario } from '../usuarios/usuario';
import { UsuarioService } from '../usuarios/usuario.service';
import { FeriasCalendarioEvento, FeriasCalendarioFiltro, FeriasCalendarioUsuario } from './ferias-calendario';
import { FeriasConsolidadoService } from './ferias-consolidado.service';

const PX_POR_DIA = 6;

@Component({
  selector: 'app-ferias-calendario-page',
  imports: [FormsModule],
  templateUrl: './ferias-calendario-page.html',
  styleUrl: './ferias-calendario-page.scss',
})
export class FeriasCalendarioPage {
  private readonly feriasConsolidadoService = inject(FeriasConsolidadoService);
  private readonly setorService = inject(SetorService);
  private readonly usuarioService = inject(UsuarioService);

  protected readonly usuarios = signal<FeriasCalendarioUsuario[]>([]);
  protected readonly setores = signal<Setor[]>([]);
  protected readonly colaboradoresPj = signal<Usuario[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal(false);

  protected filtro: FeriasCalendarioFiltro = {};

  constructor() {
    this.setorService.listar({ ativo: true }).subscribe((setores) => this.setores.set(setores));
    this.usuarioService.listar({ status: 'Ativo', tipo: 'Pj' }).subscribe((usuarios) => this.colaboradoresPj.set(usuarios));
    this.irParaMesAtual();
  }

  private irParaMesAtual(): void {
    this.filtro.de = inicioDoMes(hojeIso());
    this.filtro.ate = adicionarMeses(this.filtro.de, 1);
    this.buscar();
  }

  protected mesAnterior(): void {
    this.filtro.de = adicionarMeses(this.filtro.de!, -1);
    this.filtro.ate = adicionarMeses(this.filtro.de, 1);
    this.buscar();
  }

  protected mesSeguinte(): void {
    this.filtro.de = adicionarMeses(this.filtro.de!, 1);
    this.filtro.ate = adicionarMeses(this.filtro.de, 1);
    this.buscar();
  }

  protected rotuloMes(): string {
    return this.filtro.de ? formatDate(paraData(this.filtro.de), 'MMMM/yyyy', 'pt-BR') : '';
  }

  protected buscar(): void {
    this.carregando.set(true);
    this.erro.set(false);

    this.feriasConsolidadoService.obterCalendario(this.filtro).subscribe({
      next: (usuarios) => {
        this.usuarios.set(usuarios);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set(true);
        this.carregando.set(false);
      },
    });
  }

  protected larguraTotalPx(): number {
    if (!this.filtro.de || !this.filtro.ate) return 0;
    return Math.max(1, diasEntre(this.filtro.de, this.filtro.ate)) * PX_POR_DIA;
  }

  protected posicaoPx(dataIso: string): number {
    if (!this.filtro.de) return 0;
    return Math.max(0, diasEntre(this.filtro.de, dataIso)) * PX_POR_DIA;
  }

  protected larguraPx(dataInicio: string, dataFim: string): number {
    if (!this.filtro.de || !this.filtro.ate) return 0;
    const inicioClamp = dataInicio < this.filtro.de ? this.filtro.de : dataInicio;
    const fimClamp = dataFim > this.filtro.ate ? this.filtro.ate : dataFim;
    return Math.max(1, diasEntre(inicioClamp, fimClamp)) * PX_POR_DIA;
  }

  protected posicaoHojePx(): number | null {
    const hoje = hojeIso();
    if (!this.filtro.de || !this.filtro.ate || hoje < this.filtro.de || hoje > this.filtro.ate) return null;
    return this.posicaoPx(hoje);
  }

  protected tituloEvento(evento: FeriasCalendarioEvento): string {
    const inicio = formatDate(paraData(evento.dataInicio), 'dd/MM/yyyy', 'pt-BR');
    const fim = formatDate(paraData(evento.dataFim), 'dd/MM/yyyy', 'pt-BR');
    return `${evento.descricao}: ${inicio} – ${fim}`;
  }
}
