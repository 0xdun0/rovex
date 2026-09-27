'use client';

const MAX_DIMENSION = 1920;
const JPEG_QUALITY = 0.85;
// Abaixo deste tamanho nao compensa recodificar: evita perda de qualidade
// em diagramas e PNGs com transparencia mantendo fidelidade.
const SKIP_THRESHOLD_BYTES = 400_000;

/**
 * Redimensiona e comprime uma imagem (dataURL) antes de persistir.
 * Capturas sem compressao pesam varios MB em base64 e sobrecarregam
 * o estado local, backups e o HTML gerado do relatorio.
 * Em caso de falha (imagem invalida, sem canvas, etc.) retorna o
 * dataURL original: operacao resiliente que nunca trava o upload.
 */
export function compressImageDataUrl(
  dataUrl: string,
  options?: { maxDimension?: number; quality?: number }
): Promise<string> {
  const maxDimension = options?.maxDimension ?? MAX_DIMENSION;
  const quality = options?.quality ?? JPEG_QUALITY;

  return new Promise((resolve) => {
    if (typeof document === 'undefined') {
      resolve(dataUrl);
      return;
    }
    const img = new Image();
    img.onload = () => {
      const longestSide = Math.max(img.width, img.height);
      const scale = longestSide > maxDimension ? maxDimension / longestSide : 1;
      if (scale === 1 && dataUrl.length < SKIP_THRESHOLD_BYTES) {
        resolve(dataUrl);
        return;
      }

      const width = Math.max(1, Math.round(img.width * scale));
      const height = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      // jpeg nao suporta transparencia: usa fundo branco para evitar bordas pretas
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      const compressed = canvas.toDataURL('image/jpeg', quality);
      resolve(compressed.length < dataUrl.length ? compressed : dataUrl);
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}
