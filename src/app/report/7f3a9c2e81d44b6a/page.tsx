'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Plus,
  Search,
  ChevronRight,
  Edit,
  Trash2,
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  Crosshair,
  AlertTriangle,
  FileText,
  User,
  ExternalLink,
  FolderOpen,
  Terminal,
  MoreVertical,
  Building,
} from '@/components/icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/context/language-context';
import type { Client, Project } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
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
import { useData } from '@/context/data-context';
import { ImageUploadButton } from '@/components/image-upload-button';
import { NewProjectDialog } from '@/components/new-project-dialog';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { getProjectStatusLabel } from '@/lib/project-status';

// Paleta tatica sobria para avatares (zero neon)
const AVATAR_PALETTE = [
  'bg-zinc-800 text-zinc-200 border-zinc-700',
  'bg-emerald-950/60 text-emerald-300 border-emerald-800/40',
  'bg-sky-950/60 text-sky-300 border-sky-800/40',
  'bg-amber-950/60 text-amber-300 border-amber-800/40',
  'bg-indigo-950/60 text-indigo-300 border-indigo-800/40',
  'bg-slate-800 text-slate-200 border-slate-700',
];

function getClientNumber(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  const num = (Math.abs(hash) % 90000) + 10000;
  return `TGT-${num}`;
}

