import { Location } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { DataBrPipe } from '../../shared/pipes/data-br.pipe';
import { Icon } from '../../shared/icons/icon';
import { FaturaOperadoraSaude } from '../faturas-plano-saude/fatura-plano-saude';
import { FaturaOperadoraSaudeService } from '../faturas-plano-saude/fatura-plano-saude.service';
import { PlanoSaudeCustoService } from '../plano-saude-custos/plano-saude-custo.service';
import { Usuario } from '../usuarios/usuario';
import { UsuarioService } from '../usuarios/usuario.service';
import { NotaDebitoPj } from './nota-debito-pj';
import { NotaDebitoPjService } from './nota-debito-pj.service';

@Component({
  selector: 'app-nota-debito-pj-form',
  imports: [ReactiveFormsModule, RouterLink, Icon, DataBrPipe],
  templateUrl: './nota-debito-pj-form.html',
  styleUrl: './nota-debito-pj-form.scss',
})
export class NotaDebitoPjForm {
  private readonly fb = inject(FormBuilder);
  private readonly notaService = inject(NotaDebitoPjService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly faturaService = inject(FaturaOperadoraSaudeService);
  private readonly planoSaudeCustoService = inject(PlanoSaudeCustoService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  protected readonly notaId = signal<number | null>(null);
  protected readonly nota = signal<NotaDebitoPj | null>(null);
  protected readonly usuariosPj = signal<Usuario[]>([]);
  protected readonly faturas = signal<FaturaOperadoraSaude[]>([]);
  protected readonly carregando = signal(false);
  protected readonly salvando = signal(false);
  protected readonly erro = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    usuarioId: [null as number | null, Validators.required],
    ano: [new Date().getFullYear(), Validators.required],
    mes: [new Date().getMonth() + 1, Validators.required],
    faturaOperadoraSaudeId: [null as number | null],
    operadoraSaude: [''],
    numeroFatura: [''],
    descricao: [''],
    desconto: [0],
    retencaoTributaria: [0],
    dataEmissao: [''],
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

    this.faturaService.listar().subscribe((faturas) => this.faturas.set(faturas));

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.notaId.set(id);
      this.carregar(id);
    } else {
      // Na criação, sugere o último mês lançado no Plano de Saúde em vez do mês corrente do
      // calendário - os dois quase sempre divergem (lançamento é feito com antecedência ou atraso
      // em relação ao mês em que a nota é gerada), e usar o mês errado aqui faz a nota falhar
      // silenciosamente com "Não há coparticipação lançada para este usuário neste mês".
      this.planoSaudeCustoService.obterUltimoMes().subscribe((ultimo) => {
        if (ultimo.ano && ultimo.mes) {
          this.form.patchValue({ ano: ultimo.ano, mes: ultimo.mes });
        }
      });
    }
  }

  protected voltar(): void {
    this.location.back();
  }

  protected faturasFiltradas(): FaturaOperadoraSaude[] {
    const ano = this.form.controls.ano.value;
    const mes = this.form.controls.mes.value;
    return this.faturas().filter((f) => f.ano === ano && f.mes === mes);
  }

  protected temFaturaVinculada(): boolean {
    return this.editando ? this.nota()?.faturaOperadoraSaudeId != null : this.form.controls.faturaOperadoraSaudeId.value != null;
  }

  protected resumoFatura(): {
    operadoraSaude: string;
    numeroFatura: string | null;
    dataEmissao: string | null;
    dataVencimento: string | null;
  } | null {
    if (this.editando) {
      const nota = this.nota();
      return nota?.faturaOperadoraSaudeId != null ? nota : null;
    }

    const faturaId = this.form.controls.faturaOperadoraSaudeId.value;
    return this.faturas().find((f) => f.id === faturaId) ?? null;
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
          faturaOperadoraSaudeId: nota.faturaOperadoraSaudeId,
          operadoraSaude: nota.operadoraSaude,
          numeroFatura: nota.numeroFatura ?? '',
          descricao: nota.descricao ?? '',
          desconto: nota.desconto,
          retencaoTributaria: nota.retencaoTributaria,
          dataEmissao: nota.dataEmissao ?? '',
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

    if (!this.editando && !valor.faturaOperadoraSaudeId && !valor.operadoraSaude.trim()) {
      this.erro.set('Informe a Operadora de Saúde ou selecione uma fatura.');
      return;
    }

    this.salvando.set(true);
    this.erro.set(null);

    // Editar nunca manda null aqui - mesmo quando a nota tem fatura vinculada, esses 4 campos já
    // estão no formulário (carregados da própria nota, que o backend já sincronizou com a fatura) e o
    // backend simplesmente ignora essas colunas na atualização quando há fatura vinculada.
    // Só na criação com fatura selecionada é que mandamos null pro backend derivar tudo da fatura.
    const criandoComFatura = !this.editando && !!valor.faturaOperadoraSaudeId;
    const camposComuns = {
      operadoraSaude: criandoComFatura ? null : valor.operadoraSaude,
      numeroFatura: criandoComFatura ? null : valor.numeroFatura || null,
      dataEmissao: criandoComFatura ? null : valor.dataEmissao || null,
      dataVencimento: criandoComFatura ? null : valor.dataVencimento || null,
      descricao: valor.descricao || null,
      desconto: valor.desconto,
      retencaoTributaria: valor.retencaoTributaria,
      formaPagamento: valor.formaPagamento || null,
      centroCusto: valor.centroCusto || null,
      area: valor.area || null,
      contaContabil: valor.contaContabil || null,
      projetoContrato: valor.projetoContrato || null,
    };

    const requisicao = this.editando
      ? this.notaService.atualizar(this.notaId()!, camposComuns)
      : this.notaService.criar({
          usuarioId: valor.usuarioId!,
          ano: valor.ano,
          mes: valor.mes,
          faturaOperadoraSaudeId: valor.faturaOperadoraSaudeId,
          ...camposComuns,
        });

    requisicao.subscribe({
      next: (nota) => this.router.navigate(['/dp/plano-saude/notas-debito', nota.id]),
      error: (err) => {
        this.salvando.set(false);
        this.erro.set(err?.error?.message ?? 'Não foi possível salvar a nota de débito.');
      },
    });
  }
}
