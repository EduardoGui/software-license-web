import { AuthService } from '../auth/auth.service';
import { DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Fornecedor } from '../fornecedores/fornecedor';
import { FornecedorService } from '../fornecedores/fornecedor.service';
import { AnexosSecao } from '../../shared/anexos/anexos-secao';
import { Icon } from '../../shared/icons/icon';
import { DataBrPipe } from '../../shared/pipes/data-br.pipe';
import { cnpjEhValido } from '../../shared/validators/cnpj-validator';
import { cpfEhValido } from '../../shared/validators/cpf-validator';
import { diasEntre, hojeIso, inicioDoMes } from '../timeline/timeline-datas';
import { DestinatariosFinanceiroModal } from './destinatarios-financeiro-modal';
import { ObrigacaoUasSecao } from './obrigacao-uas-secao';
import { CampoAndamento, Obrigacao, ObrigacaoFiltro, ResponsavelObrigacao } from './obrigacao';
import { ObrigacaoService } from './obrigacao.service';
import { SolicitacaoPagamentoModal } from './solicitacao-pagamento-modal';

interface PassoAndamento {
  chave: CampoAndamento | 'assinada';
  rotulo: string;
}

// A partir de quantos dias sem avançar o andamento vira alerta.
const DIAS_ALERTA_ANDAMENTO = 7;

interface FiltroObrigacoes {
  competenciaDeMes: string;
  competenciaAteMes: string;
  tipoMovimento?: string;
  fornecedorId?: number;
  responsavelUsuarioId?: number;
  etapa?: string;
  pago?: boolean;
  incluirCanceladas: boolean;
  todosOsPeriodos: boolean;
}

@Component({
  selector: 'app-obrigacoes-list',
  imports: [FormsModule, ReactiveFormsModule, RouterLink, Icon, DataBrPipe, DecimalPipe, SolicitacaoPagamentoModal, DestinatariosFinanceiroModal, AnexosSecao, ObrigacaoUasSecao],
  templateUrl: './obrigacoes-list.html',
  styleUrl: './obrigacoes-list.scss',
})
export class ObrigacoesList {
  protected readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly obrigacaoService = inject(ObrigacaoService);
  private readonly fornecedorService = inject(FornecedorService);
  private readonly route = inject(ActivatedRoute);

