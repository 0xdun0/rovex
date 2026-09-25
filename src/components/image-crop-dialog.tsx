'use client';
/* eslint-disable @next/next/no-img-element */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Upload, Info, RotateCcw, Check } from '@/components/icons';
import { useLanguage } from '@/context/language-context';
import { useToast } from '@/hooks/use-toast';

interface ImageCropDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageSrc: string | null;
  aspect: number;
  onConfirm: (croppedDataUrl: string) => void;
  title?: string;
  outputSize?: number;
  cropShape?: 'rect' | 'round';
}

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });

async function getCroppedImg(
  imageSrc: string,
  areaPixels: Area,
  outputSize: number
): Promise<string> {
  const image = await loadImage(imageSrc);

  const sourceWidth = Math.max(1, Math.round(areaPixels.width));
  const sourceHeight = Math.max(1, Math.round(areaPixels.height));

  const longestSide = Math.max(sourceWidth, sourceHeight);
  const scale = longestSide > outputSize ? outputSize / longestSide : 1;

  const targetWidth = Math.max(1, Math.round(sourceWidth * scale));
  const targetHeight = Math.max(1, Math.round(sourceHeight * scale));

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get 2D context');
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.drawImage(
    image,
    areaPixels.x,
    areaPixels.y,
    areaPixels.width,
    areaPixels.height,
    0,
    0,
    targetWidth,
    targetHeight
  );

  return canvas.toDataURL('image/png');
}

export function ImageCropDialog({
  open,
  onOpenChange,
  imageSrc,
  aspect,
  onConfirm,
  title,
  outputSize = 512,
  cropShape = 'rect',
}: ImageCropDialogProps) {
  const { currentLocale } = useLanguage();
  const { toast } = useToast();

  const [internalSrc, setInternalSrc] = useState<string | null>(imageSrc);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isPt = currentLocale === 'pt-br';
  const isEs = currentLocale === 'es';

  const t = {
    title: title ?? (isPt ? 'Enquadramento de Evidência / Logo' : isEs ? 'Ajustar Evidencia / Logo' : 'Crop Evidence / Logo'),
    description: isPt
      ? 'Ajuste o zoom e reposicione a área de interesse para preservar a legibilidade no relatório de auditoria.'
      : isEs
      ? 'Ajusta el zoom y posición para preservar la legibilidad en el reporte de auditoría.'
      : 'Adjust zoom and reposition to ensure clarity and fidelity in the audit report.',
    zoom: isPt ? 'Escala / Zoom' : isEs ? 'Escala / Zoom' : 'Scale / Zoom',
    loadAnother: isPt ? 'Trocar arquivo' : isEs ? 'Cambiar archivo' : 'Replace file',
    cancel: isPt ? 'Cancelar' : isEs ? 'Cancelar' : 'Cancel',
    confirm: isPt ? 'Salvar Enquadramento' : isEs ? 'Guardar Encuadre' : 'Save Crop Framing',
    noImage: isPt ? 'Selecione uma imagem de evidência para enquadrar.' : isEs ? 'Selecciona una imagen de evidencia.' : 'Select an evidence image to crop.',
    pickImage: isPt ? 'Selecionar arquivo' : isEs ? 'Elegir archivo' : 'Select file',
    invalidFile: isPt ? 'Selecione um arquivo de imagem válido (PNG, JPG, SVG, WebP).' : isEs ? 'Selecciona una imagen válida.' : 'Please select a valid image file.',
    cropError: isPt ? 'Não foi possível processar o enquadramento.' : isEs ? 'No se pudo procesar la imagen.' : 'Could not process crop framing.',
  };

  useEffect(() => {
    if (open) {
      setInternalSrc(imageSrc);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
    }
  }, [open, imageSrc]);

  useEffect(() => {
    if (open && !internalSrc) {
      const id = window.setTimeout(() => fileInputRef.current?.click(), 50);
      return () => window.clearTimeout(id);
    }
    return undefined;
  }, [open, internalSrc]);

  const onCropComplete = useCallback((_: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const handleFile = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({ variant: 'destructive', title: t.invalidFile });
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setInternalSrc(reader.result as string);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
    };
    reader.readAsDataURL(file);
  };

  const handleConfirm = async () => {
    if (!internalSrc || !croppedAreaPixels) return;
    setIsProcessing(true);
    try {
      const dataUrl = await getCroppedImg(internalSrc, croppedAreaPixels, outputSize);
      onConfirm(dataUrl);
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast({ variant: 'destructive', title: t.cropError });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[580px] rounded-2xl bg-card border-border/80 shadow-2xl p-6 space-y-4">
        <DialogHeader className="flex flex-row items-start gap-3 space-y-0 text-left">
          <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5">
            <Info className="h-5 w-5" />
          </div>
          <div className="space-y-0.5 flex-1 min-w-0">
            <DialogTitle className="text-base font-semibold text-foreground font-headline">
              {t.title}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              {t.description}
            </DialogDescription>
          </div>
        </DialogHeader>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />

        {internalSrc ? (
          <div className="space-y-4">
            <div className="relative h-[290px] w-full overflow-hidden rounded-xl border border-border/80 bg-zinc-950 shadow-inner">
              <Cropper
                image={internalSrc}
                crop={crop}
                zoom={zoom}
                aspect={aspect}
                cropShape={cropShape}
                showGrid={false}
                objectFit="contain"
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div className="space-y-2 p-3 rounded-xl bg-muted/30 border border-border/60">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium text-foreground">
                  {t.zoom}
                </Label>
                <span className="text-[11px] font-mono text-muted-foreground">
                  {(zoom * 100).toFixed(0)}%
                </span>
              </div>
              <Slider
                value={[zoom]}
                min={1}
                max={3}
                step={0.01}
                onValueChange={(value) => setZoom(value[0] ?? 1)}
                className="py-1"
              />
            </div>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex h-[260px] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border/80 bg-muted/15 p-6 text-center cursor-pointer hover:border-primary/60 hover:bg-muted/30 transition-all"
          >
            <div className="h-11 w-11 rounded-xl bg-card border border-border/70 text-muted-foreground flex items-center justify-center shadow-xs">
              <Upload className="h-5 w-5" />
            </div>
            <p className="text-xs text-muted-foreground">{t.noImage}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 rounded-lg text-xs gap-1.5"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>{t.pickImage}</span>
            </Button>
          </div>
        )}

        <DialogFooter className="border-t border-border/60 pt-3 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="h-9 px-3 rounded-xl text-xs text-muted-foreground hover:text-foreground gap-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>{t.loadAnother}</span>
          </Button>
          <div className="flex items-center gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-9 px-4 rounded-xl text-xs"
            >
              {t.cancel}
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleConfirm}
              disabled={!internalSrc || !croppedAreaPixels || isProcessing}
              className="h-9 px-5 rounded-xl text-xs bg-primary text-primary-foreground font-semibold shadow-xs"
            >
              <Check className="h-3.5 w-3.5 mr-1" />
              <span>{t.confirm}</span>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ImageCropDialog;
