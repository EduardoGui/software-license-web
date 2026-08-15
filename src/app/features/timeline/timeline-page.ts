import { formatDate } from '@angular/common';
import { Component, ElementRef, HostListener, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Licenca } from '../licencas/licenca';
import { LicencaService } from '../licencas/licenca.service';
import { Usuario } from '../usuarios/usuario';
import { UsuarioService } from '../usuarios/usuario.service';
import { DataBrPipe } from '../../shared/pipes/data-br.pipe';
import { adicionarMeses, diasEntre, hojeIso, inicioDoMes, paraData } from './timeline-datas';
import { TimelineFiltro, TimelineLicencaItem, TimelineUsuario } from './timeline';
import { TimelineService } from './timeline.service';

type PeriodoPreset = 'ultimos3meses' | 'ultimos6meses' | 'ultimos12meses' | 'anoatual' | 'personalizado';

interface Selecionado {
  usuarioNome: string;
  licencaNome: string;
  dataInicio: string;
  dataFim: string | null;
  status: string;
  observacao: string | null;
}

interface MarcaMes {
  label: string;
  posicaoPx: number;
}

const PX_POR_DIA = 6;
const PALETA_CORES = ['#1d4ed8', '#15803d', '#a16207', '#7c3aed', '#be185d', '#0891b2', '#c2410c', '#4d7c0f'];