  protected readonly obrigacoes = signal<Obrigacao[]>([]);
  protected readonly fornecedores = signal<Fornecedor[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal(false);

  private readonly mesAtual = inicioDoMes(hojeIso()).slice(0, 7);

  protected filtro: FiltroObrigacoes = {
    competenciaDeMes: this.mesAtual,
    competenciaAteMes: this.mesAtual,
    incluirCanceladas: false,
    pago: false,
    todosOsPeriodos: true,
  };

  // Linha expansível (acompanhamento)
  protected readonly expandidoId = signal<number | null>(null);
  protected readonly salvandoLinha = signal(false);
  protected readonly erroLinha = signal<string | null>(null);
  protected readonly processandoAcao = signal(false);

  // Nova parcela (OC paga em várias vezes): painel dentro da linha expandida.
  protected readonly parcelaEmCriacaoId = signal<number | null>(null);
  protected readonly criandoParcela = signal(false);
  protected readonly valorNovaParcela = this.fb.control<number | null>(null);

  // Andamento documental (datas da OC/BM de origem), salvo à parte do formulário de pagamento.
  protected readonly salvandoAndamento = signal(false);
  protected readonly erroAndamento = signal<string | null>(null);
  protected readonly formAndamento = this.fb.nonNullable.group({
    dataSolicitacaoEspelho: [''],
    dataEnvioAssinatura: [''],
    dataEnvioFornecedor: [''],
    dataChegadaMaterial: [''],
    dataLiberacaoNf: [''],
  });

  protected readonly formLinha = this.fb.nonNullable.group({
    valorPrevisto: this.fb.control<number | null>(null),
    dataNf: [''],
    numeroNf: [''],
    valorNota: this.fb.control<number | null>(null),
    vencimento: [''],
    dataRequisicao: [''],
    dataAssistPgto: [''],
    dataEnvioFinanceiro: [''],
    dataPrevistaPagamento: [''],
    observacoes: [''],
  });

  // Modal de cadastro rápido de fornecedor
  // E-mail de solicitação de pagamento ao financeiro (rascunho) e lista de destinatários.
  protected readonly solicitacaoObrigacaoId = signal<number | null>(null);
  protected readonly destinatariosAberto = signal(false);

  protected readonly modalFornecedorAberto = signal(false);
  protected readonly salvandoFornecedor = signal(false);
  protected readonly erroFornecedor = signal<string | null>(null);

  protected readonly formFornecedor = this.fb.nonNullable.group({
    nome: ['', Validators.required],
    pessoa: ['PJ' as 'PJ' | 'PF'],
    documento: ['', Validators.required],
  });

  // Responsável pela obrigação (só o Administrador atribui): usuários Administrativos disponíveis e escolha pendente por linha.
  protected readonly responsaveis = signal<ResponsavelObrigacao[]>([]);
  protected readonly atribuindoResponsavel = signal(false);
  protected responsavelEscolhido: number | null = null;

  constructor() {
    this.fornecedorService.listar().subscribe((fornecedores) => this.fornecedores.set(fornecedores));
    if (this.authService.ehAdministrador()) {
      this.obrigacaoService.listarResponsaveis().subscribe((responsaveis) => this.responsaveis.set(responsaveis));
    }

    const fornecedorId = Number(this.route.snapshot.queryParamMap.get('fornecedorId'));
    if (fornecedorId) {
      // Chegando de um link "Ver obrigações" (ex.: tela de Fornecedores) - mostra o
      // extrato completo dele, não só o mês atual.
      this.filtro.fornecedorId = fornecedorId;
      this.filtro.todosOsPeriodos = true;
    }

    this.buscar();
  }

  protected buscar(): void {
    this.carregando.set(true);
    this.erro.set(false);
    this.expandidoId.set(null);

    const filtroApi: ObrigacaoFiltro = {
      competenciaDe: this.filtro.todosOsPeriodos ? undefined : `${this.filtro.competenciaDeMes}-01`,
      competenciaAte: this.filtro.todosOsPeriodos ? undefined : `${this.filtro.competenciaAteMes}-01`,
      tipoMovimento: this.filtro.tipoMovimento,
      fornecedorId: this.filtro.fornecedorId,
      responsavelUsuarioId: this.filtro.responsavelUsuarioId,
      etapa: this.filtro.etapa,
      pago: this.filtro.pago,
      cancelada: this.filtro.incluirCanceladas ? undefined : false,
    };

    this.obrigacaoService.listar(filtroApi).subscribe({
      next: (obrigacoes) => {
        this.obrigacoes.set(obrigacoes);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set(true);
        this.carregando.set(false);
      },
    });
  }

  protected limparFiltro(): void {
    this.filtro = {
      competenciaDeMes: this.mesAtual,
      competenciaAteMes: this.mesAtual,
      incluirCanceladas: false,
      pago: false,
      todosOsPeriodos: true,
    };
    this.buscar();
  }

  protected mesAnterior(): void {
    this.filtro.competenciaDeMes = this.deslocarMes(this.filtro.competenciaDeMes, -1);
    this.filtro.competenciaAteMes = this.deslocarMes(this.filtro.competenciaAteMes, -1);
    this.buscar();
  }

  protected proximoMes(): void {
    this.filtro.competenciaDeMes = this.deslocarMes(this.filtro.competenciaDeMes, 1);
    this.filtro.competenciaAteMes = this.deslocarMes(this.filtro.competenciaAteMes, 1);
    this.buscar();
  }

  private deslocarMes(mesIso: string, delta: number): string {
    const [ano, mes] = mesIso.split('-').map(Number);
    const data = new Date(ano, mes - 1 + delta, 1);
    return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
  }

  protected competenciaBr(iso: string): string {
    const [ano, mes] = iso.split('-');
    return `${mes}/${ano}`;
  }

  protected classeEtapa(etapa: string): string {
    return 'badge--' + etapa.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/\s+/g, '-');
  }

