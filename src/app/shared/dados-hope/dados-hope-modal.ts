import { Component, EventEmitter, Input, Output, signal } from '@angular/core';

import { Icon } from '../icons/icon';

interface CampoHope {
  rotulo: string;
  valor: string;
}

// Dados extraídos do Comprovante de Inscrição e de Situação Cadastral (cartão CNPJ) da Hope,
// emitido em 07/01/2026 — consulta rápida pra responder e-mail/mensagem sem precisar abrir o PDF.
const CAMPOS_HOPE: CampoHope[] = [
  { rotulo: 'Razão Social', valor: 'SPE HOPE S.A.' },
  { rotulo: 'Nome Fantasia', valor: 'Hope' },
  { rotulo: 'CNPJ', valor: '63.523.589/0001-22' },
  {
    rotulo: 'Endereço',
    valor: 'Av. Getúlio Vargas, 1245, Andar 2, Sala A, Savassi, Belo Horizonte - MG, CEP 30112-024',
  },
  { rotulo: 'Telefone', valor: '(31) 2513-1764' },
  { rotulo: 'E-mail', valor: 'contato@integra-br.com' },
  { rotulo: 'Natureza Jurídica', valor: 'Sociedade Anônima Fechada (205-4)' },
  { rotulo: 'Atividade Principal', valor: 'Serviços combinados de escritório e apoio administrativo' },
  { rotulo: 'Situação Cadastral', valor: 'Ativa' },
];

@Component({
  selector: 'app-dados-hope-modal',
  imports: [Icon],
  templateUrl: './dados-hope-modal.html',
  styleUrl: './dados-hope-modal.scss',
})
export class DadosHopeModal {
  @Input() aberto = false;
  @Output() fechar = new EventEmitter<void>();

  protected readonly campos = CAMPOS_HOPE;
  protected readonly copiadoRotulo = signal<string | null>(null);

  protected fecharModal(): void {
    this.fechar.emit();
  }

  protected async copiar(campo: CampoHope): Promise<void> {
    await navigator.clipboard.writeText(campo.valor);
    this.sinalizarCopiado(campo.rotulo);
  }

  protected async copiarTudo(): Promise<void> {
    const texto = this.campos.map((c) => `${c.rotulo}: ${c.valor}`).join('\n');
    await navigator.clipboard.writeText(texto);
    this.sinalizarCopiado('__tudo__');
  }

  private sinalizarCopiado(chave: string): void {
    this.copiadoRotulo.set(chave);
    setTimeout(() => this.copiadoRotulo.set(null), 1500);
  }
}
