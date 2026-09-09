/**
 * Utilitários para conversão bidirecional entre HSL ("H S% L%") e Hex ("#RRGGBB").
 * Utilizados pelo Theme Studio e seletores de cor interativos.
 */

// transforma string hsl do tailwind para formato hexadecimal (#rrggbb)
export function hslChannelsToHex(channels: string): string {
  if (!channels) return '#000000';
  const clean = channels.replace(/,/g, ' ').replace(/\s+/g, ' ').trim();
  const match = clean.match(/^(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%?\s+(\d+(?:\.\d+)?)%?$/);
  if (!match) {
    if (channels.startsWith('#')) return channels;
    return '#000000';
  }
  const h = Number(match[1]);
  const s = Number(match[2]) / 100;
  const l = Number(match[3]) / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const c = l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return Math.round(c * 255).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

// converte codigo hexadecimal de volta para formato de canais hsl do tailwind
export function hexToHslChannels(hex: string): string {
  if (!hex) return '0 0% 0%';
  const clean = hex.replace('#', '').trim();
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  if (full.length !== 6) return '0 0% 0%';

  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

// Curated palette swatches matching the reference design in the images
export const GREY_SWATCHES = [
  '#FFFFFF',
  '#F1F5F9',
  '#CBD5E1',
  '#94A3B8',
  '#64748B',
  '#334155',
  '#1E293B',
  '#0F172A',
  '#090D16',
];

export const VIBRANT_SWATCHES = [
  '#8032FE', // Purple from screenshot
  '#6366F1', // Indigo
  '#3B82F6', // Blue
  '#0284C7', // Sky
  '#06B6D4', // Cyan
  '#14B8A6', // Teal
  '#10B981', // Emerald
  '#22C55E', // Green
  '#339222', // Forest/Green from screenshot
  '#84CC16', // Lime
  '#EAB308', // Yellow
  '#F59E0B', // Amber
  '#F97316', // Orange
  '#EF4444', // Red
  '#F43F5E', // Rose
  '#EC4899', // Pink
  '#D946EF', // Fuchsia
  '#A855F7', // Violet
];
