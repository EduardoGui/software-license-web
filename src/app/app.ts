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

  constructor() {
    this.router.events.pipe(filter((evento) => evento instanceof NavigationEnd)).subscribe(() => {
      this.urlAtual.set(this.router.url);
    });
  }

  protected sair(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