  protected identificacao(o: Obrigacao): string {
    const primeiraPalavra = o.fornecedorNome.split(' ')[0];

    if (o.tipoMovimento === 'OC') {
      const parcela = o.totalParcelas > 1 ? ` · ${o.numeroParcela}/${o.totalParcelas}` : '';
      return `OC-${String(o.ordemCompraNumero).padStart(3, '0')} · ${primeiraPalavra}${parcela}`;
    }

    if (o.tipoMovimento === 'Medição') {
      const numeroBm = o.medicaoBmNumeroReferencia || String(o.medicaoBmNumero).padStart(3, '0');
      return `BM-${numeroBm} · ${primeiraPalavra}`;
    }

    const parteFornecedor = o.fornecedorNome.slice(0, 18);
    const parteDescricao = (o.despesaAvulsaDescricao ?? '').slice(0, 22);
    return parteDescricao ? `${parteFornecedor} · ${parteDescricao}` : parteFornecedor;
  }

  // --- Linha expansível ---

  protected linhaExpandida(o: Obrigacao): boolean {
    return this.expandidoId() === o.id;
  }

  // Seções recolhíveis da linha expandida (UAs e anexos), guardadas como "idDaObrigação:seção".
  private readonly secoesAbertas = signal<ReadonlySet<string>>(new Set());

  protected secaoAberta(obrigacaoId: number, secao: 'ua' | 'anexos'): boolean {
    return this.secoesAbertas().has(`${obrigacaoId}:${secao}`);
  }

  protected alternarSecao(obrigacaoId: number, secao: 'ua' | 'anexos'): void {
    const chave = `${obrigacaoId}:${secao}`;
    this.secoesAbertas.update((atual) => {
      const novo = new Set(atual);
      if (!novo.delete(chave)) {
        novo.add(chave);
      }
      return novo;
    });
  }

  protected alternarLinha(o: Obrigacao): void {
    if (this.linhaExpandida(o)) {
      this.expandidoId.set(null);
      return;
    }

    this.expandidoId.set(o.id);
    this.erroLinha.set(null);
    this.parcelaEmCriacaoId.set(null);
    this.erroAndamento.set(null);
    this.formAndamento.enable();
    this.formAndamento.reset({
      dataSolicitacaoEspelho: o.dataSolicitacaoEspelho ?? '',
      dataEnvioAssinatura: o.dataEnvioAssinatura ?? '',
      dataEnvioFornecedor: o.dataEnvioFornecedor ?? '',
      dataChegadaMaterial: o.dataChegadaMaterial ?? '',
      dataLiberacaoNf: o.dataLiberacaoNf ?? '',
    });
    if (o.pago || o.cancelada) {
      this.formAndamento.disable();
    }
    this.formLinha.reset({
      valorPrevisto: o.valorPrevisto,
      dataNf: o.dataNf ?? '',
      numeroNf: o.numeroNf ?? '',
      valorNota: o.valorNota,
      vencimento: o.vencimento ?? '',
      dataRequisicao: o.dataRequisicao ?? '',
      dataAssistPgto: o.dataAssistPgto ?? '',
      dataEnvioFinanceiro: o.dataEnvioFinanceiro ?? '',
      dataPrevistaPagamento: o.dataPrevistaPagamento ?? '',
      observacoes: o.observacoes ?? '',
    });
  }

  // --- Andamento documental ---

  protected passosAndamento(o: Obrigacao): PassoAndamento[] {
    if (o.tipoMovimento === 'OC') {
      return [
        { chave: 'dataEnvioAssinatura', rotulo: 'Enviada para assinatura (Docusign)' },
        { chave: 'assinada', rotulo: 'Assinada' },
        { chave: 'dataEnvioFornecedor', rotulo: 'Enviada ao fornecedor' },
        { chave: 'dataChegadaMaterial', rotulo: 'Material chegou' },
      ];
    }

    if (o.tipoMovimento === 'Medição') {
      return [
        { chave: 'dataSolicitacaoEspelho', rotulo: 'Espelho de medição solicitado' },
        ...(o.exigeAssinatura ? [{ chave: 'dataEnvioAssinatura', rotulo: 'Enviada para assinatura (Docusign)' } as PassoAndamento] : []),
        { chave: 'dataLiberacaoNf', rotulo: 'Liberada para emissão da NF' },
      ];
    }

    return [];
  }

