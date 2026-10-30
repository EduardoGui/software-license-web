export function nomeDaCaptura(agora = new Date()): string {
  const dois = (n: number) => String(n).padStart(2, '0');
  const data = `${agora.getFullYear()}-${dois(agora.getMonth() + 1)}-${dois(agora.getDate())}`;
  return `captura-${data}-${dois(agora.getHours())}${dois(agora.getMinutes())}.png`;
}
