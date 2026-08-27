import { Location } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Icon } from '../../shared/icons/icon';
import { Usuario } from '../usuarios/usuario';
import { UsuarioService } from '../usuarios/usuario.service';
import { NotaDebitoPj } from './nota-debito-pj';
import { NotaDebitoPjService } from './nota-debito-pj.service';

@Component({
  selector: 'app-nota-debito-pj-form',
  imports: [ReactiveFormsModule, RouterLink, Icon],
  templateUrl: './nota-debito-pj-form.html',
  styleUrl: './nota-debito-pj-form.scss',
})
export class NotaDebitoPjForm {
  private readonly fb = inject(FormBuilder);
  private readonly notaService = inject(NotaDebitoPjService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  protected readonly notaId = signal<number | null>(null);
  protected readonly nota = signal<NotaDebitoPj | null>(null);
  protected readonly usuariosPj = signal<Usuario[]>([]);
  protected readonly carregando = signal(false);
  protected readonly salvando = signal(false);
  protected readonly erro = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    usuarioId: [null as number | null, Validators.required],
    ano: [new Date().getFullYear(), Validators.required],
    mes: [new Date().getMonth() + 1, Validators.required],
    operadoraSaude: ['', Validators.required],
    numeroDocumento: [''],
    descricao: [''],
    desconto: [0],
    retencaoTributaria: [0],
    dataVencimento: [''],
    formaPagamento: ['PIX'],
    centroCusto: [''],
    area: [''],
    contaContabil: [''],
    projetoContrato: [''],
  });

  protected get editando(): boolean {
    return this.notaId() !== null;
  }

  constructor() {
    this.usuarioService.listar({ status: 'Ativo' }).subscribe((usuarios) => {
      this.usuariosPj.set(usuarios.filter((u) => u.tipo === 'Pj'));
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.notaId.set(id);
      this.carregar(id);
    }
  }

  protected voltar(): void {
    this.location.back();
  }

  private carregar(id: number): void {
    this.carregando.set(true);
    this.notaService.obter(id).subscribe({
      next: (nota) => {
        this.nota.set(nota);
        this.form.patchValue({
          usuarioId: nota.usuarioId,
          ano: nota.ano,
          mes: nota.mes,
          operadoraSaude: nota.operadoraSaude,
          numeroDocumento: nota.numeroDocumento ?? '',
          descricao: nota.descricao ?? '',
          desconto: nota.desconto,
          retencaoTributaria: nota.retencaoTributaria,
          dataVencimento: nota.dataVencimento ?? '',
          formaPagamento: nota.formaPagamento ?? '',
          centroCusto: nota.centroCusto ?? '',
          area: nota.area ?? '',
          contaContabil: nota.contaContabil ?? '',
          projetoContrato: nota.projetoContrato ?? '',
        });
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set('Não foi possível carregar a nota de débito.');
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
    this.salvando.set(true);
    this.erro.set(null);

    const camposComuns = {
      operadoraSaude: valor.operadoraSaude,
      numeroDocumento: valor.numeroDocumento || null,
      descricao: valor.descricao || null,
      desconto: valor.desconto,
      retencaoTributaria: valor.retencaoTributaria,
      dataVencimento: valor.dataVencimento || null,
      formaPagamento: valor.formaPagamento || null,
      centroCusto: valor.centroCusto || null,
      area: valor.area || null,
      contaContabil: valor.contaContabil || null,
      projetoContrato: valor.projetoContrato || null,
    };

    const requisicao = this.editando
      ? this.notaService.atualizar(this.notaId()!, camposComuns)
      : this.notaService.criar({ usuarioId: valor.usuarioId!, ano: valor.ano, mes: valor.mes, ...camposComuns });

    requisicao.subscribe({
      next: (nota) => this.router.navigate(['/dp/plano-saude/notas-debito', nota.id]),
      error: (err) => {
        this.salvando.set(false);
        this.erro.set(err?.error?.message ?? 'Não foi possível salvar a nota de débito.');
      },
    });
  }
}
