'use client';

import React from 'react';
import { hslChannelsToHex } from '@/lib/color-utils';
import type { ReportTheme } from '@/lib/report-themes';
import { CheckCircle } from '@/components/icons';

interface ThemeWireframeCardProps {
  theme?: ReportTheme;
  title: string;
  subtitle?: string;
  isActive?: boolean;
  isSelected?: boolean;
  type?: 'dual' | 'light' | 'dark' | 'sidebar' | 'topbar';
  onClick?: () => void;
  badge?: string;
  primaryColor?: string;
  borderColor?: string;
}

// miniatura visual do tema em formato wireframe executivo
export function ThemeWireframeCard({
  theme,
  title,
  subtitle,
  isActive = false,
  isSelected = false,
  type = 'dark',
  onClick,
  badge,
  primaryColor,
  borderColor,
}: ThemeWireframeCardProps) {
  // detecta se o card deve ser dividido na diagonal ou tema unico
  const isDual = type === 'dual' || (theme?.modes === 'both' && !type);
  const isLight = type === 'light' || theme?.modes === 'light';
  const effectivePrimary = primaryColor || (theme ? hslChannelsToHex(theme.dark.primary) : '#8032FE');
  const effectiveBorder = borderColor || (theme ? hslChannelsToHex(theme.dark.border) : '#334155');

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={`group relative text-left rounded-xl border transition-all duration-200 overflow-hidden cursor-pointer select-none p-2.5 flex flex-col gap-2 ${
        isSelected
          ? 'border-primary ring-1 ring-primary/40 bg-primary/5 shadow-xs'
          : 'border-border/70 hover:border-border hover:bg-muted/30 bg-card/60'
      }`}
    >
      {/* grafico wireframe com as linhas e cores do tema */}
      <div className="relative w-full h-24 rounded-lg overflow-hidden border border-border/60 shadow-xs">
        {isDual ? (
          // card com corte diagonal para temas duplos (sistema)
          <div className="relative w-full h-full">
            {/* Light side (Left / Top) */}
            <div className="absolute inset-0 bg-slate-100 flex flex-col p-2">
              <div className="flex items-center gap-1.5 mb-2">
                <div className="h-2 w-10 rounded bg-slate-300" />
                <div className="h-1.5 w-6 rounded bg-slate-200" />
              </div>
              <div className="space-y-1.5 w-1/2">
                <div className="h-1.5 w-full rounded bg-slate-300" />
                <div className="h-1.5 w-3/4 rounded bg-slate-200" />
                <div className="h-1.5 w-4/5 rounded bg-slate-200" />
              </div>
            </div>
            {/* Dark side (Right / Bottom via clip-path) */}
            <div
              className="absolute inset-0 bg-[#0d121c] flex flex-col items-end p-2"
              style={{ clipPath: 'polygon(35% 0, 100% 0, 100% 100%, 0 100%)' }}
            >
              <div className="flex items-center gap-1 mb-2">
                <div
                  className="h-2 w-8 rounded shadow-xs"
                  style={{ backgroundColor: effectivePrimary }}
                />
              </div>
              <div className="space-y-1.5 w-2/3 flex flex-col items-end">
                <div className="h-1.5 w-3/4 rounded bg-slate-700" />
                <div className="h-1.5 w-full rounded bg-slate-800" />
                <div className="h-1.5 w-1/2 rounded bg-slate-700" />
              </div>
            </div>
          </div>
        ) : isLight ? (
          // Light Wireframe Card
          <div className="w-full h-full bg-slate-100 flex flex-col p-2.5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 mb-2">
              <div className="h-2 w-12 rounded bg-slate-300" />
              <div
                className="h-2 w-6 rounded"
                style={{ backgroundColor: effectivePrimary }}
              />
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <div className="h-1.5 flex-1 rounded bg-slate-200" />
                <div className="h-1.5 w-8 rounded bg-slate-300" />
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                <div className="h-1.5 flex-1 rounded bg-slate-200" />
                <div className="h-1.5 w-6 rounded bg-slate-300" />
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                <div className="h-1.5 flex-1 rounded bg-slate-200" />
                <div className="h-1.5 w-10 rounded bg-slate-300" />
              </div>
            </div>
          </div>
        ) : (
          // Dark Wireframe Card
          <div className="w-full h-full bg-[#0d121c] flex flex-col p-2.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
              <div className="h-2 w-12 rounded bg-slate-700" />
              <div
                className="h-2 w-6 rounded"
                style={{ backgroundColor: effectivePrimary }}
              />
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <div className="h-1.5 flex-1 rounded bg-slate-800" />
                <div className="h-1.5 w-8 rounded bg-slate-700" />
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                <div className="h-1.5 flex-1 rounded bg-slate-800" />
                <div className="h-1.5 w-6 rounded bg-slate-700" />
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                <div className="h-1.5 flex-1 rounded bg-slate-800" />
                <div className="h-1.5 w-10 rounded bg-slate-700" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Card Info & Radio indicator */}
      <div className="flex items-center justify-between gap-2 mt-0.5">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className="text-xs font-semibold text-foreground truncate">{title}</h4>
            {badge && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-muted/60 text-muted-foreground border border-border/50">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-[11px] text-muted-foreground truncate mt-0.5">{subtitle}</p>
          )}
        </div>

        <div className="shrink-0">
          {isActive ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary">
              <CheckCircle className="h-4 w-4 fill-primary/20 text-primary" />
            </span>
          ) : (
            <div
              className={`h-4 w-4 rounded-full border flex items-center justify-center transition-colors ${
                isSelected
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border/80 group-hover:border-foreground/50'
              }`}
            >
              {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
