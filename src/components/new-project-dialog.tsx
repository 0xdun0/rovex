'use client';

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { es, ptBR } from "date-fns/locale";
import { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CalendarIcon,
  PlusCircle,
  ShieldCheck,
  Building,
  Languages,
  CheckCircle,
  Sparkles,
  ArrowRight,
  FileText,
  User,
} from "@/components/icons";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/language-context";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/context/data-context";
import { useUser } from "@/context/user-context";
import { PentesterDataFields, profileToSnapshot } from "@/components/pentester-data-fields";
import type { Project, Client, PentesterProfile, ProjectTemplate, ProjectType } from "@/lib/types";
import { ProjectIcon, ProjectIconSelectItem, projectIconOptions } from "@/components/project-icon";
import { joinMarkdownSections } from "@/lib/markdown-utils";
import { ImageUploadButton } from "@/components/image-upload-button";

// junta as secoes markdown do template conforme o idioma do projeto
const getTemplateReportContent = (
  template: { scope_en: string; scope_es: string; appendix_en?: string; appendix_es?: string; scope_pt?: string; appendix_pt?: string },
  language: Project['language']
) => {
  if (language === 'pt-br') {
    const scope = template.scope_pt || template.scope_en || template.scope_es;
    const appendix = template.appendix_pt || template.appendix_en || template.appendix_es;
    return joinMarkdownSections([scope, appendix]);
  }
  return language === 'es'
    ? joinMarkdownSections([template.scope_es || template.scope_en, template.appendix_es || template.appendix_en])
    : joinMarkdownSections([template.scope_en || template.scope_es, template.appendix_en || template.appendix_es]);
};

// recupera o nome localizado do template respeitando portugues
const getTemplateLocalizedName = (template: ProjectTemplate, lang: Project['language']) => {
  if (lang === 'pt-br') return template.name_pt || template.name_en || template.name_es;
  if (lang === 'es') return template.name_es || template.name_en;
  return template.name_en || template.name_es;
};

interface NewProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (projectId: string) => void;
}

