import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

function calcularDigitoVerificador(numeros: number[], pesos: number[]): number {
  const soma = numeros.reduce((total, numero, indice) => total + numero * pesos[indice], 0);
  const resto = soma % 11;
  return resto < 2 ? 0 : 11 - resto;
}

export function cnpjEhValido(cnpj: string): boolean {
  const digitos = cnpj.replace(/\D/g, '');

  if (digitos.length !== 14 || new Set(digitos).size === 1) {
    return false;
  }

  const numeros = digitos.split('').map(Number);

  const dv1 = calcularDigitoVerificador(numeros.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  if (dv1 !== numeros[12]) {
    return false;
  }

  const dv2 = calcularDigitoVerificador(numeros.slice(0, 13), [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return dv2 === numeros[13];
}

export const cnpjValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const valor = control.value;
  if (!valor) {
    return null;
  }

  return cnpjEhValido(valor) ? null : { cnpjInvalido: true };
};
