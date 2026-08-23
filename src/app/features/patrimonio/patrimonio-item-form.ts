import { Location } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AnexosSecao } from '../../shared/anexos/anexos-secao';
import { Icon } from '../../shared/icons/icon';
import { Local } from '../locais/local';
import { LocalService } from '../locais/local.service';
import { PatrimonioItem } from './patrimonio-item';
import { PatrimonioItemService } from './patrimonio-item.service';

@Component({
  selector: 'app-patrimonio-item-form',
  imports: [ReactiveFormsModule, RouterLink, Icon, AnexosSecao],
  templateUrl: './patrimonio-item-form.html',
  styleUrl: './patrimonio-item-form.scss',
})
export class PatrimonioItemForm {
  private readonly fb = inject(FormBuilder);
  private readonly patrimonioItemService = inject(PatrimonioItemService);
  private readonly localService = inject(LocalService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  protected readonly itemId = Number(this.route.snapshot.paramMap.get('id'));

  protected readonly item = signal<PatrimonioItem | null>(null);
  protected readonly locais = signal<Local[]>([]);
  protected readonly carregando = signal(true);
  protected readonly salvando = signal(false);
  protected readonly erro = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    descricao: [''],
    numeroPatrimonio: [''],
    localId: [null as number | null],
    observacao: [''],
  });

  protected voltar(): void {
    this.location.back();
  }

  constructor() {
    this.localService.listar({ ativo: true }).subscribe((locais) => this.locais.set(locais));

    this.patrimonioItemService.obter(this.itemId).subscribe({
      next: (item) => {
        this.item.set(item);
        this.form.patchValue({
          descricao: item.descricao ?? '',
          numeroPatrimonio: item.numeroPatrimonio ?? '',
          localId: item.localId,
          observacao: item.observacao ?? '',
        });
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set('Não foi possível carregar o item de patrimônio.');
        this.carregando.set(false);
      },
    });
  }

  protected salvar(): void {
    const valor = this.form.getRawValue();
    const payload = {
      descricao: valor.descricao || null,
      numeroPatrimonio: valor.numeroPatrimonio || null,
      localId: valor.localId,
      observacao: valor.observacao || null,
    };

    this.salvando.set(true);
    this.erro.set(null);

    this.patrimonioItemService.atualizar(this.itemId, payload).subscribe({
      next: () => this.router.navigate(['/patrimonio']),
      error: (err) => {
        this.salvando.set(false);
        this.erro.set(err?.error?.message ?? 'Não foi possível salvar o item de patrimônio.');
      },
    });
  }
}
