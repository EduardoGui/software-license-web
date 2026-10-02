import { Location } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { DataBrPipe } from '../../shared/pipes/data-br.pipe';
import { Setor } from '../setores/setor';
import { SetorService } from '../setores/setor.service';
import { Usuario } from '../usuarios/usuario';
import { UsuarioService } from '../usuarios/usuario.service';
import {
  CampanhaEntrega,
  CampanhaEntregaItem,
  CampanhaEntregaResumo,
  ColaboradorDisponivel,
  Entrega,
  EntregaFiltro,
  ROTULOS_STATUS_ENTREGA,
  ROTULOS_TIPO_DIVERGENCIA,
} from './campanha-entrega';
import { CampanhaEntregaService } from './campanha-entrega.service';

@Component({
  selector: 'app-campanha-entrega-detail',
  imports: [FormsModule, ReactiveFormsModule, DataBrPipe],
  templateUrl: './campanha-entrega-detail.html',
  styleUrl: './campanha-entrega-detail.scss',
})
export class CampanhaEntregaDetail {
  private readonly campanhaEntregaService = inject(CampanhaEntregaService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly setorService = inject(SetorService);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly fb = inject(FormBuilder);

  protected readonly campanhaId = Number(this.route.snapshot.paramMap.get('id'));

  protected readonly campanha = signal<CampanhaEntrega | null>(null);
  protected readonly resumo = signal<CampanhaEntregaResumo | null>(null);
  protected readonly entregas = signal<Entrega[]>([]);
  protected readonly setores = signal<Setor[]>([]);
  protected readonly usuarios = signal<Usuario[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal(false);
  protected readonly erroAcao = signal<string | null>(null);
  protected readonly processando = signal(false);

  protected readonly rotulosStatus = ROTULOS_STATUS_ENTREGA;
  protected readonly rotulosDivergencia = ROTULOS_TIPO_DIVERGENCIA;

  protected filtro: EntregaFiltro = {};

  protected readonly expandidoId = signal<number | null>(null);
  protected readonly salvandoLinha = signal(false);
  protected readonly erroLinha = signal<string | null>(null);
  protected readonly avisoLinha = signal<string | null>(null);

  protected readonly reenviando = signal(false);
  protected readonly avisoReenvio = signal<string | null>(null);

  protected readonly novaEntregaAberta = signal(false);
  protected readonly salvandoNovaEntrega = signal(false);
  protected readonly erroNovaEntrega = signal<string | null>(null);

  protected readonly formNovaEntrega = this.fb.nonNullable.group({
    quantidadeKits: [1, [Validators.required, Validators.min(1)]],
    observacao: [''],
  });

  protected readonly formItensLinha = this.fb.group({
    itens: this.fb.array<ReturnType<typeof this.criarLinhaItem>>([]),
  });

  protected readonly salvandoItensCampanha = signal(false);
  protected readonly erroItensCampanha = signal<string | null>(null);

  protected readonly formItensCampanha = this.fb.group({
    itens: this.fb.array<ReturnType<typeof this.criarLinhaItemCampanha>>([]),
  });

  protected get itensCampanha(): FormArray {
    return this.formItensCampanha.get('itens') as FormArray;
  }

  protected readonly formEntregaFisica = this.fb.nonNullable.group({
    dataEntregaFisica: ['', Validators.required],
    responsavelEntregaId: this.fb.control<number | null>(null, Validators.required),
  });

  protected get itensLinha(): FormArray {
    return this.formItensLinha.get('itens') as FormArray;
  }

  // --- Modal de adicionar colaboradores ---
  protected readonly modalColaboradoresAberto = signal(false);
  protected readonly colaboradoresDisponiveis = signal<ColaboradorDisponivel[]>([]);
  protected readonly selecionados = signal<Set<number>>(new Set());
  protected readonly carregandoColaboradores = signal(false);
  protected readonly salvandoColaboradores = signal(false);
  protected readonly erroColaboradores = signal<string | null>(null);
  protected filtroColaboradores: { nome?: string; setorId?: number } = {};

  constructor() {
    this.carregarTudo();
    this.usuarioService.listar().subscribe((usuarios) => this.usuarios.set(usuarios));
    this.setorService.listar().subscribe((setores) => this.setores.set(setores));
  }

  protected voltar(): void {
    this.location.back();
  }

  private carregarTudo(): void {
    this.carregando.set(true);
    this.erro.set(false);

    this.campanhaEntregaService.obter(this.campanhaId).subscribe({
      next: (campanha) => {
        this.campanha.set(campanha);
        this.preencherFormItensCampanha(campanha.itens);
      },
      error: () => this.erro.set(true),
    });
    this.campanhaEntregaService.obterResumo(this.campanhaId).subscribe((resumo) => this.resumo.set(resumo));
    this.buscarEntregas();
  }

  protected buscarEntregas(): void {
    this.carregando.set(true);
    this.campanhaEntregaService.listarEntregas(this.campanhaId, this.filtro).subscribe({
      next: (entregas) => {
        this.entregas.set(entregas);
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
    this.buscarEntregas();
  }

  private atualizarTudo(): void {
    this.campanhaEntregaService.obter(this.campanhaId).subscribe((campanha) => this.campanha.set(campanha));
    this.campanhaEntregaService.obterResumo(this.campanhaId).subscribe((resumo) => this.resumo.set(resumo));
    this.buscarEntregas();
  }

  protected resumoItens(entrega: Entrega): string {
    if (entrega.itens.length === 0) {
      return '— sem itens escolhidos';
    }
    return entrega.itens.map((i) => `${i.quantidade}× ${i.descricao}${i.tamanho ? ' (' + i.tamanho + ')' : ''}`).join(', ');
  }

  protected classeStatus(status: string): string {
    return 'badge--' + status.toLowerCase();
  }

  // --- Ações da campanha ---

  protected cancelarCampanha(): void {
    if (!confirm('Cancelar esta campanha? As entregas ainda pendentes ou com e-mail enviado serão canceladas.')) {
      return;
    }
    this.processando.set(true);
    this.campanhaEntregaService.cancelar(this.campanhaId).subscribe({
      next: (campanha) => {
        this.campanha.set(campanha);
        this.processando.set(false);
        this.atualizarTudo();
      },
      error: (err) => {
        this.processando.set(false);
        this.erroAcao.set(err?.error?.message ?? 'Não foi possível cancelar a campanha.');
      },
    });
  }

  protected encerrarCampanha(): void {
    this.processando.set(true);
    this.campanhaEntregaService.encerrar(this.campanhaId).subscribe({
      next: (campanha) => {
        this.campanha.set(campanha);
        this.processando.set(false);
      },
      error: (err) => {
        this.processando.set(false);
        this.erroAcao.set(err?.error?.message ?? 'Não foi possível encerrar a campanha.');
      },
    });
  }

  // --- Itens da campanha (aplicados automaticamente a quem for adicionado) ---

  private preencherFormItensCampanha(itens: CampanhaEntregaItem[]): void {
    this.itensCampanha.clear();
    for (const item of itens) {
      this.itensCampanha.push(this.criarLinhaItemCampanha(item));
    }
  }

  private criarLinhaItemCampanha(item?: CampanhaEntregaItem) {
    return this.fb.group({
      id: this.fb.control<number | null>(item?.id ?? null),
      vaiParaTodos: this.fb.nonNullable.control(item?.vaiParaTodos ?? true),
      descricao: this.fb.nonNullable.control(item?.descricao ?? '', Validators.required),
      tamanho: this.fb.nonNullable.control(item?.tamanho ?? ''),
      quantidade: this.fb.nonNullable.control(item?.quantidade ?? 1, [Validators.required, Validators.min(1)]),
      validade: this.fb.nonNullable.control(item?.validade ?? ''),
      quantidadeDisponivel: this.fb.control<number | null>(item?.quantidadeDisponivel ?? null, Validators.min(0)),
    });
  }

  protected adicionarLinhaItemCampanha(): void {
    this.itensCampanha.push(this.criarLinhaItemCampanha());
  }

  protected removerLinhaItemCampanha(index: number): void {
    this.itensCampanha.removeAt(index);
  }

  protected salvarItensCampanha(): void {
    if (this.itensCampanha.invalid) {
      this.itensCampanha.markAllAsTouched();
      return;
    }

    this.salvandoItensCampanha.set(true);
    this.erroItensCampanha.set(null);

    const itens = this.itensCampanha.getRawValue().map((i) => ({
      id: i.id,
      vaiParaTodos: i.vaiParaTodos,
      descricao: i.descricao,
      tamanho: i.tamanho || null,
      quantidade: i.quantidade,
      validade: i.validade || null,
      quantidadeDisponivel: i.quantidadeDisponivel,
    }));

    this.campanhaEntregaService.atualizarItensCampanha(this.campanhaId, { itens }).subscribe({
      next: (campanha) => {
        this.campanha.set(campanha);
        this.salvandoItensCampanha.set(false);
        this.atualizarTudo();
      },
      error: (err) => {
        this.salvandoItensCampanha.set(false);
        this.erroItensCampanha.set(err?.error?.message ?? 'Não foi possível salvar os itens da campanha.');
      },
    });
  }

  // --- Colar lista (importar itens do Excel) ---

  protected readonly modalColarAberto = signal(false);
  protected textoColar = '';

  protected abrirColarLista(): void {
    this.textoColar = '';
    this.modalColarAberto.set(true);
  }

  protected fecharColarLista(): void {
    this.modalColarAberto.set(false);
  }

  // Cada linha: DESCRIÇÃO ... TAMANHO ESTOQUE (o que o Excel cola, separado por tab ou espaços).
  // Último termo = estoque (inteiro), penúltimo = tamanho, o resto = descrição.
  protected linhasColadas(): ({ descricao: string; tamanho: string; estoque: number; duplicada: boolean } | null)[] {
    const existentes = new Set(
      this.itensCampanha.getRawValue().map((i) => `${i.descricao.trim().toUpperCase()}|${(i.tamanho ?? '').trim().toUpperCase()}`),
    );
    const vistas = new Set<string>();

    return this.textoColar
      .split(/\r?\n/)
      .map((linha) => linha.trim())
      .filter((linha) => linha.length > 0)
      .map((linha) => {
        const termos = linha.split(/\s+/);
        const estoque = Number(termos[termos.length - 1]);
        if (termos.length < 3 || !Number.isInteger(estoque) || estoque < 0) {
          return null;
        }

        const tamanho = termos[termos.length - 2];
        const descricao = termos.slice(0, -2).join(' ');
        const chave = `${descricao.toUpperCase()}|${tamanho.toUpperCase()}`;
        const duplicada = existentes.has(chave) || vistas.has(chave);
        vistas.add(chave);
        return { descricao, tamanho, estoque, duplicada };
      });
  }

  protected quantidadeColadaValida(): number {
    return this.linhasColadas().filter((l) => l !== null && !l.duplicada).length;
  }

  protected confirmarColarLista(): void {
    for (const linha of this.linhasColadas()) {
      if (linha === null || linha.duplicada) {
        continue;
      }
      const nova = this.criarLinhaItemCampanha();
      nova.patchValue({
        descricao: linha.descricao,
        tamanho: linha.tamanho,
        quantidade: 1,
        quantidadeDisponivel: linha.estoque,
        vaiParaTodos: false,
      });
      this.itensCampanha.push(nova);
    }
    this.modalColarAberto.set(false);
  }

  // --- Linha expansível ---

  protected linhaExpandida(entrega: Entrega): boolean {
    return this.expandidoId() === entrega.id;
  }

  protected alternarLinha(entrega: Entrega): void {
    if (this.linhaExpandida(entrega)) {
      this.expandidoId.set(null);
      return;
    }

    this.expandidoId.set(entrega.id);
    this.erroLinha.set(null);
    this.avisoLinha.set(null);
    this.novaEntregaAberta.set(false);
    this.erroNovaEntrega.set(null);
    this.formNovaEntrega.reset({ quantidadeKits: 1, observacao: '' });

    this.itensLinha.clear();
    for (const item of entrega.itens) {
      this.itensLinha.push(this.criarLinhaItem(item));
    }
    if (entrega.status === 'Pendente') {
      this.formItensLinha.enable();
    } else {
      this.formItensLinha.disable();
    }

    this.formEntregaFisica.reset({
      dataEntregaFisica: entrega.dataEntregaFisica ?? '',
      responsavelEntregaId: entrega.responsavelEntregaId,
    });
  }

  private criarLinhaItem(item?: { campanhaEntregaItemId: number | null; quantidade: number }) {
    return this.fb.group({
      campanhaEntregaItemId: this.fb.control<number | null>(item?.campanhaEntregaItemId ?? null, Validators.required),
      quantidade: this.fb.nonNullable.control(item?.quantidade ?? 1, [Validators.required, Validators.min(1)]),
    });
  }

  // Itens do catálogo agrupados por descrição (ex.: CAMISA POLO FEM -> P, M, G, GG), com o saldo de cada tamanho.
  // Opção sem saldo fica desabilitada, a não ser que já seja a escolhida nesta própria entrega.
  protected gruposDeItens(entrega: Entrega): { descricao: string; opcoes: { id: number; rotulo: string; desabilitada: boolean }[] }[] {
    const jaEscolhidos = new Set(entrega.itens.map((i) => i.campanhaEntregaItemId));
    const grupos = new Map<string, { id: number; rotulo: string; desabilitada: boolean }[]>();

    for (const item of this.campanha()?.itens ?? []) {
      const saldo = item.saldoDisponivel;
      const rotuloSaldo = saldo === null ? 'sem controle de estoque' : `saldo ${saldo}`;
      const opcao = {
        id: item.id,
        rotulo: `${item.tamanho ?? 'único'} — ${rotuloSaldo}`,
        desabilitada: saldo !== null && saldo <= 0 && !jaEscolhidos.has(item.id),
      };
      grupos.set(item.descricao, [...(grupos.get(item.descricao) ?? []), opcao]);
    }

    return [...grupos.entries()].map(([descricao, opcoes]) => ({ descricao, opcoes }));
  }

  protected adicionarLinhaItem(): void {
    this.itensLinha.push(this.criarLinhaItem());
  }

  protected removerLinhaItem(index: number): void {
    this.itensLinha.removeAt(index);
  }

  protected salvarItens(entrega: Entrega): void {
    if (this.itensLinha.invalid) {
      this.itensLinha.markAllAsTouched();
      return;
    }

    this.salvandoLinha.set(true);
    this.erroLinha.set(null);

    const itens = this.itensLinha.getRawValue().map((i) => ({
      campanhaEntregaItemId: i.campanhaEntregaItemId!,
      quantidade: i.quantidade,
    }));

    this.campanhaEntregaService.atualizarItensEntrega(this.campanhaId, entrega.id, { itens }).subscribe({
      next: (atualizada) => {
        this.substituirEntrega(atualizada);
        this.salvandoLinha.set(false);
        this.expandidoId.set(null);
      },
      error: (err) => {
        this.salvandoLinha.set(false);
        this.erroLinha.set(err?.error?.message ?? 'Não foi possível salvar os itens.');
      },
    });
  }

  protected registrarEntregaFisica(entrega: Entrega): void {
    if (this.formEntregaFisica.invalid) {
      this.formEntregaFisica.markAllAsTouched();
      return;
    }

    const valor = this.formEntregaFisica.getRawValue();
    this.salvandoLinha.set(true);
    this.erroLinha.set(null);

    this.campanhaEntregaService
      .registrarEntregaFisica(this.campanhaId, entrega.id, {
        dataEntregaFisica: valor.dataEntregaFisica,
        responsavelEntregaId: valor.responsavelEntregaId!,
      })
      .subscribe({
        next: (atualizada) => {
          this.substituirEntrega(atualizada);
          this.salvandoLinha.set(false);
        },
        error: (err) => {
          this.salvandoLinha.set(false);
          this.erroLinha.set(err?.error?.message ?? 'Não foi possível registrar a entrega física.');
        },
      });
  }

  protected cancelarEntrega(entrega: Entrega): void {
    if (!confirm('Cancelar a entrega deste colaborador?')) {
      return;
    }

    this.salvandoLinha.set(true);
    this.erroLinha.set(null);

    this.campanhaEntregaService.cancelarEntrega(this.campanhaId, entrega.id).subscribe({
      next: (atualizada) => {
        this.substituirEntrega(atualizada);
        this.salvandoLinha.set(false);
        this.expandidoId.set(null);
        this.atualizarTudo();
      },
      error: (err) => {
        this.salvandoLinha.set(false);
        this.erroLinha.set(err?.error?.message ?? 'Não foi possível cancelar a entrega.');
      },
    });
  }

  protected abrirNovaEntrega(): void {
    this.novaEntregaAberta.set(true);
    this.erroNovaEntrega.set(null);
    this.formNovaEntrega.reset({ quantidadeKits: 1, observacao: '' });
  }

  protected fecharNovaEntrega(): void {
    this.novaEntregaAberta.set(false);
  }

  protected confirmarNovaEntrega(entrega: Entrega): void {
    if (this.formNovaEntrega.invalid) {
      this.formNovaEntrega.markAllAsTouched();
      return;
    }

    const valor = this.formNovaEntrega.getRawValue();
    this.salvandoNovaEntrega.set(true);
    this.erroNovaEntrega.set(null);

    this.campanhaEntregaService
      .adicionarEntrega(this.campanhaId, {
        usuarioId: entrega.usuarioId,
        quantidadeKits: valor.quantidadeKits,
        observacao: valor.observacao || null,
      })
      .subscribe({
        next: () => {
          this.salvandoNovaEntrega.set(false);
          this.novaEntregaAberta.set(false);
          this.expandidoId.set(null);
          this.atualizarTudo();
        },
        error: (err) => {
          this.salvandoNovaEntrega.set(false);
          this.erroNovaEntrega.set(err?.error?.message ?? 'Não foi possível registrar a nova entrega.');
        },
      });
  }

  protected enviarEmail(entrega: Entrega): void {
    this.salvandoLinha.set(true);
    this.erroLinha.set(null);
    this.avisoLinha.set(null);

    this.campanhaEntregaService.enviarEmail(this.campanhaId, entrega.id).subscribe({
      next: (atualizada) => {
        this.substituirEntrega(atualizada);
        this.salvandoLinha.set(false);
        this.avisoLinha.set(atualizada.avisoEmail);
      },
      error: (err) => {
        this.salvandoLinha.set(false);
        this.erroLinha.set(err?.error?.message ?? 'Não foi possível enviar o e-mail.');
      },
    });
  }

  protected reenviarPendentes(): void {
    this.reenviando.set(true);
    this.avisoReenvio.set(null);

    this.campanhaEntregaService.reenviarPendentes(this.campanhaId).subscribe({
      next: (entregas) => {
        this.reenviando.set(false);
        const falhas = entregas.filter((e) => e.avisoEmail).length;
        this.avisoReenvio.set(
          entregas.length === 0
            ? 'Nenhum colaborador pendente para reenviar.'
            : `${entregas.length} e-mail(s) processado(s)${falhas > 0 ? `, ${falhas} com falha no envio` : ''}.`,
        );
        this.atualizarTudo();
      },
      error: (err) => {
        this.reenviando.set(false);
        this.avisoReenvio.set(err?.error?.message ?? 'Não foi possível reenviar os e-mails.');
      },
    });
  }

  private substituirEntrega(atualizada: Entrega): void {
    this.entregas.set(this.entregas().map((e) => (e.id === atualizada.id ? atualizada : e)));
    this.campanhaEntregaService.obterResumo(this.campanhaId).subscribe((resumo) => this.resumo.set(resumo));
    // O saldo do catálogo muda a cada item atribuído/cancelado, então a campanha também é recarregada.
    this.campanhaEntregaService.obter(this.campanhaId).subscribe((campanha) => this.campanha.set(campanha));
  }

  // --- Modal de adicionar colaboradores ---

  protected abrirModalColaboradores(): void {
    this.filtroColaboradores = {};
    this.selecionados.set(new Set());
    this.erroColaboradores.set(null);
    this.modalColaboradoresAberto.set(true);
    this.buscarColaboradoresDisponiveis();
  }

  protected fecharModalColaboradores(): void {
    this.modalColaboradoresAberto.set(false);
  }

  protected buscarColaboradoresDisponiveis(): void {
    this.carregandoColaboradores.set(true);
    this.campanhaEntregaService.listarColaboradoresDisponiveis(this.campanhaId, this.filtroColaboradores).subscribe({
      next: (colaboradores) => {
        this.colaboradoresDisponiveis.set(colaboradores);
        this.carregandoColaboradores.set(false);
      },
      error: () => this.carregandoColaboradores.set(false),
    });
  }

  protected estaSelecionado(id: number): boolean {
    return this.selecionados().has(id);
  }

  protected alternarSelecionado(id: number): void {
    const atual = new Set(this.selecionados());
    if (atual.has(id)) {
      atual.delete(id);
    } else {
      atual.add(id);
    }
    this.selecionados.set(atual);
  }

  protected todosSelecionados(): boolean {
    const disponiveis = this.colaboradoresDisponiveis();
    return disponiveis.length > 0 && disponiveis.every((c) => this.selecionados().has(c.id));
  }

  protected alternarSelecionarTodos(): void {
    if (this.todosSelecionados()) {
      this.selecionados.set(new Set());
      return;
    }
    this.selecionados.set(new Set(this.colaboradoresDisponiveis().map((c) => c.id)));
  }

  protected adicionarSelecionados(): void {
    const usuarioIds = [...this.selecionados()];
    if (usuarioIds.length === 0) {
      this.erroColaboradores.set('Selecione ao menos um colaborador.');
      return;
    }

    this.salvandoColaboradores.set(true);
    this.erroColaboradores.set(null);

    this.campanhaEntregaService.adicionarEntregasLote(this.campanhaId, { usuarioIds }).subscribe({
      next: () => {
        this.salvandoColaboradores.set(false);
        this.modalColaboradoresAberto.set(false);
        this.atualizarTudo();
      },
      error: (err) => {
        this.salvandoColaboradores.set(false);
        this.erroColaboradores.set(err?.error?.message ?? 'Não foi possível adicionar os colaboradores.');
      },
    });
  }
}
