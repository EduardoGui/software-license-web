import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

function calcularDigitoVerificador(numeros: number[], pesoInicial: number): number {
  const soma = numeros.reduce((total, numero, indice) => total + numero * (pesoInicial - indice), 0);
  const resto = soma % 11;
  return resto < 2 ? 0 : 11 - resto;
}

export function cpfEhValido(cpf: string): boolean {
  const digitos = cpf.replace(/\D/g, '');

  if (digitos.length !== 11 || new Set(digitos).size === 1) {
    return false;
  }

  const numeros = digitos.split('').map(Number);

  if (calcularDigitoVerificador(numeros.slice(0, 9), 10) !== numeros[9]) {
    return false;
  }

  return calcularDigitoVerificador(numeros.slice(0, 10), 11) === numeros[10];
}

export const cpfValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const valor = control.value;
  if (!valor) {
    return null;
  }

  return cpfEhValido(valor) ? null : { cpfInvalido: true };
};
