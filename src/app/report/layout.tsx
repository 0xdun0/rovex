'use client'; // componente client side interativo

import Link from 'next/link'; // navegacao nextjs
import { usePathname, useRouter } from 'next/navigation'; // hooks de rota
import React, { useState } from 'react'; // react e estado para animacoes
import { Home, ShieldCheck, FolderKanban, Users, LayoutTemplate, History, Bomb, BookOpen } from '@/components/icons'; // icones operacionais

import {
  Sidebar, // container principal da sidebar
  SidebarContent, // conteudo rolevel
  SidebarHeader, // topo da barra lateral
  SidebarInset, // container de conteudo principal da pagina
  SidebarMenu, // lista de menus
  SidebarMenuItem, // item da lista
  SidebarMenuButton, // botao do menu com acessibilidade
  SidebarProvider, // provedor de contexto da sidebar
  SidebarTrigger, // gatilho de abrir e fechar
  useSidebar, // hook para checar estado colapsado
} from '@/components/ui/sidebar'; // biblioteca de sidebar
import { UserNav } from '@/components/user-nav'; // menu do usuario com perfil temas mcp e configs
import { Logo } from '@/components/logo'; // logotipo rovex oficial
import { useLanguage } from '@/context/language-context'; // suporte a internacionalizacao
import { cn } from '@/lib/utils'; // utilitario de classes
import { LeavePageContext } from '@/context/leave-page-context'; // guarda de mudancas pendentes
import { ThemeToggleButton, LanguageToggleButton } from '@/components/header-controls'; // controles do cabecalho
import { NavigationProgressProvider, useNavigationTransition } from '@/components/navigation-progress'; // loading imediato e contextual
import { DASHBOARD_ROUTES } from '@/lib/routes'; // rotas canonicas ofuscadas da plataforma

