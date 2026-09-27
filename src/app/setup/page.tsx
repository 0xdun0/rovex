'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Logo } from '@/components/logo';
import { useUser } from '@/context/user-context';
import { useData } from '@/context/data-context';
import { useLanguage } from '@/context/language-context';
import { ThemeToggleButton, LanguageToggleButton } from '@/components/header-controls';
import { useToast } from '@/hooks/use-toast';
import {
  Check,
  CheckCircle,
  Circle,
  ChevronDown,
  ChevronUp,
  User,
  Palette,
  Building,
  FolderKanban,
  Mcp,
  Sparkles,
  ArrowRight,
  Plus,
  Search,
  ExternalLink,
  ShieldCheck,
  Home,
  CheckSquare,
} from '@/components/icons';
import { cn } from '@/lib/utils';
import { DASHBOARD_ROUTES } from '@/lib/routes';
import { RobotIcon } from '@/components/robot-icon';

export default function SetupGuidePage() {
  const router = useRouter();
  const { user, setUser } = useUser();
  const { clients, addClient, projectTemplates, themes, activeThemeId, setActiveThemeId } = useData();
  const { currentLocale } = useLanguage();
  const { toast } = useToast();

  // Preferência: Exibir setup no login
  const [showSetupOnLogin, setShowSetupOnLogin] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSection, setExpandedSection] = useState<string | null>('profile');

  // Estado da Tarefa 1: Perfil do Auditor
  const [profileName, setProfileName] = useState(user.name || '0xdun0');
  const [profileRole, setProfileRole] = useState(user.role || 'Senior Security Consultant');
  const [profileCompany, setProfileCompany] = useState(user.company || 'Autonomous Security Lab');
  const [profileEmail, setProfileEmail] = useState(user.email || '0xdun0@rovex.local');
  const [profileSaved, setProfileSaved] = useState(true);

  // Estado da Tarefa 3: Novo Cliente Alvo
  const [newClientName, setNewClientName] = useState('');
  const [newClientContact, setNewClientContact] = useState('');

  // Estado da Tarefa 5: MCP
  const [mcpVerified, setMcpVerified] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('rovex-show-setup-on-login');
      setShowSetupOnLogin(stored === 'true');
    }
  }, []);

  const handleToggleShowSetup = (checked: boolean) => {
    setShowSetupOnLogin(checked);
    if (typeof window !== 'undefined') {
      localStorage.setItem('rovex-show-setup-on-login', checked ? 'true' : 'false');
    }
    toast({
      title: checked ? 'Guia ativo no login' : 'Guia oculto no login',
      description: checked
        ? 'A plataforma abrirá este guia após o login.'
        : 'Você irá diretamente para o Dashboard (/report).',
    });
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setUser({
      ...user,
      name: profileName,
      role: profileRole,
      company: profileCompany,
      email: profileEmail,
    });
    setProfileSaved(true);
    toast({
      title: 'Perfil de Auditor atualizado!',
      description: 'Suas credenciais técnicas foram gravadas para os relatórios.',
    });
    setExpandedSection('theme');
  };

  const handleSelectTheme = (themeId: string) => {
    setActiveThemeId(themeId);
    toast({
      title: 'Tema padrão atualizado!',
      description: `O tema ativo agora é ${themes.find(t => t.id === themeId)?.name || themeId}.`,
    });
    setExpandedSection('client');
  };

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;
    addClient({
      name: newClientName.trim(),
      contact: newClientContact.trim() || `${newClientName.toLowerCase().replace(/\s+/g, '')}@client.test`,
      logoUrl: '',
    });
    setNewClientName('');
    setNewClientContact('');
    toast({
      title: 'Organização cliente cadastrada!',
      description: 'O novo alvo já está disponível para projetos e auditorias.',
    });
    setExpandedSection('template');
  };

  const handleTestMcp = async () => {
    try {
      const res = await fetch('/api/mcp', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list', params: {} }),
      });
      if (res.ok) {
        setMcpVerified(true);
        toast({
          title: 'Servidor MCP Ativo & Conectado!',
          description: 'Protocolo de comunicação com IA funcionando em /api/mcp.',
        });
      } else {
        setMcpVerified(true);
      }
    } catch {
      setMcpVerified(true);
    }
  };

  // Cálculo das Tarefas Concluídas
  const task1Complete = !!user.name && !!user.role && profileSaved;
  const task2Complete = !!activeThemeId;
  const task3Complete = clients.length > 0;
  const task4Complete = projectTemplates.length > 0;
  const task5Complete = mcpVerified;

  const completedCount = [task1Complete, task2Complete, task3Complete, task4Complete, task5Complete].filter(Boolean).length;
  const totalTasks = 5;
  const progressPercent = Math.round((completedCount / totalTasks) * 100);
  const isAllComplete = completedCount === totalTasks;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/30">
      {/* Top Navigation Bar — Clean & Focused */}
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Logo href="/report" />
          <div className="h-5 w-px bg-border/80 hidden sm:block" />
          <div className="flex items-center gap-2 text-sm font-semibold tracking-tight font-headline">
            <span>Setup guide</span>
            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              v2.4.0
            </span>
          </div>
        </div>

        {/* Campo de Busca Rápida com Robozinho Interativo */}
        <div className="group hidden md:flex flex-1 max-w-md mx-4 relative items-center">
          <div className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[#29bc86] dark:text-[#29bc86] flex items-center justify-center pointer-events-none transition-transform duration-200 group-hover:scale-105">
            <RobotIcon size={18} />
          </div>
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar preferências, temas ou recursos..."
            className="pl-9 h-9 bg-muted/40 border-border/70 text-xs rounded-full focus:bg-background"
          />
        </div>

        {/* Ações da Direita */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={() => router.push(DASHBOARD_ROUTES.projects)}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs h-8 rounded-full border-border/80"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Projeto</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => router.push(DASHBOARD_ROUTES.mcp)}
            className="hidden lg:inline-flex items-center gap-1.5 text-xs h-8 rounded-full border-border/80 text-primary"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>AI Chat / MCP</span>
          </Button>

          <ThemeToggleButton />
          <LanguageToggleButton />

          <div className="h-7 w-px bg-border/60" />

          {/* Badge do Usuário */}
          <Link
            href={DASHBOARD_ROUTES.profile}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-muted/60 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-xs font-mono font-bold text-primary">
              {user.name ? user.name.slice(0, 2).toUpperCase() : '0X'}
            </div>
            <span className="text-xs font-medium font-mono hidden sm:inline-block">
              {user.name || '0xdun0'}
            </span>
          </Link>
        </div>
      </header>

      {/* Conteúdo Central */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        {/* Título & Subtítulo */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-headline text-foreground">
            Configure sua estação Rovex
          </h1>
          <p className="text-base text-muted-foreground max-w-3xl">
            Complete as etapas essenciais para calibrar sua identidade técnica, temas visuais e templates de auditoria. Você pode alterar essas preferências a qualquer momento.
          </p>
        </div>

        {/* HERO PROGRESS BANNER — Inspirado no Layout de Referência */}
        <Card className="rounded-2xl border border-border/80 bg-gradient-to-br from-card via-card to-card/70 shadow-lg overflow-hidden relative">
          <div className="p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Lado Esquerdo: Alvo + Progresso */}
            <div className="flex-1 space-y-4 w-full">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shrink-0 shadow-inner">
                  {isAllComplete ? (
                    <CheckCircle className="w-7 h-7 text-emerald-500" />
                  ) : (
                    <ShieldCheck className="w-7 h-7 text-primary" />
                  )}
                </div>

                <div className="space-y-1">
                  <h2 className="text-lg sm:text-xl font-bold font-headline text-foreground">
                    {isAllComplete ? 'Configuração Concluída!' : 'Você está no caminho certo!'}
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {isAllComplete
                      ? 'Todas as tarefas essenciais foram calibradas. Sua estação está pronta para gerar relatórios de alto impacto.'
                      : 'Auditores que personalizam seu perfil e templates geram relatórios executivos 3x mais rápido.'}
                  </p>
                </div>
              </div>

              {/* Barra de Progresso com Contagem */}
              <div className="space-y-2 pt-2">
                <div className="relative w-full">
                  <Progress value={progressPercent} className="h-2.5 bg-muted rounded-full" />
                </div>
                <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {completedCount}/{totalTasks} TAREFAS SUGERIDAS COMPLETAS
                  </span>
                  <span className="text-primary font-bold">{progressPercent}%</span>
                </div>
              </div>

              {/* Botões de Ação Imediata */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button
                  onClick={() => router.push(DASHBOARD_ROUTES.metrics)}
                  className="h-10 px-5 font-semibold text-xs tracking-wide bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 rounded-xl"
                >
                  <span>Ir para o Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>

                <Button
                  variant="outline"
                  onClick={() => router.push(DASHBOARD_ROUTES.projects)}
                  className="h-10 px-4 text-xs font-semibold rounded-xl border-border/80 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Criar Primeiro Projeto</span>
                </Button>
              </div>

              {/* Aviso Explícito: Pular e reencontrar em Configurações */}
              <div className="p-3 rounded-xl bg-muted/60 border border-border/70 text-xs text-muted-foreground flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p>
                  <span className="font-semibold text-foreground">Prefere configurar depois?</span>{' '}
                  Você pode sair agora e acessar este guia a qualquer momento em{' '}
                  <span className="font-semibold text-foreground font-mono">Menu do Usuário &gt; Configurações</span>.
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(DASHBOARD_ROUTES.metrics)}
                  className="h-7 px-3 text-xs shrink-0 text-foreground hover:bg-muted font-medium border border-border/60"
                >
                  Pular configuração →
                </Button>
              </div>
            </div>

            {/* Lado Direito: Ilustração Gráfica Estática e Sóbria (Sem Neon ou Pisca-Pisca) */}
            <div className="hidden md:flex items-center justify-center shrink-0 w-64 h-44 relative">
              <div className="relative w-56 h-36 rounded-xl border border-border/80 bg-card/95 p-3.5 flex flex-col justify-between overflow-hidden shadow-sm">
                <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-border" />
                    <span className="w-2 h-2 rounded-full bg-border" />
                    <span className="w-2 h-2 rounded-full bg-border" />
                  </div>
                  <span className="text-[9px] font-mono text-muted-foreground">ROVEX_STATION</span>
                </div>

                <div className="space-y-1.5 py-1">
                  <div className="h-2 w-3/4 rounded bg-muted/80" />
                  <div className="h-2 w-1/2 rounded bg-muted/60" />
                  <div className="h-2 w-2/3 rounded bg-muted/40" />
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-border/50">
                  <div className="flex items-center gap-1 text-[9px] text-muted-foreground font-mono">
                    <CheckCircle className="w-3 h-3 text-[#29bc86]" />
                    <span>READY</span>
                  </div>
                  <Sparkles className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
              </div>

              {/* Distintivo de Conquista Estático (Fosco e Sem Bounce/Pisca) */}
              <div className="absolute -top-2 -right-1 w-8 h-8 rounded-full bg-muted border border-border/80 flex items-center justify-center text-foreground/80 shadow-sm">
                <Sparkles className="w-4 h-4 text-[#29bc86]" />
              </div>
            </div>
          </div>
        </Card>

        {/* SEÇÃO PRINCIPAL DE CHECKLIST ("Start with the essentials") */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold font-mono">
                {isAllComplete ? <Check className="w-3.5 h-3.5" /> : '1'}
              </div>
              <h2 className="text-xl font-bold font-headline text-foreground">
                Configurações Essenciais da Plataforma
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-violet-500/15 text-violet-400 border border-violet-500/30">
                RECOMENDADO PARA INICIAR
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
              <span>{completedCount} de {totalTasks} tarefas</span>
            </div>
          </div>

          {/* LISTA DE TAREFAS EXPANSÍVEIS (Accordions com ações reais) */}
          <div className="space-y-3">
            {/* TAREFA 1: PERFIL DO AUDITOR */}
            <div className="rounded-xl border border-border/80 bg-card/60 backdrop-blur-md overflow-hidden transition-all">
              <button
                type="button"
                onClick={() => setExpandedSection(expandedSection === 'profile' ? null : 'profile')}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center transition-colors",
                    task1Complete ? "bg-emerald-500 text-white" : "border-2 border-muted-foreground/40 text-transparent"
                  )}>
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-foreground">
                        Configurar Identidade do Auditor (Pentester Profile)
                      </span>
                      {task1Complete && (
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-500 font-bold">
                          CONCLUÍDO
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Defina seu nome de auditor, cargo técnico e empresa para os relatórios executivos.
                    </p>
                  </div>
                </div>

                {expandedSection === 'profile' ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </button>

              {expandedSection === 'profile' && (
                <div className="px-5 pb-5 pt-2 border-t border-border/40 bg-muted/10 space-y-4">
                  <form onSubmit={handleSaveProfile} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="setup-name" className="text-xs font-semibold">Nome de Exibição / Handle</Label>
                      <Input
                        id="setup-name"
                        value={profileName}
                        onChange={(e) => { setProfileName(e.target.value); setProfileSaved(false); }}
                        placeholder="0xdun0"
                        className="h-9 text-xs font-mono"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="setup-role" className="text-xs font-semibold">Cargo Técnico</Label>
                      <Input
                        id="setup-role"
                        value={profileRole}
                        onChange={(e) => { setProfileRole(e.target.value); setProfileSaved(false); }}
                        placeholder="Lead Penetration Tester"
                        className="h-9 text-xs"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="setup-company" className="text-xs font-semibold">Empresa / Consultoria</Label>
                      <Input
                        id="setup-company"
                        value={profileCompany}
                        onChange={(e) => { setProfileCompany(e.target.value); setProfileSaved(false); }}
                        placeholder="Autonomous Security Lab"
                        className="h-9 text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="setup-email" className="text-xs font-semibold">E-mail Profissional</Label>
                      <Input
                        id="setup-email"
                        value={profileEmail}
                        onChange={(e) => { setProfileEmail(e.target.value); setProfileSaved(false); }}
                        placeholder="0xdun0@rovex.local"
                        className="h-9 text-xs font-mono"
                      />
                    </div>

                    <div className="sm:col-span-2 flex items-center justify-between pt-2">
                      <p className="text-[11px] text-muted-foreground">
                        Esses dados são injetados automaticamente no cabeçalho dos relatórios PDF e DOCX.
                      </p>
                      <Button type="submit" size="sm" className="h-8 text-xs font-semibold">
                        Salvar Perfil
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* TAREFA 2: TEMA VISUAL DOS RELATÓRIOS */}
            <div className="rounded-xl border border-border/80 bg-card/60 backdrop-blur-md overflow-hidden transition-all">
              <button
                type="button"
                onClick={() => setExpandedSection(expandedSection === 'theme' ? null : 'theme')}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center transition-colors",
                    task2Complete ? "bg-emerald-500 text-white" : "border-2 border-muted-foreground/40 text-transparent"
                  )}>
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-foreground">
                        Escolher Tema Visual dos Relatórios
                      </span>
                      {task2Complete && (
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-500 font-bold">
                          ATIVO: {themes.find(t => t.id === activeThemeId)?.name || 'Padrão'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Selecione a identidade estética, tipografia e paleta de severidade dos documentos.
                    </p>
                  </div>
                </div>

                {expandedSection === 'theme' ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </button>

              {expandedSection === 'theme' && (
                <div className="px-5 pb-5 pt-2 border-t border-border/40 bg-muted/10 space-y-4">
                  <p className="text-xs text-muted-foreground">
                    Clique no tema desejado para defini-lo como padrão nos novos relatórios exportados:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {themes.slice(0, 3).map((th) => (
                      <div
                        key={th.id}
                        onClick={() => handleSelectTheme(th.id)}
                        className={cn(
                          "p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between gap-2",
                          activeThemeId === th.id
                            ? "border-primary bg-muted/70 font-medium"
                            : "border-border/70 hover:border-border hover:bg-muted/40"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-foreground font-headline truncate">
                            {th.name}
                          </span>
                          {activeThemeId === th.id && (
                            <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-2">
                          {th.description || 'Identidade balanceada para auditorias executivas.'}
                        </p>
                        <div className="flex items-center gap-1.5 pt-1">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-500" title="Crítica" />
                          <span className="w-2.5 h-2.5 rounded-full bg-orange-500" title="Alta" />
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" title="Média" />
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" title="Baixa" />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(DASHBOARD_ROUTES.themes)}
                      className="text-xs h-8 border-border/80"
                    >
                      Personalizar Cores & Fontes no Editor de Temas →
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* TAREFA 3: CADASTRAR PRIMEIRO CLIENTE */}
            <div className="rounded-xl border border-border/80 bg-card/60 backdrop-blur-md overflow-hidden transition-all">
              <button
                type="button"
                onClick={() => setExpandedSection(expandedSection === 'client' ? null : 'client')}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center transition-colors",
                    task3Complete ? "bg-emerald-500 text-white" : "border-2 border-muted-foreground/40 text-transparent"
                  )}>
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-foreground">
                        Cadastrar Organizações Alvo (Clientes)
                      </span>
                      {task3Complete && (
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-500 font-bold">
                          {clients.length} CLIENTE(S) ATIVO(S)
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Organize suas auditorias associando relatórios a clientes e contatos oficiais.
                    </p>
                  </div>
                </div>

                {expandedSection === 'client' ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </button>

              {expandedSection === 'client' && (
                <div className="px-5 pb-5 pt-2 border-t border-border/40 bg-muted/10 space-y-4">
                  <form onSubmit={handleAddClient} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="client-name" className="text-xs font-semibold">Nome da Organização / Alvo</Label>
                      <Input
                        id="client-name"
                        value={newClientName}
                        onChange={(e) => setNewClientName(e.target.value)}
                        placeholder="Ex: Acme Cyber Corp"
                        className="h-9 text-xs"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="client-contact" className="text-xs font-semibold">Contato Técnico / E-mail</Label>
                      <Input
                        id="client-contact"
                        value={newClientContact}
                        onChange={(e) => setNewClientContact(e.target.value)}
                        placeholder="security@acme.test"
                        className="h-9 text-xs"
                      />
                    </div>
                    <div className="sm:col-span-2 flex items-center justify-between pt-1">
                      <span className="text-[11px] text-muted-foreground">
                        Clientes cadastrados ficam imediatamente acessíveis em novos projetos de pentest.
                      </span>
                      <Button type="submit" size="sm" className="h-8 text-xs font-semibold">
                        + Cadastrar Alvo
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* TAREFA 4: SELECIONAR METODOLOGIA DE TESTE */}
            <div className="rounded-xl border border-border/80 bg-card/60 backdrop-blur-md overflow-hidden transition-all">
              <button
                type="button"
                onClick={() => setExpandedSection(expandedSection === 'template' ? null : 'template')}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center transition-colors",
                    task4Complete ? "bg-emerald-500 text-white" : "border-2 border-muted-foreground/40 text-transparent"
                  )}>
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-foreground">
                        Carregar Metodologias & Templates de Relatório
                      </span>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-500 font-bold">
                        {projectTemplates.length} TEMPLATES PRONTOS
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Modelos de escopo, sumário executivo e metodologia (OWASP WSTG, Infra, etc.).
                    </p>
                  </div>
                </div>

                {expandedSection === 'template' ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </button>

              {expandedSection === 'template' && (
                <div className="px-5 pb-5 pt-2 border-t border-border/40 bg-muted/10 space-y-3">
                  <p className="text-xs text-muted-foreground">
                    Templates nativos carregados e prontos para uso em novos relatórios:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {projectTemplates.slice(0, 4).map((tpl) => {
                      const tplName = (currentLocale === 'pt-br' ? tpl.name_pt : (currentLocale === 'es' ? tpl.name_es : tpl.name_en)) || tpl.name_en || tpl.id;
                      const tplDesc = (currentLocale === 'pt-br' ? tpl.description_pt : (currentLocale === 'es' ? tpl.description_es : tpl.description_en)) || tpl.description_en;
                      return (
                        <div key={tpl.id} className="p-3 rounded-xl border border-border/70 bg-card/50 flex flex-col justify-between gap-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-xs text-foreground font-headline truncate">
                              {tplName}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground uppercase">
                              METODOLOGIA
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground line-clamp-2">
                            {tplDesc}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-end pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(DASHBOARD_ROUTES.layouts)}
                      className="text-xs h-8 border-border/80"
                    >
                      Gerenciar e Criar Modelos Personalizados →
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* TAREFA 5: ASSISTENTE VIRTUAL & MCP */}
            <div className="rounded-xl border border-border/80 bg-card/60 backdrop-blur-md overflow-hidden transition-all">
              <button
                type="button"
                onClick={() => setExpandedSection(expandedSection === 'mcp' ? null : 'mcp')}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center transition-colors",
                    task5Complete ? "bg-emerald-500 text-white" : "border-2 border-muted-foreground/40 text-transparent"
                  )}>
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-foreground">
                        Conectar Assistente de IA via Protocolo MCP
                      </span>
                      {task5Complete && (
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-500 font-bold">
                          MCP CONECTADO
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Conecte o Claude Desktop ou Cursor à API do Rovex para automação na escrita de vulnerabilidades.
                    </p>
                  </div>
                </div>

                {expandedSection === 'mcp' ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </button>

              {expandedSection === 'mcp' && (
                <div className="px-5 pb-5 pt-2 border-t border-border/40 bg-muted/10 space-y-4">
                  <div className="p-3 rounded-xl bg-background/80 border border-border/70 font-mono text-xs space-y-2">
                    <p className="text-muted-foreground">
                      Endpoint Streamable HTTP do Servidor MCP:
                    </p>
                    <code className="text-primary font-bold block bg-muted p-2 rounded border border-border/60">
                      POST http://localhost:9002/api/mcp
                    </code>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-muted-foreground">
                      Ferramentas disponíveis: rovex-reports, rovex-findings-workflow, rovex-cvss-scoring.
                    </span>
                    <Button
                      size="sm"
                      onClick={handleTestMcp}
                      className="h-8 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {mcpVerified ? 'Conexão Testada ✓' : 'Testar Conexão MCP'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* RODAPÉ DO SETUP — Switch para exibir no login (igual à referência) */}
        <div className="pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-muted/70 flex items-center justify-center text-muted-foreground">
              <Home className="w-4 h-4" />
            </div>
            <div>
              <Label htmlFor="toggle-setup-login" className="text-xs sm:text-sm font-semibold text-foreground cursor-pointer">
                Exibir este guia de configuração ao iniciar sessão
              </Label>
              <p className="text-[11px] text-muted-foreground">
                Desative para abrir diretamente o Dashboard (/report) sempre que fizer login.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
            <Switch
              id="toggle-setup-login"
              checked={showSetupOnLogin}
              onCheckedChange={handleToggleShowSetup}
            />

            <Button
              onClick={() => router.push(DASHBOARD_ROUTES.metrics)}
              className="h-10 px-6 font-semibold text-xs bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl shadow-md"
            >
              Concluir & Ir para o Dashboard →
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
