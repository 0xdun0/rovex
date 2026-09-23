
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { ChevronLeft, Save, Plus, CheckCircle } from '@/components/icons';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';
import type { Vulnerability, Finding, Project, ImageAsset, Severity } from '@/lib/types';
import { useData } from '@/context/data-context';
import { useUser } from '@/context/user-context';
import { VulnerabilityTemplatePicker } from '@/components/vulnerability-template-picker';
import { FileText } from '@/components/icons';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Badge } from '@/components/ui/badge';
import { hasTodoMarker, stripMarkdownText } from '@/lib/todo-utils';
import { SectionMarkdownEditor } from '@/components/section-markdown-editor';
import { joinMarkdownSections, splitMarkdownIntoSections } from '@/lib/markdown-utils';
import { useUndoableState } from '@/hooks/use-undoable-state';

type SaveStatus = 'unsaved' | 'saving' | 'saved';

interface FindingSection {
  id: string;
  content: string;
}

type SortableSectionProps = {
  section: FindingSection;
  index: number;
  onAddSection: (index: number) => void;
  onDelete: () => void;
  onContentChange: (content: string) => void;
  getImage: (id: string) => ImageAsset | undefined;
  splitLayout: number[];
  onSplitLayoutChange: (layout: number[]) => void;
  collapsed: boolean;
  onCollapseAll: () => void;
  onCollapsedChange: (sectionId: string, collapsed: boolean) => void;
  variables?: import('@/lib/markdown-utils').VariableContext;
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

const SortableSection = ({ section, index, onAddSection, onDelete, labels, ...props }: SortableSectionProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });

  const style = {
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : 'auto',
  };
  
  return (
    <div ref={setNodeRef} style={style} data-finding-section-id={section.id} className="relative group/section scroll-mt-24">
      {!isDragging && (
        <div className="pointer-events-none absolute top-0 -left-12 h-full hidden lg:flex items-center gap-1 opacity-0 group-hover/section:opacity-100 group-hover/section:pointer-events-auto transition-opacity">
           <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer" onClick={() => onAddSection(index + 1)}>
            <Plus className="h-4 w-4"/>
          </Button>
        </div>
      )}
      <SectionMarkdownEditor
        id={`finding-section-${section.id}`}
        content={section.content}
        onChange={props.onContentChange}
        onDelete={onDelete}
        dragHandleProps={attributes}
        dragListeners={listeners}
        getImage={props.getImage}
        splitLayout={props.splitLayout}
        onSplitLayoutChange={props.onSplitLayoutChange}
        collapsed={props.collapsed}
        onDragHandleClick={props.onCollapseAll}
        dragging={isDragging}
        onCollapsedChange={(collapsed) => props.onCollapsedChange(section.id, collapsed)}
        variables={props.variables}
        titleFallback="Finding section"
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


export default function FindingEditorPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawProjectId = params.id;
  const rawFindingId = params.findingId;
  const projectId = (Array.isArray(rawProjectId) ? rawProjectId[0] : rawProjectId) ?? '';
  const findingId = (Array.isArray(rawFindingId) ? rawFindingId[0] : rawFindingId) ?? 'new';
  const { toast } = useToast();
  const { currentLocale } = useLanguage();
  const uiLanguage = currentLocale;
  const { projects, clients, findings, vulnerabilities, addFinding, updateFinding, getImage } = useData();
  const { user } = useUser();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const [finding, setFinding] = useState<Omit<Finding, 'id' | 'createdAt' | 'updatedAt'> | null>(null);

  const [project, setProject] = useState<Project | undefined>();
  const [projectLanguage, setProjectLanguage] = useState<Project['language']>('en');
  
  const {
    state: sections,
    setState: setSections,
    resetState: resetSections,
    undo: undoSections,
    redo: redoSections,
  } = useUndoableState<FindingSection[]>([]);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const [sectionSplitLayout, setSectionSplitLayout] = useState<number[]>([52, 48]);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const initializedFindingRef = useRef<string | null>(null);
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);

  const client = clients.find(c => c.id === project?.clientId);

  const getFindingSectionTitle = useCallback((content: string) => {
    const headingMatch = content.match(/^#{1,6}\s+(.+)$/m);
    return headingMatch ? stripMarkdownText(headingMatch[1]) : '';
  }, []);

  const parseMarkdownToSections = useCallback((markdown: string): FindingSection[] => {
    if (!markdown) return [];
    
    const parts = splitMarkdownIntoSections(markdown, { maxHeadingLevel: 3 });
    
    return parts
      .map((part, index) => {
        return {
          id: `section-${index}-${Date.now()}`,
          content: part.trim()
        };
      })
      .filter(p => p.content.trim() !== '');
  }, []);

  useEffect(() => {
    const currentProject = projects.find(p => p.id === projectId);
    setProject(currentProject);
    if(currentProject){
      setProjectLanguage(currentProject.language)
    }

    // inicializa editor uma vez por findingId pra nao perder foco do textarea no autosave
    const initKey = `${projectId}::${findingId}`;
    if (initializedFindingRef.current === initKey) return;

    if (findingId !== 'new') {
      const currentFinding = findings.find(f => f.id === findingId && f.projectId === projectId);
      if (currentFinding) {
        setFinding({
          title: currentFinding.title,
          severity: currentFinding.severity,
          cvss: currentFinding.cvss,
          markdown: currentFinding.markdown,
          projectId: currentFinding.projectId
        });
        const initialSections = parseMarkdownToSections(currentFinding.markdown);
        resetSections(initialSections);
        initializedFindingRef.current = initKey;
      } else if (findings.length > 0) {
        router.push(`/report/9a4f2c1b8e7d3a6e/${projectId}`);
      }
    } else {
        setFinding({
            // titulo padrao do achado conforme o idioma configurado do projeto
            title: projectLanguage === 'pt-br' ? 'Novo Achado' : projectLanguage === 'es' ? 'Nuevo Hallazgo' : 'New Finding',
            severity: 'Informational',
            cvss: 0,
            markdown: '',
            projectId,
        });
      resetSections([]);
      initializedFindingRef.current = initKey;
    }
  }, [findingId, projectId, projectLanguage, findings, router, projects, parseMarkdownToSections, resetSections]);

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
  
  useEffect(() => {
    if (saveStatus === 'unsaved') {
      const handler = setTimeout(() => {
        handleSave(false);
      }, 2000);
      return () => clearTimeout(handler);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finding, sections, saveStatus]);

  useEffect(() => {
    const todo = searchParams.get('todo');
    const section = searchParams.get('section');
    if (!todo || sections.length === 0) return;

    const found = sections.find((item) => {
      const matchesTodo = item.content.includes(todo) || (todo === 'TODO' && hasTodoMarker(item.content));
      if (!matchesTodo) return false;
      if (!section) return true;
      return getFindingSectionTitle(item.content) === section;
    }) || sections.find(item => item.content.includes(todo) || (todo === 'TODO' && hasTodoMarker(item.content)));

    if (!found) return;

    setTimeout(() => {
      const target = document.querySelector(`[data-finding-section-id="${found.id}"]`) as HTMLElement | null;
      target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const textarea = target?.querySelector('textarea') as HTMLTextAreaElement | null;
      textarea?.focus();
    }, 200);
  }, [searchParams, sections, getFindingSectionTitle]);


  const handleSave = (showToast = true) => {
    if (!finding || !finding.title || !finding.severity) {
        if (showToast) {
            toast({
                variant: 'destructive',
                title: uiLanguage === 'pt-br' ? 'Campos Incompletos' : uiLanguage === 'es' ? 'Campos Incompletos' : 'Incomplete Fields',
                description:
                  uiLanguage === 'pt-br'
                    ? 'Por favor, preencha todos os detalhes do finding.'
                    : uiLanguage === 'es'
                    ? 'Por favor, rellena todos los detalles del hallazgo.'
                    : 'Please fill in all finding details.',
            });
        }
      return;
    }

    setSaveStatus('saving');
    const markdownContent = joinMarkdownSections(sections.map(s => s.content));

    const findingData = {
      ...finding,
      markdown: markdownContent,
    };

    if (findingId === 'new') {
      const created = addFinding(findingData);
      if (showToast) toast({ title: t[uiLanguage].saveSuccessTitle, description: `${finding.title} ${t[uiLanguage].saveSuccessNew}` });
      // Mantem o operador na visualizacao da evidencia recem-criada em vez
      // de redirecionar a lista. router.replace evita entrada extra no
      // historico e mantem o estado atual dos blocos no editor.
      initializedFindingRef.current = `${projectId}::${created.id}`;
      router.replace(`/report/9a4f2c1b8e7d3a6e/${projectId}/findings/${created.id}`);
    } else {
      updateFinding({
        id: findingId,
        ...findingData,
      });
      if (showToast) toast({ title: t[uiLanguage].saveSuccessTitle, description: `${finding.title} ${t[uiLanguage].saveSuccessUpdate}` });
    }

    setTimeout(() => setSaveStatus('saved'), 500);
  };
  
  const handleFieldChange = (field: keyof Omit<Finding, 'id'|'createdAt'|'updatedAt'>, value: any) => {
    setFinding(prev => prev ? {...prev, [field]: value} : null);
    setSaveStatus('unsaved');
  }

  const handleSectionChange = (sectionId: string, newContent: string) => {
    setSections(prevSections =>
      prevSections.map(sec => 
        sec.id === sectionId ? { ...sec, content: newContent } : sec
      )
    );
    setSaveStatus('unsaved');
  };
  
  const handleAddSection = (index?: number) => {
    const newSection: FindingSection = {
        id: `section-new-${Date.now()}`,
        content: `### ${t[uiLanguage].newSection}`
    };
    if (index !== undefined) {
      const newSections = [...sections];
      newSections.splice(index, 0, newSection);
      setSections(newSections);
    } else {
      setSections(prev => [...prev, newSection]);
    }
    setSaveStatus('unsaved');
  };

  const handleDeleteSection = (sectionId: string) => {
      setSections(prev => prev.filter(sec => sec.id !== sectionId));
      setCollapsedSections(prev => {
        const next = { ...prev };
        delete next[sectionId];
        return next;
      });
      setSaveStatus('unsaved');
  };

  const collapseAllSections = useCallback(() => {
    setCollapsedSections(Object.fromEntries(sections.map(section => [section.id, true])));
  }, [sections]);

  const expandAllSections = useCallback(() => {
    setCollapsedSections({});
  }, []);

  const setSectionCollapsed = useCallback((sectionId: string, collapsed: boolean) => {
    setCollapsedSections(prev => ({ ...prev, [sectionId]: collapsed }));
  }, []);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        setSaveStatus('unsaved');
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  const handleSeverityChange = (newSeverity: Severity) => {
    handleFieldChange('severity', newSeverity);
    let newCvss = 0.0;
    switch (newSeverity) {
        case 'Critical': newCvss = 9.5; break;
        case 'High': newCvss = 8.5; break;
        case 'Medium': newCvss = 5.5; break;
        case 'Low': newCvss = 2.5; break;
        case 'Informational': newCvss = 0.0; break;
    }
    handleFieldChange('cvss', newCvss);
  }

  const getSeverityVariant = (severity: string): 'critical' | 'high' | 'medium' | 'low' | 'informational' => {
    switch (severity) {
      case 'Critical': return 'critical';
      case 'High': return 'high';
      case 'Medium': return 'medium';
      case 'Low': return 'low';
      default: return 'informational';
    }
  }


  const t = {
    en: {
      backToProject: 'Back to Project',
      saveFinding: 'Save Finding',
      saving: 'Saving...',
      saved: 'Saved',
      findingDetails: 'Finding Details',
      importFromDB: 'Import from Database',
      selectTemplate: 'Select a vulnerability template',
      titleLabel: 'Title',
      severityLabel: 'Severity',
      selectSeverity: 'Select severity',
      critical: 'Critical',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      informational: 'Informational',
      cvssScore: 'CVSS Score',
      saveSuccessTitle: 'Finding Saved',
      saveSuccessNew: 'has been created.',
      saveSuccessUpdate: 'has been updated.',
      addNewSection: 'Add New Section',
      newSection: 'New Section',
      searchVulnerability: 'Search vulnerability...',
      deleteSection: 'Delete section',
      confirmDeleteTitle: 'Delete section?',
      confirmDeleteDescription: 'This section will be removed from the editor. You can undo the change with Control+Z.',
      cancel: 'Cancel',
      confirmDelete: 'Delete',
      expand: 'Expand section',
      collapse: 'Collapse sections',
    },
    es: {
      backToProject: 'Volver al Proyecto',
      saveFinding: 'Guardar Hallazgo',
      saving: 'Guardando...',
      saved: 'Guardado',
      findingDetails: 'Detalles del Hallazgo',
      importFromDB: 'Importar desde Base de Datos',
      selectTemplate: 'Seleccionar una plantilla de vulnerabilidad',
      titleLabel: 'Título',
      severityLabel: 'Severidad',
      selectSeverity: 'Seleccionar severidad',
      critical: 'Crítica',
      high: 'Alta',
      medium: 'Media',
      low: 'Baja',
      informational: 'Informativa',
      cvssScore: 'Puntuación CVSS',
      saveSuccessTitle: 'Hallazgo Guardado',
      saveSuccessNew: 'ha sido creado.',
      saveSuccessUpdate: 'ha sido actualizado.',
      addNewSection: 'Añadir Nueva Sección',
      newSection: 'Nueva Sección',
      searchVulnerability: 'Buscar vulnerabilidad...',
      deleteSection: 'Eliminar sección',
      confirmDeleteTitle: '¿Eliminar sección?',
      confirmDeleteDescription: 'Esta sección se eliminará del editor. Puedes deshacer el cambio con Control+Z.',
      cancel: 'Cancelar',
      confirmDelete: 'Eliminar',
      expand: 'Expandir sección',
      collapse: 'Colapsar secciones',
    },
    'pt-br': {
      backToProject: 'Voltar ao Projeto',
      saveFinding: 'Salvar Finding',
      saving: 'Salvando…',
      saved: 'Salvo',
      findingDetails: 'Detalhes do Finding',
      importFromDB: 'Importar do Catálogo',
      selectTemplate: 'Selecionar template de vulnerabilidade',
      titleLabel: 'Título',
      severityLabel: 'Severidade',
      selectSeverity: 'Selecionar severidade',
      critical: 'Crítico',
      high: 'Alto',
      medium: 'Médio',
      low: 'Baixo',
      informational: 'Informativo',
      cvssScore: 'Pontuação CVSS',
      saveSuccessTitle: 'Finding Salvo',
      saveSuccessNew: 'foi criado com sucesso.',
      saveSuccessUpdate: 'foi atualizado com sucesso.',
      addNewSection: 'Adicionar Nova Seção',
      newSection: 'Nova Seção',
      searchVulnerability: 'Buscar vulnerabilidade…',
      deleteSection: 'Excluir seção',
      confirmDeleteTitle: 'Excluir seção?',
      confirmDeleteDescription: 'Esta seção será removida do editor. Você pode desfazer a alteração com Ctrl+Z.',
      cancel: 'Cancelar',
      confirmDelete: 'Excluir',
      expand: 'Expandir seção',
      collapse: 'Recolher seções',
    },
  };

  const getVulnTitle = (vuln: Vulnerability) => {
    if (projectLanguage === 'pt-br') return vuln.title_pt || vuln.title_en;
    if (projectLanguage === 'es') return vuln.title_es || vuln.title_en;
    return vuln.title_en;
  };

  const handleImportFromVulnerability = (vuln: Vulnerability) => {
    handleFieldChange('title', getVulnTitle(vuln));
    handleSeverityChange(vuln.severity);

    const langKey = projectLanguage === 'es' ? 'es' : 'en';
    const newSectionsContent = [
      vuln[`overview_${langKey}`],
      vuln[`technicalDescription_${langKey}`],
      vuln[`affectedComponents_${langKey}`],
      vuln[`impact_${langKey}`],
      vuln[`immediateActions_${langKey}`],
      vuln[`details_${langKey}`],
      vuln[`recommendations_${langKey}`],
    ];

    const newSections = splitMarkdownIntoSections(joinMarkdownSections(newSectionsContent), { maxHeadingLevel: 3 }).map(content => ({
      id: `section-imported-${Date.now()}-${Math.random()}`,
      content: content || ''
    }));

    setSections(newSections);
    setSaveStatus('unsaved');
  };


  return (
    <div className="w-full grid grid-cols-1 gap-6 pt-6">
      <header className="flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="h-10 w-10" asChild>
            <Link href={`/report/9a4f2c1b8e7d3a6e/${projectId}`}>
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="font-headline text-xl font-bold">
              {finding?.title || (projectLanguage === 'pt-br' ? 'Novo Achado' : projectLanguage === 'es' ? 'Nuevo Hallazgo' : 'New Finding')}
            </h1>
            <p className="text-sm text-muted-foreground">{project?.name} / {client?.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => handleSave(true)} disabled={saveStatus === 'saving' || saveStatus === 'saved'}>
            {saveStatus === 'saving' ? (<><Save className="mr-2 h-4 w-4 animate-spin" />{t[uiLanguage].saving}</>) : 
             saveStatus === 'saved' ? (<><CheckCircle className="mr-2 h-4 w-4" />{t[uiLanguage].saved}</>) : 
             (<><Save className="mr-2 h-4 w-4" />{t[uiLanguage].saveFinding}</>)}
          </Button>
        </div>
      </header>

      <div className="w-full px-4 sm:px-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <CardTitle>{t[uiLanguage].findingDetails}</CardTitle>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={() => setTemplatePickerOpen(true)}>
                  <FileText className="mr-2 h-4 w-4" />
                  {uiLanguage === 'pt-br' ? 'Carregar template' : uiLanguage === 'es' ? 'Cargar plantilla' : 'Load template'}
                </Button>
                {finding?.severity && <Badge variant={getSeverityVariant(finding.severity)}>{finding.severity}</Badge>}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="title">{t[uiLanguage].titleLabel}</Label>
                  <Input id="title" value={finding?.title || ''} onChange={e => handleFieldChange('title', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="severity">{t[uiLanguage].severityLabel}</Label>
                  <Select value={finding?.severity} onValueChange={(value) => handleSeverityChange(value as Severity)}>
                    <SelectTrigger id="severity">
                      <SelectValue placeholder={t[uiLanguage].selectSeverity} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Critical">{t[uiLanguage].critical}</SelectItem>
                      <SelectItem value="High">{t[uiLanguage].high}</SelectItem>
                      <SelectItem value="Medium">{t[uiLanguage].medium}</SelectItem>
                      <SelectItem value="Low">{t[uiLanguage].low}</SelectItem>
                      <SelectItem value="Informational">{t[uiLanguage].informational}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvss">{t[uiLanguage].cvssScore}</Label>
                  <Input id="cvss" type="number" step="0.1" value={finding?.cvss || 0} onChange={e => handleFieldChange('cvss', parseFloat(e.target.value))} />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4 mt-6">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-4">
                        {sections.map((section, index) => {
                           return (
                              <SortableSection
                            key={section.id}
                            section={section}
                            index={index}
                            onAddSection={handleAddSection}
                            onContentChange={(newContent: string) => handleSectionChange(section.id, newContent)}
                            onDelete={() => handleDeleteSection(section.id)}
                            getImage={getImage}
                            splitLayout={sectionSplitLayout}
                            onSplitLayoutChange={setSectionSplitLayout}
                            collapsed={Boolean(collapsedSections[section.id])}
                            onCollapseAll={collapseAllSections}
                            onCollapsedChange={setSectionCollapsed}
                            variables={{
                              client: client
                                ? {
                                    name: client.name,
                                    shortName: client.contact || client.name,
                                    contactName: client.contact || client.name,
                                    contactEmail: client.contact || '',
                                    phone: client.phone,
                                    logoUrl: client.logoUrl,
                                  }
                                : undefined,
                              project: project
                                ? {
                                    name: project.name,
                                    description: project.reportBody?.slice(0, 200) || '',
                                    startDate: project.startDate,
                                    endDate: project.endDate,
                                    reportDate: new Date().toISOString().slice(0, 10),
                                    language: project.language,
                                  }
                                : undefined,
                              pentester: {
                                name: user.name,
                                email: user.email,
                                phone: user.phone,
                                role: 'Security Consultant',
                                company: 'Rovex Security Labs',
                              },
                              // injeta variaveis do achado para interpolacao no preview da secao
                              finding: finding
                                ? {
                                    title: finding.title,
                                    summary: (finding as any).summary || (finding as any).description?.slice(0, 150) || finding.markdown?.slice(0, 150) || '',
                                    description: (finding as any).description || finding.markdown || '',
                                    severity: finding.severity,
                                    cvss: {
                                      score: finding.cvss,
                                      vector: (finding as any).cvssVector || 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
                                      level: finding.severity,
                                      levelNumber: finding.cvss >= 9 ? 5 : finding.cvss >= 7 ? 4 : finding.cvss >= 4 ? 3 : finding.cvss > 0 ? 2 : 1,
                                      version: '3.1',
                                    },
                                    recommendation: (finding as any).recommendation || '',
                                    shortRecommendation: (finding as any).recommendation?.slice(0, 80) || '',
                                    affectedComponents: (finding as any).location || '',
                                    retestStatus: 'open',
                                  }
                                : undefined,
                            }}

                            labels={{
                              section: 'Finding section',
                              untitled: 'Finding section',
                              writeContent: 'Write finding evidence, impact, remediation or notes...',
                              deleteSection: t[uiLanguage].deleteSection,
                              confirmDeleteTitle: t[uiLanguage].confirmDeleteTitle,
                              confirmDeleteDescription: t[uiLanguage].confirmDeleteDescription,
                              cancel: t[uiLanguage].cancel,
                              confirmDelete: t[uiLanguage].confirmDelete,
                              expand: t[uiLanguage].expand,
                              collapse: t[uiLanguage].collapse,
                            }}
                          />
                       );
                    })}
                  </div>
                </SortableContext>
              </DndContext>

              <div className="flex justify-center pt-4 pb-24">
                  <Button variant="outline" onClick={() => handleAddSection()}>
                      <Plus className="mr-2 h-4 w-4" />
                      {t[uiLanguage].addNewSection}
                  </Button>
              </div>
          </div>
      </div>

      <VulnerabilityTemplatePicker
        open={templatePickerOpen}
        onOpenChange={setTemplatePickerOpen}
        language={projectLanguage}
        onPick={handleImportFromVulnerability}
      />
    </div>
  );
}