  private dataDoPasso(o: Obrigacao, passo: PassoAndamento): string | null {
    return passo.chave === 'assinada' ? null : o[passo.chave];
  }

  protected passoFeito(o: Obrigacao, passo: PassoAndamento): boolean {
    return passo.chave === 'assinada' ? o.ordemCompraAssinada : this.dataDoPasso(o, passo) !== null;
  }

  // Obrigações pagas/canceladas só mostram o andamento (em leitura) se alguma data foi registrada.
  protected mostraAndamento(o: Obrigacao): boolean {
    const passos = this.passosAndamento(o);
    if (passos.length === 0) {
      return false;
    }

    return !(o.pago || o.cancelada) || passos.some((p) => this.dataDoPasso(o, p) !== null);
  }

  // Próximo passo pendente e há quantos dias o anterior foi registrado. Só existe quando o acompanhamento já
  // começou (alguma data registrada) - assim obrigações antigas, sem nenhuma data, não viram alerta.
  protected andamentoParado(o: Obrigacao): { passo: PassoAndamento; dias: number } | null {
    if (o.pago || o.cancelada) {
      return null;
    }

    const passos = this.passosAndamento(o);
    let ultimoFeito = -1;
    let referencia: string | null = null;
    passos.forEach((passo, i) => {
      if (!this.passoFeito(o, passo)) {
        return;
      }

      ultimoFeito = i;
      referencia = this.dataDoPasso(o, passo) ?? referencia;
    });

    const proximo = passos[ultimoFeito + 1];
    if (!proximo || referencia === null) {
      return null;
    }

    return { passo: proximo, dias: diasEntre(referencia, hojeIso()) };
  }

  protected andamentoEmAlerta(o: Obrigacao): boolean {
    const parado = this.andamentoParado(o);
    return parado !== null && parado.dias >= DIAS_ALERTA_ANDAMENTO;
  }

  protected definirHoje(campo: CampoAndamento): void {
    this.formAndamento.controls[campo].setValue(hojeIso());
  }

  protected salvarAndamento(o: Obrigacao): void {
    const valor = this.formAndamento.getRawValue();
    this.salvandoAndamento.set(true);
    this.erroAndamento.set(null);

    this.obrigacaoService
      .atualizarAndamento(o.id, {
        dataSolicitacaoEspelho: valor.dataSolicitacaoEspelho || null,
        dataEnvioAssinatura: valor.dataEnvioAssinatura || null,
        dataEnvioFornecedor: valor.dataEnvioFornecedor || null,
        dataChegadaMaterial: valor.dataChegadaMaterial || null,
        dataLiberacaoNf: valor.dataLiberacaoNf || null,
      })
      .subscribe({
        next: (atualizada) => {
          this.salvandoAndamento.set(false);
          // As parcelas da mesma OC compartilham as datas: atualiza todas as linhas dela.
          this.obrigacoes.update((lista) =>
            lista.map((x) =>
              x.id === atualizada.id || (atualizada.ordemCompraId !== null && x.ordemCompraId === atualizada.ordemCompraId)
                ? {
                    ...x,
                    dataSolicitacaoEspelho: atualizada.dataSolicitacaoEspelho,
                    dataEnvioAssinatura: atualizada.dataEnvioAssinatura,
                    dataEnvioFornecedor: atualizada.dataEnvioFornecedor,
                    dataChegadaMaterial: atualizada.dataChegadaMaterial,
                    dataLiberacaoNf: atualizada.dataLiberacaoNf,
                  }
                : x,
            ),
          );
        },
        error: (err) => {
          this.salvandoAndamento.set(false);
          this.erroAndamento.set(err?.error?.message ?? 'Não foi possível salvar o andamento.');
        },
      });
  }

