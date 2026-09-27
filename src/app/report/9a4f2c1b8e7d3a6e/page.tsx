'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Plus,
  Search,
  CheckCircle,
  Clock,
  ChevronRight,
  FolderOpen,
  Crosshair,
  AlertTriangle,
  FileText,
  Calendar,
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  ArrowRight,
  ShieldHalf,
  Terminal,
  User,
} from '@/components/icons';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/context/language-context';
import type { Project } from '@/lib/types';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useData } from '@/context/data-context';
import { ProjectIcon, projectIconComponents } from '@/components/project-icon';
import { NewProjectDialog } from '@/components/new-project-dialog';
import { getProjectStatusLabel } from '@/lib/project-status';
import { cn } from '@/lib/utils';

// Gera identificador numerico estavel para exibicao visual tatica
function getProjectNumber(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  const num = (Math.abs(hash) % 90000) + 10000;
  return `PRJ-${num}`;
}

// Extrai resumo executivo textual limpo do reportBody
function extractOverview(reportBody?: string): string {
  if (!reportBody) return 'Nenhum sumário executivo cadastrado para este projeto.';
  const clean = reportBody
    .replace(/!\[.*?\]\(.*?\)/g, '') // remove imagens markdown
    .replace(/\{%.*?%\}/g, '') // remove tags de template
    .replace(/#+\s+.*?\n/g, '') // remove headers
    .replace(/```[\s\S]*?```/g, '') // remove blocos de codigo
    .replace(/`.*?`/g, '') // remove inline code
    .replace(/\[.*?\]\(.*?\)/g, '$1') // mantem apenas texto do link
    .trim();

  const paragraphs = clean.split('\n\n').map(p => p.trim()).filter(p => p.length > 25);
  const first = paragraphs[0] || clean;
  return first.length > 230 ? `${first.slice(0, 230).trim()}...` : first;
}

export default function ProjectsPage() {
  const { language, currentLocale } = useLanguage();
  const { toast } = useToast();
  const router = useRouter();
  const { projects, clients, findings, deleteProject, duplicateProject } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusTab, setStatusTab] = useState<'all' | 'in_progress' | 'completed'>('all');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [newProjectOpen, setNewProjectOpen] = useState(false);

  const getStatus = (status: string) => getProjectStatusLabel(status, currentLocale);

  // Enriquece projetos com cliente e contagem de achados
  const enrichedProjects = useMemo(() => {
    return projects.map((p) => {
      const client = clients.find((c) => c.id === p.clientId);
      const projectFindings = findings.filter((f) => f.projectId === p.id);
      return {
        ...p,
        type: p.type || (p.id.includes('writeup') || p.id === 'proj-htb-haze' ? 'writeup' : 'pentest'),
        clientName: client?.name || 'Cliente Geral',
        projectNumber: getProjectNumber(p.id),
        findingsCount: projectFindings.length,
      };
    });
  }, [projects, clients, findings]);

  // Contagens para as abas superiores
  const counts = useMemo(() => {
    const total = enrichedProjects.length;
    const inProgress = enrichedProjects.filter((p) => p.status === 'In Progress').length;
    const completed = enrichedProjects.filter((p) => p.status === 'Completed').length;
    return { all: total, inProgress, completed };
  }, [enrichedProjects]);

  // Filtragem de projetos
  const filteredProjects = useMemo(() => {
    return enrichedProjects.filter((project) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        project.name.toLowerCase().includes(q) ||
        project.clientName.toLowerCase().includes(q) ||
        project.projectNumber.toLowerCase().includes(q) ||
        project.id.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (statusTab === 'in_progress') return project.status === 'In Progress';
      if (statusTab === 'completed') return project.status === 'Completed';
      return true;
    });
  }, [enrichedProjects, searchTerm, statusTab]);

  // Mantem selecao sincronizada com a lista filtrada
  useEffect(() => {
    if (filteredProjects.length === 0) {
      setSelectedProjectId('');
      return;
    }
    const currentStillExists = filteredProjects.some((p) => p.id === selectedProjectId);
    if (!currentStillExists) {
      setSelectedProjectId(filteredProjects[0].id);
    }
  }, [filteredProjects, selectedProjectId]);

  // Projeto atualmente em foco no inspector
  const activeProject = useMemo(() => {
    return enrichedProjects.find((p) => p.id === selectedProjectId) || filteredProjects[0];
  }, [enrichedProjects, filteredProjects, selectedProjectId]);

  const handleDeleteProject = () => {
    if (!projectToDelete) return;
    deleteProject(projectToDelete.id);
    toast({
      title:
        currentLocale === 'pt-br'
          ? 'Projeto Excluído'
          : currentLocale === 'es'
          ? 'Proyecto Eliminado'
          : 'Project Deleted',
    });
    setProjectToDelete(null);
  };

  const handleDuplicateProject = (projectId: string) => {
    duplicateProject(projectId);
    toast({
      title:
        currentLocale === 'pt-br'
          ? 'Projeto Duplicado'
          : currentLocale === 'es'
          ? 'Proyecto Duplicado'
          : 'Project Duplicated',
    });
  };

  const formatDateDisplay = (dateString?: string) => {
    if (!dateString) return '—';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString;
      return d.toLocaleDateString(
        currentLocale === 'pt-br' ? 'pt-BR' : currentLocale === 'es' ? 'es-ES' : 'en-US',
        {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }
      );
    } catch {
      return dateString;
    }
  };

  const dictMap = {
    en: {
      title: 'Project Explorer',
      allProjects: 'All Projects',
      inProgress: 'In Progress',
      completed: 'Completed',
      searchPlaceholder: 'Search projects or clients...',
      newProject: 'New Project',
      targets: 'TARGETS',
      risks: 'RISKS',
      evidences: 'EVIDENCES',
      report: 'REPORT',
      targetDate: 'TARGET DATE',
      progress: 'Progress',
      recon: 'Recon',
      scanning: 'Scanning',
      exploitation: 'Exploitation',
      reportPhase: 'Report',
      projectDetails: 'Project Details',
      client: 'Client',
      type: 'Type',
      typePentest: 'Professional Pentest',
      typeWriteup: 'Writeup / CTF Lab',
      created: 'Created',
      lastUpdate: 'Last Update',
      overview: 'Overview',
      viewFullReport: 'View full report',
      openProject: 'Open project',
      openInEditor: 'Open in Editor',
      viewReportMenu: 'View Report',
      duplicateProjectMenu: 'Duplicate Project',
      ready: 'Ready',
      draft: 'Draft',
      emptyList: 'No projects found.',
      deleteConfirmTitle: 'Delete this project?',
      deleteConfirmDesc: 'This action will permanently delete the project and all its findings.',
      cancel: 'Cancel',
      delete: 'Delete',
    },
    'pt-br': {
      title: 'Project Explorer',
      allProjects: 'Todos os Projetos',
      inProgress: 'Em Andamento',
      completed: 'Concluídos',
      searchPlaceholder: 'Buscar projetos ou clientes...',
      newProject: 'Novo Projeto',
      targets: 'ALVOS',
      risks: 'VULNERABILIDADES',
      evidences: 'EVIDÊNCIAS',
      report: 'RELATÓRIO',
      targetDate: 'DATA ENTREGA',
      progress: 'Progresso',
      recon: 'Recon',
      scanning: 'Scanning',
      exploitation: 'Exploitation',
      reportPhase: 'Relatório',
      projectDetails: 'Detalhes do Projeto',
      client: 'Cliente',
      type: 'Tipo',
      typePentest: 'Pentest Profissional',
      typeWriteup: 'Writeup / CTF Lab',
      created: 'Criado em',
      lastUpdate: 'Última Atualização',
      overview: 'Visão Geral',
      viewFullReport: 'Ver relatório completo',
      openProject: 'Abrir projeto',
      openInEditor: 'Abrir no Editor',
      viewReportMenu: 'Ver Relatório',
      duplicateProjectMenu: 'Duplicar Projeto',
      ready: 'Pronto',
      draft: 'Rascunho',
      emptyList: 'Nenhum projeto encontrado.',
      deleteConfirmTitle: 'Excluir este projeto?',
      deleteConfirmDesc: 'Esta ação removerá permanentemente o projeto e todos os seus achados.',
      cancel: 'Cancelar',
      delete: 'Excluir',
    },
    es: {
      title: 'Project Explorer',
      allProjects: 'Todos los Proyectos',
      inProgress: 'En Progreso',
      completed: 'Completados',
      searchPlaceholder: 'Buscar proyectos o clientes...',
      newProject: 'Nuevo Proyecto',
      targets: 'OBJETIVOS',
      risks: 'VULNERABILIDADES',
      evidences: 'EVIDENCIAS',
      report: 'INFORME',
      targetDate: 'FECHA ENTREGA',
      progress: 'Progreso',
      recon: 'Reconocimiento',
      scanning: 'Escaneo',
      exploitation: 'Explotación',
      reportPhase: 'Informe',
      projectDetails: 'Detalles del Proyecto',
      client: 'Cliente',
      type: 'Tipo',
      typePentest: 'Pentest Profesional',
      typeWriteup: 'Writeup / CTF Lab',
      created: 'Creado el',
      lastUpdate: 'Última Actualización',
      overview: 'Resumen General',
      viewFullReport: 'Ver informe completo',
      openProject: 'Abrir proyecto',
      openInEditor: 'Abrir en Editor',
      viewReportMenu: 'Ver Informe',
      duplicateProjectMenu: 'Duplicar Proyecto',
      ready: 'Listo',
      draft: 'Borrador',
      emptyList: 'Ningún proyecto encontrado.',
      deleteConfirmTitle: '¿Eliminar este proyecto?',
      deleteConfirmDesc: 'Esta acción eliminará permanentemente el proyecto y todos sus hallazgos.',
      cancel: 'Cancelar',
      delete: 'Eliminar',
    },
  };

  const dict = dictMap[currentLocale] || dictMap.en;

  return (
    <>
      <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-[1720px] mx-auto">
        {/* Cabecalho superior: Titulo Project Explorer + Abas + Busca + Botao New Project */}
        <div className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100">
              {dict.title}
            </h1>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  type="search"
                  placeholder={dict.searchPlaceholder}
                  className="w-full sm:w-[260px] lg:w-[320px] pl-9 h-9 rounded-lg bg-zinc-950/60 border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-emerald-600/50"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Button
                onClick={() => setNewProjectOpen(true)}
                className="h-9 px-4 rounded-lg font-medium text-sm gap-1.5 shadow-sm bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
              >
                <Plus className="h-4 w-4" weight="bold" />
                <span>{dict.newProject}</span>
              </Button>
            </div>
          </div>

          {/* Abas horizontais com contadores minimalistas */}
          <div className="flex items-center gap-6 border-b border-zinc-800/80 pb-2">
            <button
              onClick={() => setStatusTab('all')}
              className={cn(
                'group relative flex items-center gap-2 pb-2 text-sm font-medium transition-colors',
                statusTab === 'all'
                  ? 'text-zinc-100'
                  : 'text-zinc-400 hover:text-zinc-200'
              )}
            >
              <span>{dict.allProjects}</span>
              <span
                className={cn(
                  'px-2 py-0.5 rounded-full text-xs font-semibold transition-colors',
                  statusTab === 'all'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-zinc-800/80 text-zinc-400 group-hover:bg-zinc-800'
                )}
              >
                {counts.all}
              </span>
              {statusTab === 'all' && (
                <span className="absolute bottom-[-9px] left-0 right-0 h-[2px] bg-emerald-500 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setStatusTab('in_progress')}
              className={cn(
                'group relative flex items-center gap-2 pb-2 text-sm font-medium transition-colors',
                statusTab === 'in_progress'
                  ? 'text-zinc-100'
                  : 'text-zinc-400 hover:text-zinc-200'
              )}
            >
              <span>{dict.inProgress}</span>
              <span
                className={cn(
                  'px-2 py-0.5 rounded-full text-xs font-semibold transition-colors',
                  statusTab === 'in_progress'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-zinc-800/80 text-zinc-400 group-hover:bg-zinc-800'
                )}
              >
                {counts.inProgress}
              </span>
              {statusTab === 'in_progress' && (
                <span className="absolute bottom-[-9px] left-0 right-0 h-[2px] bg-emerald-500 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setStatusTab('completed')}
              className={cn(
                'group relative flex items-center gap-2 pb-2 text-sm font-medium transition-colors',
                statusTab === 'completed'
                  ? 'text-zinc-100'
                  : 'text-zinc-400 hover:text-zinc-200'
              )}
            >
              <span>{dict.completed}</span>
              <span
                className={cn(
                  'px-2 py-0.5 rounded-full text-xs font-semibold transition-colors',
                  statusTab === 'completed'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-zinc-800/80 text-zinc-400 group-hover:bg-zinc-800'
                )}
              >
                {counts.completed}
              </span>
              {statusTab === 'completed' && (
                <span className="absolute bottom-[-9px] left-0 right-0 h-[2px] bg-emerald-500 rounded-full" />
              )}
            </button>
          </div>
        </div>

        {/* Layout Master-Detail: Coluna Esquerda (Lista) + Coluna Direita (Contextual Inspector) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* COLUNA ESQUERDA: Lista Vertical de Projetos */}
          <div className="lg:col-span-5 xl:col-span-5 space-y-2">
            <Card className="bg-zinc-950/40 border border-zinc-800/80 rounded-2xl overflow-hidden p-2 sm:p-2.5">
              <CardContent className="p-0 space-y-1.5">
                {filteredProjects.length === 0 ? (
                  <div className="text-center py-16 px-4 text-zinc-500 text-sm">
                    {dict.emptyList}
                  </div>
                ) : (
                  filteredProjects.map((project) => {
                    const isSelected = activeProject?.id === project.id;
                    const Icon = projectIconComponents[project.icon] || ProjectIcon;
                    const isCompleted = project.status === 'Completed';

                    return (
                      <div
                        key={project.id}
                        onClick={() => setSelectedProjectId(project.id)}
                        className={cn(
                          'group relative flex items-center gap-3.5 p-3.5 rounded-xl cursor-pointer transition-all border text-left',
                          isSelected
                            ? 'bg-zinc-900/90 border-zinc-700/80 border-l-[3px] border-l-emerald-500 shadow-sm'
                            : 'bg-zinc-900/30 hover:bg-zinc-900/60 border-zinc-800/50 border-l-[3px] border-l-transparent'
                        )}
                      >
                        {/* Icone quadrado minimalista */}
                        <div
                          className={cn(
                            'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-colors',
                            isSelected
                              ? 'bg-zinc-900 border-zinc-700 text-emerald-400'
                              : 'bg-zinc-950/70 border-zinc-800/80 text-zinc-400 group-hover:text-zinc-200'
                          )}
                        >
                          <Icon className="h-5 w-5" />
                        </div>

                        {/* Bloco Central de Textos */}
                        <div className="flex-1 min-w-0 pr-2">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-mono text-[11px] text-emerald-500/80 tracking-wide font-medium">
                              {project.projectNumber}
                            </span>
                            <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400 border border-zinc-800 px-1.5 py-0.2 rounded">
                              {project.type}
                            </span>
                          </div>
                          <div className="font-semibold text-sm text-zinc-100 truncate group-hover:text-white">
                            {project.name}
                          </div>
                          <div className="text-xs text-zinc-400 truncate">
                            {project.clientName}
                          </div>
                        </div>

                        {/* Bloco Direito: Status Badge, Data e Seta */}
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right flex flex-col items-end gap-1">
                            <span
                              className={cn(
                                'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border',
                                isCompleted
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                                  : 'bg-amber-500/10 text-amber-400 border-amber-500/25'
                              )}
                            >
                              <span
                                className={cn(
                                  'w-1.5 h-1.5 rounded-full',
                                  isCompleted ? 'bg-emerald-400' : 'bg-amber-400'
                                )}
                              />
                              {getStatus(project.status)}
                            </span>
                            <span className="text-[11px] text-zinc-400 font-mono">
                              {formatDateDisplay(project.endDate)}
                            </span>
                          </div>

                          <ChevronRight
                            className={cn(
                              'h-4 w-4 transition-transform',
                              isSelected
                                ? 'text-zinc-200 translate-x-0.5'
                                : 'text-zinc-400 group-hover:text-zinc-200'
                            )}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>

          {/* COLUNA DIREITA: Contextual Inspector (Detalhes Taticos do Projeto) */}
          <div className="lg:col-span-7 xl:col-span-7">
            {activeProject ? (
              <Card className="bg-zinc-950/40 border border-zinc-800/80 rounded-2xl overflow-hidden p-6 sm:p-7 space-y-6">
                {/* Header do Inspector: Icone, Titulo, Status e Menu de Acoes */}
                <div className="flex items-start justify-between gap-4 border-b border-zinc-800/80 pb-5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-700/80 flex items-center justify-center shrink-0 text-emerald-400 shadow-sm">
                      {React.createElement(
                        projectIconComponents[activeProject.icon] || ProjectIcon,
                        { className: 'h-6 w-6' }
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-emerald-500/90 font-medium">
                          {activeProject.projectNumber}
                        </span>
                        <span className="text-[11px] font-mono text-zinc-400">
                          {activeProject.id}
                        </span>
                      </div>
                      <h2 className="text-xl font-bold text-zinc-100 tracking-tight mt-0.5">
                        {activeProject.name}
                      </h2>
                      <p className="text-sm text-zinc-400">
                        {activeProject.clientName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border',
                        activeProject.status === 'Completed'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/25'
                      )}
                    >
                      <span
                        className={cn(
                          'w-1.5 h-1.5 rounded-full',
                          activeProject.status === 'Completed' ? 'bg-emerald-400' : 'bg-amber-400'
                        )}
                      />
                      {getStatus(activeProject.status)}
                    </span>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-zinc-950 border-zinc-800">
                        <DropdownMenuItem
                          onClick={() => router.push(`/report/9a4f2c1b8e7d3a6e/${activeProject.id}`)}
                          className="gap-2 cursor-pointer text-zinc-200"
                        >
                          <Edit className="h-4 w-4" />
                          <span>{dict.openInEditor}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => router.push(`/report/9a4f2c1b8e7d3a6e/${activeProject.id}/report`)}
                          className="gap-2 cursor-pointer text-zinc-200"
                        >
                          <FileText className="h-4 w-4" />
                          <span>{dict.viewReportMenu}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDuplicateProject(activeProject.id)}
                          className="gap-2 cursor-pointer text-zinc-200"
                        >
                          <Copy className="h-4 w-4" />
                          <span>{dict.duplicateProjectMenu}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setProjectToDelete(activeProject)}
                          className="gap-2 cursor-pointer text-rose-400 focus:text-rose-400 focus:bg-rose-950/20"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>{dict.delete}</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Grid com 5 Tiles de Metricas Operacionais */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {/* TARGETS */}
                  <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3 flex flex-col justify-between">
                    <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] font-semibold uppercase tracking-wider">
                      <Crosshair className="h-3.5 w-3.5 text-zinc-400" />
                      <span>{dict.targets}</span>
                    </div>
                    <div className="text-xl font-bold font-mono text-zinc-100 mt-2">
                      01
                    </div>
                  </div>

                  {/* RISKS */}
                  <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3 flex flex-col justify-between">
                    <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] font-semibold uppercase tracking-wider">
                      <AlertTriangle className="h-3.5 w-3.5 text-zinc-400" />
                      <span>{dict.risks}</span>
                    </div>
                    <div className="text-xl font-bold font-mono text-zinc-100 mt-2">
                      {activeProject.findingsCount.toString().padStart(2, '0')}
                    </div>
                  </div>

                  {/* EVIDENCES */}
                  <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3 flex flex-col justify-between">
                    <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] font-semibold uppercase tracking-wider">
                      <FileText className="h-3.5 w-3.5 text-zinc-400" />
                      <span>{dict.evidences}</span>
                    </div>
                    <div className="text-xl font-bold font-mono text-zinc-100 mt-2">
                      {activeProject.findingsCount.toString().padStart(2, '0')}
                    </div>
                  </div>

                  {/* REPORT */}
                  <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3 flex flex-col justify-between">
                    <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] font-semibold uppercase tracking-wider">
                      <FileText className="h-3.5 w-3.5 text-zinc-400" />
                      <span>{dict.report}</span>
                    </div>
                    <div className="mt-2">
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {activeProject.status === 'Completed' ? dict.ready : dict.draft}
                      </span>
                    </div>
                  </div>

                  {/* TARGET DATE */}
                  <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3 flex flex-col justify-between col-span-2 sm:col-span-1">
                    <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] font-semibold uppercase tracking-wider">
                      <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                      <span>{dict.targetDate}</span>
                    </div>
                    <div className="text-xs font-mono text-zinc-200 mt-2 font-medium">
                      {formatDateDisplay(activeProject.endDate)}
                    </div>
                  </div>
                </div>

                {/* Lifecycle Progress Bar */}
                <div className="space-y-3 pt-2">
                  <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    {dict.progress}
                  </div>
                  <div className="relative flex items-center justify-between">
                    {/* Linha de fundo */}
                    <div className="absolute left-3 right-3 top-1/2 -translate-y-1/2 h-[2px] bg-zinc-800 z-0" />
                    {/* Linha preenchida com base no status */}
                    <div
                      className={cn(
                        'absolute left-3 top-1/2 -translate-y-1/2 h-[2px] bg-emerald-600/80 z-0 transition-all duration-500',
                        activeProject.status === 'Completed' ? 'right-3' : 'right-1/3'
                      )}
                    />

                    {/* Step 1: Recon */}
                    <div className="relative z-10 flex flex-col items-center gap-1.5">
                      <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs shadow-sm">
                        <CheckCircle className="h-4 w-4" weight="bold" />
                      </div>
                      <span className="text-[11px] font-medium text-zinc-300">{dict.recon}</span>
                    </div>

                    {/* Step 2: Scanning */}
                    <div className="relative z-10 flex flex-col items-center gap-1.5">
                      <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs shadow-sm">
                        <CheckCircle className="h-4 w-4" weight="bold" />
                      </div>
                      <span className="text-[11px] font-medium text-zinc-300">{dict.scanning}</span>
                    </div>

                    {/* Step 3: Exploitation */}
                    <div className="relative z-10 flex flex-col items-center gap-1.5">
                      <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs shadow-sm">
                        <CheckCircle className="h-4 w-4" weight="bold" />
                      </div>
                      <span className="text-[11px] font-medium text-zinc-300">{dict.exploitation}</span>
                    </div>

                    {/* Step 4: Report */}
                    <div className="relative z-10 flex flex-col items-center gap-1.5">
                      <div
                        className={cn(
                          'w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-sm border transition-colors',
                          activeProject.status === 'Completed'
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'bg-zinc-900 border-zinc-700 text-zinc-400'
                        )}
                      >
                        {activeProject.status === 'Completed' ? (
                          <CheckCircle className="h-4 w-4" weight="bold" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-zinc-600" />
                        )}
                      </div>
                      <span
                        className={cn(
                          'text-[11px] font-medium',
                          activeProject.status === 'Completed' ? 'text-zinc-300' : 'text-zinc-500'
                        )}
                      >
                        {dict.reportPhase}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Project Details & Overview */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2 border-t border-zinc-800/80">
                  {/* Metadados */}
                  <div className="md:col-span-5 space-y-3">
                    <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                      {dict.projectDetails}
                    </div>

                    <div className="space-y-2.5 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-zinc-400 flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5" />
                          {dict.client}
                        </span>
                        <span className="font-medium text-zinc-200 truncate text-right">
                          {activeProject.clientName}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <span className="text-zinc-400 flex items-center gap-1.5">
                          {activeProject.type === 'writeup' ? (
                            <Terminal className="h-3.5 w-3.5" />
                          ) : (
                            <ShieldHalf className="h-3.5 w-3.5" />
                          )}
                          {dict.type}
                        </span>
                        <span className="font-medium text-zinc-200">
                          {activeProject.type === 'writeup' ? dict.typeWriteup : dict.typePentest}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <span className="text-zinc-400 flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {dict.created}
                        </span>
                        <span className="font-mono text-zinc-300">
                          {formatDateDisplay(activeProject.createdAt)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <span className="text-zinc-400 flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          {dict.lastUpdate}
                        </span>
                        <span className="font-mono text-zinc-300">
                          {formatDateDisplay(activeProject.updatedAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Overview textual */}
                  <div className="md:col-span-7 space-y-2 border-t md:border-t-0 md:border-l border-zinc-800/80 md:pl-6 pt-4 md:pt-0">
                    <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      {dict.overview}
                    </div>
                    <p className="text-xs leading-relaxed text-zinc-400">
                      {extractOverview(activeProject.reportBody)}
                    </p>
                    <div className="pt-2">
                      <Link
                        href={`/report/9a4f2c1b8e7d3a6e/${activeProject.id}/report`}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors group"
                      >
                        <span>{dict.viewFullReport}</span>
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Barra de Acoes Inferior */}
                <div className="flex items-center gap-3 pt-3 border-t border-zinc-800/80">
                  <Button
                    onClick={() => router.push(`/report/9a4f2c1b8e7d3a6e/${activeProject.id}`)}
                    className="flex-1 h-10 px-4 rounded-xl font-medium text-sm gap-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 border border-zinc-700/80 shadow-sm transition-colors group"
                  >
                    <FolderOpen className="h-4 w-4 text-emerald-400" />
                    <span>{dict.openProject}</span>
                    <ArrowRight className="h-4 w-4 ml-auto text-zinc-400 group-hover:text-zinc-200 transition-transform group-hover:translate-x-0.5" />
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => router.push(`/report/9a4f2c1b8e7d3a6e/${activeProject.id}`)}
                    className="h-10 w-10 rounded-xl bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
                    title={currentLocale === 'pt-br' ? 'Editar' : 'Edit'}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDuplicateProject(activeProject.id)}
                    className="h-10 w-10 rounded-xl bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
                    title={currentLocale === 'pt-br' ? 'Duplicar' : 'Duplicate'}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setProjectToDelete(activeProject)}
                    className="h-10 w-10 rounded-xl bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-rose-400 hover:bg-rose-950/20 transition-colors"
                    title={dict.delete}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ) : null}
          </div>
        </div>
      </div>

      {/* Modal de Criacao de Projeto */}
      <NewProjectDialog open={newProjectOpen} onOpenChange={setNewProjectOpen} />

      {/* Alerta de Confirmacao de Exclusao */}
      <AlertDialog open={!!projectToDelete} onOpenChange={(open) => !open && setProjectToDelete(null)}>
        <AlertDialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-zinc-100">
              {dict.deleteConfirmTitle}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              {dict.deleteConfirmDesc}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white">
              {dict.cancel}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProject}
              className="bg-rose-600 hover:bg-rose-700 text-white font-medium"
            >
              {dict.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