// modal executivo em duas colunas estilo blueprint para criar assessment
export function NewProjectDialog({ open, onOpenChange, onCreated }: NewProjectDialogProps) {
  const { currentLocale } = useLanguage();
  const uiLanguage = currentLocale;
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { clients, addProject, projectTemplates, addClient } = useData();
  const { user } = useUser();

  // estados principais do formulario do projeto
  const [name, setName] = useState('');
  const [clientId, setClientId] = useState<string>('');
  const [scope, setScope] = useState('');
  const [date, setDate] = useState<DateRange | undefined>();
  const [templateId, setTemplateId] = useState<string | null>(searchParams.get('template'));
  const [projectLanguage, setProjectLanguage] = useState<Project['language']>(
    currentLocale === 'pt-br' ? 'pt-br' : currentLocale === 'es' ? 'es' : 'en'
  );
  const [projectType, setProjectType] = useState<ProjectType>('pentest');
  const [icon, setIcon] = useState('FileText');
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [includePentester, setIncludePentester] = useState<boolean>(true);
  const [pentesterSnapshot, setPentesterSnapshot] = useState<PentesterProfile>(() => profileToSnapshot(user));

  // modal rapido para cadastrar um novo alvo direto daqui
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientContact, setNewClientContact] = useState('');
  const [newClientLogo, setNewClientLogo] = useState<string | null>(null);
  const [newClientLogoWide, setNewClientLogoWide] = useState<string | null>(null);

  // preenche nome e escopo automaticamente ao trocar de template
  useEffect(() => {
    if (templateId) {
      const template = projectTemplates.find((t) => t.id === templateId);
      if (template) {
        setName(getTemplateLocalizedName(template, projectLanguage));
        setScope(getTemplateReportContent(template, projectLanguage));
        setIcon(template.icon);
        if (template.id === 'ptpl-5') {
          setProjectType('writeup');
        }
      }
    }
  }, [templateId, projectLanguage, projectTemplates]);

  // zera tudo ao fechar o modal ou carrega o perfil ao abrir
  useEffect(() => {
    if (open) {
      setIncludePentester(true);
      setPentesterSnapshot(profileToSnapshot(user));
    } else {
      setName('');
      setClientId('');
      setScope('');
      setDate(undefined);
      setTemplateId(null);
      setProjectType('pentest');
      setProjectLanguage(currentLocale === 'pt-br' ? 'pt-br' : currentLocale === 'es' ? 'es' : 'en');
      setIcon('FileText');
      setErrors({});
    }
  }, [open, user, currentLocale]);

  const handleTemplateChange = (newTemplateId: string) => {
    const template = projectTemplates.find((t) => t.id === newTemplateId);
    if (template) {
      setTemplateId(newTemplateId);
      setName(getTemplateLocalizedName(template, projectLanguage));
      setScope(getTemplateReportContent(template, projectLanguage));
      setIcon(template.icon);
      if (newTemplateId === 'ptpl-5') {
        setProjectType('writeup');
      }
    }
  };

  // checa se todos os campos necessarios foram preenchidos
  const validateFields = () => {
    const newErrors: Record<string, boolean> = {};
    if (!name.trim()) newErrors.name = true;
    if (!clientId) newErrors.clientId = true;
    if (!date?.from || !date?.to) newErrors.date = true;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // cria o assessment e abre o projeto recem-criado
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateFields()) {
      toast({
        variant: 'destructive',
        title: uiLanguage === 'pt-br' ? 'Campos Obrigatórios' : uiLanguage === 'es' ? 'Campos Obligatorios' : 'Required Fields Missing',
        description:
          uiLanguage === 'pt-br'
            ? 'Por favor, selecione a organização alvo, nome e o cronograma do projeto.'
            : uiLanguage === 'es'
            ? 'Por favor, selecciona la organización objetivo, nombre y fechas del proyecto.'
            : 'Please select a target organization, project name, and execution dates.',
      });
      return;
    }

    // monta o payload do projeto pronto para auditoria
    const newProjectData = {
      clientId,
      name,
      type: projectType,
      scope,
      icon,
      startDate: date!.from!,
      endDate: date!.to!,
      status: 'In Progress' as const,
      language: projectLanguage,
      includePentesterData: includePentester,
      pentesterSnapshot: includePentester ? pentesterSnapshot : undefined,
    };

    const newProject = addProject(newProjectData);

    toast({
      title: uiLanguage === 'pt-br' ? 'Assessment Criado' : uiLanguage === 'es' ? 'Evaluación Creada' : 'Assessment Created',
      description: `${name} ${
        uiLanguage === 'pt-br' ? 'foi inicializado com sucesso.' : uiLanguage === 'es' ? 'ha sido inicializado.' : 'has been initialized.'
      }`,
    });

    onOpenChange(false);
    onCreated?.(newProject.id);
  };

  // cadastra o novo alvo direto no storage e seleciona ele
  const handleCreateClient = () => {
    if (!newClientName.trim() || !newClientContact.trim()) {
      toast({
        variant: 'destructive',
        title: uiLanguage === 'pt-br' ? 'Campos Incompletos' : uiLanguage === 'es' ? 'Campos incompletos' : 'Incomplete fields',
        description:
          uiLanguage === 'pt-br'
            ? 'Preencha o nome do alvo e o contato focal.'
            : uiLanguage === 'es'
            ? 'Rellena el nombre del objetivo y contacto focal.'
            : 'Please provide target name and focal contact.',
      });
      return;
    }

    const newClient: Omit<Client, 'id'> = {
      name: newClientName,
      contact: newClientContact,
      logoUrl: newClientLogo || '',
      logoWide: newClientLogoWide || undefined,
    };

    const created = addClient(newClient);
    setClientId(created.id);

    toast({
      title: uiLanguage === 'pt-br' ? 'Alvo Cadastrado' : uiLanguage === 'es' ? 'Objetivo Creado' : 'Target Registered',
      description: `${newClient.name} ${
        uiLanguage === 'pt-br' ? 'foi cadastrado com sucesso.' : uiLanguage === 'es' ? 'ha sido añadido.' : 'has been registered.'
      }`,
    });

    setNewClientName('');
    setNewClientContact('');
    setNewClientLogo(null);
    setNewClientLogoWide(null);
    setIsClientDialogOpen(false);
  };

  const t = {
    en: {
      title: "New Security Assessment",
      description: "Configure operational scope, target organization, and deliverable blueprint.",
      projectNameLabel: "Assessment / Project Name",
      projectNamePlaceholder: "e.g., Q4 Internal Network Penetration Test",
      targetLabel: "Target Organization",
      selectTarget: "Select a target organization",
      createNewTarget: "Register New Target",
      datesLabel: "Assessment Timeline",
      createProject: "Initialize Assessment",
      cancel: "Cancel",
      importTemplate: "Assessment Blueprint / Template",
      selectTemplate: "Select a template",
      searchBlueprints: "Search blueprints...",
      projectType: "Project Type",
      professionalPentest: "Professional Pentest",
      writeupLab: "Writeup / CTF Lab",
      languageLabel: "Report Deliverable Language",
      english: "English",
      portuguese: "Portuguese",
      spanish: "Spanish",
      iconLabel: "Icon",
      newTargetTitle: "Register Target Organization",
      newTargetDescription: "Add a target to manage scoped assets, risks, and assessment reports.",
      nameLabel: "Organization Name",
      namePlaceholder: "Acme Corp / Cloud Gateway",
      contactLabel: "Focal Contact",
      contactPlaceholder: "security@target.com",
      saveTarget: "Save Target",
      logoSquareLabel: "Square logo",
      logoSquareHint: "Used in tables and summary cards. 1:1 ratio.",
      logoWideLabel: "Horizontal logo",
      logoWideHint: "Used in report header/cover. 4:1 ratio.",
      blueprintSummary: "Assessment Blueprint",
      noTargetSelected: "No target selected yet",
      leadAuditor: "Lead Auditor",
      timelineEmpty: "Select execution dates",
      requiredFieldsNote: "* Required fields for report compilation",
      assessmentTitlePlaceholder: "Assessment Title...",
      noTemplateLoaded: "No template loaded",
    },
    'pt-br': {
      title: "Novo Assessment de Segurança",
      description: "Configure parâmetros operacionais, organização alvo e blueprint do relatório.",
      projectNameLabel: "Nome do Assessment / Projeto",
      projectNamePlaceholder: "ex: Pentest Web & Infraestrutura Q4",
      targetLabel: "Organização Alvo",
      selectTarget: "Selecionar uma organização alvo",
      createNewTarget: "Cadastrar Novo Alvo",
      datesLabel: "Cronograma de Execução",
      createProject: "Inicializar Assessment",
      cancel: "Cancelar",
      importTemplate: "Blueprint / Template de Escopo",
      selectTemplate: "Selecionar um template",
      searchBlueprints: "Buscar blueprints...",
      projectType: "Tipo de Projeto",
      professionalPentest: "Pentest Profissional",
      writeupLab: "Writeup / CTF Lab",
      languageLabel: "Idioma do Relatório Final",
      english: "Inglês",
      portuguese: "Português",
      spanish: "Espanhol",
      iconLabel: "Ícone",
      newTargetTitle: "Cadastrar Organização Alvo",
      newTargetDescription: "Adicione um alvo para gerenciar ativos no escopo, riscos e relatórios.",
      nameLabel: "Nome da Organização",
      namePlaceholder: "Empresa Alvo / Infraestrutura",
      contactLabel: "Contato Focal / Ponto de Contato",
      contactPlaceholder: "seguranca@empresa.com",
      saveTarget: "Salvar Alvo",
      logoSquareLabel: "Logo quadrado",
      logoSquareHint: "Usado em tabelas e cards. Proporção 1:1.",
      logoWideLabel: "Logo horizontal",
      logoWideHint: "Usado no cabeçalho e capa do relatório. Proporção 4:1.",
      blueprintSummary: "Resumo do Blueprint",
      noTargetSelected: "Nenhum alvo selecionado ainda",
      leadAuditor: "Auditor Responsável",
      timelineEmpty: "Definir datas de execução",
      requiredFieldsNote: "* Campos obrigatórios para compilação do relatório",
      assessmentTitlePlaceholder: "Título do Assessment...",
      noTemplateLoaded: "Nenhum template selecionado",
    },
    es: {
      title: "Nueva Evaluación de Seguridad",
      description: "Configura parámetros operativos, organización objetivo y blueprint del informe.",
      projectNameLabel: "Nombre de la Evaluación / Proyecto",
      projectNamePlaceholder: "p.ej., Pentest Red Interna Q4",
      targetLabel: "Organización Objetivo",
      selectTarget: "Seleccionar organización objetivo",
      createNewTarget: "Registrar Nuevo Objetivo",
      datesLabel: "Cronograma de Ejecución",
      createProject: "Inicializar Evaluación",
      cancel: "Cancelar",
      importTemplate: "Blueprint / Plantilla de Alcance",
      selectTemplate: "Seleccionar plantilla",
      searchBlueprints: "Buscar plantillas...",
      projectType: "Tipo de Proyecto",
      professionalPentest: "Pentest Profesional",
      writeupLab: "Writeup / CTF Lab",
      languageLabel: "Idioma del Informe Final",
      english: "Inglés",
      portuguese: "Portugués",
      spanish: "Español",
      iconLabel: "Icono",
      newTargetTitle: "Registrar Organización Objetivo",
      newTargetDescription: "Añade un objetivo para gestionar activos, riesgos y reportes ejecutivos.",
      nameLabel: "Nombre de la Organización",
      namePlaceholder: "Nombre de la Empresa o Entorno",
      contactLabel: "Contacto Focal",
      contactPlaceholder: "seguridad@empresa.com",
      saveTarget: "Guardar Objetivo",
      logoSquareLabel: "Logo cuadrado",
      logoSquareHint: "Usado en tablas y tarjetas. Proporción 1:1.",
      logoWideLabel: "Logo horizontal",
      logoWideHint: "Usado en encabezados y portadas. Proporción 4:1.",
      blueprintSummary: "Resumen del Blueprint",
      noTargetSelected: "Ningún objetivo seleccionado aún",
      leadAuditor: "Auditor Líder",
      timelineEmpty: "Definir fechas de ejecución",
      requiredFieldsNote: "* Campos obligatorios para compilar el informe",
      assessmentTitlePlaceholder: "Título de la Evaluación...",
      noTemplateLoaded: "Ninguna plantilla seleccionada",
    },
  };

  const L = (t as Record<string, typeof t.en>)[uiLanguage] || t.en;
  const selectedClient = clients.find((c) => c.id === clientId);
  const selectedTemplate = projectTemplates.find((tp) => tp.id === templateId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-2xl bg-card border border-border/80 text-foreground shadow-2xl">
        {/* Split Container: Left Blueprint summary + Right Interactive Form */}
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] min-h-[600px] max-h-[90vh]">
          {/* coluna da esquerda: resumo blueprint em tempo real */}
          <div className="bg-[#0b0f17] border-b lg:border-b-0 lg:border-r border-border/70 p-5 flex flex-col justify-between text-slate-200">
            <div className="space-y-4">
              {/* indicador de status ativo */}
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-mono font-bold tracking-widest text-primary uppercase">
                  Assessment Blueprint
                </span>
              </div>

              {/* titulo e icone escolhido em destaque */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/25 flex items-center justify-center text-primary shrink-0">
                    <ProjectIcon name={icon} className="h-4 w-4" />
                  </div>
                  <h3 className="font-bold text-sm text-white line-clamp-2 leading-snug">
                    {name || L.assessmentTitlePlaceholder}
                  </h3>
                </div>
                <p className="text-[11px] text-slate-400 font-mono">
                  {selectedTemplate
                    ? getTemplateLocalizedName(selectedTemplate, uiLanguage)
                    : L.noTemplateLoaded}
                </p>
              </div>

              {/* card da organizacao alvo selecionada */}
              <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1">
                <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider flex items-center gap-1">
                  <Building className="h-3 w-3 text-primary" />
                  {L.targetLabel}
                </span>
                <p className="text-xs font-semibold text-white truncate">
                  {selectedClient ? selectedClient.name : L.noTargetSelected}
                </p>
                {selectedClient?.contact && (
                  <p className="text-[11px] font-mono text-slate-400 truncate">
                    {selectedClient.contact}
                  </p>
                )}
              </div>

              {/* cronograma do assessment */}
              <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1">
                <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider flex items-center gap-1">
                  <CalendarIcon className="h-3 w-3 text-primary" />
                  {L.datesLabel}
                </span>
                <p className="text-xs font-mono text-white">
                  {date?.from && date?.to ? (
                    `${format(date.from, 'dd/MM/yyyy')} ➔ ${format(date.to, 'dd/MM/yyyy')}`
                  ) : (
                    <span className="text-slate-500 italic">{L.timelineEmpty}</span>
                  )}
                </p>
              </div>

              {/* dados do auditor que vai assinar o relatorio */}
              {includePentester && (
                <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider flex items-center gap-1">
                    <User className="h-3 w-3 text-primary" />
                    {L.leadAuditor}
                  </span>
                  <p className="text-xs font-semibold text-white truncate">
                    {pentesterSnapshot.name || 'Auditor'}
                  </p>
                  <p className="text-[11px] font-mono text-slate-400 truncate">
                    {pentesterSnapshot.email || 'auditor@rovex.local'}
                  </p>
                </div>
              )}
            </div>

            {/* selos de normas tecnicas e padroes */}
            <div className="pt-4 border-t border-slate-800/80 space-y-2">
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800/90 text-slate-300 border border-slate-700/60">
                  PTES v2.0
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800/90 text-slate-300 border border-slate-700/60">
                  OWASP WSTG
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  CVSS v3.1
                </span>
              </div>
            </div>
          </div>

          {/* coluna da direita: controles e formulario do projeto */}
          <div className="p-5 sm:p-6 overflow-y-auto max-h-[90vh] flex flex-col justify-between space-y-5">
            <div>
              <DialogHeader className="pb-3 border-b border-border/60">
                <DialogTitle className="text-lg sm:text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  {L.title}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  {L.description}
                </DialogDescription>
              </DialogHeader>

              <form id="new-project-form" onSubmit={handleSubmit} className="space-y-4 pt-4">
                {/* secao 1: blueprint e escopo inicial */}
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* seletor de tipo de projeto: Pentest x Writeup */}
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="text-xs text-muted-foreground">
                        {L.projectType}
                      </Label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setProjectType('pentest')}
                          className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                            projectType === 'pentest'
                              ? 'border-primary bg-primary/10 text-primary font-semibold shadow-xs'
                              : 'border-border/70 hover:bg-muted/40 text-muted-foreground'
                          }`}
                        >
                          <ShieldCheck className="h-4 w-4" />
                          <span>{L.professionalPentest}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setProjectType('writeup')}
                          className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                            projectType === 'writeup'
                              ? 'border-amber-500 bg-amber-500/10 text-amber-500 font-semibold shadow-xs'
                              : 'border-border/70 hover:bg-muted/40 text-muted-foreground'
                          }`}
                        >
                          <FileText className="h-4 w-4" />
                          <span>{L.writeupLab}</span>
                        </button>
                      </div>
                    </div>

                    {/* seletor de template */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">{L.importTemplate}</Label>
                      <Combobox
                        options={projectTemplates.map((template) => ({
                          value: template.id,
                          label: getTemplateLocalizedName(template, uiLanguage),
                        }))}
                        selectedValue={templateId || ''}
                        onSelect={handleTemplateChange}
                        placeholder={L.selectTemplate}
                        searchPlaceholder={L.searchBlueprints}
                        className="h-9 w-full justify-between rounded-lg border border-border/70 bg-background/80 px-3 text-xs font-normal"
                      />
                    </div>

                    {/* seletor rapido de idioma com botoes em linha */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">{L.languageLabel}</Label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {(['pt-br', 'en', 'es'] as const).map((lang) => (
                          <button
                            key={lang}
                            type="button"
                            onClick={() => setProjectLanguage(lang)}
                            className={`py-1.5 rounded-lg border text-xs font-medium transition-all ${
                              projectLanguage === lang
                                ? 'border-primary bg-primary/10 text-primary font-semibold shadow-xs'
                                : 'border-border/70 hover:bg-muted/40 text-muted-foreground'
                            }`}
                          >
                            {lang === 'pt-br' ? 'PT-BR' : lang === 'en' ? 'EN' : 'ES'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Project Name & Icon */}
                  <div className="grid grid-cols-1 sm:grid-cols-[1fr_130px] gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="name" className="text-xs text-muted-foreground">
                        {L.projectNameLabel} *
                      </Label>
                      <Input
                        id="name"
                        placeholder={L.projectNamePlaceholder}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className={cn(
                          'h-9 text-xs bg-background/80 rounded-lg border-border/70',
                          errors.name && 'border-destructive'
                        )}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="icon" className="text-xs text-muted-foreground">
                        {L.iconLabel}
                      </Label>
                      <Select onValueChange={setIcon} value={icon}>
                        <SelectTrigger id="icon" className="h-9 text-xs bg-background/80 rounded-lg border-border/70">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {projectIconOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <ProjectIconSelectItem value={option.value} label={option.label} />
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* SECTION 2: Target Organization & Timeline */}
                <div className="space-y-3 pt-3 border-t border-border/60">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Target Organization */}
                    <div className="space-y-1.5">
                      <Label htmlFor="client" className="text-xs text-muted-foreground">
                        {L.targetLabel} *
                      </Label>
                      <Dialog open={isClientDialogOpen} onOpenChange={setIsClientDialogOpen}>
                        <Select onValueChange={setClientId} value={clientId} required>
                          <SelectTrigger
                            id="client"
                            className={cn(
                              'h-9 text-xs bg-background/80 rounded-lg border-border/70',
                              errors.clientId && 'border-destructive'
                            )}
                          >
                            <SelectValue placeholder={L.selectTarget} />
                          </SelectTrigger>
                          <SelectContent>
                            {clients.map((client) => (
                              <SelectItem key={client.id} value={client.id}>
                                {client.name}
                              </SelectItem>
                            ))}
                            <DialogTrigger asChild>
                              <Button variant="ghost" className="w-full justify-start mt-1 text-xs h-8">
                                <PlusCircle className="mr-2 h-3.5 w-3.5 text-primary" />
                                {L.createNewTarget}
                              </Button>
                            </DialogTrigger>
                          </SelectContent>
                        </Select>

                        {/* Modal to Register New Target */}
                        <DialogContent className="max-w-md rounded-2xl bg-card border border-border/80">
                          <DialogHeader>
                            <DialogTitle className="text-base font-bold">{L.newTargetTitle}</DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground">
                              {L.newTargetDescription}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-3 py-2">
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">{L.nameLabel}</Label>
                              <Input
                                placeholder={L.namePlaceholder}
                                value={newClientName}
                                onChange={(e) => setNewClientName(e.target.value)}
                                className="h-9 text-xs"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">{L.contactLabel}</Label>
                              <Input
                                placeholder={L.contactPlaceholder}
                                value={newClientContact}
                                onChange={(e) => setNewClientContact(e.target.value)}
                                className="h-9 text-xs"
                              />
                            </div>
                            <div className="space-y-1 pt-1">
                              <Label className="text-xs text-muted-foreground">{L.logoSquareLabel}</Label>
                              <ImageUploadButton
                                value={newClientLogo}
                                onChange={(dataUrl) => setNewClientLogo(dataUrl || null)}
                                aspect={1}
                                cropShape="rect"
                                previewClassName="h-14 w-14"
                                cropTitle={L.logoSquareLabel}
                                outputSize={512}
                              />
                            </div>
                          </div>
                          <DialogFooter className="pt-2">
                            <Button size="sm" onClick={handleCreateClient} type="button" className="text-xs">
                              {L.saveTarget}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>

                    {/* Timeline Date Picker */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">{L.datesLabel} *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            id="date"
                            variant="outline"
                            className={cn(
                              'w-full justify-start text-left font-normal h-9 text-xs rounded-lg border-border/70 bg-background/80',
                              !date && 'text-muted-foreground',
                              errors.date && 'border-destructive'
                            )}
                          >
                            <CalendarIcon className="mr-2 h-3.5 w-3.5 text-primary" />
                            {date?.from ? (
                              date.to ? (
                                <>
                                  {format(date.from, 'dd/MM/yyyy')} - {format(date.to, 'dd/MM/yyyy')}
                                </>
                              ) : (
                                format(date.from, 'dd/MM/yyyy')
                              )
                            ) : (
                              <span>{L.timelineEmpty}</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={date?.from}
                            selected={date}
                            onSelect={setDate}
                            numberOfMonths={2}
                            locale={uiLanguage === 'pt-br' ? ptBR : uiLanguage === 'es' ? es : undefined}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>

                {/* SECTION 3: Auditor Credentials Snapshot */}
                <div className="pt-3 border-t border-border/60">
                  <PentesterDataFields
                    include={includePentester}
                    onIncludeChange={setIncludePentester}
                    snapshot={pentesterSnapshot}
                    onSnapshotChange={setPentesterSnapshot}
                  />
                </div>
              </form>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-border/60 flex items-center justify-between gap-3">
              <span className="text-[11px] text-muted-foreground hidden sm:inline">
                {L.requiredFieldsNote}
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  type="button"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                  className="h-9 text-xs px-4 rounded-lg border-border/70"
                >
                  {L.cancel}
                </Button>
                <Button
                  type="submit"
                  form="new-project-form"
                  size="sm"
                  className="h-9 text-xs px-5 rounded-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs flex items-center gap-1.5"
                >
                  {L.createProject}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
