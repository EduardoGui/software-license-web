import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-plano-saude-painel',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './plano-saude-painel.html',
  styleUrl: './plano-saude-painel.scss',
})
export class PlanoSaudePainel {}
