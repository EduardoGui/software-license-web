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

  protected readonly formItensLinha = this.fb.group({
    itens: this.fb.array<ReturnType<typeof this.criarLinhaItem>>([]),
  });

  protected readonly salvandoItensCampanha = signal(false);
  protected readonly erroItensCampanha = signal<string | null>(null);

  protected readonly formItensCampanha = this.fb.group({
    itens: this.fb.array<ReturnType<typeof this.criarLinhaItem>>([]),
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
    this.campanhaEntregaService.obterResumo(this.campanhaId).subscribe((resumo) => this.resumo.set(resumo));
    this.buscarEntregas();
  }

  protected resumoItens(entrega: Entrega): string {
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

  private preencherFormItensCampanha(itens: Entrega['itens']): void {
    this.itensCampanha.clear();
    for (const item of itens) {
      this.itensCampanha.push(this.criarLinhaItem(item));
    }
  }

  protected adicionarLinhaItemCampanha(): void {
    this.itensCampanha.push(this.criarLinhaItem());
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
      descricao: i.descricao,
      tamanho: i.tamanho || null,
      quantidade: i.quantidade,
      validade: i.validade || null,
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

    this.itensLinha.clear();
    for (const item of entrega.itens) {
      this.itensLinha.push(this.criarLinhaItem(item));
    }

    this.formEntregaFisica.reset({
      dataEntregaFisica: entrega.dataEntregaFisica ?? '',
      responsavelEntregaId: entrega.responsavelEntregaId,
    });
  }

  private criarLinhaItem(item?: { descricao: string; tamanho: string | null; quantidade: number; validade: string | null }) {
    return this.fb.group({
      descricao: this.fb.nonNullable.control(item?.descricao ?? '', Validators.required),
      tamanho: this.fb.nonNullable.control(item?.tamanho ?? ''),
      quantidade: this.fb.nonNullable.control(item?.quantidade ?? 1, [Validators.required, Validators.min(1)]),
      validade: this.fb.nonNullable.control(item?.validade ?? ''),
    });
  }

  protected adicionarLinhaItem(): void {
    this.itensLinha.push(this.criarLinhaItem());
  }

  protected removerLinhaItem(index: number): void {
    this.itensLinha.removeAt(index);
  }

  protected salvarItens(entrega: Entrega): void {
    if (this.itensLinha.invalid || this.itensLinha.length === 0) {
      this.itensLinha.markAllAsTouched();
      return;
    }

    this.salvandoLinha.set(true);
    this.erroLinha.set(null);

    const itens = this.itensLinha.getRawValue().map((i) => ({
      descricao: i.descricao,
      tamanho: i.tamanho || null,
      quantidade: i.quantidade,
      validade: i.validade || null,
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
