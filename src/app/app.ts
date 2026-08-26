import { Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

import { AuthService } from './features/auth/auth.service';
import { Icon } from './shared/icons/icon';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Icon],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly router = inject(Router);
  protected readonly authService = inject(AuthService);

  protected readonly urlAtual = signal(this.router.url);
  protected readonly mostrarShell = computed(
    () => !this.urlAtual().startsWith('/login') && !this.urlAtual().startsWith('/definir-senha'),
  );
  protected readonly grupoTiAberto = signal(false);
  protected readonly grupoDpAberto = signal(false);
  protected readonly grupoSuprimentosAberto = signal(false);
  protected readonly grupoCadastrosGeraisAberto = signal(false);
  protected readonly grupoLicencasAberto = signal(false);
  protected readonly grupoEquipamentosAberto = signal(false);
  protected readonly grupoPatrimonioAberto = signal(false);
  protected readonly grupoReembolsoAberto = signal(false);
  protected readonly menuMobileAberto = signal(false);

  constructor() {
    this.router.events.pipe(filter((evento) => evento instanceof NavigationEnd)).subscribe(() => {
      this.urlAtual.set(this.router.url);
      this.menuMobileAberto.set(false);
    });
  }

  protected alternarGrupoTi(): void {
    const abrindo = !this.grupoTiAberto();
    this.grupoTiAberto.set(abrindo);
    if (abrindo) {
      this.grupoDpAberto.set(false);
      this.grupoSuprimentosAberto.set(false);
      this.grupoCadastrosGeraisAberto.set(false);
    }
  }

  protected alternarGrupoDp(): void {
    const abrindo = !this.grupoDpAberto();
    this.grupoDpAberto.set(abrindo);
    if (abrindo) {
      this.grupoTiAberto.set(false);
      this.grupoSuprimentosAberto.set(false);
      this.grupoCadastrosGeraisAberto.set(false);
    }
  }

  protected alternarGrupoSuprimentos(): void {
    const abrindo = !this.grupoSuprimentosAberto();
    this.grupoSuprimentosAberto.set(abrindo);
    if (abrindo) {
      this.grupoTiAberto.set(false);
      this.grupoDpAberto.set(false);
      this.grupoCadastrosGeraisAberto.set(false);
    }
  }

  protected alternarGrupoCadastrosGerais(): void {
    const abrindo = !this.grupoCadastrosGeraisAberto();
    this.grupoCadastrosGeraisAberto.set(abrindo);
    if (abrindo) {
      this.grupoTiAberto.set(false);
      this.grupoDpAberto.set(false);
      this.grupoSuprimentosAberto.set(false);
    }
  }

  protected alternarGrupoLicencas(): void {
    const abrindo = !this.grupoLicencasAberto();
    this.grupoLicencasAberto.set(abrindo);
    if (abrindo) {
      this.grupoEquipamentosAberto.set(false);
      this.grupoPatrimonioAberto.set(false);
    }
  }

  protected alternarGrupoEquipamentos(): void {
    const abrindo = !this.grupoEquipamentosAberto();
    this.grupoEquipamentosAberto.set(abrindo);
    if (abrindo) {
      this.grupoLicencasAberto.set(false);
      this.grupoPatrimonioAberto.set(false);
    }
  }

  protected alternarGrupoPatrimonio(): void {
    const abrindo = !this.grupoPatrimonioAberto();
    this.grupoPatrimonioAberto.set(abrindo);
    if (abrindo) {
      this.grupoLicencasAberto.set(false);
      this.grupoEquipamentosAberto.set(false);
    }
  }

  protected alternarGrupoReembolso(): void {
    this.grupoReembolsoAberto.update((aberto) => !aberto);
  }

  protected alternarMenuMobile(): void {
    this.menuMobileAberto.update((aberto) => !aberto);
  }

  protected sair(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
