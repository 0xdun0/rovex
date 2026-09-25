'use client';
/* eslint-disable @next/next/no-img-element */

import React, { useState, useCallback, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import {
  Upload,
  Link as LinkIcon,
  GalleryHorizontal,
  Crosshair,
  Check,
  Trash2,
  FileText,
  RotateCcw,
} from '@/components/icons';
import { useLanguage } from '@/context/language-context';
import { useData } from '@/context/data-context';
import type { ImageAsset } from '@/lib/types';
import { compressImageDataUrl } from '@/lib/image-compress';
import { cn } from '@/lib/utils';

export const ImageUploadDialog = ({
  onInsert,
  children,
}: {
  onInsert: (markdown: string) => void;
  children: React.ReactNode;
}) => {
  const { currentLocale } = useLanguage();
  const { images, addImage } = useData();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [url, setUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isPt = currentLocale === 'pt-br';
  const isEs = currentLocale === 'es';

  const t = {
    title: isPt ? 'Anexo de Evidência & PoC' : isEs ? 'Adjuntar Evidencia & PoC' : 'Attach Evidence & PoC',
    subtitle: isPt
      ? 'Anexe capturas de tela do exploit, respostas HTTP ou diagramas de vulnerabilidade para o achado'
      : isEs
      ? 'Adjunta capturas del exploit, respuestas HTTP o diagramas de vulnerabilidad para el hallazgo'
      : 'Upload exploit screenshots, HTTP responses, or vulnerability diagrams for this finding',
    uploadTab: isPt ? 'Evidência Local' : isEs ? 'Evidencia Local' : 'Local Evidence',
    embedTab: isPt ? 'URL / Imagem Remota' : isEs ? 'Enlace Remoto' : 'Remote URL',
    galleryTab: isPt ? 'Evidências do Projeto' : isEs ? 'Evidencias del Proyecto' : 'Project Gallery',
    clickToUpload: isPt ? 'Clique para anexar evidência' : isEs ? 'Haz clic para adjuntar' : 'Click to attach evidence',
    orDragDrop: isPt ? 'ou arraste o screenshot aqui' : isEs ? 'o arrastra la captura aquí' : 'or drag screenshot here',
    formatHint: 'PNG, JPG, WebP, SVG ou GIF (Capturas de tela e PoC até 10MB)',
    uploading: isPt ? 'Otimizando e comprimindo evidência para o relatório... aguarde.' : isEs ? 'Optimizando evidencia para el reporte... espera.' : 'Optimizing and compressing evidence for report...',
    uploadComplete: isPt ? 'Evidência validada. Pronta para inclusão no achado.' : isEs ? 'Evidencia validada. Lista para incluir.' : 'Evidence verified. Ready to insert in finding.',
    tryAgain: isPt ? 'Substituir captura' : isEs ? 'Reemplazar captura' : 'Replace screenshot',
    cancel: isPt ? 'Cancelar' : isEs ? 'Cancelar' : 'Cancel',
    continueBtn: isPt ? 'Inserir no Achado' : isEs ? 'Insertar en Hallazgo' : 'Insert into Finding',
    imageUrlLabel: isPt ? 'URL da Evidência Externa' : isEs ? 'URL de la Evidencia' : 'External Evidence URL',
    noRecent: isPt ? 'Nenhuma evidência recente registrada no projeto.' : isEs ? 'No hay evidencias recientes en el proyecto.' : 'No recent evidence registered in this project.',
  };

  const handleFileChange = useCallback(async (selectedFile: File | null) => {
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setFile(selectedFile);
      setIsProcessing(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const raw = reader.result as string;
          const compressed = await compressImageDataUrl(raw);
          setPreviewUrl(compressed);
        } catch {
          setPreviewUrl(reader.result as string);
        } finally {
          setIsProcessing(false);
        }
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setFile(null);
      setPreviewUrl(null);
      setIsProcessing(false);
    }
  }, []);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const resetAndClose = () => {
    setOpen(false);
    setFile(null);
    setPreviewUrl(null);
    setUrl('');
    setIsProcessing(false);
  };

  const handleInsert = () => {
    let markdown = '';
    if (activeTab === 'upload' && previewUrl) {
      const newImage = addImage(previewUrl);
      markdown = `![${file?.name || 'Evidence Image'}](image://${newImage.id})`;
    } else if (activeTab === 'embed' && url) {
      markdown = `![Evidence Image](${url})`;
    }

    if (markdown) {
      onInsert(markdown);
    }

    resetAndClose();
  };

  const handleGalleryInsert = (image: ImageAsset) => {
    const markdown = `![Image from Gallery](image://${image.id})`;
    onInsert(markdown);
    resetAndClose();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[560px] rounded-2xl bg-card border-border/80 shadow-2xl p-6 space-y-4">
        {/* Header Clean Minimalista com Ícone Informativo */}
        <DialogHeader className="flex flex-row items-start gap-3 space-y-0 text-left">
          <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5">
            <Crosshair className="h-5 w-5" />
          </div>
          <div className="space-y-0.5 min-w-0 flex-1">
            <DialogTitle className="text-base font-semibold text-foreground font-headline">
              {t.title}
            </DialogTitle>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t.subtitle}
            </p>
          </div>
        </DialogHeader>

        {/* Tabs de Seleção de Origem */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-9 p-1 rounded-xl bg-muted/50 border border-border/60">
            <TabsTrigger value="upload" className="text-xs rounded-lg font-medium gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-xs">
              <Upload className="w-3.5 h-3.5" />
              {t.uploadTab}
            </TabsTrigger>
            <TabsTrigger value="embed" className="text-xs rounded-lg font-medium gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-xs">
              <LinkIcon className="w-3.5 h-3.5" />
              {t.embedTab}
            </TabsTrigger>
            <TabsTrigger value="gallery" className="text-xs rounded-lg font-medium gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-xs">
              <GalleryHorizontal className="w-3.5 h-3.5" />
              {t.galleryTab}
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: UPLOAD COM DROPZONE E LISTAGEM DE ARQUIVO */}
          <TabsContent value="upload" className="mt-4 space-y-4">
            <input
              id="dropzone-file"
              type="file"
              className="hidden"
              accept="image/*"
              ref={fileInputRef}
              onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)}
            />

            {/* Dropzone Estilo Imagem 1 */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={cn(
                'group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/80 bg-muted/15 p-8 text-center cursor-pointer transition-all duration-200 hover:border-primary/60 hover:bg-muted/30',
                isDragging && 'border-primary bg-primary/5 ring-4 ring-primary/10'
              )}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border/70 bg-card shadow-xs text-muted-foreground transition-colors group-hover:border-primary/40 group-hover:text-primary">
                <Upload className="h-5 w-5" />
              </div>
              <p className="mt-3.5 text-xs text-muted-foreground">
                <span className="font-semibold text-primary underline underline-offset-2">
                  {t.clickToUpload}
                </span>{' '}
                {t.orDragDrop}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground/80 font-mono">
                {t.formatHint}
              </p>
            </div>

            {/* Card de Arquivo Carregado (Fiel à imagem de referência) */}
            {file && (
              <div className="rounded-xl border border-border/70 bg-card/70 p-3.5 space-y-2.5 shadow-xs animate-in fade-in duration-200">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/60 bg-muted/50 p-1">
                      {previewUrl ? (
                        <img src={previewUrl} alt="" className="h-full w-full object-contain" />
                      ) : (
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {file.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {isProcessing ? (
                          <span className="text-primary font-medium">{t.uploading}</span>
                        ) : (
                          <span className="text-emerald-500 font-medium flex items-center gap-1">
                            <Check className="h-3 w-3" />
                            {t.uploadComplete}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[10px] font-mono text-muted-foreground mr-1">
                      {formatFileSize(file.size)}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                      onClick={() => fileInputRef.current?.click()}
                      title={t.tryAgain}
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => {
                        setFile(null);
                        setPreviewUrl(null);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Barra de Progresso Sutil */}
                <div className="w-full bg-muted/60 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full transition-all duration-300 rounded-full',
                      isProcessing ? 'bg-primary animate-pulse w-2/3' : 'bg-emerald-500 w-full'
                    )}
                  />
                </div>
              </div>
            )}
          </TabsContent>

          {/* TAB 2: EMBED POR LINK */}
          <TabsContent value="embed" className="mt-4 space-y-4">
            <div className="space-y-2">
              <label htmlFor="image-url" className="text-xs font-medium text-foreground">
                {t.imageUrlLabel}
              </label>
              <Input
                id="image-url"
                type="url"
                placeholder="https://example.com/evidence-screenshot.png"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="h-9 text-xs rounded-xl"
              />
            </div>
            {url && (
              <div className="flex justify-center p-3 border border-border/70 rounded-xl bg-muted/20">
                <img
                  src={url}
                  alt="URL Preview"
                  className="max-h-56 w-auto rounded-lg object-contain shadow-xs"
                />
              </div>
            )}
          </TabsContent>

          {/* TAB 3: GALERIA DO PROJETO */}
          <TabsContent value="gallery" className="mt-4">
            {images.length > 0 ? (
              <div className="grid grid-cols-4 gap-3 max-h-72 overflow-y-auto p-1">
                {images.map((image: ImageAsset) => (
                  <div
                    key={image.id}
                    className="relative aspect-square cursor-pointer group rounded-xl overflow-hidden border border-border/70 hover:border-primary/60 transition-all shadow-xs"
                    onClick={() => handleGalleryInsert(image)}
                  >
                    <img
                      src={image.dataUrl}
                      alt="Gallery evidence"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white text-xs font-semibold">{t.continueBtn}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-10">
                {t.noRecent}
              </p>
            )}
          </TabsContent>
        </Tabs>

        {/* Footer com Cancelar e Continuar */}
        <DialogFooter className="border-t border-border/60 pt-3 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={resetAndClose}
            className="h-9 px-4 rounded-xl text-xs"
          >
            {t.cancel}
          </Button>
          {(activeTab === 'upload' || activeTab === 'embed') && (
            <Button
              type="button"
              onClick={handleInsert}
              disabled={(!previewUrl && activeTab === 'upload') || (!url && activeTab === 'embed') || isProcessing}
              className="h-9 px-5 rounded-xl text-xs bg-primary text-primary-foreground font-semibold shadow-xs"
            >
              {t.continueBtn}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImageUploadDialog;
