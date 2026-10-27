import { Component, ElementRef, computed, effect, inject, signal, viewChild } from '@angular/core';
import { DecimalPipe, NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';

import { Icon } from '../../shared/icons/icon';
import { Usuario } from '../usuarios/usuario';
import { UsuarioService } from '../usuarios/usuario.service';

interface NoOrganograma {
  usuario: Usuario;
  filhos: NoOrganograma[];
  // Gestor cadastrado, mas fora da visão atual (ex.: desligado e ocultado).
  gestorOculto: string | null;
  total: number;
}

@Component({
  selector: 'app-organograma-page',
  imports: [RouterLink, Icon, NgTemplateOutlet, DecimalPipe],
  templateUrl: './organograma-page.html',
  styleUrl: './organograma-page.scss',
})
export class OrganogramaPage {
  private readonly usuarioService = inject(UsuarioService);

  private readonly usuarios = signal<Usuario[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal(false);

  protected readonly mostrarDesligados = signal(false);
  protected readonly recolhidos = signal<ReadonlySet<number>>(new Set());
  protected readonly zoom = signal(1);
  private readonly grafico = viewChild<ElementRef<HTMLElement>>('grafico');

  private readonly visiveis = computed(() =>
    this.usuarios().filter((u) => this.mostrarDesligados() || u.status !== 'Inativo'),
  );

  private readonly arvore = computed(() => {
    const visiveis = this.visiveis();
    const idsVisiveis = new Set(visiveis.map((u) => u.id));
    const nos = new Map<number, NoOrganograma>(
      visiveis.map((u) => [u.id, { usuario: u, filhos: [], gestorOculto: null, total: 0 }]),
    );

    const raizes: NoOrganograma[] = [];
    for (const no of nos.values()) {
      const gestorId = no.usuario.gestorImediatoId;
      const pai = gestorId !== null && gestorId !== no.usuario.id ? nos.get(gestorId) : undefined;
      if (pai) {
        pai.filhos.push(no);
      } else {
        if (gestorId !== null && !idsVisiveis.has(gestorId)) {
          no.gestorOculto = no.usuario.gestorImediatoNome;
        }
        raizes.push(no);
      }
    }

    const alcancados = new Set<number>();
    const percorrer = (no: NoOrganograma): number => {
      alcancados.add(no.usuario.id);
      no.filhos.sort((a, b) => a.usuario.nome.localeCompare(b.usuario.nome));
      no.total = no.filhos.reduce((soma, f) => soma + 1 + percorrer(f), 0);
      return no.total;
    };
    raizes.forEach(percorrer);

    // Quem está num ciclo de gestores (A gerencia B, B gerencia A) não chega a uma raiz: vira raiz
    // avulsa para não sumir da tela.
    for (const no of nos.values()) {
      if (!alcancados.has(no.usuario.id)) {
        no.filhos = no.filhos.filter((f) => !alcancados.has(f.usuario.id));
        percorrer(no);
        raizes.push(no);
      }
    }
    return raizes;
  });

  // Quem tem equipe (ou cujo gestor está oculto) aparece no gráfico; os demais vão para "sem relação".
  protected readonly raizes = computed(() =>
    this.arvore()
      .filter((n) => n.filhos.length > 0 || n.gestorOculto !== null)
      .sort((a, b) => b.total - a.total || a.usuario.nome.localeCompare(b.usuario.nome)),
  );

  protected readonly semRelacao = computed(() =>
    this.arvore()
      .filter((n) => n.filhos.length === 0 && n.gestorOculto === null)
      .map((n) => n.usuario)
      .sort((a, b) => a.nome.localeCompare(b.nome)),
  );

  protected readonly resumo = computed(() => {
    const visiveis = this.visiveis();
    return {
      total: visiveis.length,
      comGestor: visiveis.filter((u) => u.gestorImediatoId !== null).length,
      semGestor: visiveis.filter((u) => u.gestorImediatoId === null).length,
    };
  });

  constructor() {
    // Árvores largas ficam maiores que a tela: ao carregar (ou mudar o zoom) centraliza, para o topo aparecer.
    effect(() => {
      this.zoom();
      this.raizes();
      const el = this.grafico()?.nativeElement;
      if (el) {
        setTimeout(() => (el.scrollLeft = Math.max(0, (el.scrollWidth - el.clientWidth) / 2)));
      }
    });

    this.usuarioService.listar().subscribe({
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

  protected alternarNo(id: number): void {
    const novo = new Set(this.recolhidos());
    if (!novo.delete(id)) {
      novo.add(id);
    }
    this.recolhidos.set(novo);
  }

  protected recolherTudo(): void {
    const comEquipe = new Set<number>();
    const visitar = (nos: NoOrganograma[]) => {
      for (const n of nos) {
        if (n.filhos.length > 0) {
          comEquipe.add(n.usuario.id);
          visitar(n.filhos);
        }
      }
    };
    visitar(this.raizes());
    this.recolhidos.set(comEquipe);
  }

  protected mudarZoom(passo: number): void {
    this.zoom.set(Math.min(1.2, Math.max(0.3, Math.round((this.zoom() + passo) * 10) / 10)));
  }

  protected ajustarATela(): void {
    const el = this.grafico()?.nativeElement;
    if (!el) {
      return;
    }
    // scrollWidth já inclui o zoom atual; volta ao tamanho real antes de calcular o encaixe.
    const larguraReal = el.scrollWidth / this.zoom();
    this.zoom.set(Math.min(1, Math.max(0.3, Math.floor((el.clientWidth / larguraReal) * 10) / 10)));
  }

  protected expandirTudo(): void {
    this.recolhidos.set(new Set());
  }
}
