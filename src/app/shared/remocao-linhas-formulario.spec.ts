import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormArray, FormBuilder, ReactiveFormsModule } from '@angular/forms';

// Guarda contra a regressão "apaguei uma linha e sumiu outra" nas listas de itens das campanhas de entrega:
// cada linha precisa ficar presa ao próprio FormGroup (e não ao número da posição).

@Component({
  selector: 'app-lista-correta',
  imports: [ReactiveFormsModule],
  template: `
    <div [formGroup]="form">
      <div formArrayName="itens">
        @for (item of itens.controls; track item; let i = $index) {
          <div [formGroup]="$any(item)" class="linha">
            <input formControlName="descricao" />
            <button type="button" class="remover" (click)="remover(i)">x</button>
          </div>
        }
      </div>
    </div>
  `,
})
class ListaCorreta {
  private readonly fb = new FormBuilder();
  readonly form = this.fb.group({ itens: this.fb.array([] as ReturnType<FormBuilder['group']>[]) });

  constructor() {
    for (const descricao of ['A', 'B', 'C', 'D']) {
      this.itens.push(this.fb.group({ descricao }));
    }
  }

  get itens(): FormArray {
    return this.form.get('itens') as FormArray;
  }

  remover(i: number): void {
    this.itens.removeAt(i);
  }
}

describe('Remoção de linhas em listas de itens (FormArray)', () => {
  function valores(raiz: HTMLElement): string[] {
    return Array.from(raiz.querySelectorAll<HTMLInputElement>('.linha input')).map((input) => input.value);
  }

  it('remove exatamente a linha clicada, no começo, no meio e no fim', () => {
    const fixture = TestBed.createComponent(ListaCorreta);
    fixture.detectChanges();
    const raiz = fixture.nativeElement as HTMLElement;
    expect(valores(raiz)).toEqual(['A', 'B', 'C', 'D']);

    // Remove "B" (meio)
    raiz.querySelectorAll<HTMLButtonElement>('.remover')[1].click();
    fixture.detectChanges();
    expect(valores(raiz)).toEqual(['A', 'C', 'D']);
    expect(fixture.componentInstance.itens.getRawValue().map((l) => l.descricao)).toEqual(['A', 'C', 'D']);

    // Remove "A" (começo)
    raiz.querySelectorAll<HTMLButtonElement>('.remover')[0].click();
    fixture.detectChanges();
    expect(valores(raiz)).toEqual(['C', 'D']);

    // Remove "D" (fim)
    raiz.querySelectorAll<HTMLButtonElement>('.remover')[1].click();
    fixture.detectChanges();
    expect(valores(raiz)).toEqual(['C']);
    expect(fixture.componentInstance.itens.getRawValue().map((l) => l.descricao)).toEqual(['C']);
  });

  it('digitar numa linha depois de remover outra altera o item certo', () => {
    const fixture = TestBed.createComponent(ListaCorreta);
    fixture.detectChanges();
    const raiz = fixture.nativeElement as HTMLElement;

    raiz.querySelectorAll<HTMLButtonElement>('.remover')[0].click(); // remove A
    fixture.detectChanges();

    const entradas = raiz.querySelectorAll<HTMLInputElement>('.linha input');
    entradas[1].value = 'C-editado';
    entradas[1].dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(fixture.componentInstance.itens.getRawValue().map((l) => l.descricao)).toEqual(['B', 'C-editado', 'D']);
  });
});
