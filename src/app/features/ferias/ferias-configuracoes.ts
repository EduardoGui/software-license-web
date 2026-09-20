import { Component } from '@angular/core';

import { FeriadosList } from '../feriados/feriados-list';
import { PoliticaFeriasForm } from '../politica-ferias/politica-ferias-form';

@Component({
  selector: 'app-ferias-configuracoes',
  imports: [FeriadosList, PoliticaFeriasForm],
  templateUrl: './ferias-configuracoes.html',
  styleUrl: './ferias-configuracoes.scss',
})
export class FeriasConfiguracoes {}
