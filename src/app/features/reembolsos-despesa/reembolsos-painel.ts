import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-reembolsos-painel',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './reembolsos-painel.html',
  styleUrl: './reembolsos-painel.scss',
})
export class ReembolsosPainel {
  protected readonly authService = inject(AuthService);
}
