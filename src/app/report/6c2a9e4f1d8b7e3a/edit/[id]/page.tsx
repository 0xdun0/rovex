'use client';

import React, { useState, useEffect, useCallback, useRef, type SetStateAction } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ChevronLeft,
  Save,
  Plus,
  CheckCircle,
  FileText,
  Sliders,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Layers,
  ShieldCheck,
  List,
} from '@/components/icons';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';
import type { ProjectTemplate } from '@/lib/types';
import { useData } from '@/context/data-context';
import { ProjectIcon, ProjectIconSelectItem, projectIconOptions } from '@/components/project-icon';
import { SectionMarkdownEditor } from '@/components/section-markdown-editor';
import { joinMarkdownSections, splitMarkdownIntoSections } from '@/lib/markdown-utils';
import { stripMarkdownText } from '@/lib/todo-utils';
import { useUndoableState } from '@/hooks/use-undoable-state';

type SaveStatus = 'unsaved' | 'saving' | 'saved';

interface TemplateSection {
  id: string;
  content: string;
}

// extrai o titulo do cabecalho h1-h6 da secao para o indice
const getSectionHeadingTitle = (content: string) => {
  const headingMatch = content.match(/^\s{0,3}#{1,6}\s+(.+)$/m);
  return headingMatch ? stripMarkdownText(headingMatch[1]).toLocaleLowerCase() : '';
};

// separa o escopo geral do apendice na hora de persistir
const splitTemplateSectionsForStorage = (sections: TemplateSection[], appendixTitles: string[]) => {
  const appendixIndex = sections.findIndex((section) =>
    appendixTitles.includes(getSectionHeadingTitle(section.content))
  );
  const scopeSections = appendixIndex >= 0 ? sections.slice(0, appendixIndex) : sections;
  const appendixSections = appendixIndex >= 0 ? sections.slice(appendixIndex) : [];

  return {
    scope: joinMarkdownSections(scopeSections.map((section) => section.content)),
    appendix: joinMarkdownSections(appendixSections.map((section) => section.content)),
  };
};

type SortableSectionProps = {
  section: TemplateSection;
  onContentChange: (content: string) => void;
  onDelete: () => void;
  splitLayout: number[];
  onSplitLayoutChange: (layout: number[]) => void;
  collapsed: boolean;
  onCollapseAll: () => void;
  onCollapsedChange: (sectionId: string, collapsed: boolean) => void;
  dragging?: boolean;
  labels: {
    section: string;
    untitled: string;
    writeContent: string;
    deleteSection: string;
    confirmDeleteTitle: string;
    confirmDeleteDescription: string;
    cancel: string;
    confirmDelete: string;
    expand: string;
    collapse: string;
  };
};

// componente arrastavel para reordenar secoes do layout
const SortableSection = ({ section, ...props }: SortableSectionProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  });

  const style = {
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : 'auto',
  };

  return (
    <div ref={setNodeRef} style={style}>
      <SectionEditor
        section={section}
        dragHandleProps={attributes}
        dragListeners={listeners}
        dragging={isDragging}
        {...props}
      />
    </div>
  );
};

// editor markdown de cada bloco com toolbar e split preview
const SectionEditor = ({
  section,
  onContentChange,
  onDelete,
  dragHandleProps,
  dragListeners,
  splitLayout,
  onSplitLayoutChange,
  collapsed,
  onCollapseAll,
  onCollapsedChange,
  dragging,
  labels,
}: {
  section: TemplateSection;
  onContentChange: (content: string) => void;
  onDelete: () => void;
  dragHandleProps: any;
  dragListeners: any;
  splitLayout: number[];
  onSplitLayoutChange: (layout: number[]) => void;
  collapsed: boolean;
  onCollapseAll: () => void;
  onCollapsedChange: (sectionId: string, collapsed: boolean) => void;
  dragging?: boolean;
  labels: SortableSectionProps['labels'];
}) => {
  return (
    <div className="rounded-xl border border-border/70 bg-card/70 overflow-hidden shadow-xs transition-all hover:border-border">
      <SectionMarkdownEditor
        content={section.content}
        onChange={onContentChange}
        onDelete={onDelete}
        dragHandleProps={dragHandleProps}
        dragListeners={dragListeners}
        dragging={dragging}
        splitLayout={splitLayout}
        onSplitLayoutChange={onSplitLayoutChange}
        collapsed={collapsed}
        onDragHandleClick={onCollapseAll}
        onCollapsedChange={(nextCollapsed) => onCollapsedChange(section.id, nextCollapsed)}
        titleFallback="Nova Seção do Layout"
        labels={{
          section: labels.section,
          untitled: labels.untitled,
          writeContent: labels.writeContent,
          delete: labels.deleteSection,
          confirmDeleteTitle: labels.confirmDeleteTitle,
          confirmDeleteDescription: labels.confirmDeleteDescription,
          cancel: labels.cancel,
          confirmDelete: labels.confirmDelete,
          expand: labels.expand,
          collapse: labels.collapse,
        }}
      />
    </div>
  );
};

