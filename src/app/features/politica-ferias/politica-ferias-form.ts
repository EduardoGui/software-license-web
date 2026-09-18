import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Icon } from '../../shared/icons/icon';
import { PoliticaFeriasService } from './politica-ferias.service';

@Component({
  selector: 'app-politica-ferias-form',
  imports: [ReactiveFormsModule, Icon],
  templateUrl: './politica-ferias-form.html',
  styleUrl: './politica-ferias-form.scss',
})
export class PoliticaFeriasForm {
  private readonly fb = inject(FormBuilder);
  private readonly politicaFeriasService = inject(PoliticaFeriasService);

  protected readonly politicaId = signal<number | null>(null);
  protected readonly carregando = signal(true);
  protected readonly salvando = signal(false);
  protected readonly erro = signal<string | null>(null);
  protected readonly salvo = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    diasDireitoPorAno: [30, [Validators.required, Validators.min(1)]],
    maxFracionamentos: [3, [Validators.required, Validators.min(1)]],
    diasMinimoUltimoFracionamento: [14, [Validators.required, Validators.min(1)]],
    diasMinimoDemaisFracionamentos: [5, [Validators.required, Validators.min(1)]],
    diasAntecedenciaRemarcacao: [45, [Validators.required, Validators.min(0)]],
    diasAntecedenciaMarcacaoCompulsoria: [30, [Validators.required, Validators.min(0)]],
    permiteAbonoPecuniario: [true, Validators.required],
    maxDiasAbono: [10, [Validators.required, Validators.min(0)]],
    diasMinimosAntesFeriadoOuFimDeSemana: [2, [Validators.required, Validators.min(0)]],
    ativa: [true, Validators.required],
  });

  constructor() {
    this.carregar();
  }

  private carregar(): void {
    this.carregando.set(true);
    this.politicaFeriasService.listar().subscribe({
      next: (politicas) => {
        // Fase 0: uma única política (PJ) - se já existir, edita; senão, o form fica pronto para criar.
        const politica = politicas[0];
        if (politica) {
          this.politicaId.set(politica.id);
          this.form.patchValue({
            diasDireitoPorAno: politica.diasDireitoPorAno,
            maxFracionamentos: politica.maxFracionamentos,
            diasMinimoUltimoFracionamento: politica.diasMinimoUltimoFracionamento,
            diasMinimoDemaisFracionamentos: politica.diasMinimoDemaisFracionamentos,
            diasAntecedenciaRemarcacao: politica.diasAntecedenciaRemarcacao,
            diasAntecedenciaMarcacaoCompulsoria: politica.diasAntecedenciaMarcacaoCompulsoria,
            permiteAbonoPecuniario: politica.permiteAbonoPecuniario,
            maxDiasAbono: politica.maxDiasAbono,
            diasMinimosAntesFeriadoOuFimDeSemana: politica.diasMinimosAntesFeriadoOuFimDeSemana,
            ativa: politica.ativa,
          });
        }
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set('Não foi possível carregar a política de férias.');
        this.carregando.set(false);
      },
    });
  }

  protected salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valor = this.form.getRawValue();
    const payload = { tipoVinculo: 'Pj', ...valor };

    this.salvando.set(true);
    this.erro.set(null);
    this.salvo.set(false);

    const id = this.politicaId();
    const requisicao = id !== null ? this.politicaFeriasService.atualizar(id, payload) : this.politicaFeriasService.criar(payload);

    requisicao.subscribe({
      next: (politica) => {
        this.politicaId.set(politica.id);
        this.salvando.set(false);
        this.salvo.set(true);
      },
      error: (err) => {
        this.salvando.set(false);
        this.erro.set(err?.error?.message ?? 'Não foi possível salvar a política de férias.');
      },
    });
  }
}
