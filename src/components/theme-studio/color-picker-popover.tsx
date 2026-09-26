'use client';

import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { GREY_SWATCHES, VIBRANT_SWATCHES, hslChannelsToHex, hexToHslChannels } from '@/lib/color-utils';
import { Check, Plus } from '@/components/icons';

interface ColorPickerPopoverProps {
  label?: string;
  value: string; // "H S% L%" or "#RRGGBB"
  onChange: (hslChannels: string) => void;
  disabled?: boolean;
  pageColors?: string[]; // optional hex codes of page colors
}

// popover de selecao de cor com paleta de cinzas, cores vivas e picker interativo
export function ColorPickerPopover({
  label,
  value,
  onChange,
  disabled = false,
  pageColors = [],
}: ColorPickerPopoverProps) {
  const [open, setOpen] = useState(false);
  const currentHex = hslChannelsToHex(value);
  const [customHex, setCustomHex] = useState(currentHex);

  // aplica a cor escolhida convertendo de hex para canais hsl
  const handleSelectHex = (hex: string) => {
    setCustomHex(hex);
    onChange(hexToHslChannels(hex));
  };

  // valida e aplica o codigo hex digitado manualmente
  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomHex(val);
    if (/^#[0-9A-Fa-f]{6}$/.test(val) || /^#[0-9A-Fa-f]{3}$/.test(val)) {
      onChange(hexToHslChannels(val));
    }
  };

  // atualiza atraves do seletor nativo de cor
  const handleNativeColorPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    setCustomHex(val);
    onChange(hexToHslChannels(val));
  };

  // conta-gotas do navegador para capturar cor de qualquer pixel
  const handleEyeDropper = async () => {
    if (typeof window !== 'undefined' && 'EyeDropper' in window) {
      try {
        // @ts-expect-error EyeDropper is a modern browser feature
        const eyeDropper = new window.EyeDropper();
        const result = await eyeDropper.open();
        if (result?.sRGBHex) {
          handleSelectHex(result.sRGBHex.toUpperCase());
        }
      } catch {
        // EyeDropper cancelled
      }
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className="group flex items-center justify-between gap-2.5 w-full h-9 px-3 rounded-lg border border-border/70 bg-background/60 hover:bg-muted/40 hover:border-border transition-all text-left focus:outline-none focus:ring-1 focus:ring-primary/40 disabled:opacity-50 disabled:pointer-events-none"
          title={label}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="h-4 w-4 rounded-md shrink-0 border border-black/20 shadow-xs"
              style={{ backgroundColor: currentHex }}
            />
            <span className="font-mono text-xs text-foreground font-medium truncate">
              {currentHex}
            </span>
          </div>
          {label && (
            <span className="text-[11px] text-muted-foreground truncate hidden sm:inline">
              {label}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={6}
        className="w-[280px] p-3.5 space-y-3.5 bg-popover/95 backdrop-blur-md border border-border/80 rounded-xl shadow-xl z-50 text-foreground"
      >
        {/* Grayscale Swatches */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Greys
          </span>
          <div className="flex items-center gap-1.5 justify-between">
            {GREY_SWATCHES.map((hex) => {
              const isSelected = currentHex.toLowerCase() === hex.toLowerCase();
              return (
                <button
                  key={hex}
                  type="button"
                  onClick={() => handleSelectHex(hex)}
                  className={`h-5 w-5 rounded-md border border-border/60 transition-transform hover:scale-110 flex items-center justify-center relative ${
                    isSelected ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : ''
                  }`}
                  style={{ backgroundColor: hex }}
                  title={hex}
                >
                  {isSelected && (
                    <Check
                      className={`h-3 w-3 ${
                        hex.toLowerCase() === '#ffffff' || hex.toLowerCase() === '#f1f5f9'
                          ? 'text-black'
                          : 'text-white'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Vibrant Swatches Grid */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Colors
          </span>
          <div className="grid grid-cols-9 gap-1.5">
            {VIBRANT_SWATCHES.map((hex) => {
              const isSelected = currentHex.toLowerCase() === hex.toLowerCase();
              return (
                <button
                  key={hex}
                  type="button"
                  onClick={() => handleSelectHex(hex)}
                  className={`h-5 w-5 rounded-md border border-border/60 transition-transform hover:scale-110 flex items-center justify-center ${
                    isSelected ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : ''
                  }`}
                  style={{ backgroundColor: hex }}
                  title={hex}
                >
                  {isSelected && <Check className="h-2.5 w-2.5 text-white drop-shadow-sm" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Color Spectrum / Native Picker */}
        <div className="space-y-2 pt-1 border-t border-border/50">
          <div className="flex items-center gap-2">
            <div className="relative h-8 w-10 shrink-0 rounded-lg overflow-hidden border border-border/80 cursor-pointer shadow-xs">
              <input
                type="color"
                value={currentHex.length === 7 ? currentHex : '#000000'}
                onChange={handleNativeColorPick}
                className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer border-0 p-0"
              />
            </div>
            <Input
              type="text"
              value={customHex}
              onChange={handleHexInputChange}
              placeholder="#000000"
              className="h-8 font-mono text-xs bg-background/80 uppercase"
              maxLength={7}
            />
            {typeof window !== 'undefined' && 'EyeDropper' in window && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleEyeDropper}
                className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
                title="Eyedropper"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* Page colors if available */}
        {pageColors.length > 0 && (
          <div className="space-y-1.5 pt-1 border-t border-border/50">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Page colors
            </span>
            <div className="flex flex-wrap gap-1.5">
              {pageColors.slice(0, 9).map((hex, idx) => (
                <button
                  key={`${hex}-${idx}`}
                  type="button"
                  onClick={() => handleSelectHex(hex)}
                  className="h-5 w-5 rounded-md border border-border/60 transition-transform hover:scale-110"
                  style={{ backgroundColor: hex }}
                  title={hex}
                />
              ))}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