// dicionario de termos nos tres idiomas
const T = {
  en: {
    back: 'Back to Layouts',
    save: 'Save Layout',
    saving: 'Saving...',
    saved: 'Saved',
    create: 'Create Layout',
    newTitle: 'New Blueprint Layout',
    editTitle: 'Edit Blueprint Layout',
    newDescription: 'Architect reusable assessment scopes, testing methodologies, and deliverable standards.',
    editDescription: 'Fine-tune structured sections, rules of engagement, and appendix templates.',
    namePt: 'Layout Name (Portuguese)',
    nameEn: 'Layout Name (English)',
    nameEs: 'Layout Name (Spanish)',
    descPt: 'Scope Description (Portuguese)',
    descEn: 'Scope Description (English)',
    descEs: 'Scope Description (Spanish)',
    icon: 'Icon',
    selectIcon: 'Select an icon',
    portugueseContent: 'Portuguese',
    englishContent: 'English',
    spanishContent: 'Spanish',
    newSection: 'New Section',
    addNewSection: 'Add New Section',
    writeContent: 'Write reusable blueprint content...',
    deleteSection: 'Delete section',
    confirmDeleteTitle: 'Delete section?',
    confirmDeleteDescription: 'This section will be removed from the blueprint. You can undo with Ctrl+Z.',
    cancel: 'Cancel',
    confirmDelete: 'Delete',
    expand: 'Expand all',
    collapse: 'Collapse all',
    blueprintSpecs: 'Blueprint Specifications',
    sectionNav: 'Section Index',
    quickPresets: 'Quick Presets',
    rulesPreset: 'Rules of Engagement',
    methodologyPreset: 'Testing Methodology',
    exclusionsPreset: 'Scope Exclusions',
    activeEditingLanguage: 'Editing Language Tab',
  },
  'pt-br': {
    back: 'Voltar aos Layouts',
    save: 'Salvar Layout',
    saving: 'Salvando...',
    saved: 'Salvo',
    create: 'Criar Layout',
    newTitle: 'Novo Layout de Relatório',
    editTitle: 'Editar Layout de Relatório',
    newDescription: 'Desenhe estruturas de escopo reutilizáveis, metodologias de teste e padrões executivos.',
    editDescription: 'Ajuste seções de auditoria, regras de engajamento e apêndices técnicos.',
    namePt: 'Nome do Layout (Português)',
    nameEn: 'Nome do Layout (Inglês)',
    nameEs: 'Nome do Layout (Espanhol)',
    descPt: 'Resumo do Escopo (Português)',
    descEn: 'Resumo do Escopo (Inglês)',
    descEs: 'Resumo do Escopo (Espanhol)',
    icon: 'Ícone',
    selectIcon: 'Selecionar um ícone',
    portugueseContent: 'Português',
    englishContent: 'Inglês',
    spanishContent: 'Espanhol',
    newSection: 'Nova Seção',
    addNewSection: 'Adicionar Nova Seção',
    writeContent: 'Escreva o conteúdo reutilizável do blueprint...',
    deleteSection: 'Excluir seção',
    confirmDeleteTitle: 'Excluir seção?',
    confirmDeleteDescription: 'Esta seção será removida do blueprint. Você pode desfazer com Ctrl+Z.',
    cancel: 'Cancelar',
    confirmDelete: 'Excluir',
    expand: 'Expandir todas',
    collapse: 'Recolher todas',
    blueprintSpecs: 'Especificações do Layout',
    sectionNav: 'Índice de Seções',
    quickPresets: 'Presets Rápidos',
    rulesPreset: 'Regras de Engajamento',
    methodologyPreset: 'Metodologia de Teste',
    exclusionsPreset: 'Exclusões de Escopo',
    activeEditingLanguage: 'Idioma em Edição',
  },
  es: {
    back: 'Volver a Layouts',
    save: 'Guardar Layout',
    saving: 'Guardando...',
    saved: 'Guardado',
    create: 'Crear Layout',
    newTitle: 'Nuevo Layout de Informe',
    editTitle: 'Editar Layout de Informe',
    newDescription: 'Diseña estructuras de alcance reutilizables, metodologías y estándares ejecutivos.',
    editDescription: 'Ajusta secciones de auditoría, reglas de compromiso y apéndices técnicos.',
    namePt: 'Nombre del Layout (Portugués)',
    nameEn: 'Nombre del Layout (Inglés)',
    nameEs: 'Nombre del Layout (Español)',
    descPt: 'Resumen de Alcance (Portugués)',
    descEn: 'Resumen de Alcance (Inglés)',
    descEs: 'Resumen de Alcance (Español)',
    icon: 'Icono',
    selectIcon: 'Seleccionar un icono',
    portugueseContent: 'Portugués',
    englishContent: 'Inglés',
    spanishContent: 'Español',
    newSection: 'Nueva Sección',
    addNewSection: 'Añadir Nueva Sección',
    writeContent: 'Escribe contenido reutilizable para el layout...',
    deleteSection: 'Eliminar sección',
    confirmDeleteTitle: '¿Eliminar sección?',
    confirmDeleteDescription: 'Esta sección se eliminará del blueprint. Puedes deshacer con Ctrl+Z.',
    cancel: 'Cancelar',
    confirmDelete: 'Eliminar',
    expand: 'Expandir todas',
    collapse: 'Colapsar todas',
    blueprintSpecs: 'Especificaciones del Layout',
    sectionNav: 'Índice de Secciones',
    quickPresets: 'Plantillas Rápidas',
    rulesPreset: 'Reglas de Compromiso',
    methodologyPreset: 'Metodología de Prueba',
    exclusionsPreset: 'Exclusiones de Alcance',
    activeEditingLanguage: 'Idioma en Edición',
  },
} as const;

