// hashing seguro de senha via webcrypto com fallback universal para contextos inseguros (HTTP / IP local)
// formato gerado padrao: "pbkdf2$<iteracoes>$<saltHex>$<hashHex>"
// formato fallback: "fallback-sha256$<iteracoes>$<saltHex>$<hashHex>"
// hashes legados em djb2 continuam sendo validados e migram no login

const PBKDF2_ITERATIONS = 150_000;
const SALT_BYTES = 16;
const HASH_BITS = 256;
const FORMAT_PREFIX = 'pbkdf2';

export function hasSubtleCrypto(): boolean {
  return (
    typeof globalThis !== 'undefined' &&
    !!globalThis.crypto &&
    !!globalThis.crypto.subtle &&
    typeof globalThis.crypto.subtle.importKey === 'function' &&
    typeof globalThis.crypto.subtle.deriveBits === 'function'
  );
}

function getRandomBytes(len: number): Uint8Array {
  const bytes = new Uint8Array(len);
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < len; i += 1) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return bytes;
}

function toHex(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function fromHex(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

async function deriveBits(password: string, salt: Uint8Array, iterations: number): Promise<ArrayBuffer> {
  const keyMaterial = await globalThis.crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  return globalThis.crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    keyMaterial,
    HASH_BITS
  );
}

// implementacao pura de sha-256 para ambientes onde crypto.subtle nao esta disponivel (ex: HTTP em IP local)
function pureSha256(ascii: string): string {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }
  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  const words: number[] = [];
  const asciiBitLength = ascii.length * 8;
  const hash: number[] = [];
  const k: number[] = [];
  let primeCounter = 0;
  const isComposite: Record<number, boolean> = {};

  for (let candidate = 2; primeCounter < 64; candidate += 1) {
    if (!isComposite[candidate]) {
      for (let i = 0; i < 313; i += candidate) {
        isComposite[i] = true;
      }
      hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
      k[primeCounter] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
      primeCounter += 1;
    }
  }

  let formatted = ascii + '\x80';
  while ((formatted.length % 64) - 56) formatted += '\x00';
  for (let i = 0; i < formatted.length; i += 1) {
    const j = formatted.charCodeAt(i);
    words[i >> 2] |= j << ((3 - (i % 4)) * 8);
  }
  words[words.length] = (asciiBitLength / maxWord) | 0;
  words[words.length] = asciiBitLength | 0;

  for (let j = 0; j < words.length; ) {
    const w = words.slice(j, (j += 16));
    const oldHash = [...hash];
    for (let i = 0; i < 64; i += 1) {
      const w15 = w[i - 15];
      const w2 = w[i - 2];
      const s0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3);
      const s1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10);
      w[i] = (i < 16 ? w[i] : (w[i - 16] + s0 + w[i - 7] + s1) | 0);
      const s1h = rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25);
      const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
      const temp1 = (hash[7] + s1h + ch + k[i] + w[i]) | 0;
      const s0h = rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22);
      const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
      const temp2 = (s0h + maj) | 0;
      hash[7] = hash[6];
      hash[6] = hash[5];
      hash[5] = hash[4];
      hash[4] = (hash[3] + temp1) | 0;
      hash[3] = hash[2];
      hash[2] = hash[1];
      hash[1] = hash[0];
      hash[0] = (temp1 + temp2) | 0;
    }
    for (let i = 0; i < 8; i += 1) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }

  let result = '';
  for (let i = 0; i < 8; i += 1) {
    for (let j = 3; j >= 0; j -= 1) {
      const b = (hash[i] >> (8 * j)) & 255;
      result += (b < 16 ? '0' : '') + b.toString(16);
    }
  }
  return result;
}

function fallbackHash(password: string, saltHex: string, iterations = 2000): string {
  let cur = `${password}:${saltHex}`;
  for (let i = 0; i < iterations; i += 1) {
    cur = pureSha256(`${cur}:${saltHex}`);
  }
  return cur;
}

// gera hash seguro com salt para senha em texto plano
export async function hashPassword(password: string): Promise<string> {
  const salt = getRandomBytes(SALT_BYTES);
  const saltHex = toHex(salt);

  if (hasSubtleCrypto()) {
    try {
      const bits = await deriveBits(password, salt, PBKDF2_ITERATIONS);
      return `${FORMAT_PREFIX}$${PBKDF2_ITERATIONS}$${saltHex}$${toHex(bits)}`;
    } catch {
      // fallback caso ocorra erro no subtle
    }
  }

  // fallback universal seguro para ambientes sem crypto.subtle (ex: HTTP)
  const hashHex = fallbackHash(password, saltHex, 2000);
  return `fallback-sha256$2000$${saltHex}$${hashHex}`;
}

// algoritmo de hash legado (djb2) usado apenas para validacao de senhas antigas
function legacyHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash.toString();
}

export function isLegacyHash(stored: string): boolean {
  return !stored.startsWith(`${FORMAT_PREFIX}$`) && !stored.startsWith('fallback-sha256$');
}

// valida senha informada contra o hash persistido em qualquer um dos formatos
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  if (isLegacyHash(stored)) {
    return legacyHash(password) === stored;
  }

  if (stored.startsWith('fallback-sha256$')) {
    const [, iterationsStr, saltHex, hashHex] = stored.split('$');
    const iterations = Number(iterationsStr) || 2000;
    if (!saltHex || !hashHex) return false;
    return fallbackHash(password, saltHex, iterations) === hashHex;
  }

  if (stored.startsWith(`${FORMAT_PREFIX}$`)) {
    const [, iterationsStr, saltHex, hashHex] = stored.split('$');
    const iterations = Number(iterationsStr);
    if (!iterations || !saltHex || !hashHex) return false;

    if (hasSubtleCrypto()) {
      try {
        const bits = await deriveBits(password, fromHex(saltHex), iterations);
        return toHex(bits) === hashHex;
      } catch {
        // se subtle falhar, tenta o fallback do servidor
      }
    }

    // fallback de validacao no servidor para browsers em HTTP / contextos sem subtle
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ password, stored }),
      });
      if (res.ok) {
        const data = await res.json();
        return !!data.valid;
      }
    } catch {
      // falha de rede
    }
    return false;
  }

  return false;
}
