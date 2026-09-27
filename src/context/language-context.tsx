'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { PT_BR_TRANSLATIONS } from '@/lib/translations-ptbr';

export type AppLanguage = 'en' | 'pt-br' | 'es';
export type Language = 'en' | 'es';

export const SUPPORTED_LANGUAGES: readonly AppLanguage[] = ['en', 'pt-br', 'es'] as const;

export const LANGUAGE_UI_LABELS: Record<AppLanguage, { code: string; label: string; urlPrefix: string }> = {
  'en': { code: 'EN', label: 'English', urlPrefix: '/en' },
  'pt-br': { code: 'PT', label: 'Português (Brasil)', urlPrefix: '/pt-br' },
  'es': { code: 'ES', label: 'Español', urlPrefix: '/es' },
};

export function getLanguageFromPathname(pathname: string): AppLanguage | null {
  if (!pathname) return null;
  const segments = pathname.split('/').filter(Boolean);
  const first = segments[0]?.toLowerCase();
  if (first === 'pt-br' || first === 'pt_br' || first === 'pt') return 'pt-br';
  if (first === 'en') return 'en';
  if (first === 'es') return 'es';
  return null;
}

export function replaceLanguageInPath(pathname: string, newLang: AppLanguage): string {
  if (!pathname || pathname === '/') {
    return `/${newLang}`;
  }
  const segments = pathname.split('/').filter(Boolean);
  const first = segments[0]?.toLowerCase();
  if (first === 'pt-br' || first === 'pt_br' || first === 'pt' || first === 'en' || first === 'es') {
    segments[0] = newLang;
    return '/' + segments.join('/');
  }
  return `/${newLang}${pathname.startsWith('/') ? pathname : '/' + pathname}`;
}

interface LanguageContextType {
  // language is typed as 'en' | 'es' with fallback so `t[language]` never causes TS7053 across 34 existing components
  language: Language;
  // currentLocale has the exact active locale ('en' | 'pt-br' | 'es')
  currentLocale: AppLanguage;
  setLanguage: (language: AppLanguage, syncUrl?: boolean) => void;
  uiLabel: string;
  uiCode: string;
  tSafe: <T>(dict: Record<string, T>, fallbackLang?: AppLanguage) => T;
  t: <T>(dict: Record<string, T>) => T;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentLocale, setCurrentLocale] = useState<AppLanguage>('en');

  useEffect(() => {
    // 1. verifica se a url especifica o idioma
    const pathLang = getLanguageFromPathname(pathname);
    if (pathLang) {
      setCurrentLocale(pathLang);
      localStorage.setItem('rovex-lang', pathLang);
      document.documentElement.lang = pathLang;
      return;
    }

    // 2. le idioma salvo no rovex
    const saved = localStorage.getItem('rovex-lang') as AppLanguage;
    if (saved && (saved === 'en' || saved === 'pt-br' || saved === 'es')) {
      setCurrentLocale(saved);
      document.documentElement.lang = saved;
    } else {
      setCurrentLocale('en');
      document.documentElement.lang = 'en';
    }
  }, [pathname]);

  const setLanguage = useCallback((newLocale: AppLanguage, syncUrl: boolean = true) => {
    localStorage.setItem('rovex-lang', newLocale);
    setCurrentLocale(newLocale);
    document.documentElement.lang = newLocale;

    if (syncUrl && pathname) {
      const pathLang = getLanguageFromPathname(pathname);
      if (pathLang || pathname.startsWith('/report') || pathname.startsWith('/report')) {
        const targetUrl = replaceLanguageInPath(pathname, newLocale);
        if (targetUrl !== pathname) {
          router.push(targetUrl);
        }
      }
    }
  }, [pathname, router]);

  // Fallback safe dictionary lookup: pt-br -> en -> es
  const tSafe = useCallback(<T,>(dict: Record<string, T>, fallbackLang: AppLanguage = 'en'): T => {
    if (currentLocale === 'pt-br') {
      if (dict['pt-br'] !== undefined) {
        return dict['pt-br'];
      }
      // If dict does not have 'pt-br', check if there is a match in PT_BR_TRANSLATIONS or merge with base fallback
      const baseObj = dict['en'] ?? dict['es'] ?? ({} as T);
      if (baseObj && typeof baseObj === 'object') {
        // Find matching section in PT_BR_TRANSLATIONS by comparing keys
        const baseKeys = Object.keys(baseObj as object);
        for (const section of Object.values(PT_BR_TRANSLATIONS)) {
          const matchCount = baseKeys.filter(k => k in section).length;
          if (matchCount > 0 && matchCount >= Math.min(3, baseKeys.length)) {
            return { ...(baseObj as object), ...section } as T;
          }
        }
      }
    }

    if (dict[currentLocale] !== undefined) return dict[currentLocale];
    if (dict[fallbackLang] !== undefined) return dict[fallbackLang];
    if (dict['en'] !== undefined) return dict['en'];
    if (dict['es'] !== undefined) return dict['es'];
    const keys = Object.keys(dict);
    return keys.length > 0 ? dict[keys[0]] : ({} as T);
  }, [currentLocale]);

  // For components with only { en, es }, pass 'en' as primary fallback for 'pt-br'
  const legacyLanguage: Language = currentLocale === 'es' ? 'es' : 'en';

  const t = useCallback(<T,>(dict: Record<string, T>): T => {
    return tSafe(dict);
  }, [tSafe]);

  return (
    <LanguageContext.Provider
      value={{
        language: legacyLanguage,
        currentLocale,
        setLanguage,
        uiLabel: LANGUAGE_UI_LABELS[currentLocale]?.label ?? 'English',
        uiCode: LANGUAGE_UI_LABELS[currentLocale]?.code ?? 'EN',
        tSafe,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}