'use client';
/* eslint-disable @next/next/no-img-element */

import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Upload, Check } from '@/components/icons';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/language-context';
import { useToast } from '@/hooks/use-toast';
import dynamic from 'next/dynamic';

const ImageCropDialog = dynamic(
  () => import('@/components/image-crop-dialog').then((m) => m.ImageCropDialog),
  { ssr: false }
);

interface ImageUploadButtonProps {
  value: string | null | undefined;
  onChange: (dataUrl: string) => void;
  aspect: number;
  cropShape?: 'rect' | 'round';
  previewClassName?: string;
  label?: string;
  sublabel?: string;
  cropTitle?: string;
  outputSize?: number;
  showRemove?: boolean;
  className?: string;
}

export function ImageUploadButton({
  value,
  onChange,
  aspect,
  cropShape = 'rect',
  previewClassName,
  label,
  sublabel,
  cropTitle,
  outputSize = 512,
  showRemove = true,
  className,
}: ImageUploadButtonProps) {
  const { currentLocale } = useLanguage();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogSrc, setDialogSrc] = useState<string | null>(null);
  const [cropperMounted, setCropperMounted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const isPt = currentLocale === 'pt-br';
  const isEs = currentLocale === 'es';

  const t = {
    upload: label ?? (isPt ? 'Vincular Logo / Ativo' : isEs ? 'Vincular Logo' : 'Attach Logo / Asset'),
    clickOrDrag: isPt ? 'Clique ou arraste o arquivo' : isEs ? 'Haz clic o arrastra' : 'Click or drag asset',
    uploadComplete: isPt ? 'Ativo validado para relatório' : isEs ? 'Activo listo para reporte' : 'Asset ready for report',
    edit: isPt ? 'Recortar / Enquadrar' : isEs ? 'Ajustar imagen' : 'Crop / Reposition',
    remove: isPt ? 'Remover' : isEs ? 'Quitar' : 'Remove',
    placeholder: isPt ? 'Sem logotipo' : isEs ? 'Sin logo' : 'No logo attached',
    invalidFile: isPt
      ? 'Selecione uma imagem válida (PNG, SVG, JPG, WebP).'
      : isEs
      ? 'Selecciona una imagen válida (PNG, SVG, JPG, WebP).'
      : 'Please select a valid image file (PNG, SVG, JPG, WebP).',
  };

  const openCropper = (src: string | null) => {
    setDialogSrc(src);
    setDialogOpen(true);
    setCropperMounted(true);
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({ variant: 'destructive', title: t.invalidFile });
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      openCropper(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  // Layout circular dedicado para avatar de operador (quando cropShape === 'round')
  if (cropShape === 'round') {
    return (
      <div className={cn('flex flex-col items-center gap-3', className)}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <div
          onClick={() => (!value ? fileInputRef.current?.click() : openCropper(value))}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'group relative flex shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 bg-muted/40 transition-all duration-200 hover:border-primary/60 hover:shadow-md',
            isDragging && 'border-primary ring-2 ring-primary/30',
            previewClassName ?? 'h-24 w-24'
          )}
        >
          {value ? (
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center p-2 text-center text-muted-foreground group-hover:text-primary transition-colors">
              <Upload className="h-5 w-5 mb-1" />
              <span className="text-[10px] font-medium uppercase tracking-wider">{t.upload}</span>
            </div>
          )}

          {value && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-[10px] font-semibold text-white uppercase tracking-wider">
                {t.edit}
              </span>
            </div>
          )}
        </div>

        {value && (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs rounded-lg gap-1 text-muted-foreground hover:text-foreground"
              onClick={() => openCropper(value)}
            >
              <Edit className="h-3 w-3" />
              <span>{t.edit}</span>
            </Button>
            {showRemove && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs rounded-lg gap-1 border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => onChange('')}
              >
                <Trash2 className="h-3 w-3" />
                <span>{t.remove}</span>
              </Button>
            )}
          </div>
        )}

        {cropperMounted && (
          <ImageCropDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            imageSrc={dialogSrc}
            aspect={aspect}
            cropShape={cropShape}
            outputSize={outputSize}
            title={cropTitle}
            onConfirm={(dataUrl) => onChange(dataUrl)}
          />
        )}
      </div>
    );
  }

  // Layout minimalista moderno inspirado na imagem de referência para logos e retângulos
  return (
    <div className={cn('w-full', className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {!value ? (
        // Estado 1: DROPZONE MINIMALISTA
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'group relative flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-card/40 p-4 text-center cursor-pointer transition-all duration-200 hover:border-primary/60 hover:bg-card/70',
            isDragging && 'border-primary bg-primary/5 ring-2 ring-primary/20 scale-[0.99]'
          )}
        >
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg border border-border/70 bg-background/80 text-muted-foreground shadow-xs transition-colors group-hover:border-primary/40 group-hover:text-primary">
            <Upload className="h-4 w-4" />
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">
              {label || t.upload}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {sublabel || t.clickOrDrag}
            </p>
          </div>
        </div>
      ) : (
        // Estado 2: CARD DE ARQUIVO CARREGADO (CLEAN & MINIMAL)
        <div className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-card/60 p-3 shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/60 bg-background p-1">
              <img src={value} alt="" className="h-full w-full object-contain" />
            </div>
            <div className="flex-1 min-w-0 space-y-0.5">
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold text-foreground truncate">
                  {label || 'Logo'}
                </p>
                {sublabel && (
                  <span className="text-[10px] font-mono text-muted-foreground hidden sm:inline">
                    • {sublabel}
                  </span>
                )}
              </div>
              <p className="flex items-center gap-1 text-[11px] font-medium text-emerald-500 whitespace-nowrap">
                <Check className="h-3 w-3 shrink-0" />
                <span>{t.uploadComplete}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={() => openCropper(value)}
              title={t.edit}
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
            {showRemove && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                onClick={() => onChange('')}
                title={t.remove}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      )}

      {cropperMounted && (
        <ImageCropDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          imageSrc={dialogSrc}
          aspect={aspect}
          cropShape={cropShape}
          outputSize={outputSize}
          title={cropTitle}
          onConfirm={(dataUrl) => onChange(dataUrl)}
        />
      )}
    </div>
  );
}

export default ImageUploadButton;