function getAvatarColorClass(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[idx];
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getClientPeriod(client: Client): 'Weekly' | 'Monthly' | 'Yearly' {
  if (client.period) return client.period;
  const mod = (client.id.charCodeAt(0) || 0) % 3;
  if (mod === 0) return 'Weekly';
  if (mod === 1) return 'Monthly';
  return 'Yearly';
}

export default function TargetsPage() {
  const { currentLocale } = useLanguage();
  const { toast } = useToast();
  const router = useRouter();
  const { clients, projects, findings, addClient, updateClient, deleteClient } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'weekly' | 'monthly' | 'yearly'>('all');
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [newProjectOpen, setNewProjectOpen] = useState(false);

  // Estados do modal de criacao
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientContact, setNewClientContact] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientPeriod, setNewClientPeriod] = useState<'Weekly' | 'Monthly' | 'Yearly'>('Monthly');
  const [newClientLogo, setNewClientLogo] = useState<string | null>(null);
  const [newClientLogoWide, setNewClientLogoWide] = useState<string | null>(null);

  // Estados do modal de edicao
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editClientName, setEditClientName] = useState('');
  const [editClientContact, setEditClientContact] = useState('');
  const [editClientPhone, setEditClientPhone] = useState('');
  const [editClientPeriod, setEditClientPeriod] = useState<'Weekly' | 'Monthly' | 'Yearly'>('Monthly');
  const [editClientLogo, setEditClientLogo] = useState<string | null>(null);
  const [editClientLogoWide, setEditClientLogoWide] = useState<string | null>(null);

  useEffect(() => {
    if (editingClient) {
      setEditClientName(editingClient.name);
      setEditClientContact(editingClient.contact);
      setEditClientPhone(editingClient.phone || '');
      setEditClientPeriod(editingClient.period || getClientPeriod(editingClient));
      setEditClientLogo(editingClient.logoUrl || null);
      setEditClientLogoWide(editingClient.logoWide || null);
    }
  }, [editingClient]);

  // Enriquece alvos com projetos vinculados e contagem de riscos
  const enrichedTargets = useMemo(() => {
    return clients.map((c) => {
      const targetProjects = projects.filter((p) => p.clientId === c.id);
      const targetProjectIds = new Set(targetProjects.map((p) => p.id));
      const targetFindings = findings.filter((f) => targetProjectIds.has(f.projectId));
      const criticalCount = targetFindings.filter((f) => f.severity === 'Critical').length;
      const period = getClientPeriod(c);

      return {
        ...c,
        period,
        clientNumber: getClientNumber(c.id),
        projects: targetProjects,
        projectsCount: targetProjects.length,
        findingsCount: targetFindings.length,
        criticalCount,
      };
    });
  }, [clients, projects, findings]);

  // Contagens para as abas
  const counts = useMemo(() => {
    const total = enrichedTargets.length;
    const weekly = enrichedTargets.filter((t) => t.period === 'Weekly').length;
    const monthly = enrichedTargets.filter((t) => t.period === 'Monthly').length;
    const yearly = enrichedTargets.filter((t) => t.period === 'Yearly').length;
    return { all: total, weekly, monthly, yearly };
  }, [enrichedTargets]);

  // Filtragem da lista
  const filteredTargets = useMemo(() => {
    return enrichedTargets.filter((t) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.contact.toLowerCase().includes(q) ||
        (t.phone && t.phone.toLowerCase().includes(q)) ||
        t.clientNumber.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (activeTab === 'weekly') return t.period === 'Weekly';
      if (activeTab === 'monthly') return t.period === 'Monthly';
      if (activeTab === 'yearly') return t.period === 'Yearly';
      return true;
    });
  }, [enrichedTargets, searchTerm, activeTab]);

  // Sincroniza selecao com a lista filtrada
  useEffect(() => {
    if (filteredTargets.length === 0) {
      setSelectedClientId('');
      return;
    }
    const currentStillExists = filteredTargets.some((t) => t.id === selectedClientId);
    if (!currentStillExists) {
      setSelectedClientId(filteredTargets[0].id);
    }
  }, [filteredTargets, selectedClientId]);

  // Alvo ativo inspecionado na coluna direita
  const activeTarget = useMemo(() => {
    return enrichedTargets.find((t) => t.id === selectedClientId) || filteredTargets[0];
  }, [enrichedTargets, filteredTargets, selectedClientId]);

  const dictMap = {
    en: {
      title: 'Target Recon & Scopes',
      subtitle: 'Central registry of target organizations, scopes, authorized assets, and audit cadence',
      allTargets: 'All Targets',
      monthly: 'Monthly',
      weekly: 'Weekly',
      yearly: 'Yearly',
      searchPlaceholder: 'Search targets, channels and scopes…',
      newTarget: 'New Target',
      engagements: 'ENGAGEMENTS',
      vulnerabilities: 'VULNERABILITIES',
      criticalRisks: 'CRITICAL RISKS',
      cadence: 'CADENCE',
      associatedAudits: 'Associated Engagements',
      records: 'records',
      due: 'Deadline',
      openInEditor: 'Open in Editor',
      noAuditsYet: 'No engagements recorded for this target yet.',
      createAuditForTarget: 'New Engagement for Target',
      editTarget: 'Edit Target',
      deleteTarget: 'Delete Target',
      deleteConfirmTitle: 'Delete this target?',
      deleteConfirmDesc: 'This will delete the target organization. Existing projects will be preserved.',
      cancel: 'Cancel',
      delete: 'Delete',
      emptyList: 'No targets found.',
      targetDeletedTitle: 'Target Deleted',
      targetDeletedDesc: (name: string) => `${name} was removed successfully.`,
      targetUpdatedTitle: 'Target Updated',
      targetUpdatedDesc: (name: string) => `${name} updated successfully.`,
      incompleteFieldsTitle: 'Incomplete fields',
      incompleteFieldsDesc: 'Please fill target name and contact.',
      targetRegisteredTitle: 'Target Registered',
      targetRegisteredDesc: (name: string) => `${name} registered successfully.`,
      createDialogTitle: 'Register New Target',
      createDialogDesc: 'Register a new organization or asset for audit scopes and executive reporting.',
      editDialogTitle: 'Edit Target',
      editDialogDesc: 'Update target details and communication channels.',
      targetNameLabel: 'Target / Organization *',
      targetNamePlaceholder: 'e.g., Hack The Box, Acme Corp, Alpha Bank',
      targetContactLabel: 'Technical Contact / Lead *',
      targetPhoneLabel: 'Secure Channel / Phone',
      auditCadenceLabel: 'Audit Cadence',
      logosLabel: 'Target Logos (Optional)',
      logosEditLabel: 'Target Logos',
      logoSquare: 'Square Logo',
      logoWide: 'Horizontal Logo',
      saveChanges: 'Save Changes',
      registerTargetBtn: 'Register Target',
    },
    'pt-br': {
      title: 'Target Recon & Scopes',
      subtitle: 'Base central de organizações, ativos monitorados, escopos e ciclos de auditoria',
      allTargets: 'Todos os Alvos',
      monthly: 'Mensais',
      weekly: 'Semanais',
      yearly: 'Anuais',
      searchPlaceholder: 'Buscar alvos, canais e escopos…',
      newTarget: 'Novo Alvo',
      engagements: 'AUDITORIAS',
      vulnerabilities: 'VULNERABILIDADES',
      criticalRisks: 'CRÍTICOS',
      cadence: 'CADÊNCIA',
      associatedAudits: 'Projetos e Auditorias Vinculadas',
      records: 'registros',
      due: 'Prazo',
      openInEditor: 'Abrir no Editor',
      noAuditsYet: 'Nenhuma auditoria vinculada a este alvo no momento.',
      createAuditForTarget: 'Iniciar Nova Auditoria',
      editTarget: 'Editar Alvo',
      deleteTarget: 'Excluir Alvo',
      deleteConfirmTitle: 'Excluir este alvo?',
      deleteConfirmDesc: 'Esta ação removerá o alvo. Projetos já existentes permanecerão preservados.',
      cancel: 'Cancelar',
      delete: 'Excluir',
      emptyList: 'Nenhum alvo encontrado.',
      targetDeletedTitle: 'Alvo Removido',
      targetDeletedDesc: (name: string) => `${name} foi removido com sucesso.`,
      targetUpdatedTitle: 'Alvo Atualizado',
      targetUpdatedDesc: (name: string) => `${name} atualizado com sucesso.`,
      incompleteFieldsTitle: 'Campos incompletos',
      incompleteFieldsDesc: 'Preencha o nome do alvo e o contato.',
      targetRegisteredTitle: 'Alvo Cadastrado',
      targetRegisteredDesc: (name: string) => `${name} cadastrado com sucesso.`,
      createDialogTitle: 'Cadastrar Novo Alvo',
      createDialogDesc: 'Cadastre uma nova organização ou ativo para escopo de auditorias e relatórios executivos.',
      editDialogTitle: 'Editar Alvo',
      editDialogDesc: 'Atualize as informações do alvo e canais de contato.',
      targetNameLabel: 'Alvo / Organização *',
      targetNamePlaceholder: 'ex: Hack The Box, Acme Corp, Banco Alfa',
      targetContactLabel: 'Contato Técnico / Responsável *',
      targetPhoneLabel: 'Canal Seguro / Telefone',
      auditCadenceLabel: 'Ciclo de Auditoria',
      logosLabel: 'Logotipos do Alvo (Opcional)',
      logosEditLabel: 'Logotipos do Alvo',
      logoSquare: 'Logo Quadrado',
      logoWide: 'Logo Horizontal',
      saveChanges: 'Salvar Alterações',
      registerTargetBtn: 'Cadastrar Alvo',
    },
    es: {
      title: 'Target Recon & Scopes',
      subtitle: 'Registro central de organizaciones objetivo, alcances, activos autorizados y cadencia de auditoría',
      allTargets: 'Todos los Objetivos',
      monthly: 'Mensuales',
      weekly: 'Semanales',
      yearly: 'Anuales',
      searchPlaceholder: 'Buscar objetivos, canales y alcances…',
      newTarget: 'Nuevo Objetivo',
      engagements: 'AUDITORÍAS',
      vulnerabilities: 'VULNERABILIDADES',
      criticalRisks: 'CRÍTICOS',
      cadence: 'CADENCIA',
      associatedAudits: 'Proyectos y Auditorías Vinculadas',
      records: 'registros',
      due: 'Plazo',
      openInEditor: 'Abrir en Editor',
      noAuditsYet: 'Ninguna auditoría vinculada a este objetivo por el momento.',
      createAuditForTarget: 'Nueva Auditoría para Objetivo',
      editTarget: 'Editar Objetivo',
      deleteTarget: 'Eliminar Objetivo',
      deleteConfirmTitle: '¿Eliminar este objetivo?',
      deleteConfirmDesc: 'Esta acción eliminará la organización objetivo. Los proyectos existentes permanecerán preservados.',
      cancel: 'Cancelar',
      delete: 'Eliminar',
      emptyList: 'Ningún objetivo encontrado.',
      targetDeletedTitle: 'Objetivo Eliminado',
      targetDeletedDesc: (name: string) => `${name} fue eliminado con éxito.`,
      targetUpdatedTitle: 'Objetivo Actualizado',
      targetUpdatedDesc: (name: string) => `${name} actualizado con éxito.`,
      incompleteFieldsTitle: 'Campos incompletos',
      incompleteFieldsDesc: 'Por favor, completa el nombre del objetivo y el contacto.',
      targetRegisteredTitle: 'Objetivo Registrado',
      targetRegisteredDesc: (name: string) => `${name} registrado con éxito.`,
      createDialogTitle: 'Registrar Nuevo Objetivo',
      createDialogDesc: 'Registra una nueva organización o activo para el alcance de auditorías e informes ejecutivos.',
      editDialogTitle: 'Editar Objetivo',
      editDialogDesc: 'Actualiza la información del objetivo y canales de contacto.',
      targetNameLabel: 'Objetivo / Organización *',
      targetNamePlaceholder: 'ej: Hack The Box, Acme Corp, Banco Alfa',
      targetContactLabel: 'Contacto Técnico / Responsable *',
      targetPhoneLabel: 'Canal Seguro / Teléfono',
      auditCadenceLabel: 'Ciclo de Auditoría',
      logosLabel: 'Logotipos del Objetivo (Opcional)',
      logosEditLabel: 'Logotipos del Objetivo',
      logoSquare: 'Logo Cuadrado',
      logoWide: 'Logo Horizontal',
      saveChanges: 'Guardar Cambios',
      registerTargetBtn: 'Registrar Objetivo',
    },
  };

  const dict = dictMap[currentLocale] || dictMap.en;

  const handleDeleteClient = () => {
    if (clientToDelete) {
      deleteClient(clientToDelete.id);
      toast({
        title: dict.targetDeletedTitle,
        description: dict.targetDeletedDesc(clientToDelete.name),
      });
      setClientToDelete(null);
    }
  };

  const handleEditClick = (client: Client) => {
    setEditingClient(client);
    setIsEditDialogOpen(true);
  };

  const handleUpdateClient = () => {
    if (!editingClient || !editClientName || !editClientContact) return;

    const updated: Client = {
      ...editingClient,
      name: editClientName,
      contact: editClientContact,
      phone: editClientPhone,
      period: editClientPeriod,
      logoUrl: editClientLogo || '',
      logoWide: editClientLogoWide || undefined,
    };

    updateClient(updated);
    toast({
      title: dict.targetUpdatedTitle,
      description: dict.targetUpdatedDesc(updated.name),
    });
    setIsEditDialogOpen(false);
  };

  const handleCreateClient = () => {
    if (!newClientName || !newClientContact) {
      toast({
        variant: 'destructive',
        title: dict.incompleteFieldsTitle,
        description: dict.incompleteFieldsDesc,
      });
      return;
    }

    const newClient: Omit<Client, 'id'> = {
      name: newClientName,
      contact: newClientContact,
      phone: newClientPhone,
      period: newClientPeriod,
      serviceDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      status: 'active',
      logoUrl: newClientLogo || '',
      logoWide: newClientLogoWide || undefined,
    };

    addClient(newClient);
    toast({
      title: dict.targetRegisteredTitle,
      description: dict.targetRegisteredDesc(newClient.name),
    });
    setIsCreateDialogOpen(false);
    setNewClientName('');
    setNewClientContact('');
    setNewClientPhone('');
    setNewClientLogo(null);
    setNewClientLogoWide(null);
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

  return (
    <>
      <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-[1720px] mx-auto">
        {/* Cabecalho Superior: Titulo + Abas + Busca + Botao Novo Alvo */}
        <div className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100">
                  {dict.title}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700/80">
                  {filteredTargets.length}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                {dict.subtitle}
              </p>
            </div>

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
                onClick={() => setIsCreateDialogOpen(true)}
                className="h-9 px-4 rounded-lg font-medium text-sm gap-1.5 shadow-sm bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
              >
                <Plus className="h-4 w-4" weight="bold" />
                <span>{dict.newTarget}</span>
              </Button>
            </div>
          </div>

          {/* Abas Horizontais com Filtros de Cadencia */}
          <div className="flex items-center gap-6 border-b border-zinc-800/80 pb-2">
            <button
              onClick={() => setActiveTab('all')}
              className={cn(
                'group relative flex items-center gap-2 pb-2 text-sm font-medium transition-colors',
                activeTab === 'all' ? 'text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
              )}
            >
              <span>{dict.allTargets}</span>
              <span
                className={cn(
                  'px-2 py-0.5 rounded-full text-xs font-semibold transition-colors',
                  activeTab === 'all'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-zinc-800/80 text-zinc-400 group-hover:bg-zinc-800'
                )}
              >
                {counts.all}
              </span>
              {activeTab === 'all' && (
                <span className="absolute bottom-[-9px] left-0 right-0 h-[2px] bg-emerald-500 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('monthly')}
              className={cn(
                'group relative flex items-center gap-2 pb-2 text-sm font-medium transition-colors',
                activeTab === 'monthly' ? 'text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
              )}
            >
              <span>{dict.monthly}</span>
              <span
                className={cn(
                  'px-2 py-0.5 rounded-full text-xs font-semibold transition-colors',
                  activeTab === 'monthly'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-zinc-800/80 text-zinc-400 group-hover:bg-zinc-800'
                )}
              >
                {counts.monthly}
              </span>
              {activeTab === 'monthly' && (
                <span className="absolute bottom-[-9px] left-0 right-0 h-[2px] bg-emerald-500 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('weekly')}
              className={cn(
                'group relative flex items-center gap-2 pb-2 text-sm font-medium transition-colors',
                activeTab === 'weekly' ? 'text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
              )}
            >
              <span>{dict.weekly}</span>
              <span
                className={cn(
                  'px-2 py-0.5 rounded-full text-xs font-semibold transition-colors',
                  activeTab === 'weekly'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-zinc-800/80 text-zinc-400 group-hover:bg-zinc-800'
                )}
              >
                {counts.weekly}
              </span>
              {activeTab === 'weekly' && (
                <span className="absolute bottom-[-9px] left-0 right-0 h-[2px] bg-emerald-500 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('yearly')}
              className={cn(
                'group relative flex items-center gap-2 pb-2 text-sm font-medium transition-colors',
                activeTab === 'yearly' ? 'text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
              )}
            >
              <span>{dict.yearly}</span>
              <span
                className={cn(
                  'px-2 py-0.5 rounded-full text-xs font-semibold transition-colors',
                  activeTab === 'yearly'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-zinc-800/80 text-zinc-400 group-hover:bg-zinc-800'
                )}
              >
                {counts.yearly}
              </span>
              {activeTab === 'yearly' && (
                <span className="absolute bottom-[-9px] left-0 right-0 h-[2px] bg-emerald-500 rounded-full" />
              )}
            </button>
          </div>
        </div>

        {/* Layout Master-Detail: Coluna Esquerda (Lista de Alvos) + Coluna Direita (Dossie do Alvo) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* COLUNA ESQUERDA: Master List */}
          <div className="lg:col-span-5 xl:col-span-5 space-y-2">
            <Card className="bg-zinc-950/40 border border-zinc-800/80 rounded-2xl overflow-hidden p-2 sm:p-2.5">
              <CardContent className="p-0 space-y-1.5 max-h-[calc(100vh-250px)] overflow-y-auto pr-1">
                {filteredTargets.length === 0 ? (
                  <div className="text-center py-16 px-4 text-zinc-500 text-sm">
                    {dict.emptyList}
                  </div>
                ) : (
                  filteredTargets.map((target) => {
                    const isSelected = activeTarget?.id === target.id;
                    const avatarColor = getAvatarColorClass(target.name);

                    return (
                      <div
                        key={target.id}
                        onClick={() => setSelectedClientId(target.id)}
                        className={cn(
                          'group relative flex items-center gap-3.5 p-3.5 rounded-xl cursor-pointer transition-all border text-left',
                          isSelected
                            ? 'bg-zinc-900/90 border-zinc-700/80 border-l-[3px] border-l-emerald-500 shadow-sm'
                            : 'bg-zinc-900/30 hover:bg-zinc-900/60 border-zinc-800/50 border-l-[3px] border-l-transparent'
                        )}
                      >
                        {/* Logo ou Avatar com iniciais */}
                        <Avatar className="h-10 w-10 rounded-xl border border-zinc-800 shrink-0">
                          {target.logoUrl ? (
                            <AvatarImage src={target.logoUrl} alt={target.name} className="object-contain p-1" />
                          ) : null}
                          <AvatarFallback className={cn('rounded-xl text-xs font-bold', avatarColor)}>
                            {getInitials(target.name)}
                          </AvatarFallback>
                        </Avatar>

                        {/* Bloco Central */}
                        <div className="flex-1 min-w-0 pr-2">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-mono text-[11px] text-emerald-500/80 font-medium">
                              {target.clientNumber}
                            </span>
                            <span className="text-[10px] uppercase font-mono text-zinc-500 border border-zinc-800 px-1 rounded">
                              {target.period}
                            </span>
                          </div>
                          <div className="font-semibold text-sm text-zinc-100 truncate group-hover:text-white">
                            {target.name}
                          </div>
                          <div className="text-xs text-zinc-400 truncate">
                            {target.contact}
                          </div>
                        </div>

                        {/* Bloco Direito */}
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right flex flex-col items-end gap-1">
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-zinc-800/90 text-zinc-300 border border-zinc-700/70">
                              {target.projectsCount} {target.projectsCount === 1 ? 'proj' : 'projs'}
                            </span>
                            {target.criticalCount > 0 && (
                              <span className="text-[10px] font-mono text-rose-400 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                {target.criticalCount} crit
                              </span>
                            )}
                          </div>

                          <ChevronRight
                            className={cn(
                              'h-4 w-4 transition-transform',
                              isSelected ? 'text-zinc-200 translate-x-0.5' : 'text-zinc-600 group-hover:text-zinc-400'
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

          {/* COLUNA DIREITA: Contextual Inspector (Dossie do Alvo) */}
          <div className="lg:col-span-7 xl:col-span-7">
            {activeTarget ? (
              <Card className="bg-zinc-950/40 border border-zinc-800/80 rounded-2xl overflow-hidden p-6 sm:p-7 space-y-6">
                {/* Header do Dossie: Logo, Nome, Contato, Acoes */}
                <div className="flex items-start justify-between gap-4 border-b border-zinc-800/80 pb-5">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-14 w-14 rounded-2xl border border-zinc-800 shrink-0 shadow-sm bg-zinc-900">
                      {activeTarget.logoUrl ? (
                        <AvatarImage src={activeTarget.logoUrl} alt={activeTarget.name} className="object-contain p-2" />
                      ) : null}
                      <AvatarFallback className={cn('rounded-2xl text-sm font-bold', getAvatarColorClass(activeTarget.name))}>
                        {getInitials(activeTarget.name)}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-emerald-500/90 font-medium">
                          {activeTarget.clientNumber}
                        </span>
                        <span className="font-mono text-[11px] text-zinc-500">
                          {activeTarget.id}
                        </span>
                      </div>
                      <h2 className="text-xl font-bold text-zinc-100 tracking-tight mt-0.5">
                        {activeTarget.name}
                      </h2>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 mt-1">
                        <span>{activeTarget.contact}</span>
                        {activeTarget.phone && (
                          <>
                            <span className="text-zinc-600">·</span>
                            <span>{activeTarget.phone}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
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
                          onClick={() => handleEditClick(activeTarget)}
                          className="gap-2 cursor-pointer text-zinc-200"
                        >
                          <Edit className="h-4 w-4" />
                          <span>{dict.editTarget}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setNewProjectOpen(true)}
                          className="gap-2 cursor-pointer text-zinc-200"
                        >
                          <Plus className="h-4 w-4" />
                          <span>{dict.createAuditForTarget}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setClientToDelete(activeTarget)}
                          className="gap-2 cursor-pointer text-rose-400 focus:text-rose-400 focus:bg-rose-950/20"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>{dict.deleteTarget}</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Grid com 4 Metricas Taticas do Alvo */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* ENGAGEMENTS */}
                  <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3 flex flex-col justify-between">
                    <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] font-semibold uppercase tracking-wider">
                      <FolderOpen className="h-3.5 w-3.5 text-zinc-400" />
                      <span>{dict.engagements}</span>
                    </div>
                    <div className="text-xl font-bold font-mono text-zinc-100 mt-2">
                      {activeTarget.projectsCount.toString().padStart(2, '0')}
                    </div>
                  </div>

                  {/* VULNERABILITIES */}
                  <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3 flex flex-col justify-between">
                    <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] font-semibold uppercase tracking-wider">
                      <AlertTriangle className="h-3.5 w-3.5 text-zinc-400" />
                      <span>{dict.vulnerabilities}</span>
                    </div>
                    <div className="text-xl font-bold font-mono text-zinc-100 mt-2">
                      {activeTarget.findingsCount.toString().padStart(2, '0')}
                    </div>
                  </div>

                  {/* CRITICAL RISKS */}
                  <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3 flex flex-col justify-between">
                    <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] font-semibold uppercase tracking-wider">
                      <ShieldCheck className="h-3.5 w-3.5 text-zinc-400" />
                      <span>{dict.criticalRisks}</span>
                    </div>
                    <div
                      className={cn(
                        'text-xl font-bold font-mono mt-2',
                        activeTarget.criticalCount > 0 ? 'text-rose-400' : 'text-zinc-100'
                      )}
                    >
                      {activeTarget.criticalCount.toString().padStart(2, '0')}
                    </div>
                  </div>

                  {/* AUDIT CADENCE */}
                  <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3 flex flex-col justify-between">
                    <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] font-semibold uppercase tracking-wider">
                      <Clock className="h-3.5 w-3.5 text-zinc-400" />
                      <span>{dict.cadence}</span>
                    </div>
                    <div className="text-xs font-mono font-medium text-emerald-400 mt-2">
                      {activeTarget.period}
                    </div>
                  </div>
                </div>

                {/* Lista de Auditorias & Escopos Vinculados */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                    <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                      <Crosshair className="h-4 w-4 text-emerald-500" />
                      <span>{dict.associatedAudits}</span>
                    </div>
                    <span className="text-[11px] font-mono text-zinc-500">
                      {activeTarget.projects.length} {dict.records}
                    </span>
                  </div>

                  <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                    {activeTarget.projects.length === 0 ? (
                      <div className="py-8 text-center text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
                        <p>{dict.noAuditsYet}</p>
                        <Button
                          variant="ghost"
                          onClick={() => setNewProjectOpen(true)}
                          className="mt-2 text-xs text-emerald-400 hover:text-emerald-300 gap-1.5"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>{dict.createAuditForTarget}</span>
                        </Button>
                      </div>
                    ) : (
                      activeTarget.projects.map((proj) => {
                        const isCompleted = proj.status === 'Completed';

                        return (
                          <div
                            key={proj.id}
                            className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-3.5 flex items-center justify-between gap-3 hover:bg-zinc-900/70 transition-colors"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="font-mono text-[11px] text-zinc-400">
                                  {proj.id}
                                </span>
                                <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded border border-zinc-800 text-zinc-400">
                                  {proj.type || 'pentest'}
                                </span>
                              </div>
                              <div className="text-sm font-semibold text-zinc-200 truncate">
                                {proj.name}
                              </div>
                              <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                                {dict.due}: {formatDateDisplay(proj.endDate)}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
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
                                {getProjectStatusLabel(proj.status, currentLocale)}
                              </span>

                              <Link
                                href={`/report/9a4f2c1b8e7d3a6e/${proj.id}`}
                                className="h-8 px-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium inline-flex items-center gap-1 transition-colors"
                                title={dict.openInEditor}
                              >
                                <span>Editor</span>
                                <ArrowRight className="h-3.5 w-3.5" />
                              </Link>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Barra de Acoes Inferior */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-3 border-t border-zinc-800/80">
                  <Button
                    onClick={() => setNewProjectOpen(true)}
                    className="w-full sm:flex-1 h-10 px-4 rounded-xl font-medium text-sm gap-2 bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors"
                  >
                    <Plus className="h-4 w-4" weight="bold" />
                    <span>{dict.createAuditForTarget}</span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => handleEditClick(activeTarget)}
                    className="w-full sm:w-auto h-10 px-4 rounded-xl bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 text-xs font-medium"
                  >
                    <Edit className="h-4 w-4 mr-1.5 text-zinc-400" />
                    <span>{dict.editTarget}</span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => setClientToDelete(activeTarget)}
                    className="w-full sm:w-auto h-10 px-4 rounded-xl bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-rose-400 hover:bg-rose-950/20 text-xs font-medium"
                  >
                    <Trash2 className="h-4 w-4 mr-1.5" />
                    <span>{dict.deleteTarget}</span>
                  </Button>
                </div>
              </Card>
            ) : null}
          </div>
        </div>
      </div>

      {/* Modal de Criacao de Novo Alvo */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[480px] bg-zinc-950 border-zinc-800 text-zinc-100">
          <DialogHeader>
            <DialogTitle className="text-zinc-100">{dict.createDialogTitle}</DialogTitle>
            <DialogDescription className="text-zinc-400 text-xs">
              {dict.createDialogDesc}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="clientName" className="text-xs text-zinc-300">
                {dict.targetNameLabel}
              </Label>
              <Input
                id="clientName"
                placeholder={dict.targetNamePlaceholder}
                value={newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
                className="bg-zinc-900 border-zinc-800 text-zinc-100 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="clientContact" className="text-xs text-zinc-300">
                {dict.targetContactLabel}
              </Label>
              <Input
                id="clientContact"
                placeholder="security@target.com"
                value={newClientContact}
                onChange={(e) => setNewClientContact(e.target.value)}
                className="bg-zinc-900 border-zinc-800 text-zinc-100 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="clientPhone" className="text-xs text-zinc-300">
                {dict.targetPhoneLabel}
              </Label>
              <Input
                id="clientPhone"
                placeholder="+55 11 99999-0000"
                value={newClientPhone}
                onChange={(e) => setNewClientPhone(e.target.value)}
                className="bg-zinc-900 border-zinc-800 text-zinc-100 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-300">{dict.auditCadenceLabel}</Label>
              <div className="grid grid-cols-3 gap-2">
                {(['Weekly', 'Monthly', 'Yearly'] as const).map((period) => (
                  <button
                    key={period}
                    type="button"
                    onClick={() => setNewClientPeriod(period)}
                    className={cn(
                      'py-1.5 rounded-lg text-xs font-medium border transition-colors',
                      newClientPeriod === period
                        ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/50'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                    )}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-zinc-800/80">
              <Label className="text-xs text-zinc-300">{dict.logosLabel}</Label>
              <div className="flex gap-4">
                <ImageUploadButton
                  label={dict.logoSquare}
                  value={newClientLogo}
                  onChange={setNewClientLogo}
                  aspect={1}
                  cropShape="rect"
                />
                <ImageUploadButton
                  label={dict.logoWide}
                  value={newClientLogoWide}
                  onChange={setNewClientLogoWide}
                  aspect={3}
                  cropShape="rect"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="border-t border-zinc-800/80 pt-3">
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              className="bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800"
            >
              {dict.cancel}
            </Button>
            <Button
              onClick={handleCreateClient}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
            >
              {dict.registerTargetBtn}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Edicao de Alvo */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[480px] bg-zinc-950 border-zinc-800 text-zinc-100">
          <DialogHeader>
            <DialogTitle className="text-zinc-100">{dict.editDialogTitle}</DialogTitle>
            <DialogDescription className="text-zinc-400 text-xs">
              {dict.editDialogDesc}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="editClientName" className="text-xs text-zinc-300">
                {dict.targetNameLabel}
              </Label>
              <Input
                id="editClientName"
                value={editClientName}
                onChange={(e) => setEditClientName(e.target.value)}
                className="bg-zinc-900 border-zinc-800 text-zinc-100 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="editClientContact" className="text-xs text-zinc-300">
                {dict.targetContactLabel}
              </Label>
              <Input
                id="editClientContact"
                value={editClientContact}
                onChange={(e) => setEditClientContact(e.target.value)}
                className="bg-zinc-900 border-zinc-800 text-zinc-100 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="editClientPhone" className="text-xs text-zinc-300">
                {dict.targetPhoneLabel}
              </Label>
              <Input
                id="editClientPhone"
                value={editClientPhone}
                onChange={(e) => setEditClientPhone(e.target.value)}
                className="bg-zinc-900 border-zinc-800 text-zinc-100 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-300">{dict.auditCadenceLabel}</Label>
              <div className="grid grid-cols-3 gap-2">
                {(['Weekly', 'Monthly', 'Yearly'] as const).map((period) => (
                  <button
                    key={period}
                    type="button"
                    onClick={() => setEditClientPeriod(period)}
                    className={cn(
                      'py-1.5 rounded-lg text-xs font-medium border transition-colors',
                      editClientPeriod === period
                        ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/50'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                    )}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-zinc-800/80">
              <Label className="text-xs text-zinc-300">{dict.logosEditLabel}</Label>
              <div className="flex gap-4">
                <ImageUploadButton
                  label={dict.logoSquare}
                  value={editClientLogo}
                  onChange={setEditClientLogo}
                  aspect={1}
                  cropShape="rect"
                />
                <ImageUploadButton
                  label={dict.logoWide}
                  value={editClientLogoWide}
                  onChange={setEditClientLogoWide}
                  aspect={3}
                  cropShape="rect"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="border-t border-zinc-800/80 pt-3">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              className="bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800"
            >
              {dict.cancel}
            </Button>
            <Button
              onClick={handleUpdateClient}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
            >
              {dict.saveChanges}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alerta de Confirmacao de Exclusao de Alvo */}
      <AlertDialog open={!!clientToDelete} onOpenChange={(open) => !open && setClientToDelete(null)}>
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
              onClick={handleDeleteClient}
              className="bg-rose-600 hover:bg-rose-700 text-white font-medium"
            >
              {dict.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de Criacao de Projeto vinculado */}
      <NewProjectDialog open={newProjectOpen} onOpenChange={setNewProjectOpen} />
    </>
  );
}
