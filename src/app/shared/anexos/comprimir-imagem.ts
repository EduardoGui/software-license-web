const DIMENSAO_MAXIMA_PX = 1600;
const QUALIDADE_JPEG = 0.8;

/**
 * Redimensiona (lado maior até 1600px) e recomprime uma imagem como JPEG antes do upload —
 * fotos de celular saem cruas com vários MB, e isso derruba pra algumas centenas de KB sem
 * perda visível, sem precisar de nenhuma biblioteca (usa Canvas nativo do navegador).
 * PDF e qualquer coisa que não seja imagem passa direto, sem alteração.
 */
export async function comprimirImagemSeNecessario(arquivo: File): Promise<File> {
  if (!arquivo.type.startsWith('image/')) {
    return arquivo;
  }

  try {
    const bitmap = await createImageBitmap(arquivo);
    const escala = Math.min(1, DIMENSAO_MAXIMA_PX / Math.max(bitmap.width, bitmap.height));
    const largura = Math.round(bitmap.width * escala);
    const altura = Math.round(bitmap.height * escala);

    const canvas = document.createElement('canvas');
    canvas.width = largura;
    canvas.height = altura;
    const contexto = canvas.getContext('2d');
    if (!contexto) {
      bitmap.close();
      return arquivo;
    }

    contexto.drawImage(bitmap, 0, 0, largura, altura);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', QUALIDADE_JPEG));
    if (!blob || blob.size >= arquivo.size) {
      // Não compensou (ex.: imagem já pequena) — mantém o original.
      return arquivo;
    }

    const nomeSemExtensao = arquivo.name.replace(/\.[^.]+$/, '');
    return new File([blob], `${nomeSemExtensao}.jpg`, { type: 'image/jpeg' });
  } catch {
    // Se o navegador não suportar (ou a imagem estiver corrompida), envia o original —
    // melhor enviar sem comprimir do que bloquear o anexo.
    return arquivo;
  }
}