  protected salvarLinha(o: Obrigacao): void {
    const valor = this.formLinha.getRawValue();
    this.salvandoLinha.set(true);
    this.erroLinha.set(null);

    this.obrigacaoService
      .atualizar(o.id, {
        valorPrevisto: this.valorPrevistoEditavel(o) ? valor.valorPrevisto : undefined,
        dataNf: valor.dataNf || null,
        numeroNf: valor.numeroNf || null,
        valorNota: valor.valorNota,
        vencimento: valor.vencimento || null,
        dataRequisicao: valor.dataRequisicao || null,
        dataAssistPgto: valor.dataAssistPgto || null,
        dataEnvioFinanceiro: valor.dataEnvioFinanceiro || null,
        dataPrevistaPagamento: valor.dataPrevistaPagamento || null,
        observacoes: valor.observacoes || null,
      })
      .subscribe({
        next: (atualizada) => {
          this.salvandoLinha.set(false);
          if (o.totalParcelas > 1) {
            // A NF e a competência são copiadas para as outras parcelas: recarrega a lista inteira.
            this.buscar();
            return;
          }

          this.substituir(atualizada);
          this.expandidoId.set(null);
        },
        error: (err) => {
          this.salvandoLinha.set(false);
          this.erroLinha.set(err?.error?.message ?? 'Não foi possível salvar.');
        },
      });
  }

  // --- Parcelas (OC paga em várias vezes: uma NF, vários boletos) ---

  protected valorPrevistoEditavel(o: Obrigacao): boolean {
    return o.tipoMovimento === 'OC' && o.totalParcelas > 1 && !o.pago && !o.cancelada;
  }

  protected podeAdicionarParcela(o: Obrigacao): boolean {
    return o.tipoMovimento === 'OC' && !o.cancelada;
  }

  protected somaDivergente(o: Obrigacao): boolean {
    return o.somaParcelas !== null && o.valorReferenciaParcelas !== null && Math.abs(o.somaParcelas - o.valorReferenciaParcelas) >= 0.005;
  }

  protected rotuloReferencia(o: Obrigacao): string {
    return o.valorNota !== null ? 'valor da NF' : 'total da OC';
  }

  protected abrirNovaParcela(o: Obrigacao): void {
    this.erroLinha.set(null);
    this.valorNovaParcela.setValue(Math.round((o.valorPrevisto / 2) * 100) / 100);
    this.parcelaEmCriacaoId.set(o.id);
  }

  protected criarParcela(o: Obrigacao): void {
    const valor = this.valorNovaParcela.value;
    if (valor === null || !(valor > 0)) {
      this.erroLinha.set('Informe o valor da nova parcela.');
      return;
    }

    this.criandoParcela.set(true);
    this.erroLinha.set(null);

    this.obrigacaoService.adicionarParcela(o.id, valor).subscribe({
      next: () => {
        this.criandoParcela.set(false);
        this.parcelaEmCriacaoId.set(null);
        this.buscar();
      },
      error: (err) => {
        this.criandoParcela.set(false);
        this.erroLinha.set(err?.error?.message ?? 'Não foi possível adicionar a parcela.');
      },
    });
  }

  protected abrirSolicitacaoPagamento(o: Obrigacao): void {
    this.solicitacaoObrigacaoId.set(o.id);
  }

  protected solicitacaoEnviada(atualizada: Obrigacao): void {
    this.substituir(atualizada);
  }

  protected marcarPaga(o: Obrigacao): void {
    this.processandoAcao.set(true);
    this.erroLinha.set(null);

    this.obrigacaoService.marcarPaga(o.id).subscribe({
      next: (atualizada) => {
        this.substituir(atualizada);
        this.processandoAcao.set(false);
      },
      error: (err) => {
        this.processandoAcao.set(false);
        this.erroLinha.set(err?.error?.message ?? 'Não foi possível marcar como paga.');
      },
    });
  }

  // Atribui (ou remove, com null) o responsável: ele passa a ver a obrigação e a agir nela.
  protected atribuirResponsavel(o: Obrigacao, usuarioId: number | null): void {
    this.atribuindoResponsavel.set(true);
    this.erroLinha.set(null);

    this.obrigacaoService.atribuirResponsavel(o.id, usuarioId).subscribe({
      next: (atualizada) => {
        this.substituir(atualizada);
        this.atribuindoResponsavel.set(false);
        this.responsavelEscolhido = null;
      },
      error: (err) => {
        this.atribuindoResponsavel.set(false);
        this.erroLinha.set(err?.error?.message ?? 'Não foi possível atribuir o responsável.');
      },
    });
  }

