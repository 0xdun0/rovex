'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, CheckCircle } from '@/components/icons';
import type { ReportTheme } from '@/lib/report-themes';

interface ThemeConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeMode: 'light' | 'dark';
  onModeChange: (mode: 'light' | 'dark') => void;
  containerMode: 'default' | 'fluid' | 'fixed';
  onContainerModeChange: (mode: 'default' | 'fluid' | 'fixed') => void;
  layoutStyle: 'sidebar' | 'topbar';
  onLayoutStyleChange: (style: 'sidebar' | 'topbar') => void;
  iconStyle: 'filled' | 'outline' | 'dual';
  onIconStyleChange: (style: 'filled' | 'outline' | 'dual') => void;
  activeTheme?: ReportTheme;
}

// modal de configuracao rapida de layout, contraste e densidade do relatorio
export function ThemeConfigDialog({
  open,
  onOpenChange,
  activeMode,
  onModeChange,
  containerMode,
  onContainerModeChange,
  layoutStyle,
  onLayoutStyleChange,
  iconStyle,
  onIconStyleChange,
}: ThemeConfigDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl bg-card border border-border/80 text-foreground shadow-2xl">
        <DialogHeader className="pb-3 border-b border-border/60">
          <DialogTitle className="text-xl font-bold tracking-tight">
            Theme Configuration
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Ajuste os parâmetros visuais de layout, contraste e densidade do ambiente
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* seletor de modo claro ou escuro com cards wireframe */}
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-semibold text-foreground">Theme Mode</h4>
              <p className="text-xs text-muted-foreground">Alterne entre visual claro ou escuro.</p>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              {/* Light Mode Wireframe */}
              <button
                type="button"
                onClick={() => onModeChange('light')}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-2.5 ${
                  activeMode === 'light'
                    ? 'border-emerald-500/80 bg-emerald-500/5 ring-1 ring-emerald-500/40'
                    : 'border-border/70 hover:border-border hover:bg-muted/30'
                }`}
              >
                <div className="w-full h-20 rounded-lg bg-slate-100 border border-slate-200 p-2 flex gap-1.5 overflow-hidden">
                  <div className="w-1/4 h-full bg-slate-200 rounded flex flex-col gap-1 p-1">
                    <div className="h-1 w-full bg-slate-300 rounded" />
                    <div className="h-1 w-3/4 bg-slate-300 rounded" />
                  </div>
                  <div className="flex-1 flex flex-col gap-1.5">
                    <div className="h-2 w-full bg-slate-200 rounded" />
                    <div className="h-1.5 w-4/5 bg-slate-300 rounded" />
                    <div className="h-1.5 w-2/3 bg-slate-200 rounded" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                      activeMode === 'light'
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : 'border-muted-foreground'
                    }`}
                  >
                    {activeMode === 'light' && <Check className="h-2.5 w-2.5" />}
                  </div>
                  <span className="text-xs font-semibold">Light</span>
                </div>
              </button>

              {/* Dark Mode Wireframe */}
              <button
                type="button"
                onClick={() => onModeChange('dark')}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-2.5 ${
                  activeMode === 'dark'
                    ? 'border-emerald-500/80 bg-emerald-500/5 ring-1 ring-emerald-500/40'
                    : 'border-border/70 hover:border-border hover:bg-muted/30'
                }`}
              >
                <div className="w-full h-20 rounded-lg bg-[#0d121c] border border-slate-800 p-2 flex gap-1.5 overflow-hidden">
                  <div className="w-1/4 h-full bg-slate-800 rounded flex flex-col gap-1 p-1">
                    <div className="h-1 w-full bg-slate-700 rounded" />
                    <div className="h-1 w-3/4 bg-slate-700 rounded" />
                  </div>
                  <div className="flex-1 flex flex-col gap-1.5">
                    <div className="h-2 w-full bg-slate-800 rounded" />
                    <div className="h-1.5 w-4/5 bg-slate-700 rounded" />
                    <div className="h-1.5 w-2/3 bg-slate-800 rounded" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                      activeMode === 'dark'
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : 'border-muted-foreground'
                    }`}
                  >
                    {activeMode === 'dark' && <Check className="h-2.5 w-2.5" />}
                  </div>
                  <span className="text-xs font-semibold">Dark</span>
                </div>
              </button>
            </div>
          </div>

          {/* Container Mode Section */}
          <div className="space-y-2">
            <div>
              <h4 className="text-sm font-semibold text-foreground">Container Mode</h4>
              <p className="text-xs text-muted-foreground">Largura e enquadramento do conteúdo do relatório.</p>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {(['default', 'fluid', 'fixed'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => onContainerModeChange(mode)}
                  className={`py-2 px-3 rounded-lg border text-xs font-medium capitalize flex items-center justify-center gap-1.5 transition-all ${
                    containerMode === mode
                      ? 'border-primary bg-primary/10 text-primary font-semibold'
                      : 'border-border/70 hover:bg-muted/40 text-muted-foreground'
                  }`}
                >
                  {containerMode === mode && <CheckCircle className="h-3.5 w-3.5" />}
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Icon Style Section */}
          <div className="space-y-2">
            <div>
              <h4 className="text-sm font-semibold text-foreground">Icon Style</h4>
              <p className="text-xs text-muted-foreground">Estilo global dos marcadores e pictogramas.</p>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {(['filled', 'outline', 'dual'] as const).map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => onIconStyleChange(style)}
                  className={`py-2 px-3 rounded-lg border text-xs font-medium capitalize flex items-center justify-center gap-1.5 transition-all ${
                    iconStyle === style
                      ? 'border-primary bg-primary/10 text-primary font-semibold'
                      : 'border-border/70 hover:bg-muted/40 text-muted-foreground'
                  }`}
                >
                  {iconStyle === style && <CheckCircle className="h-3.5 w-3.5" />}
                  {style === 'dual' ? 'Dual tone' : style}
                </button>
              ))}
            </div>
          </div>

          {/* Layout Style Section */}
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-semibold text-foreground">Layout Style</h4>
              <p className="text-xs text-muted-foreground">Disposição estrutural da navegação e documento.</p>
            </div>
            <div className="grid grid-cols-2 gap-3.5">
              {/* Sidebar layout */}
              <button
                type="button"
                onClick={() => onLayoutStyleChange('sidebar')}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-2 ${
                  layoutStyle === 'sidebar'
                    ? 'border-emerald-500/80 bg-emerald-500/5 ring-1 ring-emerald-500/40'
                    : 'border-border/70 hover:border-border hover:bg-muted/30'
                }`}
              >
                <div className="w-full h-16 rounded-lg bg-muted/40 border border-border/60 p-2 flex gap-2">
                  <div className="w-6 h-full bg-primary/30 rounded" />
                  <div className="flex-1 flex flex-col gap-1.5">
                    <div className="h-2 w-full bg-border rounded" />
                    <div className="h-2 w-3/4 bg-border/60 rounded" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                      layoutStyle === 'sidebar'
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : 'border-muted-foreground'
                    }`}
                  >
                    {layoutStyle === 'sidebar' && <Check className="h-2.5 w-2.5" />}
                  </div>
                  <span className="text-xs font-semibold">Side bar</span>
                </div>
              </button>

              {/* Topbar layout */}
              <button
                type="button"
                onClick={() => onLayoutStyleChange('topbar')}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-2 ${
                  layoutStyle === 'topbar'
                    ? 'border-emerald-500/80 bg-emerald-500/5 ring-1 ring-emerald-500/40'
                    : 'border-border/70 hover:border-border hover:bg-muted/30'
                }`}
              >
                <div className="w-full h-16 rounded-lg bg-muted/40 border border-border/60 p-2 flex flex-col gap-2">
                  <div className="h-3 w-full bg-primary/30 rounded" />
                  <div className="flex-1 flex gap-2">
                    <div className="flex-1 bg-border/60 rounded" />
                    <div className="flex-1 bg-border/40 rounded" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                      layoutStyle === 'topbar'
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : 'border-muted-foreground'
                    }`}
                  >
                    {layoutStyle === 'topbar' && <Check className="h-2.5 w-2.5" />}
                  </div>
                  <span className="text-xs font-semibold">Top bar</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border/60">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs h-9 px-4 rounded-lg"
          >
            Fechar
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs h-9 px-5 rounded-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Concluir
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
