import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-ferias-painel',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './ferias-painel.html',
  styleUrl: './ferias-painel.scss',
})
export class FeriasPainel {}
