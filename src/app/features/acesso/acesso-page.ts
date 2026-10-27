import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Icon } from '../../shared/icons/icon';
import { UsuarioService } from '../usuarios/usuario.service';
import { AcessoConta } from './acesso';
import { AcessoService } from './acesso.service';

@Component({
  selector: 'app-acesso-page',
  imports: [FormsModule, RouterLink, Icon],
  templateUrl: './acesso-page.html',
  styleUrl: './acesso-page.scss',
})
export class AcessoPage {
  private readonly acessoService = inject(AcessoService);
  private readonly usuarioService = inject(UsuarioService);

  protected readonly contas = signal<AcessoConta[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal(false);
  // Linha (contaId ou "u<usuarioId>") com uma ação em andamento, para travar os botões dela.
  protected readonly ocupada = signal<string | null>(null);
  protected readonly mensagem = signal<{ tipo: 'ok' | 'erro'; texto: string } | null>(null);

  protected busca = '';
  protected filtroSituacao: 'todos' | 'semConta' | 'bloqueados' | 'administradores' | 'administrativos' = 'todos';
  protected mostrarDesligados = false;

  protected readonly resumo = computed(() => {
    const contas = this.contas();
    return {
      comConta: contas.filter((c) => c.temConta).length,
      semConta: contas.filter((c) => !c.temConta && c.statusUsuario !== 'Inativo').length,
      bloqueadas: contas.filter((c) => c.bloqueada).length,
      administradores: contas.filter((c) => c.papeis.includes('Administrador')).length,
    };
  });

  constructor() {
    this.carregar();
  }

  protected carregar(): void {
    this.carregando.set(true);
    this.erro.set(false);
    this.acessoService.listar().subscribe({
      next: (contas) => {
        this.contas.set(contas);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set(true);
        this.carregando.set(false);
      },
    });
  }

  protected get contasFiltradas(): AcessoConta[] {
    const termo = this.busca.trim().toLowerCase();
    return this.contas().filter((c) => {
      if (termo && !c.nome.toLowerCase().includes(termo) && !c.email.toLowerCase().includes(termo)) {
        return false;
      }
      if (!this.mostrarDesligados && c.statusUsuario === 'Inativo' && this.filtroSituacao === 'todos') {
        return false;
      }
      switch (this.filtroSituacao) {
        case 'semConta':
          return !c.temConta;
        case 'bloqueados':
          return c.bloqueada;
        case 'administradores':
          return c.papeis.includes('Administrador');
        case 'administrativos':
          return c.papeis.includes('Administrativo');
        default:
          return true;
      }
    });
  }

  protected chave(conta: AcessoConta): string {
    return conta.contaId ?? `u${conta.usuarioId}`;
  }

  protected tem(conta: AcessoConta, papel: string): boolean {
    return conta.papeis.includes(papel);
  }

  protected alternarPapel(conta: AcessoConta, papel: 'Administrativo' | 'Administrador', marcado: boolean): void {
    if (!conta.contaId) {
      return;
    }

    if (papel === 'Administrador' && marcado) {
      const ok = confirm(
        `Dar acesso de ADMINISTRADOR a "${conta.nome}"? Administrador vê e altera tudo, incluindo usuários e contratos.`,
      );
      if (!ok) {
        this.carregar();
        return;
      }
    }

    const outros = conta.papeis.filter((p) => p !== papel);
    const novos = marcado ? [...outros, papel] : outros;
    this.executar(conta, this.acessoService.definirPapeis(conta.contaId, novos), `Papéis de ${conta.nome} atualizados. A pessoa precisa sair e entrar de novo para o novo acesso valer.`);
  }

  protected alternarBloqueio(conta: AcessoConta): void {
    if (!conta.contaId) {
      return;
    }

    if (conta.bloqueada) {
      this.executar(conta, this.acessoService.desbloquear(conta.contaId), `Acesso de ${conta.nome} liberado.`);
      return;
    }

    if (!confirm(`Bloquear o acesso de "${conta.nome}"? Ela não consegue mais entrar no sistema (em até 30 segundos) até você liberar.`)) {
      return;
    }
    this.executar(conta, this.acessoService.bloquear(conta.contaId), `Acesso de ${conta.nome} bloqueado.`);
  }

  protected criarConta(conta: AcessoConta): void {
    if (conta.usuarioId === null) {
      return;
    }

    if (!confirm(`Criar a conta de acesso de "${conta.nome}" e enviar o convite para ${conta.email}?`)) {
      return;
    }

    this.ocupada.set(this.chave(conta));
    this.mensagem.set(null);
    this.usuarioService.criarContaAcesso(conta.usuarioId).subscribe({
      next: (resposta) => {
        this.ocupada.set(null);
        this.mensagem.set({
          tipo: resposta.conviteEnviado ? 'ok' : 'erro',
          texto: resposta.conviteEnviado
            ? `Conta criada e convite enviado para ${conta.email}.`
            : `Conta criada, mas o e-mail de convite NÃO foi enviado. Use "Reenviar convite".`,
        });
        this.carregar();
      },
      error: (err) => this.falhar(err, 'Não foi possível criar a conta de acesso.'),
    });
  }

  protected reenviarConvite(conta: AcessoConta): void {
    if (conta.usuarioId === null) {
      return;
    }

    if (!confirm(`Reenviar o convite de acesso para "${conta.nome}" (${conta.email})?`)) {
      return;
    }

    this.ocupada.set(this.chave(conta));
    this.mensagem.set(null);
    this.usuarioService.reenviarConvite(conta.usuarioId).subscribe({
      next: () => {
        this.ocupada.set(null);
        this.mensagem.set({ tipo: 'ok', texto: `Convite reenviado para ${conta.email}.` });
      },
      error: (err) => this.falhar(err, 'Não foi possível reenviar o convite.'),
    });
  }

  private executar(conta: AcessoConta, requisicao: ReturnType<AcessoService['bloquear']>, sucesso: string): void {
    this.ocupada.set(this.chave(conta));
    this.mensagem.set(null);
    requisicao.subscribe({
      next: () => {
        this.ocupada.set(null);
        this.mensagem.set({ tipo: 'ok', texto: sucesso });
        this.carregar();
      },
      error: (err) => {
        this.falhar(err, 'Não foi possível concluir a ação.');
        this.carregar();
      },
    });
  }

  private falhar(err: { error?: { message?: string } }, padrao: string): void {
    this.ocupada.set(null);
    this.mensagem.set({ tipo: 'erro', texto: err?.error?.message ?? padrao });
  }
}
