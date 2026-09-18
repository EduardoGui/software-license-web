import { Location } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { Icon } from '../../shared/icons/icon';
import { Setor } from '../setores/setor';
import { SetorService } from '../setores/setor.service';
import { Usuario } from '../usuarios/usuario';
import { UsuarioService } from '../usuarios/usuario.service';
import { RecessoCorporativo, RecessoSimulacaoLinha, ROTULOS_STATUS_RECESSO } from './recesso-corporativo';
import { RecessoCorporativoService } from './recesso-corporativo.service';

@Component({
  selector: 'app-recesso-detalhe',
  imports: [ReactiveFormsModule, Icon],
  templateUrl: './recesso-detalhe.html',
  styleUrl: './recesso-detalhe.scss',
})
export class RecessoDetalhe {
  private readonly recessoService = inject(RecessoCorporativoService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly setorService = inject(SetorService);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly fb = inject(FormBuilder);

  protected readonly recessoId = Number(this.route.snapshot.paramMap.get('id'));

  protected readonly recesso = signal<RecessoCorporativo | null>(null);
  protected readonly carregando = signal(true);
  protected readonly erro = signal(false);
  protected readonly rotulosStatus = ROTULOS_STATUS_RECESSO;

  protected readonly salvandoEdicao = signal(false);
  protected readonly erroEdicao = signal<string | null>(null);
  protected readonly formEdicao = this.fb.nonNullable.group({
    nome: ['', Validators.required],
    dataInicio: ['', Validators.required],
    dataFim: ['', Validators.required],
    diasADescontar: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
  });

  protected readonly setores = signal<Setor[]>([]);
  protected readonly colaboradoresPj = signal<Usuario[]>([]);
  protected readonly setorFiltroId = signal<number | null>(null);
  protected readonly selecionados = signal<Set<number>>(new Set());

  protected readonly linhasSimulacao = signal<RecessoSimulacaoLinha[] | null>(null);
  protected readonly simulando = signal(false);
  protected readonly confirmando = signal(false);
  protected readonly erroAcao = signal<string | null>(null);

  constructor() {
    this.carregar();
    this.setorService.listar({ ativo: true }).subscribe((setores) => this.setores.set(setores));
    this.carregarColaboradores();
  }

  protected voltar(): void {
    this.location.back();
  }

  private carregar(): void {
    this.carregando.set(true);
    this.erro.set(false);

    this.recessoService.obter(this.recessoId).subscribe({
      next: (recesso) => {
        this.recesso.set(recesso);
        this.formEdicao.setValue({
          nome: recesso.nome,
          dataInicio: recesso.dataInicio,
          dataFim: recesso.dataFim,
          diasADescontar: recesso.diasADescontar,
        });
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set(true);
        this.carregando.set(false);
      },
    });
  }

  private carregarColaboradores(): void {
    const setorId = this.setorFiltroId();
    this.usuarioService.listar({ status: 'Ativo', tipo: 'Pj', setorId: setorId ?? undefined }).subscribe((usuarios) => {
      this.colaboradoresPj.set(usuarios);
    });
  }

  protected filtrarPorSetor(valor: string): void {
    this.setorFiltroId.set(valor ? Number(valor) : null);
    this.carregarColaboradores();
  }

  protected estaSelecionado(usuarioId: number): boolean {
    return this.selecionados().has(usuarioId);
  }

  protected alternarSelecionado(usuarioId: number): void {
    const atual = new Set(this.selecionados());
    if (atual.has(usuarioId)) {
      atual.delete(usuarioId);
    } else {
      atual.add(usuarioId);
    }
    this.selecionados.set(atual);
  }

  protected selecionarTodosVisiveis(): void {
    const atual = new Set(this.selecionados());
    for (const usuario of this.colaboradoresPj()) {
      atual.add(usuario.id);
    }
    this.selecionados.set(atual);
  }

  protected limparSelecao(): void {
    this.selecionados.set(new Set());
  }

  protected salvarEdicao(): void {
    if (this.formEdicao.invalid) {
      this.formEdicao.markAllAsTouched();
      return;
    }

    const valor = this.formEdicao.getRawValue();
    this.salvandoEdicao.set(true);
    this.erroEdicao.set(null);

    this.recessoService
      .atualizar(this.recessoId, {
        nome: valor.nome,
        dataInicio: valor.dataInicio,
        dataFim: valor.dataFim,
        diasADescontar: valor.diasADescontar!,
      })
      .subscribe({
        next: (recesso) => {
          this.recesso.set(recesso);
          this.salvandoEdicao.set(false);
        },
        error: (err) => {
          this.salvandoEdicao.set(false);
          this.erroEdicao.set(err?.error?.message ?? 'Não foi possível salvar as alterações.');
        },
      });
  }

  protected simular(): void {
    const usuarioIds = [...this.selecionados()];
    if (usuarioIds.length === 0) {
      this.erroAcao.set('Selecione ao menos um colaborador.');
      return;
    }

    this.simulando.set(true);
    this.erroAcao.set(null);

    this.recessoService.simular(this.recessoId, usuarioIds).subscribe({
      next: (linhas) => {
        this.linhasSimulacao.set(linhas);
        this.simulando.set(false);
      },
      error: (err) => {
        this.simulando.set(false);
        this.erroAcao.set(err?.error?.message ?? 'Não foi possível simular o recesso.');
      },
    });
  }

  protected removerDaSimulacao(usuarioId: number): void {
    this.linhasSimulacao.update((linhas) => (linhas ?? []).filter((l) => l.usuarioId !== usuarioId));
  }

  protected confirmar(): void {
    const linhas = this.linhasSimulacao();
    if (!linhas || linhas.length === 0) {
      return;
    }

    if (!confirm(`Confirmar o recesso para ${linhas.length} colaborador(es)? Essa ação não pode ser desfeita.`)) {
      return;
    }

    this.confirmando.set(true);
    this.erroAcao.set(null);

    this.recessoService.confirmar(this.recessoId, linhas.map((l) => l.usuarioId)).subscribe({
      next: (recesso) => {
        this.recesso.set(recesso);
        this.linhasSimulacao.set(null);
        this.confirmando.set(false);
      },
      error: (err) => {
        this.confirmando.set(false);
        this.erroAcao.set(err?.error?.message ?? 'Não foi possível confirmar o recesso.');
      },
    });
  }
}