// tela completa do layout studio com split-screen e seletor limpo de idioma
export default function TemplateEditorPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const { toast } = useToast();
  const { currentLocale } = useLanguage();
  const t =
    (T as unknown as Record<string, typeof T.en>)[currentLocale] ||
    (currentLocale === 'pt-br' ? T['pt-br'] : currentLocale === 'es' ? T.es : T.en);

  const { projectTemplates, addProjectTemplate, updateProjectTemplate } = useData();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const [isNew, setIsNew] = useState(id === 'new');
  const [template, setTemplate] = useState<Omit<ProjectTemplate, 'id'> | ProjectTemplate | null>(null);

  // historico de alteracoes com suporte a desfazer/refazer para os 3 idiomas
  const {
    state: sectionState,
    setState: setSectionState,
    resetState: resetSectionState,
    undo: undoSections,
    redo: redoSections,
  } = useUndoableState<{ 'pt-br': TemplateSection[]; en: TemplateSection[]; es: TemplateSection[] }>({
    'pt-br': [],
    en: [],
    es: [],
  });

  const ptSections = sectionState['pt-br'] || [];
  const enSections = sectionState.en || [];
  const esSections = sectionState.es || [];

  const setPtSections = useCallback(
    (action: SetStateAction<TemplateSection[]>) => {
      setSectionState((prev) => ({
        ...prev,
        'pt-br': typeof action === 'function' ? (action as (items: TemplateSection[]) => TemplateSection[])(prev['pt-br'] || []) : action,
      }));
    },
    [setSectionState]
  );

  const setEnSections = useCallback(
    (action: SetStateAction<TemplateSection[]>) => {
      setSectionState((prev) => ({
        ...prev,
        en: typeof action === 'function' ? (action as (items: TemplateSection[]) => TemplateSection[])(prev.en || []) : action,
      }));
    },
    [setSectionState]
  );

  const setEsSections = useCallback(
    (action: SetStateAction<TemplateSection[]>) => {
      setSectionState((prev) => ({
        ...prev,
        es: typeof action === 'function' ? (action as (items: TemplateSection[]) => TemplateSection[])(prev.es || []) : action,
      }));
    },
    [setSectionState]
  );

  // aba de idioma ativo no editor: 'pt-br', 'en' ou 'es' (inicia no idioma da interface)
  const [editingLang, setEditingLang] = useState<'pt-br' | 'en' | 'es'>(
    currentLocale === 'pt-br' ? 'pt-br' : currentLocale === 'es' ? 'es' : 'en'
  );
  const [sectionSplitLayout, setSectionSplitLayout] = useState<number[]>([52, 48]);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const initializedIdRef = useRef<string | null>(null);

  // converte markdown bruto em secoes estruturadas
  const parseContentToSections = useCallback((content: string): TemplateSection[] => {
    if (!content || typeof content !== 'string') return [];
    const parts = splitMarkdownIntoSections(content, { maxHeadingLevel: 2 });
    return parts
      .map((part, index) => ({
        id: `section-${index}-${Date.now()}-${Math.random()}`,
        content: part.trim(),
      }))
      .filter((p) => p.content.trim() !== '');
  }, []);

  // inicializa o template uma unica vez para nao desmontar os editores no autosave
  useEffect(() => {
    const currentId = typeof id === 'string' ? id : Array.isArray(id) ? id[0] : '';
    if (initializedIdRef.current === currentId) return;

    if (isNew) {
      const newTemplate = {
        name_pt: '',
        name_en: '',
        name_es: '',
        description_pt: '',
        description_en: '',
        description_es: '',
        scope_pt: '## Escopo & Limites da Avaliação\n\n[TODO: Definir alvos e fronteiras operacionais]',
        appendix_pt: '## Apêndice & Metodologia\n\n[TODO: Detalhes de metodologia e ferramentas]',
        scope_en: '## Scope & Assessment Boundaries\n\n[TODO: Define targets and boundaries]',
        scope_es: '## Alcance y Fronteras de Auditoría\n\n[TODO: Definir objetivos y fronteras]',
        appendix_en: '## Appendix & Methodology\n\n[TODO: Add testing methodology details]',
        appendix_es: '## Apéndice y Metodología\n\n[TODO: Añadir detalles de metodología]',
        icon: 'FileText',
      };
      setTemplate(newTemplate);
      const initialPtSections = [
        ...parseContentToSections(newTemplate.scope_pt),
        ...parseContentToSections(newTemplate.appendix_pt),
      ];
      const initialEnSections = [
        ...parseContentToSections(newTemplate.scope_en),
        ...parseContentToSections(newTemplate.appendix_en),
      ];
      const initialEsSections = [
        ...parseContentToSections(newTemplate.scope_es),
        ...parseContentToSections(newTemplate.appendix_es),
      ];
      resetSectionState({ 'pt-br': initialPtSections, en: initialEnSections, es: initialEsSections });
      initializedIdRef.current = currentId;
    } else {
      const existingTemplate = projectTemplates.find((t) => t.id === currentId);
      if (existingTemplate) {
        setTemplate(JSON.parse(JSON.stringify(existingTemplate)));
        const fullPtContent = joinMarkdownSections([
          existingTemplate.scope_pt || existingTemplate.scope_en || existingTemplate.scope_es,
          existingTemplate.appendix_pt || existingTemplate.appendix_en || existingTemplate.appendix_es,
        ]);
        const fullEnContent = joinMarkdownSections([existingTemplate.scope_en, existingTemplate.appendix_en]);
        const fullEsContent = joinMarkdownSections([existingTemplate.scope_es, existingTemplate.appendix_es]);
        resetSectionState({
          'pt-br': parseContentToSections(fullPtContent),
          en: parseContentToSections(fullEnContent),
          es: parseContentToSections(fullEsContent),
        });
        initializedIdRef.current = currentId;
      } else if (projectTemplates.length > 0) {
        toast({ variant: 'destructive', title: 'Layout não encontrado' });
        router.push('/report/6c2a9e4f1d8b7e3a');
      }
    }
  }, [id, isNew, projectTemplates, router, toast, parseContentToSections, resetSectionState]);

  // atalhos de teclado globais para desfazer (Ctrl+Z) e refazer (Ctrl+Y)
  useEffect(() => {
    const handleGlobalUndoRedo = (event: KeyboardEvent) => {
      if (event.defaultPrevented || (!event.ctrlKey && !event.metaKey)) return;
      const key = event.key.toLowerCase();

      if (key === 'z') {
        event.preventDefault();
        const changed = event.shiftKey ? redoSections() : undoSections();
        if (changed) setSaveStatus('unsaved');
      } else if (key === 'y') {
        event.preventDefault();
        if (redoSections()) setSaveStatus('unsaved');
      }
    };

    window.addEventListener('keydown', handleGlobalUndoRedo);
    return () => window.removeEventListener('keydown', handleGlobalUndoRedo);
  }, [redoSections, undoSections]);

  // autosave inteligente com debounce de 2 segundos
  useEffect(() => {
    if (saveStatus === 'unsaved') {
      const handler = setTimeout(() => {
        handleSave(false);
      }, 2000);
      return () => clearTimeout(handler);
    }
  }, [template, ptSections, enSections, esSections, saveStatus]);

  // atualiza campos de texto dos metadados
  const handleInputChange = (field: keyof Omit<ProjectTemplate, 'id'>, value: string) => {
    setTemplate((prev) => (prev ? { ...prev, [field]: value } : null));
    setSaveStatus('unsaved');
  };

  // salva o layout persistindo no banco local
  const handleSave = (showToast = true) => {
    if (!template) return;

    // valida se pelo menos um nome foi informado
    const hasAnyName = template.name_pt || template.name_en || template.name_es;
    if (!hasAnyName) {
      if (showToast) {
        toast({
          variant: 'destructive',
          title: currentLocale === 'pt-br' ? 'Nome obrigatório' : 'Required Name',
          description: currentLocale === 'pt-br' ? 'Defina o nome do layout.' : 'Please provide a layout name.',
        });
      }
      return;
    }

    setSaveStatus('saving');

    const ptContent = splitTemplateSectionsForStorage(ptSections, ['apêndice', 'apendice', 'appendix']);
    const enContent = splitTemplateSectionsForStorage(enSections, ['appendix', 'apêndice']);
    const esContent = splitTemplateSectionsForStorage(esSections, ['apéndice', 'apendice', 'appendix']);

    // garante sincronizacao entre idiomas vazios para nao quebrar compatibilidade
    const primaryName = template.name_pt || template.name_en || template.name_es || '';
    const primaryDesc = template.description_pt || template.description_en || template.description_es || '';

    const finalTemplate: ProjectTemplate = {
      ...template,
      id: isNew ? `ptpl-custom-${Date.now()}` : (template as ProjectTemplate).id,
      name_pt: template.name_pt || primaryName,
      name_en: template.name_en || primaryName,
      name_es: template.name_es || primaryName,
      description_pt: template.description_pt || primaryDesc,
      description_en: template.description_en || primaryDesc,
      description_es: template.description_es || primaryDesc,
      scope_pt: ptContent.scope || template.scope_pt || '',
      appendix_pt: ptContent.appendix || template.appendix_pt || '',
      scope_en: enContent.scope || template.scope_en || '',
      appendix_en: enContent.appendix || template.appendix_en || '',
      scope_es: esContent.scope || template.scope_es || '',
      appendix_es: esContent.appendix || template.appendix_es || '',
    };

    if (isNew) {
      addProjectTemplate(finalTemplate as Omit<ProjectTemplate, 'id'>);
      if (showToast) {
        toast({
          title: 'Layout Criado',
          description: `O blueprint "${finalTemplate.name_pt || finalTemplate.name_en}" foi cadastrado com sucesso.`,
        });
      }
      router.push('/report/6c2a9e4f1d8b7e3a');
    } else {
      updateProjectTemplate(finalTemplate as ProjectTemplate);
      if (showToast) {
        toast({
          title: 'Layout Atualizado',
          description: `As alterações no "${finalTemplate.name_pt || finalTemplate.name_en}" foram salvas.`,
        });
      }
    }
    setTimeout(() => setSaveStatus('saved'), 500);
  };

  // atualiza o conteudo markdown da secao editada
  const handleSectionChange = (lang: 'pt-br' | 'en' | 'es', sectionId: string, newContent: string) => {
    const updater = lang === 'pt-br' ? setPtSections : lang === 'en' ? setEnSections : setEsSections;
    updater((prev) => prev.map((s) => (s.id === sectionId ? { ...s, content: newContent } : s)));
    setSaveStatus('unsaved');
  };

  // adiciona nova secao em branco no idioma ativo
  const handleAddSection = (lang: 'pt-br' | 'en' | 'es') => {
    const newSection: TemplateSection = {
      id: `new-${lang}-${Date.now()}`,
      content: `### ${t.newSection}\n\n[TODO: Descreva o escopo desta seção]`,
    };
    if (lang === 'pt-br') {
      setPtSections((prev) => [...prev, newSection]);
    } else if (lang === 'en') {
      setEnSections((prev) => [...prev, newSection]);
    } else {
      setEsSections((prev) => [...prev, newSection]);
    }
    setSaveStatus('unsaved');
  };

  // adiciona uma secao pre-configurada (preset executivo de pentest)
  const handleAddPresetSection = (lang: 'pt-br' | 'en' | 'es', presetType: 'rules' | 'methodology' | 'exclusions') => {
    let title = '';
    let content = '';

    if (presetType === 'rules') {
      title = lang === 'en' ? 'Rules of Engagement & Operational Limits' : 'Regras de Engajamento e Limites Operacionais';
      content =
        lang === 'en'
          ? `### ${title}\n\n- Testing authorized within agreed timeframes only.\n- Denial of Service (DoS/DDoS) strictly prohibited.\n- Immediate escalation for critical findings to focal point.`
          : `### ${title}\n\n- Execução de testes autorizada apenas nas janelas acordadas.\n- Ataques de negação de serviço (DoS/DDoS) estritamente proibidos.\n- Escalonamento imediato de falhas críticas para o ponto focal.`;
    } else if (presetType === 'methodology') {
      title = lang === 'en' ? 'Assessment Methodology (OWASP / PTES)' : 'Metodologia de Teste (OWASP / PTES)';
      content =
        lang === 'en'
          ? `### ${title}\n\n1. Reconnaissance and OSINT discovery\n2. Vulnerability identification and service mapping\n3. Exploitation and proof of concept validation\n4. Post-exploitation risk impact analysis`
          : `### ${title}\n\n1. Reconhecimento e descoberta via OSINT\n2. Mapeamento de serviços e identificação de falhas\n3. Exploração controlada e prova de conceito\n4. Análise de impacto e risco pós-exploração`;
    } else {
      title = lang === 'en' ? 'Scope Exclusions & Third-Party Assets' : 'Exclusões de Escopo e Ativos de Terceiros';
      content =
        lang === 'en'
          ? `### ${title}\n\n- Any domain or IP not explicitly registered in target scope.\n- Cloud provider management planes (AWS/GCP/Azure).\n- Physical access and social engineering against employees.`
          : `### ${title}\n\n- Qualquer domínio ou IP não explicitamente listado no escopo.\n- Planos de controle do provedor de nuvem (AWS/GCP/Azure).\n- Acesso físico e engenharia social contra colaboradores.`;
    }

    const newSection: TemplateSection = {
      id: `preset-${lang}-${presetType}-${Date.now()}`,
      content,
    };

    if (lang === 'pt-br') {
      setPtSections((prev) => [...prev, newSection]);
    } else if (lang === 'en') {
      setEnSections((prev) => [...prev, newSection]);
    } else {
      setEsSections((prev) => [...prev, newSection]);
    }
    setSaveStatus('unsaved');
  };

  // remove a secao selecionada
  const handleDeleteSection = (lang: 'pt-br' | 'en' | 'es', sectionId: string) => {
    if (lang === 'pt-br') {
      setPtSections((prev) => prev.filter((s) => s.id !== sectionId));
    } else if (lang === 'en') {
      setEnSections((prev) => prev.filter((s) => s.id !== sectionId));
    } else {
      setEsSections((prev) => prev.filter((s) => s.id !== sectionId));
    }
    setCollapsedSections((prev) => {
      const next = { ...prev };
      delete next[sectionId];
      return next;
    });
    setSaveStatus('unsaved');
  };

  // recolhe e expande secoes
  const collapseAllSections = useCallback(() => {
    setCollapsedSections(
      Object.fromEntries([...ptSections, ...enSections, ...esSections].map((section) => [section.id, true]))
    );
  }, [ptSections, enSections, esSections]);

  const expandAllSections = useCallback(() => {
    setCollapsedSections({});
  }, []);

  const setSectionCollapsed = useCallback((sectionId: string, collapsed: boolean) => {
    setCollapsedSections((prev) => ({ ...prev, [sectionId]: collapsed }));
  }, []);

  // lida com o drop do drag and drop
  const handleDragEnd = (event: DragEndEvent, lang: 'pt-br' | 'en' | 'es') => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const updater = lang === 'pt-br' ? setPtSections : lang === 'en' ? setEnSections : setEsSections;
      updater((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        setSaveStatus('unsaved');
        return arrayMove(items, oldIndex, newIndex);
      });
    }
    expandAllSections();
  };

  if (!template) {
    return null;
  }

  const activeSections = editingLang === 'pt-br' ? ptSections : editingLang === 'es' ? esSections : enSections;
  const currentTitle =
    currentLocale === 'pt-br'
      ? template.name_pt || template.name_en || template.name_es || 'Novo Layout'
      : currentLocale === 'es'
      ? template.name_es || template.name_en || 'Nuevo Layout'
      : template.name_en || template.name_es || 'New Layout';

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] p-4 sm:p-6 max-w-[1720px] mx-auto space-y-5">
      {/* Top Header do Studio */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/60 pb-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" asChild className="h-9 w-9 rounded-lg border-border/70 hover:bg-muted/40">
            <Link href="/report/6c2a9e4f1d8b7e3a">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-primary/10 border border-primary/25 flex items-center justify-center text-primary shrink-0">
                <ProjectIcon name={template.icon} className="h-4 w-4" />
              </div>
              <h1 className="font-headline text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                {currentTitle || (isNew ? t.newTitle : t.editTitle)}
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-primary/10 text-primary border border-primary/20">
                BLUEPRINT
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isNew ? t.newDescription : t.editDescription}
            </p>
          </div>
        </div>

        {/* Status de salvamento e botao de acao */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-border/70 bg-card/60 text-xs font-mono">
            {saveStatus === 'saving' ? (
              <>
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                <span className="text-muted-foreground">{t.saving}</span>
              </>
            ) : saveStatus === 'saved' ? (
              <>
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="text-emerald-400 font-semibold">{t.saved}</span>
              </>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                <span className="text-amber-400 font-semibold">Alterações pendentes</span>
              </>
            )}
          </div>

          <Button
            size="sm"
            onClick={() => handleSave(true)}
            disabled={saveStatus === 'saving' || saveStatus === 'saved'}
            className="h-9 px-4 rounded-lg text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs flex items-center gap-1.5"
          >
            <Save className="h-3.5 w-3.5" />
            {isNew ? t.create : t.save}
          </Button>
        </div>
      </div>

      {/* Split Studio: Esquerda (Configuracoes & Indice) + Direita (Editor de Seções) */}
      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 items-start">
        {/* COLUNA ESQUERDA: Especificacoes do Layout & Indice */}
        <div className="space-y-4">
          {/* Card 1: Metadados do Layout */}
          <div className="rounded-2xl border border-border/70 bg-card/70 backdrop-blur-md p-4 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Sliders className="h-3.5 w-3.5 text-primary" />
                {t.blueprintSpecs}
              </h3>
              <span className="text-[10px] font-mono text-primary font-semibold">v2.0</span>
            </div>

            <div className="space-y-3">
              {/* Nome do template (Português) */}
              <div className="space-y-1">
                <Label htmlFor="name_pt" className="text-xs text-muted-foreground flex items-center justify-between">
                  <span>{t.namePt} *</span>
                  <span className="text-[10px] font-mono text-primary font-semibold">PT-BR</span>
                </Label>
                <Input
                  id="name_pt"
                  value={template.name_pt || ''}
                  onChange={(e) => handleInputChange('name_pt', e.target.value)}
                  placeholder="Ex: Pentest de Aplicação Web"
                  className="h-9 text-xs bg-background/80 rounded-lg border-border/70"
                />
              </div>

              {/* Nome do template (Ingles) */}
              <div className="space-y-1">
                <Label htmlFor="name_en" className="text-xs text-muted-foreground flex items-center justify-between">
                  <span>{t.nameEn}</span>
                  <span className="text-[10px] font-mono text-muted-foreground">EN</span>
                </Label>
                <Input
                  id="name_en"
                  value={template.name_en || ''}
                  onChange={(e) => handleInputChange('name_en', e.target.value)}
                  placeholder="Ex: Web Application Pentest"
                  className="h-9 text-xs bg-background/80 rounded-lg border-border/70"
                />
              </div>

              {/* Nome do template (Espanhol) */}
              <div className="space-y-1">
                <Label htmlFor="name_es" className="text-xs text-muted-foreground flex items-center justify-between">
                  <span>{t.nameEs}</span>
                  <span className="text-[10px] font-mono text-muted-foreground">ES</span>
                </Label>
                <Input
                  id="name_es"
                  value={template.name_es || ''}
                  onChange={(e) => handleInputChange('name_es', e.target.value)}
                  placeholder="Ex: Pentest de Aplicación Web"
                  className="h-9 text-xs bg-background/80 rounded-lg border-border/70"
                />
              </div>

              {/* Descricao (Português) */}
              <div className="space-y-1">
                <Label htmlFor="description_pt" className="text-xs text-muted-foreground flex items-center justify-between">
                  <span>{t.descPt}</span>
                  <span className="text-[10px] font-mono text-primary font-semibold">PT-BR</span>
                </Label>
                <Textarea
                  id="description_pt"
                  rows={2}
                  value={template.description_pt || ''}
                  onChange={(e) => handleInputChange('description_pt', e.target.value)}
                  placeholder="Resumo da metodologia e escopo em português..."
                  className="text-xs bg-background/80 rounded-lg border-border/70 resize-none"
                />
              </div>

              {/* Descricao (Ingles) */}
              <div className="space-y-1">
                <Label htmlFor="description_en" className="text-xs text-muted-foreground flex items-center justify-between">
                  <span>{t.descEn}</span>
                  <span className="text-[10px] font-mono text-muted-foreground">EN</span>
                </Label>
                <Textarea
                  id="description_en"
                  rows={2}
                  value={template.description_en || ''}
                  onChange={(e) => handleInputChange('description_en', e.target.value)}
                  placeholder="Summary of assessment methodology..."
                  className="text-xs bg-background/80 rounded-lg border-border/70 resize-none"
                />
              </div>

              {/* Descricao (Espanhol) */}
              <div className="space-y-1">
                <Label htmlFor="description_es" className="text-xs text-muted-foreground flex items-center justify-between">
                  <span>{t.descEs}</span>
                  <span className="text-[10px] font-mono text-muted-foreground">ES</span>
                </Label>
                <Textarea
                  id="description_es"
                  rows={2}
                  value={template.description_es || ''}
                  onChange={(e) => handleInputChange('description_es', e.target.value)}
                  placeholder="Resumen del alcance y metodología..."
                  className="text-xs bg-background/80 rounded-lg border-border/70 resize-none"
                />
              </div>

              {/* Seletor de Ícone */}
              <div className="space-y-1 pt-1">
                <Label htmlFor="icon" className="text-xs text-muted-foreground">
                  {t.icon}
                </Label>
                <Select
                  value={template.icon}
                  onValueChange={(val) => handleInputChange('icon', val)}
                >
                  <SelectTrigger id="icon" className="h-9 text-xs bg-background/80 rounded-lg border-border/70">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {projectIconOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <ProjectIconSelectItem value={opt.value} label={opt.label} />
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Card 2: Indice de Secoes do Layout */}
          <div className="rounded-2xl border border-border/70 bg-card/70 backdrop-blur-md p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <List className="h-3.5 w-3.5 text-primary" />
                {t.sectionNav}
              </h3>
              <span className="text-[11px] font-mono text-muted-foreground">
                {activeSections.length} seções ({editingLang.toUpperCase()})
              </span>
            </div>

            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {activeSections.map((sec, idx) => {
                const heading = getSectionHeadingTitle(sec.content) || `Seção ${idx + 1}`;
                return (
                  <div
                    key={sec.id}
                    className="flex items-center justify-between px-2.5 py-1.5 rounded-lg border border-border/50 bg-background/60 text-xs font-medium text-foreground hover:bg-muted/40 transition-colors"
                  >
                    <span className="truncate capitalize flex items-center gap-1.5">
                      <span className="font-mono text-[10px] text-muted-foreground font-semibold">
                        {idx + 1}.
                      </span>
                      {heading}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Presets rapidos de secoes de seguranca */}
            <div className="pt-2 border-t border-border/50 space-y-1.5">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                {t.quickPresets}
              </span>
              <div className="grid grid-cols-1 gap-1">
                <button
                  type="button"
                  onClick={() => handleAddPresetSection(editingLang, 'rules')}
                  className="px-2.5 py-1.5 rounded-lg border border-border/60 bg-muted/20 hover:bg-primary/10 hover:border-primary/40 text-[11px] font-medium text-left transition-all text-muted-foreground hover:text-primary flex items-center justify-between"
                >
                  <span>+ {t.rulesPreset}</span>
                  <Sparkles className="h-3 w-3 opacity-60" />
                </button>
                <button
                  type="button"
                  onClick={() => handleAddPresetSection(editingLang, 'methodology')}
                  className="px-2.5 py-1.5 rounded-lg border border-border/60 bg-muted/20 hover:bg-primary/10 hover:border-primary/40 text-[11px] font-medium text-left transition-all text-muted-foreground hover:text-primary flex items-center justify-between"
                >
                  <span>+ {t.methodologyPreset}</span>
                  <Sparkles className="h-3 w-3 opacity-60" />
                </button>
                <button
                  type="button"
                  onClick={() => handleAddPresetSection(editingLang, 'exclusions')}
                  className="px-2.5 py-1.5 rounded-lg border border-border/60 bg-muted/20 hover:bg-primary/10 hover:border-primary/40 text-[11px] font-medium text-left transition-all text-muted-foreground hover:text-primary flex items-center justify-between"
                >
                  <span>+ {t.exclusionsPreset}</span>
                  <Sparkles className="h-3 w-3 opacity-60" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: Editor Visual das Seções (The Markdown Studio) */}
        <div className="space-y-4">
          {/* Barra superior de controle do editor */}
          <div className="rounded-2xl border border-border/70 bg-card/70 backdrop-blur-md p-3 px-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm">
            {/* Seletor limpo de idioma ativo para edicao */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mr-1 hidden sm:inline">
                {t.activeEditingLanguage}:
              </span>
              <div className="flex items-center p-0.5 rounded-xl bg-background/80 border border-border/60">
                <button
                  type="button"
                  onClick={() => setEditingLang('pt-br')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    editingLang === 'pt-br'
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t.portugueseContent} ({ptSections.length})
                </button>
                <button
                  type="button"
                  onClick={() => setEditingLang('en')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    editingLang === 'en'
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t.englishContent} ({enSections.length})
                </button>
                <button
                  type="button"
                  onClick={() => setEditingLang('es')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    editingLang === 'es'
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t.spanishContent} ({esSections.length})
                </button>
              </div>
            </div>

            {/* Botoes de acoes em lote para as secoes */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={collapseAllSections}
                className="h-8 text-xs px-2.5 rounded-lg border-border/70 hover:bg-muted/40"
              >
                {t.collapse}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={expandAllSections}
                className="h-8 text-xs px-2.5 rounded-lg border-border/70 hover:bg-muted/40"
              >
                {t.expand}
              </Button>
              <Button
                size="sm"
                onClick={() => handleAddSection(editingLang)}
                className="h-8 text-xs px-3 rounded-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs flex items-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                {t.addNewSection}
              </Button>
            </div>
          </div>

          {/* Area de secoes ordenaveis via drag and drop */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={(e) => handleDragEnd(e, editingLang)}
          >
            <SortableContext
              items={activeSections.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {activeSections.map((section) => (
                  <SortableSection
                    key={section.id}
                    section={section}
                    onContentChange={(newContent) =>
                      handleSectionChange(editingLang, section.id, newContent)
                    }
                    onDelete={() => handleDeleteSection(editingLang, section.id)}
                    splitLayout={sectionSplitLayout}
                    onSplitLayoutChange={setSectionSplitLayout}
                    collapsed={!!collapsedSections[section.id]}
                    onCollapseAll={collapseAllSections}
                    onCollapsedChange={setSectionCollapsed}
                    labels={{
                      section: 'Seção do Relatório',
                      untitled: 'Sem título',
                      writeContent: t.writeContent,
                      deleteSection: t.deleteSection,
                      confirmDeleteTitle: t.confirmDeleteTitle,
                      confirmDeleteDescription: t.confirmDeleteDescription,
                      cancel: t.cancel,
                      confirmDelete: t.confirmDelete,
                      expand: t.expand,
                      collapse: t.collapse,
                    }}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {/* Botao de adicionar secao no rodape */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => handleAddSection(editingLang)}
              className="w-full py-4 rounded-xl border border-dashed border-border/80 hover:border-primary/60 bg-muted/20 hover:bg-primary/5 text-xs font-semibold text-muted-foreground hover:text-primary transition-all flex items-center justify-center gap-2 shadow-xs group"
            >
              <Plus className="h-4 w-4 transition-transform group-hover:scale-110" />
              {t.addNewSection} ({editingLang === 'pt-br' ? 'Português' : editingLang === 'es' ? 'Espanhol' : 'Inglês'})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
