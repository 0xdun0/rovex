'use client';

import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useData } from '@/context/data-context';
import { useLanguage } from '@/context/language-context';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Plus,
  Upload,
  Copy,
  Trash2,
  Edit,
  FileDown,
  Search,
  CheckCircle,
  Eye,
  Sliders,
  Palette,
  Sun,
  Moon,
  Save,
  RotateCcw,
  Sparkles,
  Layers,
  Settings,
} from '@/components/icons';
import { ColorPickerPopover } from '@/components/theme-studio/color-picker-popover';
import { ThemeWireframeCard } from '@/components/theme-studio/wireframe-card';
import { LiveAuditTable } from '@/components/theme-studio/live-audit-table';
import { ThemeConfigDialog } from '@/components/theme-studio/theme-config-dialog';
import { ThemePreview } from '@/components/theme-preview';
import { CURATED_FONTS } from '@/lib/report-fonts';
import { hslChannelsToHex, hexToHslChannels } from '@/lib/color-utils';
import {
  BUILTIN_THEMES,
  isBuiltinThemeId,
  cloneTheme,
  type ReportTheme,
  type ReportThemeColors,
} from '@/lib/report-themes';

const T = {
  en: {
    studioTitle: 'Theme Studio',
    studioSubtitle: 'Executive visual identity system for deliverables, audit tables, and exported reports.',
    tabThemes: 'Themes',
    tabCustomize: 'Customize',
    searchThemes: 'Search themes...',
    predefinedThemes: 'Predefined Themes',
    customThemes: 'Custom Themes',
    newTheme: 'New Theme',
    importJson: 'Import JSON',
    exportJson: 'Export JSON',
    applyTheme: 'Apply to Workspace',
    activeBadge: 'Active',
    duplicate: 'Duplicate',
    editTheme: 'Customize',
    deleteTheme: 'Delete',
    themeName: 'Theme Name',
    author: 'Author / Organization',
    description: 'Description',
    themeMode: 'Theme Mode',
    modeLight: 'Light only',
    modeDark: 'Dark only',
    modeBoth: 'Dual mode (System)',
    generalTable: 'General Table',
    borderColor: 'Border color',
    cornerRadius: 'Corner radius',
    fontFamily: 'Font family',
    fontSize: 'Font size',
    emptyStatePlaceholder: 'Empty state placeholder',
    header: 'Header',
    headerBg: 'Background color',
    headerText: 'Text color',
    headerWeight: 'Font weight',
    verticalPadding: 'Vertical padding',
    severities: 'Severity & Status Palette',
    coverHero: 'Cover & Hero Design',
    saveChanges: 'Save Changes',
    saveAsNew: 'Save as New Theme',
    discardChanges: 'Discard',
    activePreview: 'Live Deliverable Canvas',
    viewTable: 'Audit Table',
    viewCover: 'Report Cover',
    viewFullDoc: 'Full Document',
    previewModeLight: 'Light',
    previewModeDark: 'Dark',
    containerMode: 'Container',
    themeConfig: 'Theme Configuration',
    confirmDeleteTitle: 'Delete custom theme?',
    confirmDeleteDesc: 'This action cannot be undone. Reports using this theme will automatically fallback to default.',
    cancel: 'Cancel',
    appliedToast: 'Theme applied as workspace default.',
    savedToast: 'Theme settings successfully saved.',
    duplicatedToast: 'Theme cloned to custom studio.',
    deletedToast: 'Theme removed from workspace.',
    importedToast: 'Theme successfully imported.',
    invalidFileToast: 'Invalid theme file format.',
  },
  'pt-br': {
    studioTitle: 'Theme Studio',
    studioSubtitle: 'Sistema de identidade visual executiva para entregáveis, tabelas de auditoria e relatórios.',
    tabThemes: 'Temas',
    tabCustomize: 'Personalizar',
    searchThemes: 'Buscar temas...',
    predefinedThemes: 'Temas Pré-definidos',
    customThemes: 'Temas Customizados',
    newTheme: 'Novo Tema',
    importJson: 'Importar JSON',
    exportJson: 'Exportar JSON',
    applyTheme: 'Definir como Ativo',
    activeBadge: 'Ativo',
    duplicate: 'Duplicar',
    editTheme: 'Personalizar',
    deleteTheme: 'Excluir',
    themeName: 'Nome do Tema',
    author: 'Autor / Organização',
    description: 'Descrição',
    themeMode: 'Modo do Tema',
    modeLight: 'Apenas Claro',
    modeDark: 'Apenas Escuro',
    modeBoth: 'Modo Duplo (Sistema)',
    generalTable: 'Tabela Geral',
    borderColor: 'Cor da borda',
    cornerRadius: 'Raio do canto',
    fontFamily: 'Família tipográfica',
    fontSize: 'Tamanho da fonte',
    emptyStatePlaceholder: 'Espaço reservado (Empty state)',
    header: 'Cabeçalho',
    headerBg: 'Cor de fundo',
    headerText: 'Cor do texto',
    headerWeight: 'Peso da fonte',
    verticalPadding: 'Padding vertical',
    severities: 'Paleta de Severidades',
    coverHero: 'Capa & Design do Relatório',
    saveChanges: 'Salvar Alterações',
    saveAsNew: 'Salvar como Novo Tema',
    discardChanges: 'Descartar',
    activePreview: 'Canvas Interativo do Entregável',
    viewTable: 'Tabela de Auditoria',
    viewCover: 'Capa do Relatório',
    viewFullDoc: 'Documento Completo',
    previewModeLight: 'Claro',
    previewModeDark: 'Escuro',
    containerMode: 'Container',
    themeConfig: 'Configuração do Tema',
    confirmDeleteTitle: 'Excluir tema customizado?',
    confirmDeleteDesc: 'Esta ação não pode ser desfeita. Os relatórios vinculados voltarão ao padrão executivo.',
    cancel: 'Cancelar',
    appliedToast: 'Tema definido como padrão ativo.',
    savedToast: 'Configurações do tema salvas com sucesso.',
    duplicatedToast: 'Tema clonado para sua galeria.',
    deletedToast: 'Tema excluído da galeria.',
    importedToast: 'Tema importado com sucesso.',
    invalidFileToast: 'Arquivo de tema inválido.',
  },
  es: {
    studioTitle: 'Theme Studio',
    studioSubtitle: 'Sistema de identidad visual ejecutiva para entregables, tablas de auditoría e informes.',
    tabThemes: 'Temas',
    tabCustomize: 'Personalizar',
    searchThemes: 'Buscar temas...',
    predefinedThemes: 'Temas Predefinidos',
    customThemes: 'Temas Personalizados',
    newTheme: 'Nuevo Tema',
    importJson: 'Importar JSON',
    exportJson: 'Exportar JSON',
    applyTheme: 'Establecer como Activo',
    activeBadge: 'Activo',
    duplicate: 'Duplicar',
    editTheme: 'Personalizar',
    deleteTheme: 'Eliminar',
    themeName: 'Nombre del Tema',
    author: 'Autor / Organización',
    description: 'Descripción',
    themeMode: 'Modo del Tema',
    modeLight: 'Solo Claro',
    modeDark: 'Solo Oscuro',
    modeBoth: 'Modo Dual (Sistema)',
    generalTable: 'Tabla General',
    borderColor: 'Color de borde',
    cornerRadius: 'Radio de esquina',
    fontFamily: 'Familia tipográfica',
    fontSize: 'Tamaño de fuente',
    emptyStatePlaceholder: 'Estado vacío (Empty state)',
    header: 'Encabezado',
    headerBg: 'Color de fondo',
    headerText: 'Color de texto',
    headerWeight: 'Peso de fuente',
    verticalPadding: 'Relleno vertical',
    severities: 'Paleta de Severidades',
    coverHero: 'Portada y Diseño',
    saveChanges: 'Guardar Cambios',
    saveAsNew: 'Guardar como Nuevo Tema',
    discardChanges: 'Descartar',
    activePreview: 'Canvas Interactivo del Entregable',
    viewTable: 'Tabla de Auditoría',
    viewCover: 'Portada del Reporte',
    viewFullDoc: 'Documento Completo',
    previewModeLight: 'Claro',
    previewModeDark: 'Oscuro',
    containerMode: 'Contenedor',
    themeConfig: 'Configuración del Tema',
    confirmDeleteTitle: '¿Eliminar tema personalizado?',
    confirmDeleteDesc: 'Esta acción no se puede deshacer. Los reportes usarán el tema por defecto.',
    cancel: 'Cancelar',
    appliedToast: 'Tema establecido como activo.',
    savedToast: 'Ajustes del tema guardados con éxito.',
    duplicatedToast: 'Tema duplicado en la galería.',
    deletedToast: 'Tema eliminado de la galería.',
    importedToast: 'Tema importado con éxito.',
    invalidFileToast: 'Archivo de tema no válido.',
  },
} as const;