@Component({
  selector: 'app-timeline-page',
  imports: [FormsModule, DataBrPipe],
  templateUrl: './timeline-page.html',
  styleUrl: './timeline-page.scss',
})
export class TimelinePage {
  private readonly timelineService = inject(TimelineService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly licencaService = inject(LicencaService);

  private readonly scrollContainer = viewChild<ElementRef<HTMLDivElement>>('scrollContainer');

  protected readonly usuarios = signal<TimelineUsuario[]>([]);
  protected readonly usuariosFiltro = signal<Usuario[]>([]);
  protected readonly licencasFiltro = signal<Licenca[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal(false);
  protected readonly colapsados = signal<Set<number>>(new Set());
  protected readonly selecionado = signal<Selecionado | null>(null);
  protected readonly periodoAtivo = signal<PeriodoPreset>('ultimos6meses');

  protected filtro: TimelineFiltro = {};

  constructor() {
    this.usuarioService.listar().subscribe((usuarios) => this.usuariosFiltro.set(usuarios));
    this.licencaService.listar().subscribe((licencas) => this.licencasFiltro.set(licencas));
    this.definirPeriodo('ultimos6meses');
  }

  protected definirPeriodo(preset: PeriodoPreset): void {
    this.periodoAtivo.set(preset);
    const hoje = hojeIso();

    switch (preset) {
      case 'ultimos3meses':
        this.filtro.dataInicial = adicionarMeses(hoje, -3);
        this.filtro.dataFinal = hoje;
        break;
      case 'ultimos6meses':
        this.filtro.dataInicial = adicionarMeses(hoje, -6);
        this.filtro.dataFinal = hoje;
        break;
      case 'ultimos12meses':
        this.filtro.dataInicial = adicionarMeses(hoje, -12);
        this.filtro.dataFinal = hoje;
        break;
      case 'anoatual': {
        const ano = new Date().getFullYear();
        this.filtro.dataInicial = `${ano}-01-01`;
        this.filtro.dataFinal = `${ano}-12-31`;
        break;
      }
      case 'personalizado':
        break;
    }

    if (preset !== 'personalizado') {
      this.buscar();
    }
  }

  protected buscar(): void {
    this.carregando.set(true);
    this.erro.set(false);

    this.timelineService.listar(this.filtro).subscribe({
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

  protected limparFiltro(): void {
    this.filtro = { usuarioId: undefined, licencaId: undefined, status: undefined };
    this.definirPeriodo('ultimos6meses');
  }

  protected irParaHoje(): void {
    const hoje = hojeIso();
    const dentroDoPeriodo =
      this.filtro.dataInicial !== undefined &&
      this.filtro.dataFinal !== undefined &&
      hoje >= this.filtro.dataInicial &&
      hoje <= this.filtro.dataFinal;

    if (!dentroDoPeriodo) {
      this.definirPeriodo('ultimos3meses');
    }

    setTimeout(() => {
      const elemento = this.scrollContainer()?.nativeElement;
      const posicao = this.posicaoHojePx();
      if (elemento && posicao !== null) {
        elemento.scrollLeft = Math.max(0, posicao - elemento.clientWidth / 2);
      }
    });
  }

  protected expandido(usuarioId: number): boolean {
    return !this.colapsados().has(usuarioId);
  }

  protected alternarExpandido(usuarioId: number): void {
    const novo = new Set(this.colapsados());
    if (novo.has(usuarioId)) {
      novo.delete(usuarioId);
    } else {
      novo.add(usuarioId);
    }
    this.colapsados.set(novo);
  }

  @HostListener('document:keydown.escape')
  protected fecharModal(): void {
    this.selecionado.set(null);
  }

  protected selecionar(usuario: TimelineUsuario, licenca: TimelineLicencaItem): void {
    this.selecionado.set({
      usuarioNome: usuario.usuarioNome,
      licencaNome: licenca.licencaNome,
      dataInicio: licenca.dataInicio,
      dataFim: licenca.dataFim,
      status: licenca.status,
      observacao: licenca.observacao,
    });
  }

  protected corLicenca(licencaId: number): string {
    return PALETA_CORES[licencaId % PALETA_CORES.length];
  }

  protected larguraTotalPx(): number {
    if (!this.filtro.dataInicial || !this.filtro.dataFinal) {
      return 0;
    }
    return Math.max(1, diasEntre(this.filtro.dataInicial, this.filtro.dataFinal)) * PX_POR_DIA;
  }

  protected posicaoPx(dataIso: string): number {
    if (!this.filtro.dataInicial) {
      return 0;
    }
    const dias = diasEntre(this.filtro.dataInicial, dataIso);
    return Math.max(0, dias) * PX_POR_DIA;
  }

  protected larguraPx(dataInicio: string, dataFim: string | null): number {
    if (!this.filtro.dataInicial || !this.filtro.dataFinal) {
      return 0;
    }

    const inicioClamp = dataInicio < this.filtro.dataInicial ? this.filtro.dataInicial : dataInicio;
    const fimEfetivo = dataFim ?? this.filtro.dataFinal;
    const fimClamp = fimEfetivo > this.filtro.dataFinal ? this.filtro.dataFinal : fimEfetivo;

    const dias = Math.max(1, diasEntre(inicioClamp, fimClamp));
    return dias * PX_POR_DIA;
  }

  protected marcasDeMes(): MarcaMes[] {
    if (!this.filtro.dataInicial || !this.filtro.dataFinal) {
      return [];
    }

    const marcas: MarcaMes[] = [];
    let cursor = inicioDoMes(this.filtro.dataInicial);
    const limite = 36;
    let contagem = 0;

    while (cursor <= this.filtro.dataFinal && contagem < limite) {
      const dias = diasEntre(this.filtro.dataInicial, cursor);
      marcas.push({
        label: formatDate(paraData(cursor), 'MMM/yyyy', 'pt-BR'),
        posicaoPx: Math.max(0, dias) * PX_POR_DIA,
      });
      cursor = adicionarMeses(cursor, 1);
      contagem++;
    }

    return marcas;
  }

  protected posicaoHojePx(): number | null {
    const hoje = hojeIso();
    if (!this.filtro.dataInicial || !this.filtro.dataFinal) {
      return null;
    }
    if (hoje < this.filtro.dataInicial || hoje > this.filtro.dataFinal) {
      return null;
    }
    return this.posicaoPx(hoje);
  }

  protected tituloUsuario(usuario: TimelineUsuario): string {
    const inicio = this.formatarData(usuario.dataInicio);
    const fim = usuario.dataFim ? this.formatarData(usuario.dataFim) : 'atual';
    return `${usuario.usuarioNome}: ${inicio} – ${fim}`;
  }

  protected tituloLicenca(licenca: TimelineLicencaItem): string {
    const inicio = this.formatarData(licenca.dataInicio);
    const fim = licenca.dataFim ? this.formatarData(licenca.dataFim) : 'em uso';
    return `${licenca.licencaNome}: ${inicio} – ${fim}`;
  }

  private formatarData(iso: string): string {
    return formatDate(paraData(iso), 'dd/MM/yyyy', 'pt-BR');
  }
}
