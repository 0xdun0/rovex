import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const LOCALES = ['en', 'pt-br', 'es'] as const;
type Locale = typeof LOCALES[number];
const DEFAULT_LOCALE: Locale = 'en';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Skip system paths, api routes, static files, and icons
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') // favicon.ico, images, etc.
  ) {
    return NextResponse.next();
  }

  // 2. Check if pathname already starts with a supported locale
  const segments = pathname.split('/').filter(Boolean);
  const first = segments[0]?.toLowerCase();

  // Normalize /pt or /pt_br to /pt-br
  if (first === 'pt' || first === 'pt_br') {
    const url = request.nextUrl.clone();
    segments[0] = 'pt-br';
    url.pathname = '/' + segments.join('/');
    return NextResponse.redirect(url);
  }

  const isLocalePresent = LOCALES.includes(first as Locale);

  if (isLocalePresent) {
    // encaminha para rota interna
    const internalPath = '/' + segments.slice(1).join('/');
    const url = request.nextUrl.clone();
    url.pathname = internalPath || '/';
    
    const response = NextResponse.rewrite(url);
    response.headers.set('x-rovex-locale', first);
    return response;
  }

  // If path has no locale prefix (e.g. /report or /):
  // Let the client-side router and localStorage handle it gracefully or redirect to DEFAULT_LOCALE
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
