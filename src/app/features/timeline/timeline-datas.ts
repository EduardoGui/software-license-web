export function paraData(iso: string): Date {
  const [ano, mes, dia] = iso.split('-').map(Number);
  return new Date(ano, mes - 1, dia);
}

export function formatarIso(data: Date): string {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

export function hojeIso(): string {
  return formatarIso(new Date());
}

export function diasEntre(inicioIso: string, fimIso: string): number {
  return Math.round((paraData(fimIso).getTime() - paraData(inicioIso).getTime()) / 86_400_000);
}

export function adicionarMeses(iso: string, meses: number): string {
  const data = paraData(iso);
  data.setMonth(data.getMonth() + meses);
  return formatarIso(data);
}

export function inicioDoMes(iso: string): string {
  const data = paraData(iso);
  return formatarIso(new Date(data.getFullYear(), data.getMonth(), 1));
}