function DashboardNav({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(); // rota atual
  const { currentLocale } = useLanguage(); // idioma ativo
  const router = useRouter(); // roteador
  const { startTransitionTo } = useNavigationTransition(); // transicao visual com loading imediato
  const { state } = useSidebar(); // estado da sidebar
  const isCollapsed = state === 'collapsed'; // se esta minimizada
  const [hoveredPath, setHoveredPath] = useState<string | null>(null); // caminho do item em hover para efeito animado

  const hasUnsavedChangesRef = React.useRef(false); // referencia para alteracoes nao salvas
  const setHasUnsavedChanges = (hasChanges: boolean) => {
    hasUnsavedChangesRef.current = hasChanges; // atualiza ref
  };

  // dispara evento ou navega com feedback visual instantaneo
  const handleRequestLeave = (path: string) => {
    if (hasUnsavedChangesRef.current) {
      window.dispatchEvent(new CustomEvent('requestLeave', { detail: path })); // emite aviso de saida
    } else {
      if (path !== pathname) {
        startTransitionTo(path); // inicia o loading bonito imediatamente
      }
    }
  };

  const handleLeaveClick = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault(); // impede reload brusco
    handleRequestLeave(path); // valida saida
  };

  // dicionario com termos tecnicos solicitados por dj
  const t = {
    en: {
      metrics: 'Metrics', // metricas operacionais
      projects: 'Projects', // projetos
      targets: 'Targets', // alvos e organizacoes
      evidences: 'Evidences', // evidencias coletadas
      risks: 'Risks', // catalogo de riscos
      doc: 'Doc', // documentacao tecnica da plataforma
    },
    'pt-br': {
      metrics: 'Métricas', // painel geral
      projects: 'Projetos', // gestao de projetos
      targets: 'Alvos', // alvos e organizacoes
      evidences: 'Evidências', // evidencias coletadas
      risks: 'Riscos', // base de riscos
      doc: 'Doc', // documentacao completa da plataforma
    },
    es: {
      metrics: 'Métricas', // metricas
      projects: 'Proyectos', // proyectos
      targets: 'Objetivos', // objetivos
      evidences: 'Evidencias', // evidencias
      risks: 'Riesgos', // riesgos
      doc: 'Doc', // documentacion
    },
  };

  const currentDict = t[currentLocale] || t.en; // fallback seguro

  // lista dos itens operacionais da sidebar alinhados com o mapa canonico do rovex
  const navItems = [
    { href: DASHBOARD_ROUTES.metrics, icon: Home, label: currentDict.metrics }, // metricas gerais
    { href: DASHBOARD_ROUTES.projects, icon: FolderKanban, label: currentDict.projects }, // projetos e auditorias
    { href: DASHBOARD_ROUTES.evidences, icon: Bomb, label: currentDict.evidences }, // catalogo de evidencias
    { href: DASHBOARD_ROUTES.targets, icon: Users, label: currentDict.targets }, // alvos e organizacoes
    { href: DASHBOARD_ROUTES.risks, icon: ShieldCheck, label: currentDict.risks }, // riscos identificados
    { href: DASHBOARD_ROUTES.doc, icon: BookOpen, label: currentDict.doc }, // documentacao tecnica
  ];

  // componente de link da sidebar com animacao fluida inspirada em doc/pills (Dribbble)
  const NavLink = ({ item, isActive }: { item: { href: string; icon: React.ElementType; label: string }; isActive: boolean }) => {
    const isHovered = hoveredPath === item.href; // estado de hover ativo

    return (
      <SidebarMenuButton
        asChild // renderiza filho direto
        isActive={isActive} // estado de rota ativa
        tooltip={{ children: item.label, side: 'right' }} // dica flutuante quando colapsada
        className={cn(
          'relative group h-10 rounded-lg transition-all duration-200 ease-out overflow-hidden', // container do item
          isCollapsed ? 'justify-center px-0 w-full' : 'justify-start px-3', // centralizacao no modo colapsado
          isActive
            ? 'bg-primary/15 text-primary font-semibold border border-primary/25 shadow-xs' // item ativo selecionado
            : 'text-muted-foreground hover:text-foreground hover:bg-sidebar-accent border border-transparent' // item inativo com hover sutil
        )}
      >
        <Link
          href={item.href} // rota
          onClick={handleLeaveClick(item.href)} // checagem de saida
          onMouseEnter={() => setHoveredPath(item.href)} // ativa hover
          onMouseLeave={() => setHoveredPath(null)} // desativa hover
          className={cn('flex items-center w-full', isCollapsed && 'justify-center')} // centralizacao do link
        >
          {/* indicador tatico vertical luminoso no item ativo */}
          {isActive && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-primary transition-all duration-300" />
          )}

          {/* icone animado com escala no hover e transicao de cor */}
          <item.icon
            className={cn(
              'h-4 w-4 shrink-0 transition-transform duration-200 ease-out', // transicao de escala
              isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground', // cor condicional
              (isActive || isHovered) && 'scale-110' // escala suave no hover
            )}
          />

          {/* rotulo com transicao de opacidade e margem */}
          <span className={cn('truncate text-sm ml-3 transition-opacity duration-200', isCollapsed && 'hidden')}>
            {item.label}
          </span>
        </Link>
      </SidebarMenuButton>
    );
  };

  return (
    <LeavePageContext.Provider value={{ setHasUnsavedChanges, handleRequestLeave }}>
      {/* sidebar executiva integrada de superficie continua (Opcao A) */}
      <Sidebar collapsible="icon" className="border-r border-border/60 bg-sidebar text-sidebar-foreground no-print transition-all duration-300">
        <div className="flex flex-col h-full">
          {/* cabecalho perfeitamente alinhado a altura h-16 (64px) do top header */}
          <SidebarHeader className={cn('h-16 px-4 border-b border-border/60 flex items-center justify-between', isCollapsed && 'px-2 justify-center')}>
            <Logo isCollapsed={isCollapsed} />
          </SidebarHeader>

          {/* menu com navegacao operacional integrada */}
          <SidebarContent className="p-3">
            <SidebarMenu className="space-y-1 mt-1">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/report' && pathname.startsWith(item.href)); // checa rota ativa correspondente ao hash

                return (
                  <SidebarMenuItem key={item.href}>
                    <NavLink item={item} isActive={isActive} />
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>

          {/* badge de status da conexao e versao no rodape integrado da sidebar */}
          <div className={cn('p-3.5 border-t border-border/60 mt-auto flex items-center gap-2 text-[10px] font-mono text-muted-foreground bg-sidebar/80', isCollapsed ? 'justify-center p-2' : 'px-4 py-3')}>
            <span className="h-2 w-2 rounded-full bg-primary/90 animate-pulse shrink-0" />
            <span className={cn('truncate uppercase tracking-wider font-semibold text-foreground/80', isCollapsed && 'hidden')}>ROVEX // V2.4 ONLINE</span>
          </div>
        </div>
      </Sidebar>


      {/* conteudo principal e barra superior */}
      <SidebarInset className="bg-background text-foreground min-h-screen">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border/60 bg-background/90 backdrop-blur-md px-4 sm:px-6 h-16 no-print">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1">
            <SidebarTrigger className="hidden md:flex" />
          </div>
          <div className="flex items-center gap-2.5">
            <ThemeToggleButton />
            <LanguageToggleButton />
            <UserNav />
          </div>
        </header>
        <main className="flex-1 bg-background text-foreground min-h-[calc(100vh-4rem)]">{children}</main>
      </SidebarInset>
    </LeavePageContext.Provider>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <NavigationProgressProvider>
      <SidebarProvider>
        <DashboardNav>{children}</DashboardNav>
      </SidebarProvider>
    </NavigationProgressProvider>
  );
}
