import { Component } from '@angular/core';

import { TiposDespesaList } from '../tipos-despesa/tipos-despesa-list';
import { EmailsNotificacaoReembolsoList } from '../emails-notificacao-reembolso/emails-notificacao-reembolso-list';

@Component({
  selector: 'app-reembolsos-configuracoes',
  imports: [TiposDespesaList, EmailsNotificacaoReembolsoList],
  templateUrl: './reembolsos-configuracoes.html',
  styleUrl: './reembolsos-configuracoes.scss',
})
export class ReembolsosConfiguracoes {}
