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
  protected readonly mostrarShell = computed(() => !this.urlAtual().startsWith('/login'));
  protected readonly grupoLicencasAberto = signal(false);
  protected readonly grupoEquipamentosAberto = signal(false);
  protected readonly menuMobileAberto = signal(false);

  constructor() {
    this.router.events.pipe(filter((evento) => evento instanceof NavigationEnd)).subscribe(() => {
      this.urlAtual.set(this.router.url);
      this.menuMobileAberto.set(false);
    });
  }

  protected alternarGrupoLicencas(): void {
    const abrindo = !this.grupoLicencasAberto();
    this.grupoLicencasAberto.set(abrindo);
    if (abrindo) {
      this.grupoEquipamentosAberto.set(false);
    }
  }

  protected alternarGrupoEquipamentos(): void {
    const abrindo = !this.grupoEquipamentosAberto();
    this.grupoEquipamentosAberto.set(abrindo);
    if (abrindo) {
      this.grupoLicencasAberto.set(false);
    }
  }

  protected alternarMenuMobile(): void {
    this.menuMobileAberto.update((aberto) => !aberto);
  }

  protected sair(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
