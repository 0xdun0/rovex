import { NextResponse } from 'next/server';
import crypto from 'node:crypto';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { password, stored } = await req.json();
    if (typeof password !== 'string' || typeof stored !== 'string') {
      return NextResponse.json({ valid: false }, { status: 400 });
    }

    if (stored.startsWith('pbkdf2$')) {
      const parts = stored.split('$');
      if (parts.length === 4) {
        const [, iterationsStr, saltHex, hashHex] = parts;
        const iterations = Number(iterationsStr);
        const salt = Buffer.from(saltHex, 'hex');
        const derived = crypto.pbkdf2Sync(password, salt, iterations, 32, 'sha256');
        const valid = derived.toString('hex') === hashHex;
        return NextResponse.json({ valid });
      }
    }

    return NextResponse.json({ valid: false });
  } catch {
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}