// exporta o tema para arquivo json local
function exportThemeFile(theme: ReportTheme) {
  const payload = JSON.stringify({ version: 1, kind: 'rovex-report-theme', theme }, null, 2);
  const blob = new Blob([payload], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${theme.name.replace(/\s+/g, '-').toLowerCase()}.rovextheme.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// tela principal do theme studio com split de controles e preview interativo
export default function ThemeStudioPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentLocale } = useLanguage();
  const { toast } = useToast();
  const t =
    (T as unknown as Record<string, typeof T.en>)[currentLocale] ||
    (currentLocale === 'pt-br' ? T['pt-br'] : currentLocale === 'es' ? T.es : T.en);

  const {
    getAllThemes,
    activeThemeId,
    setActiveThemeId,
    addTheme,
    updateTheme,
    deleteTheme,
    duplicateTheme,
  } = useData();

  // abas do painel lateral: galeria de temas ou customizacao direta
  const [activeTab, setActiveTab] = useState<'themes' | 'customize'>('themes');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedThemeId, setSelectedThemeId] = useState<string>(activeThemeId || BUILTIN_THEMES[0].id);

  // rascunho de trabalho para refletir as mudancas no canvas na hora
  const allThemes = getAllThemes();
  const initialTheme = allThemes.find((th) => th.id === selectedThemeId) || BUILTIN_THEMES[0];
  const [draft, setDraft] = useState<ReportTheme>(() => cloneTheme(initialTheme));
  const [isDirty, setIsDirty] = useState(false);

  // controles visuais do canvas da direita
  const [canvasView, setCanvasView] = useState<'table' | 'cover' | 'full'>('table');
  const [simulationMode, setSimulationMode] = useState<'light' | 'dark'>('dark');
  const [containerMode, setContainerMode] = useState<'default' | 'fluid' | 'fixed'>('default');
  const [layoutStyle, setLayoutStyle] = useState<'sidebar' | 'topbar'>('sidebar');
  const [iconStyle, setIconStyle] = useState<'filled' | 'outline' | 'dual'>('filled');

  // modais auxiliares
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [toDelete, setToDelete] = useState<ReportTheme | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // abre direto na edicao se veio com parametro ?edit na url
  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId) {
      const match = allThemes.find((th) => th.id === editId);
      if (match) {
        setSelectedThemeId(match.id);
        setDraft(cloneTheme(match));
        setActiveTab('customize');
      }
    }
  }, [searchParams]);

  // seleciona tema na galeria e atualiza o preview
  const handleSelectTheme = (theme: ReportTheme) => {
    setSelectedThemeId(theme.id);
    setDraft(cloneTheme(theme));
    setIsDirty(false);
  };

  // abre o tema diretamente na aba de personalizacao
  const handleEditTheme = (theme: ReportTheme) => {
    setSelectedThemeId(theme.id);
    setDraft(cloneTheme(theme));
    setIsDirty(false);
    setActiveTab('customize');
  };

  // aplica o tema como padrao para os relatorios do workspace
  const handleApplyTheme = (theme: ReportTheme) => {
    setActiveThemeId(theme.id);
    toast({ title: t.appliedToast, description: theme.name });
  };

  // cria uma copia customizada do tema
  const handleDuplicateTheme = (theme: ReportTheme) => {
    const copy = duplicateTheme(theme.id);
    if (copy) {
      toast({ title: t.duplicatedToast, description: copy.name });
      setSelectedThemeId(copy.id);
      setDraft(cloneTheme(copy));
      setActiveTab('customize');
    }
  };

  // remove tema customizado e restaura o tema padrao
  const handleDeleteTheme = (theme: ReportTheme) => {
    deleteTheme(theme.id);
    toast({ title: t.deletedToast, description: theme.name });
    setToDelete(null);
    const remaining = getAllThemes().filter((th) => th.id !== theme.id);
    const fallback = remaining[0] || BUILTIN_THEMES[0];
    setSelectedThemeId(fallback.id);
    setDraft(cloneTheme(fallback));
  };

  // cria um tema novo do zero baseado no template executivo
  const handleCreateNewTheme = () => {
    const base = BUILTIN_THEMES[0];
    const next = cloneTheme(base);
    next.id = `custom-${Date.now()}`;
    next.name = currentLocale === 'es' ? 'Nuevo tema' : currentLocale === 'pt-br' ? 'Novo tema' : 'New theme';
    next.description = 'Identidade personalizada para auditorias executivas.';
    next.author = 'Auditor';
    const saved = addTheme(next);
    setSelectedThemeId(saved.id);
    setDraft(cloneTheme(saved));
    setIsDirty(false);
    setActiveTab('customize');
    toast({ title: t.newTheme, description: saved.name });
  };

  const handleSaveDraft = () => {
    if (isBuiltinThemeId(draft.id)) {
      // Create duplicate custom theme
      const next = cloneTheme(draft);
      next.id = `custom-${Date.now()}`;
      next.name = `${draft.name} (Custom)`;
      const saved = addTheme(next);
      setSelectedThemeId(saved.id);
      setDraft(cloneTheme(saved));
      setIsDirty(false);
      toast({ title: t.saveAsNew, description: saved.name });
    } else {
      updateTheme(draft);
      setIsDirty(false);
      toast({ title: t.savedToast, description: draft.name });
    }
  };

  const handleDiscardChanges = () => {
    const fresh = allThemes.find((th) => th.id === selectedThemeId) || BUILTIN_THEMES[0];
    setDraft(cloneTheme(fresh));
    setIsDirty(false);
  };

  const handleImportJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!parsed || parsed.kind !== 'rovex-report-theme' || !parsed.theme) {
        throw new Error('Invalid format');
      }
      const incoming = parsed.theme as ReportTheme;
      const existing = allThemes.some((th) => th.id === incoming.id);
      const safe: ReportTheme = {
        ...cloneTheme(incoming),
        id: existing ? `custom-${Date.now()}` : incoming.id,
      };
      const saved = addTheme(safe);
      setSelectedThemeId(saved.id);
      setDraft(cloneTheme(saved));
      toast({ title: t.importedToast, description: saved.name });
    } catch {
      toast({ variant: 'destructive', title: t.invalidFileToast });
    }
  };

  // Updaters for draft state
  const patchColor = (mode: 'light' | 'dark', key: keyof ReportThemeColors, val: string) => {
    setDraft((prev) => ({
      ...prev,
      [mode]: {
        ...prev[mode],
        [key]: val,
      },
    }));
    setIsDirty(true);
  };

  const patchBothColors = (key: keyof ReportThemeColors, val: string) => {
    setDraft((prev) => ({
      ...prev,
      light: { ...prev.light, [key]: val },
      dark: { ...prev.dark, [key]: val },
    }));
    setIsDirty(true);
  };

  // Filtered themes list
  const filteredThemes = useMemo(() => {
    if (!searchQuery) return allThemes;
    const q = searchQuery.toLowerCase();
    return allThemes.filter(
      (th) => th.name.toLowerCase().includes(q) || (th.description || '').toLowerCase().includes(q)
    );
  }, [allThemes, searchQuery]);

  const builtinList = filteredThemes.filter((th) => isBuiltinThemeId(th.id));
  const customList = filteredThemes.filter((th) => !isBuiltinThemeId(th.id));

  // Current draft page colors for swatch palette
  const activePageColors = useMemo(() => {
    const mode = simulationMode === 'dark' ? draft.dark : draft.light;
    return [
      hslChannelsToHex(mode.primary),
      hslChannelsToHex(mode.border),
      hslChannelsToHex(mode.background),
      hslChannelsToHex(mode.card),
      hslChannelsToHex(mode.severityCritical),
      hslChannelsToHex(mode.severityHigh),
      hslChannelsToHex(mode.severityMedium),
      hslChannelsToHex(mode.severityLow),
      hslChannelsToHex(mode.brand),
    ];
  }, [draft, simulationMode]);

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 max-w-[1720px] mx-auto space-y-5">
      {/* Executive Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-headline text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Palette className="h-6 w-6 text-primary" />
              {t.studioTitle}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-primary/10 text-primary border border-primary/20">
              v2.0
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 max-w-2xl leading-relaxed">
            {t.studioSubtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Theme Configuration Modal button (Reference Image 1) */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfigModalOpen(true)}
            className="h-9 px-3 rounded-lg text-xs font-medium border-border/70 hover:bg-muted/40"
          >
            <Settings className="h-3.5 w-3.5 mr-1.5 text-primary" />
            {t.themeConfig}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="h-9 px-3 rounded-lg text-xs font-medium border-border/70 hover:bg-muted/40"
          >
            <Upload className="h-3.5 w-3.5 mr-1.5" />
            {t.importJson}
          </Button>

          <Button
            size="sm"
            onClick={handleCreateNewTheme}
            className="h-9 px-3.5 rounded-lg text-xs font-semibold shadow-xs"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            {t.newTheme}
          </Button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json,.rovextheme.json,.vftheme.json"
        className="hidden"
        onChange={handleImportJson}
      />

      {/* Main Studio 2-Column Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[440px_1fr] gap-6 items-start">
        {/* LEFT PANE: Studio Dock (Themes vs Customize) */}
        <div className="rounded-2xl border border-border/70 bg-card/70 backdrop-blur-md shadow-sm overflow-hidden flex flex-col">
          {/* Dock Tabs Header matching Reference Images 2 & 3 */}
          <div className="flex items-center justify-between border-b border-border/60 bg-muted/20 px-3 py-2.5">
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-background/80 border border-border/60 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setActiveTab('themes')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'themes'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                {t.tabThemes}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('customize')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'customize'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Edit className="h-3.5 w-3.5" />
                {t.tabCustomize}
                {isDirty && (
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                )}
              </button>
            </div>

            <span className="text-[11px] font-mono text-muted-foreground hidden sm:inline">
              {draft.name}
            </span>
          </div>

          {/* DOCK CONTENT: TAB 1 (THEMES GALLERY) */}
          {activeTab === 'themes' && (
            <div className="p-4 space-y-5 max-h-[calc(100vh-14rem)] overflow-y-auto">
              {/* Search input */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchThemes}
                  className="pl-8 h-9 text-xs bg-background/80 rounded-lg border-border/70"
                />
              </div>

              {/* Predefined Themes Section (Image 3) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {t.predefinedThemes}
                  </h3>
                  <span className="text-[11px] font-mono text-muted-foreground">
                    {builtinList.length}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {builtinList.map((th) => {
                    const isActive = th.id === activeThemeId;
                    const isSelected = th.id === selectedThemeId;

                    return (
                      <div key={th.id} className="relative group">
                        <ThemeWireframeCard
                          theme={th}
                          title={th.name}
                          subtitle={th.author}
                          isActive={isActive}
                          isSelected={isSelected}
                          type={th.modes === 'both' ? 'dual' : th.modes === 'light' ? 'light' : 'dark'}
                          onClick={() => handleSelectTheme(th)}
                        />
                        <div className="mt-2 flex items-center justify-between gap-1.5 px-1">
                          <Button
                            size="sm"
                            variant={isActive ? 'secondary' : 'outline'}
                            onClick={() => handleApplyTheme(th)}
                            className="h-7 text-[11px] px-2.5 rounded-md flex-1 font-medium"
                          >
                            {isActive ? t.activeBadge : t.applyTheme}
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEditTheme(th)}
                            title={t.editTheme}
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          >
                            <Sliders className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDuplicateTheme(th)}
                            title={t.duplicate}
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => exportThemeFile(th)}
                            title={t.exportJson}
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          >
                            <FileDown className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Custom Themes Section */}
              <div className="space-y-3 pt-3 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {t.customThemes}
                  </h3>
                  <span className="text-[11px] font-mono text-muted-foreground">
                    {customList.length}
                  </span>
                </div>

                {customList.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border/70 p-4 text-center">
                    <p className="text-xs text-muted-foreground">
                      Nenhum tema personalizado criado ainda.
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCreateNewTheme}
                      className="mt-2 h-7 text-xs rounded-md"
                    >
                      <Plus className="h-3 w-3 mr-1" /> Criar Primeiro Tema
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {customList.map((th) => {
                      const isActive = th.id === activeThemeId;
                      const isSelected = th.id === selectedThemeId;

                      return (
                        <div key={th.id} className="relative group">
                          <ThemeWireframeCard
                            theme={th}
                            title={th.name}
                            subtitle={th.author || 'Custom'}
                            isActive={isActive}
                            isSelected={isSelected}
                            type={th.modes === 'both' ? 'dual' : th.modes === 'light' ? 'light' : 'dark'}
                            onClick={() => handleSelectTheme(th)}
                          />
                          <div className="mt-2 flex items-center justify-between gap-1.5 px-1">
                            <Button
                              size="sm"
                              variant={isActive ? 'secondary' : 'outline'}
                              onClick={() => handleApplyTheme(th)}
                              className="h-7 text-[11px] px-2.5 rounded-md flex-1 font-medium"
                            >
                              {isActive ? t.activeBadge : t.applyTheme}
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleEditTheme(th)}
                              title={t.editTheme}
                              className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            >
                              <Sliders className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDuplicateTheme(th)}
                              title={t.duplicate}
                              className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => exportThemeFile(th)}
                              title={t.exportJson}
                              className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            >
                              <FileDown className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setToDelete(th)}
                              title={t.deleteTheme}
                              className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* DOCK CONTENT: TAB 2 (CUSTOMIZE CONTROLS - Exact match for Images 2 & 3) */}
          {activeTab === 'customize' && (
            <div className="p-4 space-y-6 max-h-[calc(100vh-14rem)] overflow-y-auto">
              {/* Theme Name & Author */}
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">
                    {t.themeName}
                  </Label>
                  <Input
                    value={draft.name}
                    onChange={(e) => {
                      setDraft({ ...draft, name: e.target.value });
                      setIsDirty(true);
                    }}
                    placeholder="Ex: Teal, Cyber Dark..."
                    className="h-9 text-xs bg-background/80 rounded-lg border-border/70 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">{t.author}</Label>
                    <Input
                      value={draft.author || ''}
                      onChange={(e) => {
                        setDraft({ ...draft, author: e.target.value });
                        setIsDirty(true);
                      }}
                      className="h-8 text-xs bg-background/80 rounded-md border-border/70"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">{t.themeMode}</Label>
                    <Select
                      value={draft.modes}
                      onValueChange={(val: any) => {
                        setDraft({ ...draft, modes: val });
                        setIsDirty(true);
                      }}
                    >
                      <SelectTrigger className="h-8 text-xs bg-background/80 rounded-md border-border/70">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="both">{t.modeBoth}</SelectItem>
                        <SelectItem value="dark">{t.modeDark}</SelectItem>
                        <SelectItem value="light">{t.modeLight}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* GENERAL TABLE SECTION (matching Image 2 & 3) */}
              <div className="space-y-3 pt-3 border-t border-border/60">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                  <span>{t.generalTable}</span>
                  <span className="text-[10px] font-mono text-primary font-normal">Table UI</span>
                </h4>

                {/* Border color */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">{t.borderColor}</Label>
                  <ColorPickerPopover
                    label="Table border color"
                    value={simulationMode === 'dark' ? draft.dark.border : draft.light.border}
                    onChange={(hsl) => patchColor(simulationMode, 'border', hsl)}
                    pageColors={activePageColors}
                  />
                </div>

                {/* Corner radius */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      <span className="font-mono text-sm leading-none">╭─</span> {t.cornerRadius}
                    </Label>
                    <span className="font-mono text-[11px] text-primary font-semibold">
                      {draft.shape.radius}px
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[0, 4, 8, 12, 16].map((rad) => (
                      <button
                        key={rad}
                        type="button"
                        onClick={() => {
                          setDraft((prev) => ({
                            ...prev,
                            shape: { ...prev.shape, radius: rad },
                          }));
                          setIsDirty(true);
                        }}
                        className={`h-8 rounded-lg border text-xs font-mono font-medium transition-all ${
                          draft.shape.radius === rad
                            ? 'border-primary bg-primary/10 text-primary font-bold'
                            : 'border-border/70 hover:bg-muted/40 text-muted-foreground'
                        }`}
                      >
                        {rad}px
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font family & Font size */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">{t.fontFamily}</Label>
                    <Select
                      value={draft.typography.familyBody}
                      onValueChange={(val) => {
                        setDraft((prev) => ({
                          ...prev,
                          typography: { ...prev.typography, familyBody: val },
                        }));
                        setIsDirty(true);
                      }}
                    >
                      <SelectTrigger className="h-9 text-xs bg-background/80 rounded-lg border-border/70">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CURATED_FONTS.slice(0, 10).map((f) => (
                          <SelectItem key={f.family} value={f.family}>
                            {f.family}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">{t.fontSize}</Label>
                    <Select
                      value={String(draft.typography.baseSize)}
                      onValueChange={(val) => {
                        setDraft((prev) => ({
                          ...prev,
                          typography: { ...prev.typography, baseSize: Number(val) },
                        }));
                        setIsDirty(true);
                      }}
                    >
                      <SelectTrigger className="h-9 text-xs bg-background/80 rounded-lg border-border/70">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[12, 13, 14, 15, 16].map((sz) => (
                          <SelectItem key={sz} value={String(sz)}>
                            {sz}px
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Empty state placeholder preview card (Image 2 & 3) */}
                <div className="space-y-1.5 pt-1">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    {t.emptyStatePlaceholder}
                    <span className="text-[10px] text-muted-foreground/80 italic">(info)</span>
                  </Label>
                  <div className="rounded-xl border border-dashed border-border/70 p-3 flex flex-col items-center justify-center bg-muted/20 text-center gap-2">
                    <div className="h-10 w-16 rounded border border-border/60 bg-background/60 flex flex-col p-1 gap-1">
                      <div className="h-1 w-full bg-border rounded" />
                      <div className="grid grid-cols-3 gap-0.5 flex-1">
                        <div className="bg-muted rounded-xs" />
                        <div className="bg-muted rounded-xs" />
                        <div className="bg-muted rounded-xs" />
                      </div>
                    </div>
                    <span className="text-[11px] text-muted-foreground font-medium">
                      Layout do Estado Vazio Ativo
                    </span>
                  </div>
                </div>
              </div>

              {/* HEADER SECTION (matching Image 2 & 3) */}
              <div className="space-y-3 pt-3 border-t border-border/60">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                  <span>{t.header}</span>
                  <span className="text-[10px] font-mono text-primary font-normal">Header UI</span>
                </h4>

                <div className="grid grid-cols-2 gap-2.5">
                  {/* Header Background */}
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">{t.headerBg}</Label>
                    <ColorPickerPopover
                      value={simulationMode === 'dark' ? draft.dark.card : draft.light.card}
                      onChange={(hsl) => patchColor(simulationMode, 'card', hsl)}
                      pageColors={activePageColors}
                    />
                  </div>

                  {/* Header Text Color */}
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">{t.headerText}</Label>
                    <ColorPickerPopover
                      value={simulationMode === 'dark' ? draft.dark.foreground : draft.light.foreground}
                      onChange={(hsl) => patchColor(simulationMode, 'foreground', hsl)}
                      pageColors={activePageColors}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {/* Font weight */}
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">{t.headerWeight}</Label>
                    <Select defaultValue="600">
                      <SelectTrigger className="h-9 text-xs bg-background/80 rounded-lg border-border/70">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="400">Regular (400)</SelectItem>
                        <SelectItem value="500">Medium (500)</SelectItem>
                        <SelectItem value="600">Semi-bold (600)</SelectItem>
                        <SelectItem value="700">Bold (700)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Vertical padding */}
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">{t.verticalPadding}</Label>
                    <Select
                      value={draft.shape.spacing}
                      onValueChange={(val: any) => {
                        setDraft((prev) => ({
                          ...prev,
                          shape: { ...prev.shape, spacing: val },
                        }));
                        setIsDirty(true);
                      }}
                    >
                      <SelectTrigger className="h-9 text-xs bg-background/80 rounded-lg border-border/70">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="compact">Compact (60%)</SelectItem>
                        <SelectItem value="cozy">Medium (100%)</SelectItem>
                        <SelectItem value="roomy">Roomy (140%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* SEVERITY PALETTE */}
              <div className="space-y-3 pt-3 border-t border-border/60">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t.severities}
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <div className="space-y-1">
                    <Label className="text-[11px] text-rose-400 font-semibold">Critical</Label>
                    <ColorPickerPopover
                      value={draft[simulationMode].severityCritical}
                      onChange={(hsl) => patchColor(simulationMode, 'severityCritical', hsl)}
                      pageColors={activePageColors}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-orange-400 font-semibold">High</Label>
                    <ColorPickerPopover
                      value={draft[simulationMode].severityHigh}
                      onChange={(hsl) => patchColor(simulationMode, 'severityHigh', hsl)}
                      pageColors={activePageColors}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-amber-400 font-semibold">Medium</Label>
                    <ColorPickerPopover
                      value={draft[simulationMode].severityMedium}
                      onChange={(hsl) => patchColor(simulationMode, 'severityMedium', hsl)}
                      pageColors={activePageColors}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-sky-400 font-semibold">Low</Label>
                    <ColorPickerPopover
                      value={draft[simulationMode].severityLow}
                      onChange={(hsl) => patchColor(simulationMode, 'severityLow', hsl)}
                      pageColors={activePageColors}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-slate-400 font-semibold">Info</Label>
                    <ColorPickerPopover
                      value={draft[simulationMode].severityInformational}
                      onChange={(hsl) => patchColor(simulationMode, 'severityInformational', hsl)}
                      pageColors={activePageColors}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-primary font-semibold">Primary Accent</Label>
                    <ColorPickerPopover
                      value={draft[simulationMode].primary}
                      onChange={(hsl) => patchColor(simulationMode, 'primary', hsl)}
                      pageColors={activePageColors}
                    />
                  </div>
                </div>
              </div>

              {/* SAVE & ACTION TOOLBAR */}
              <div className="pt-4 border-t border-border/60 flex flex-col gap-2">
                <Button
                  size="sm"
                  onClick={handleSaveDraft}
                  className="h-9 rounded-lg text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs w-full"
                >
                  <Save className="h-3.5 w-3.5 mr-1.5" />
                  {isBuiltinThemeId(draft.id) ? t.saveAsNew : t.saveChanges}
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleApplyTheme(draft)}
                    className="h-8 text-xs font-medium flex-1 rounded-lg border-border/70 hover:bg-muted/40"
                  >
                    <CheckCircle className="h-3.5 w-3.5 mr-1 text-primary" />
                    {t.applyTheme}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => exportThemeFile(draft)}
                    className="h-8 text-xs font-medium rounded-lg border-border/70 hover:bg-muted/40"
                  >
                    <FileDown className="h-3.5 w-3.5 mr-1" />
                    Export
                  </Button>
                  {isDirty && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleDiscardChanges}
                      className="h-8 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <RotateCcw className="h-3.5 w-3.5 mr-1" />
                      {t.discardChanges}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANE: Live Interactive Deliverable Canvas */}
        <div className="rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md shadow-sm overflow-hidden flex flex-col">
          {/* Canvas Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/60 bg-muted/20 p-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                {t.activePreview}:
              </span>
              <Badge variant="outline" className="text-xs font-mono bg-background/80 border-border/70">
                {draft.name}
              </Badge>
              {isDirty && (
                <span className="text-[10px] font-mono text-amber-400 font-semibold px-1.5 py-0.5 rounded bg-amber-400/10 border border-amber-400/20">
                  Unsaved Draft
                </span>
              )}
            </div>

            {/* View Switchers & Simulation Mode Controls */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Deliverable View switcher */}
              <div className="flex items-center gap-1 p-0.5 rounded-lg bg-background/80 border border-border/60 text-xs">
                <button
                  type="button"
                  onClick={() => setCanvasView('table')}
                  className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                    canvasView === 'table'
                      ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t.viewTable}
                </button>
                <button
                  type="button"
                  onClick={() => setCanvasView('cover')}
                  className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                    canvasView === 'cover'
                      ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t.viewCover}
                </button>
                <button
                  type="button"
                  onClick={() => setCanvasView('full')}
                  className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                    canvasView === 'full'
                      ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t.viewFullDoc}
                </button>
              </div>

              {/* Light / Dark Mode Simulation toggle */}
              <div className="flex items-center gap-1 p-0.5 rounded-lg bg-background/80 border border-border/60 text-xs">
                <button
                  type="button"
                  onClick={() => setSimulationMode('light')}
                  className={`p-1.5 rounded-md transition-all ${
                    simulationMode === 'light'
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  title={t.previewModeLight}
                >
                  <Sun className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setSimulationMode('dark')}
                  className={`p-1.5 rounded-md transition-all ${
                    simulationMode === 'dark'
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  title={t.previewModeDark}
                >
                  <Moon className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Canvas Body rendering in real-time */}
          <div className="p-4 sm:p-6 bg-background/40 min-h-[580px] flex items-center justify-center overflow-x-auto">
            {canvasView === 'table' && (
              <LiveAuditTable
                theme={draft}
                mode={simulationMode}
                containerMode={containerMode}
              />
            )}

            {canvasView === 'cover' && (
              <div className="w-full max-w-xl mx-auto rounded-xl overflow-hidden border border-border/60 shadow-lg">
                <ThemePreview theme={draft} mode={simulationMode} variant="mini" />
              </div>
            )}

            {canvasView === 'full' && (
              <div className="w-full max-w-4xl mx-auto rounded-xl overflow-hidden border border-border/60 shadow-xl">
                <ThemePreview theme={draft} mode={simulationMode} variant="full" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Theme Configuration Dialog (Reference Image 1) */}
      <ThemeConfigDialog
        open={configModalOpen}
        onOpenChange={setConfigModalOpen}
        activeMode={simulationMode}
        onModeChange={setSimulationMode}
        containerMode={containerMode}
        onContainerModeChange={setContainerMode}
        layoutStyle={layoutStyle}
        onLayoutStyleChange={setLayoutStyle}
        iconStyle={iconStyle}
        onIconStyleChange={setIconStyle}
        activeTheme={draft}
      />

      {/* Delete Confirmation Alert */}
      <AlertDialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.confirmDeleteTitle}</AlertDialogTitle>
            <AlertDialogDescription>{t.confirmDeleteDesc}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => toDelete && handleDeleteTheme(toDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t.deleteTheme}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