  protected desmarcarPaga(o: Obrigacao): void {
    this.processandoAcao.set(true);
    this.erroLinha.set(null);

    this.obrigacaoService.desmarcarPaga(o.id).subscribe({
      next: (atualizada) => {
        this.substituir(atualizada);
        this.processandoAcao.set(false);
      },
      error: (err) => {
        this.processandoAcao.set(false);
        this.erroLinha.set(err?.error?.message ?? 'Não foi possível desmarcar.');
      },
    });
  }

  protected cancelar(o: Obrigacao): void {
    if (!confirm('Cancelar esta obrigação?')) {
      return;
    }

    this.processandoAcao.set(true);
    this.erroLinha.set(null);

    this.obrigacaoService.cancelar(o.id).subscribe({
      next: (atualizada) => {
        this.substituir(atualizada);
        this.processandoAcao.set(false);
        this.expandidoId.set(null);
      },
      error: (err) => {
        this.processandoAcao.set(false);
        this.erroLinha.set(err?.error?.message ?? 'Não foi possível cancelar.');
      },
    });
  }

  protected reativar(o: Obrigacao): void {
    this.processandoAcao.set(true);
    this.erroLinha.set(null);

    this.obrigacaoService.reativar(o.id).subscribe({
      next: (atualizada) => {
        this.substituir(atualizada);
        this.processandoAcao.set(false);
      },
      error: (err) => {
        this.processandoAcao.set(false);
        this.erroLinha.set(err?.error?.message ?? 'Não foi possível reativar.');
      },
    });
  }

  private substituir(atualizada: Obrigacao): void {
    this.obrigacoes.set(this.obrigacoes().map((o) => (o.id === atualizada.id ? atualizada : o)));
  }

  // --- Modal de cadastro rápido de fornecedor ---

  protected abrirModalFornecedor(): void {
    this.erroFornecedor.set(null);
    this.formFornecedor.reset({ nome: '', pessoa: 'PJ', documento: '' });
    this.modalFornecedorAberto.set(true);
  }

  protected fecharModalFornecedor(): void {
    this.modalFornecedorAberto.set(false);
  }

  protected salvarFornecedor(): void {
    const valor = this.formFornecedor.getRawValue();
    const pessoaFisica = valor.pessoa === 'PF';

    if (this.formFornecedor.invalid) {
      this.formFornecedor.markAllAsTouched();
      this.erroFornecedor.set(`Informe o nome e o ${pessoaFisica ? 'CPF' : 'CNPJ'} do fornecedor.`);
      return;
    }

    if (pessoaFisica ? !cpfEhValido(valor.documento) : !cnpjEhValido(valor.documento)) {
      this.erroFornecedor.set(pessoaFisica ? 'CPF inválido.' : 'CNPJ inválido.');
      return;
    }

    this.salvandoFornecedor.set(true);
    this.erroFornecedor.set(null);

    this.fornecedorService
      .criar({
        nome: valor.nome.trim(),
        cnpj: pessoaFisica ? null : valor.documento.trim(),
        cpf: pessoaFisica ? valor.documento.trim() : null,
        contato: null,
        telefone: null,
        endereco: null,
        inscricaoEstadual: null,
        inscricaoMunicipal: null,
        email: null,
        dadosBancarios: null,
        ativo: true,
      })
      .subscribe({
        next: (novo) => {
          this.fornecedores.set([...this.fornecedores(), novo].sort((a, b) => a.nome.localeCompare(b.nome)));
          this.filtro.fornecedorId = novo.id;
          this.salvandoFornecedor.set(false);
          this.modalFornecedorAberto.set(false);
          this.buscar();
        },
        error: (err) => {
          this.salvandoFornecedor.set(false);
          this.erroFornecedor.set(err?.error?.message ?? 'Não foi possível cadastrar o fornecedor.');
        },
      });
  }
}
