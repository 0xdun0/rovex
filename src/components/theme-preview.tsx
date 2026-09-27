'use client';

import React, { useEffect, useMemo, useId } from 'react';
import { themeExtrasCSS, themeVariablesStyle } from '@/lib/theme-to-css';
import { buildThemePreviewDoc } from '@/lib/theme-preview-doc';
import { loadFontFamilies } from '@/lib/report-fonts';
import type { ReportTheme } from '@/lib/report-themes';

type Variant = 'mini' | 'full';

// Capa demonstrativa para miniatura visual do tema.
const DEMO = {
  kicker: 'Security Assessment Report',
  title: 'Q3 Web App Pentest',
  client: 'Hack The Box',
} as const;

interface ThemePreviewProps {
  theme: ReportTheme;
  mode?: 'light' | 'dark';
  variant?: Variant;
  className?: string;
  /** Quando ativo exibe folha A4 com capa, evidencias e barra lateral. */
  showFull?: boolean;
}

/**
 * Renderiza preview do tema sem iframe com container escopado
 * data-theme-scope aplica variaveis de estilo isoladamente
 * regras injetadas em tag style local sem vazar para a aplicacao
 * delimitado por id exclusivo.
 */
export function ThemePreview({ theme, mode = 'light', variant = 'mini', className, showFull }: ThemePreviewProps) {
  const scopeId = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const styleVars = useMemo(() => themeVariablesStyle(mode, theme), [mode, theme]);

  useEffect(() => {
    loadFontFamilies([
      theme.typography.familyBody,
      theme.typography.familyHeadline,
      theme.typography.familyMono,
    ]);
  }, [theme]);

  // Gera CSS com prefixo de escopo para isolamento do tema
  // garante que o preview nao altere a interface principal.
  const scopedExtras = useMemo(() => {
    const raw = themeExtrasCSS(theme);
    // Insere o seletor de escopo em cada bloco CSS.
    // Estrategia simples: divide por chaves aplicando escopo nos seletores
    // aplica seletor escopado.
    const prefix = `[data-theme-scope="${scopeId}"]`;
    return raw
      .split('}')
      .map((chunk) => {
        const idx = chunk.indexOf('{');
        if (idx === -1) return chunk;
        const selectors = chunk.slice(0, idx).split(',').map((s) => s.trim()).filter(Boolean);
        const body = chunk.slice(idx);
        const scoped = selectors
          .map((sel) => {
            if (sel.startsWith(':root') || sel.startsWith('.light') || sel.startsWith('.dark')) {
              // Variaveis root aplicadas diretamente ao container wrapper.
              return prefix;
            }
            return `${prefix} ${sel}`;
          })
          .join(', ');
        return `${scoped}${body}`;
      })
      .join('}');
  }, [theme, scopeId]);

  const isFull = variant === 'full' || showFull;

  if (isFull) {
    return <FullPreview theme={theme} mode={mode} className={className} />;
  }

  return (
    <div
      data-theme-scope={scopeId}
      className={['theme-preview', mode, className].filter(Boolean).join(' ')}
      style={{
        ...(styleVars as React.CSSProperties),
        background: 'hsl(var(--background))',
        color: 'hsl(var(--foreground))',
        overflow: 'hidden',
        fontFamily: 'var(--report-font-body, system-ui, sans-serif)',
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: scopedExtras }} />
      <MiniPreview theme={theme} />
    </div>
  );
}

function MiniPreview({ theme: _theme }: { theme: ReportTheme }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div
        className="report-cover"
        style={{
          padding: '1.3rem 1.2rem',
          minHeight: 0,
          position: 'relative',
        }}
      >
        <p style={{ color: 'hsl(var(--brand))', fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', margin: 0 }}>
          {DEMO.kicker}
        </p>
        <h2
          className="cover-title"
          style={{ fontFamily: 'var(--report-font-headline)', fontSize: '1.15rem', margin: '0.35rem 0 0.2rem', color: 'hsl(var(--foreground))', fontWeight: 700, letterSpacing: '-0.01em' }}
        >
          {DEMO.title}
        </h2>
        <p style={{ margin: 0, color: 'hsl(var(--muted-foreground))', fontSize: '0.7rem' }}>
          {DEMO.client}
        </p>
      </div>
    </div>
  );
}

function FullPreview({ theme, mode, className }: { theme: ReportTheme; mode: 'light' | 'dark'; className?: string }) {
  const doc = useMemo(() => buildThemePreviewDoc(theme, mode), [theme, mode]);
  return (
    <iframe
      title="Theme preview"
      srcDoc={doc}
      sandbox="allow-same-origin"
      className={['w-full rounded-lg border bg-background', className].filter(Boolean).join(' ')}
      style={{ height: '70vh', display: 'block' }}
    />
  );
}
