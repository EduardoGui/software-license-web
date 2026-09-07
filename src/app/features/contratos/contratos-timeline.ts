import { DecimalPipe, formatDate } from '@angular/common';
import { Component, ElementRef, HostListener, computed, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Fornecedor } from '../fornecedores/fornecedor';
import { FornecedorService } from '../fornecedores/fornecedor.service';
import { DataBrPipe } from '../../shared/pipes/data-br.pipe';
import { adicionarMeses, diasEntre, hojeIso, inicioDoMes, paraData } from '../timeline/timeline-datas';
import { Contrato, ContratoStatus } from './contrato';
import { ContratoService } from './contrato.service';

type PeriodoPreset = 'ultimos3meses' | 'ultimos6meses' | 'ultimos12meses' | 'anoatual' | 'personalizado';

interface FiltroContratosTimeline {
  fornecedorId?: number;
  status?: string;
  natureza?: string;
  dataInicial?: string;
  dataFinal?: string;
}

interface FornecedorAgrupado {
  fornecedorId: number;
  fornecedorNome: string;
  dataInicio: string;
  dataFim: string;
  contratos: Contrato[];
}

interface MarcaMes {
  label: string;
  posicaoPx: number;
}

const PX_POR_DIA = 6;

@Component({
  selector: 'app-contratos-timeline',
  imports: [FormsModule, RouterLink, DataBrPipe, DecimalPipe],
  templateUrl: './contratos-timeline.html',
  styleUrl: './contratos-timeline.scss',
})
export class ContratosTimeline {
  private readonly contratoService = inject(ContratoService);
  private readonly fornecedorService = inject(FornecedorService);

  private readonly scrollContainer = viewChild<ElementRef<HTMLDivElement>>('scrollContainer');

  protected readonly contratos = signal<Contrato[]>([]);
  protected readonly fornecedoresFiltro = signal<Fornecedor[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal(false);
  protected readonly expandidos = signal<Set<number>>(new Set());
  protected readonly selecionado = signal<Contrato | null>(null);
  protected readonly periodoAtivo = signal<PeriodoPreset>('ultimos6meses');

  protected filtro: FiltroContratosTimeline = {};

  protected readonly agrupados = computed<FornecedorAgrupado[]>(() => {
    const porFornecedor = new Map<number, FornecedorAgrupado>();

    for (const contrato of this.contratos()) {
      let grupo = porFornecedor.get(contrato.fornecedorId);
      if (!grupo) {
        grupo = {
          fornecedorId: contrato.fornecedorId,
          fornecedorNome: contrato.fornecedorNome,
          dataInicio: contrato.dataInicioVigencia,
          dataFim: contrato.dataFimVigenciaAtual,
          contratos: [],
        };
        porFornecedor.set(contrato.fornecedorId, grupo);
      }
      grupo.contratos.push(contrato);
      if (contrato.dataInicioVigencia < grupo.dataInicio) grupo.dataInicio = contrato.dataInicioVigencia;
      if (contrato.dataFimVigenciaAtual > grupo.dataFim) grupo.dataFim = contrato.dataFimVigenciaAtual;
    }

    for (const grupo of porFornecedor.values()) {
      grupo.contratos.sort((a, b) => (a.dataInicioVigencia < b.dataInicioVigencia ? -1 : 1));
    }

    return [...porFornecedor.values()].sort((a, b) => a.fornecedorNome.localeCompare(b.fornecedorNome));
  });

  constructor() {
    this.fornecedorService.listar().subscribe((fornecedores) => this.fornecedoresFiltro.set(fornecedores));
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

    this.contratoService.listar({ fornecedorId: this.filtro.fornecedorId, status: this.filtro.status }).subscribe({
      next: (contratos) => {
        const natureza = this.filtro.natureza?.trim().toLowerCase();
        const filtrados = natureza ? contratos.filter((c) => c.natureza?.toLowerCase().includes(natureza)) : contratos;
        this.contratos.set(filtrados);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set(true);
        this.carregando.set(false);
      },
    });
  }

  protected limparFiltro(): void {
    this.filtro = {};
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

  protected expandido(fornecedorId: number): boolean {
    return this.expandidos().has(fornecedorId);
  }

  protected alternarExpandido(fornecedorId: number): void {
    const novo = new Set(this.expandidos());
    if (novo.has(fornecedorId)) {
      novo.delete(fornecedorId);
    } else {
      novo.add(fornecedorId);
    }
    this.expandidos.set(novo);
  }

  @HostListener('document:keydown.escape')
  protected fecharModal(): void {
    this.selecionado.set(null);
  }

  protected selecionar(contrato: Contrato): void {
    this.selecionado.set(contrato);
  }

  protected corStatus(status: ContratoStatus): string {
    switch (status) {
      case 'Ativo':
        return '#15803d';
      case 'Suspenso':
        return '#a16207';
      case 'Encerrado':
      default:
        return 'var(--color-secondary)';
    }
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

  protected larguraPx(dataInicio: string, dataFim: string): number {
    if (!this.filtro.dataInicial || !this.filtro.dataFinal) {
      return 0;
    }

    const inicioClamp = dataInicio < this.filtro.dataInicial ? this.filtro.dataInicial : dataInicio;
    const fimClamp = dataFim > this.filtro.dataFinal ? this.filtro.dataFinal : dataFim;

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

  protected tituloFornecedor(fornecedor: FornecedorAgrupado): string {
    const inicio = this.formatarData(fornecedor.dataInicio);
    const fim = this.formatarData(fornecedor.dataFim);
    const plural = fornecedor.contratos.length === 1 ? 'contrato' : 'contratos';
    return `${fornecedor.fornecedorNome}: ${fornecedor.contratos.length} ${plural}, ${inicio} – ${fim}`;
  }

  protected tituloContrato(contrato: Contrato): string {
    const inicio = this.formatarData(contrato.dataInicioVigencia);
    const fim = this.formatarData(contrato.dataFimVigenciaAtual);
    return `${contrato.numero} — ${contrato.objeto} (${contrato.status}): ${inicio} – ${fim}`;
  }

  private formatarData(iso: string): string {
    return formatDate(paraData(iso), 'dd/MM/yyyy', 'pt-BR');
  }
}
