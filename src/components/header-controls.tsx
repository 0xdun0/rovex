'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/context/theme-context';
import { useLanguage } from '@/context/language-context';
import { Globe, Moon, Sun } from '@/components/icons';
import { cn } from '@/lib/utils';

type Variant = 'app' | 'report';

export function ThemeToggleButton({ className, variant = 'app' }: { className?: string; variant?: Variant }) {
  const { theme, setTheme } = useTheme();
  const { language } = useLanguage();
  const t = {
    en: { light: 'Light mode', dark: 'Dark mode' },
    es: { light: 'Modo claro', dark: 'Modo oscuro' },
  };
  const label = theme === 'dark' ? t[language].light : t[language].dark;
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label={label}
      title={label}
      className={cn('h-9 w-9 rounded-full', variant === 'report' && 'h-9 w-9', className)}
    >
      {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}

export function LanguageToggleButton({ className }: { className?: string }) {
  const { currentLocale, setLanguage, uiCode } = useLanguage();
  const t = {
    en: {
      language: 'Language',
      en: 'English',
      'pt-br': 'Português (Brasil)',
      es: 'Español',
    },
    'pt-br': {
      language: 'Idioma',
      en: 'English',
      'pt-br': 'Português (Brasil)',
      es: 'Español',
    },
    es: {
      language: 'Idioma',
      en: 'Inglés',
      'pt-br': 'Portugués (Brasil)',
      es: 'Español',
    },
  };

  const currentDict = t[currentLocale] ?? t.en;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          aria-label={currentDict.language}
          title={currentDict.language}
          className={cn(
            'h-9 min-w-[3.25rem] px-2.5 rounded-full font-semibold text-xs tracking-wider border transition-all flex items-center justify-center gap-1.5 hover:bg-muted/70 shadow-xs',
            className
          )}
        >
          <span className="font-mono text-[11px] font-bold text-primary">{uiCode}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 p-1">
        <DropdownMenuItem
          onClick={() => setLanguage('en')}
          className={cn(
            'flex items-center justify-between text-xs py-2 px-2.5 rounded-sm cursor-pointer',
            currentLocale === 'en' ? 'bg-primary/10 text-primary font-semibold' : 'text-foreground'
          )}
        >
          <span>{currentDict.en}</span>
          <span className="font-mono text-[10px] text-muted-foreground font-bold px-1.5 py-0.5 rounded bg-muted">EN</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLanguage('pt-br')}
          className={cn(
            'flex items-center justify-between text-xs py-2 px-2.5 rounded-sm cursor-pointer',
            currentLocale === 'pt-br' ? 'bg-primary/10 text-primary font-semibold' : 'text-foreground'
          )}
        >
          <span>{currentDict['pt-br']}</span>
          <span className="font-mono text-[10px] text-muted-foreground font-bold px-1.5 py-0.5 rounded bg-muted">PT</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLanguage('es')}
          className={cn(
            'flex items-center justify-between text-xs py-2 px-2.5 rounded-sm cursor-pointer',
            currentLocale === 'es' ? 'bg-primary/10 text-primary font-semibold' : 'text-foreground'
          )}
        >
          <span>{currentDict.es}</span>
          <span className="font-mono text-[10px] text-muted-foreground font-bold px-1.5 py-0.5 rounded bg-muted">ES</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
