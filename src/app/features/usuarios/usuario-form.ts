import { Location } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { EmpresaPj } from '../empresas-pj/empresa-pj';
import { EmpresaPjService } from '../empresas-pj/empresa-pj.service';
import { Icon } from '../../shared/icons/icon';
import { Usuario, UsuarioTipo } from './usuario';
import { UsuarioService } from './usuario.service';

@Component({
  selector: 'app-usuario-form',
  imports: [ReactiveFormsModule, FormsModule, RouterLink, Icon],
  templateUrl: './usuario-form.html',
  styleUrl: './usuario-form.scss',
})
export class UsuarioForm {
  private readonly fb = inject(FormBuilder);
  private readonly usuarioService = inject(UsuarioService);
  private readonly empresaPjService = inject(EmpresaPjService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  protected readonly usuarioId = signal<number | null>(null);
  protected readonly usuario = signal<Usuario | null>(null);
  protected readonly carregando = signal(false);
  protected readonly salvando = signal(false);
  protected readonly erro = signal<string | null>(null);
  protected readonly empresasPj = signal<EmpresaPj[]>([]);

  protected readonly form = this.fb.nonNullable.group({
    nome: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    dataInicio: ['', Validators.required],
    dataFim: [''],
    observacao: [''],
    tipo: [null as UsuarioTipo | null],
    empresaPjId: [null as number | null],
  });

  // Dependentes: gerenciados fora do form reativo principal (só existem depois do usuário salvo).
  protected novoDependenteNome = '';
  protected readonly salvandoDependente = signal(false);
  protected readonly erroDependente = signal<string | null>(null);
  protected readonly editandoDependenteId = signal<number | null>(null);
  protected dependenteEmEdicaoNome = '';
  protected dependenteEmEdicaoAtivo = true;

  protected get editando(): boolean {
    return this.usuarioId() !== null;
  }

  protected voltar(): void {
    this.location.back();
  }

  constructor() {
    this.empresaPjService.listar({ ativa: true }).subscribe((empresas) => this.empresasPj.set(empresas));

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.usuarioId.set(id);
      this.carregar(id);
    } else {
      this.restaurarRascunho();
    }
  }

  // Sair pra cadastrar/editar uma Empresa PJ destrói este componente; guarda o formulário
  // em sessionStorage pra não perder seleções ainda não salvas ao voltar.
  private chaveRascunho(): string {
    return `usuario-form-rascunho:${this.usuarioId() ?? 'novo'}`;
  }

  protected prepararNavegacaoParaEmpresa(): void {
    sessionStorage.setItem(this.chaveRascunho(), JSON.stringify(this.form.getRawValue()));
  }

  private restaurarRascunho(): void {
    const bruto = sessionStorage.getItem(this.chaveRascunho());
    if (!bruto) {
      return;
    }
    sessionStorage.removeItem(this.chaveRascunho());
    this.form.patchValue(JSON.parse(bruto));
  }

  private carregar(id: number): void {
    this.carregando.set(true);
    this.usuarioService.obter(id).subscribe({
      next: (usuario) => {
        this.usuario.set(usuario);
        this.form.patchValue({
          nome: usuario.nome,
          email: usuario.email,
          dataInicio: usuario.dataInicio,
          dataFim: usuario.dataFim ?? '',
          observacao: usuario.observacao ?? '',
          tipo: usuario.tipo,
          empresaPjId: usuario.empresaPjId,
        });
        this.restaurarRascunho();
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set('Não foi possível carregar o usuário.');
        this.carregando.set(false);
      },
    });
  }

  protected salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valor = this.form.getRawValue();
    const payload = {
      nome: valor.nome,
      email: valor.email,
      dataInicio: valor.dataInicio,
      dataFim: valor.dataFim || null,
      observacao: valor.observacao || null,
      tipo: valor.tipo,
      empresaPjId: valor.tipo === 'Pj' ? valor.empresaPjId : null,
    };

    this.salvando.set(true);
    this.erro.set(null);

    const requisicao = this.editando
      ? this.usuarioService.atualizar(this.usuarioId()!, payload)
      : this.usuarioService.criar(payload);

    requisicao.subscribe({
      next: () => this.router.navigate(['/usuarios']),
      error: (err) => {
        this.salvando.set(false);
        this.erro.set(err?.error?.message ?? 'Não foi possível salvar o usuário.');
      },
    });
  }

  protected adicionarDependente(): void {
    const nome = this.novoDependenteNome.trim();
    if (!nome) {
      return;
    }

    this.salvandoDependente.set(true);
    this.erroDependente.set(null);

    this.usuarioService.adicionarDependente(this.usuarioId()!, nome).subscribe({
      next: (usuario) => {
        this.usuario.set(usuario);
        this.novoDependenteNome = '';
        this.salvandoDependente.set(false);
      },
      error: (err) => {
        this.salvandoDependente.set(false);
        this.erroDependente.set(err?.error?.message ?? 'Não foi possível adicionar o dependente.');
      },
    });
  }

  protected editarDependente(dependenteId: number, nomeAtual: string, ativoAtual: boolean): void {
    this.editandoDependenteId.set(dependenteId);
    this.dependenteEmEdicaoNome = nomeAtual;
    this.dependenteEmEdicaoAtivo = ativoAtual;
  }

  protected cancelarEdicaoDependente(): void {
    this.editandoDependenteId.set(null);
  }

  protected salvarEdicaoDependente(): void {
    const nome = this.dependenteEmEdicaoNome.trim();
    const dependenteId = this.editandoDependenteId();
    if (!nome || dependenteId === null) {
      return;
    }

    this.salvandoDependente.set(true);
    this.erroDependente.set(null);

    this.usuarioService.atualizarDependente(this.usuarioId()!, dependenteId, nome, this.dependenteEmEdicaoAtivo).subscribe({
      next: (usuario) => {
        this.usuario.set(usuario);
        this.editandoDependenteId.set(null);
        this.salvandoDependente.set(false);
      },
      error: (err) => {
        this.salvandoDependente.set(false);
        this.erroDependente.set(err?.error?.message ?? 'Não foi possível atualizar o dependente.');
      },
    });
  }

  protected removerDependente(dependenteId: number): void {
    if (!confirm('Remover este dependente?')) {
      return;
    }

    this.usuarioService.removerDependente(this.usuarioId()!, dependenteId).subscribe({
      next: (usuario) => this.usuario.set(usuario),
      error: () => this.erroDependente.set('Não foi possível remover o dependente.'),
    });
  }
}
