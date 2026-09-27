'use client'; // componente client side interativo

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // cards base
import { Button } from "@/components/ui/button"; // botoes da interface
import Link from 'next/link'; // navegacao nextjs
import { PlusCircle, Users, FolderKanban, ShieldCheck, ChevronLeft, ChevronRight, Bomb, ArrowUpDown, ExternalLink, Activity } from "@/components/icons"; // icones operacionais
import { useLanguage } from "@/context/language-context"; // internacionalizacao
import { useData } from "@/context/data-context"; // dados globais de projetos e findings
import { useMemo, useState } from "react"; // hooks de estado e memoizacao
import { Badge } from "@/components/ui/badge"; // badges de status
import { formatDistanceToNow } from 'date-fns'; // formatador de datas relativas
import { es, ptBR } from 'date-fns/locale'; // localizacoes date-fns
import { ProjectIcon, projectIconComponents } from "@/components/project-icon"; // icones de projeto
import { getProjectStatusLabel, getProjectStatusVariant } from "@/lib/project-status"; // formatadores de status
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"; // tabela de dados
import { DASHBOARD_ROUTES } from "@/lib/routes"; // rotas canonicas ofuscadas da plataforma

type SortKey = 'name' | 'clientName' | 'findingCount' | 'status' | 'updatedAt'; // campos ordenaveis

export default function DashboardPage() {
  const { currentLocale } = useLanguage(); // pega locale atual (en, pt-br, es)
  const { projects, clients, findings } = useData(); // extrai colecoes do contexto
  const criticalFindings = findings.filter(f => f.severity === 'Critical').length; // contagem de criticos
  
  const [currentPage, setCurrentPage] = useState(1); // pagina atual da tabela
  const [statusFilter, setStatusFilter] = useState<string>('all'); // filtro por status
  const [typeFilter, setTypeFilter] = useState<string>('all'); // filtro por tipo: all | pentest | writeup
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'ascending' | 'descending' }>({ key: 'updatedAt', direction: 'descending' }); // ordenacao padrao
  const projectsPerPage = 6; // limite por pagina de layout compacto
  
  // enriquece os projetos com nome do cliente e contagem de findings
  const enrichedProjects = useMemo(() => {
    return projects.map(p => ({
      ...p, // clona propriedades base
      type: p.type || 'pentest', // migracao default garantida
      clientName: clients.find(c => c.id === p.clientId)?.name || 'Cliente Geral', // resolve nome do cliente
      findingCount: findings.filter(f => f.projectId === p.id).length // conta findings vinculadas
    }));
  }, [projects, clients, findings]); // recalcula quando dados mudam

  // filtra projetos por status e tipo selecionados
  const filteredProjects = useMemo(() => {
    return enrichedProjects.filter(p => {
      const matchStatus = statusFilter === 'all' || p.status === statusFilter;
      const matchType = typeFilter === 'all' || p.type === typeFilter;
      return matchStatus && matchType;
    });
  }, [enrichedProjects, statusFilter, typeFilter]);

  // ordena a lista com base na coluna ativa
  const sortedProjects = useMemo(() => {
    return [...filteredProjects].sort((a, b) => {
      const aValue = sortConfig.key === 'updatedAt' ? new Date(a.updatedAt).getTime() : a[sortConfig.key]; // valor a
      const bValue = sortConfig.key === 'updatedAt' ? new Date(b.updatedAt).getTime() : b[sortConfig.key]; // valor b
      if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1; // direcao ascendente
      if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1; // direcao descendente
      return 0; // empate
    });
  }, [filteredProjects, sortConfig]);

  // fatia a pagina atual de projetos
  const recentProjects = useMemo(() => {
    const startIndex = (currentPage - 1) * projectsPerPage; // indice inicial
    const endIndex = startIndex + projectsPerPage; // indice final
    return sortedProjects.slice(startIndex, endIndex); // fatia
  }, [sortedProjects, currentPage, projectsPerPage]);

  const totalPages = Math.ceil(sortedProjects.length / projectsPerPage); // total de paginas

  // altera a ordenacao da tabela
  const requestSort = (key: SortKey) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'ascending' ? 'descending' : 'ascending'; // inverte sentido
    setSortConfig({ key, direction }); // aplica nova ordenacao
    setCurrentPage(1); // reinicia na primeira pagina
  };

  // icone indicador de ordenacao
  const getSortIcon = (key: SortKey) => {
    if (sortConfig.key !== key) return <ArrowUpDown className="ml-1.5 h-3.5 w-3.5 opacity-40" />; // icone neutro
    return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼'; // seta de direcao
  };

  // resolve variante de cor do status
  const getStatusVariant = (status: string) => getProjectStatusVariant(status) as any;
  // resolve rotulo de status
  const getStatus = (status: string) => getProjectStatusLabel(status, currentLocale === 'pt-br' ? 'pt-br' : (currentLocale === 'es' ? 'es' : 'en'));

  // localidade para formatacao de datas
  const dateLocale = currentLocale === 'pt-br' ? ptBR : (currentLocale === 'es' ? es : undefined);

  // ultimas findings para o feed de atividades ao vivo
  const latestFindings = useMemo(() => {
    return [...findings].slice(0, 4); // pega ate 4 itens recentes
  }, [findings]);

  // dicionario com termos tecnicos preservados
  const t = {
    en: {
      dashboard: "Metrics", // titulo da pagina
      newProject: "New Project", // botao novo projeto
      totalProjects: "TOTAL PROJECTS", // kpi projetos
      acrossAllClients: "Across all clients", // descricao kpi
      totalClients: "TOTAL CLIENTS", // kpi clientes
      managedInSystem: "Managed in the system", // descricao clientes
      totalFindings: "TOTAL FINDINGS", // kpi findings
      inActiveProjects: "In active projects", // descricao findings
      criticalFindings: "CRITICAL FINDINGS", // kpi criticos
      immediateAttention: "Require immediate attention", // alerta
      recentProjects: "Recent Projects", // titulo tabela
      recentProjectsDesc: "Monitoring of active and completed penetration tests", // subtitulo
      filterStatus: "Filter status", // filtro
      allStatuses: "All statuses", // todos os status
      project: "PROJECT", // coluna projeto
      client: "CLIENT", // coluna cliente
      findings: "FINDINGS", // coluna findings
      status: "STATUS", // coluna status
      lastUpdated: "LAST UPDATE", // coluna atualizacao
      action: "ACTION", // coluna acao
      open: "Access", // botao abrir
      latestActivity: "The latest", // titulo feed
      realtime: "Real time", // subtitulo feed
      viewAllAudit: "View all audit feed...", // link ver todos
      operationalStatus: "OPERATIONAL STATUS", // card de saude
      operationalDesc: "Isolated audit environment active. All proxies and MCP agents operating with normal latency (24ms).", // descricao operacional
      previous: "Previous", // paginacao anterior
      next: "Next", // paginacao proximo
      page: "Page", // paginacao pagina
      of: "of", // paginacao de
    },
    'pt-br': {
      dashboard: "Métricas", // titulo da tela
      newProject: "Novo Projeto", // botao criar projeto
      totalProjects: "TOTAL DE PROJETOS", // kpi projetos
      acrossAllClients: "Em todos os clientes", // subtitulo
      totalClients: "TOTAL DE CLIENTES", // kpi clientes
      managedInSystem: "Gerenciados no sistema", // subtitulo
      totalFindings: "TOTAL DE FINDINGS", // kpi findings
      inActiveProjects: "Em projetos ativos", // subtitulo
      criticalFindings: "FINDINGS CRÍTICOS", // kpi criticos
      immediateAttention: "Requerem atenção imediata", // alerta
      recentProjects: "Projetos Recentes", // tabela projetos
      recentProjectsDesc: "Acompanhamento dos testes de penetração em andamento e finalizados", // subtitulo
      filterStatus: "Filtrar por status", // filtro
      allStatuses: "Todos os status", // opcao todos
      project: "PROJETO", // cabecalho projeto
      client: "CLIENTE", // cabecalho cliente
      findings: "FINDINGS", // cabecalho findings
      status: "STATUS", // cabecalho status
      lastUpdated: "ÚLTIMA ATUALIZAÇÃO", // cabecalho data
      action: "AÇÃO", // cabecalho acao
      open: "Acessar", // botao acessar
      latestActivity: "The latest", // feed lateral
      realtime: "Tempo real", // subtitulo tempo real
      viewAllAudit: "Ver todo o feed de auditoria...", // link ver mais
      operationalStatus: "STATUS OPERACIONAL", // bloco de saude
      operationalDesc: "Ambiente de auditoria isolado ativo. Todos os proxies e agentes MCP operando com latência normal (24ms).", // descricao saude
      previous: "Anterior", // paginacao
      next: "Próximo", // paginacao
      page: "Página", // paginacao
      of: "de", // paginacao
    },
    es: {
      dashboard: "Métricas", // titulo dashboard
      newProject: "Nuevo Proyecto", // boton nuevo proyecto
      totalProjects: "TOTAL DE PROYECTOS", // kpi proyectos
      acrossAllClients: "En todos los clientes", // subtitulo
      totalClients: "TOTAL DE CLIENTES", // kpi clientes
      managedInSystem: "Gestionados en el sistema", // subtitulo
      totalFindings: "TOTAL DE FINDINGS", // kpi findings
      inActiveProjects: "En proyectos activos", // subtitulo
      criticalFindings: "FINDINGS CRÍTICOS", // kpi criticos
      immediateAttention: "Requieren atención inmediata", // alerta
      recentProjects: "Proyectos Recientes", // proyectos
      recentProjectsDesc: "Seguimiento de pruebas de penetración activas y finalizadas", // subtitulo
      filterStatus: "Filtrar por estado", // filtro
      allStatuses: "Todos los estados", // todos
      project: "PROYECTO", // columna
      client: "CLIENTE", // columna
      findings: "FINDINGS", // columna
      status: "ESTADO", // columna
      lastUpdated: "ÚLTIMA ACTUALIZACIÓN", // columna
      action: "ACCIÓN", // columna
      open: "Acceder", // boton acceder
      latestActivity: "The latest", // feed
      realtime: "Tiempo real", // subtitulo
      viewAllAudit: "Ver todo el feed de auditoría...", // ver mas
      operationalStatus: "ESTADO OPERACIONAL", // estado operativo
      operationalDesc: "Ambiente de auditoría aislado activo. Todos los proxies y agentes MCP operando con latencia normal (24ms).", // descripcion
      previous: "Anterior", // paginacion
      next: "Siguiente", // paginacion
      page: "Página", // paginacion
      of: "de", // paginacion
    }
  };

  const currentDict = t[currentLocale] || t.en; // fallback seguro

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-[1700px] mx-auto w-full">
      {/* cabecalho da pagina com titulo e acao primaria */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{currentDict.dashboard}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Rovex Security Operations Center</p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm">
          <Link href="/report/9a4f2c1b8e7d3a6e/new">
            <PlusCircle className="mr-2 h-4 w-4" /> {currentDict.newProject}
          </Link>
        </Button>
      </div>

      {/* grid com os 4 kpis estilizados sem cores neon */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* card total de projetos */}
        <Link href={DASHBOARD_ROUTES.projects} className="group">
          <Card className="border border-border/60 hover:border-primary/50 bg-card/60 hover:bg-card transition-all duration-200 shadow-sm rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 pt-4 px-5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{currentDict.totalProjects}</span>
              <div className="p-2 rounded-lg bg-secondary/60 text-foreground/80 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                <FolderKanban className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-4">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-foreground">{projects.length}</span>
                <span className="text-xs font-semibold text-primary">↑ 12%</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{currentDict.acrossAllClients}</p>
            </CardContent>
          </Card>
        </Link>

        {/* card total de alvos com rota ofuscada */}
        <Link href={DASHBOARD_ROUTES.targets} className="group">
          <Card className="border border-border/60 hover:border-primary/50 bg-card/60 hover:bg-card transition-all duration-200 shadow-sm rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 pt-4 px-5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{currentDict.totalClients}</span>
              <div className="p-2 rounded-lg bg-secondary/60 text-foreground/80 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                <Users className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-4">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-foreground">{clients.length}</span>
                <span className="text-xs text-muted-foreground">ativos</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{currentDict.managedInSystem}</p>
            </CardContent>
          </Card>
        </Link>

        {/* card total de evidencias */}
        <Link href={DASHBOARD_ROUTES.evidences} className="group">
          <Card className="border border-border/60 hover:border-primary/50 bg-card/60 hover:bg-card transition-all duration-200 shadow-sm rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 pt-4 px-5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{currentDict.totalFindings}</span>
              <div className="p-2 rounded-lg bg-secondary/60 text-foreground/80 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                <Bomb className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-4">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-foreground">{findings.length}</span>
                <span className="text-xs font-semibold text-primary">identificados</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{currentDict.inActiveProjects}</p>
            </CardContent>
          </Card>
        </Link>

        {/* card findings criticos com acento carmesim seguro */}
        <Link href={`${DASHBOARD_ROUTES.evidences}?severity=Critical`} className="group">
          <Card className="border border-destructive/40 hover:border-destructive bg-destructive/5 hover:bg-destructive/10 transition-all duration-200 shadow-sm rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 pt-4 px-5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-destructive">{currentDict.criticalFindings}</span>
              <div className="p-2 rounded-lg bg-destructive/20 text-destructive">
                <ShieldCheck className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-4">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-destructive">{criticalFindings}</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-destructive/20 text-destructive uppercase">Atenção</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{currentDict.immediateAttention}</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* layout principal dividido em duas colunas assimétricas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* coluna esquerda (8 de 12): tabela de projetos recentes */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <Card className="border border-border/60 bg-card/60 shadow-sm rounded-xl">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-border/40">
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="font-headline text-lg font-bold">{currentDict.recentProjects}</CardTitle>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-semibold">{projects.length} totais</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{currentDict.recentProjectsDesc}</p>
              </div>
              {/* controles de filtro rapido */}
              <div className="flex items-center gap-2">
                <select
                  value={typeFilter}
                  onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
                  className="text-xs h-8 px-2.5 rounded-lg border border-border/60 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="all">
                    {currentLocale === 'pt-br' ? 'Todos os Tipos' : currentLocale === 'es' ? 'Todos los Tipos' : 'All Types'}
                  </option>
                  <option value="pentest">Pentest</option>
                  <option value="writeup">Writeup</option>
                </select>
                <select
                  value={statusFilter} // valor vinculado
                  onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} // altera filtro
                  className="text-xs h-8 px-2.5 rounded-lg border border-border/60 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="all">{currentDict.allStatuses}</option>
                  <option value="in_progress">Em Andamento</option>
                  <option value="completed">Concluído</option>
                  <option value="draft">Rascunho</option>
                </select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {recentProjects.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow className="border-b border-border/50 text-[11px] font-bold text-muted-foreground">
                        <TableHead onClick={() => requestSort('name')} className="cursor-pointer hover:text-foreground py-3 pl-5">
                          <div className="flex items-center">{currentDict.project}{getSortIcon('name')}</div>
                        </TableHead>
                        <TableHead onClick={() => requestSort('clientName')} className="cursor-pointer hover:text-foreground py-3">
                          <div className="flex items-center">{currentDict.client}{getSortIcon('clientName')}</div>
                        </TableHead>
                        <TableHead onClick={() => requestSort('findingCount')} className="cursor-pointer hover:text-foreground py-3 text-center">
                          <div className="flex items-center justify-center">{currentDict.findings}{getSortIcon('findingCount')}</div>
                        </TableHead>
                        <TableHead onClick={() => requestSort('status')} className="cursor-pointer hover:text-foreground py-3">
                          <div className="flex items-center">{currentDict.status}{getSortIcon('status')}</div>
                        </TableHead>
                        <TableHead onClick={() => requestSort('updatedAt')} className="cursor-pointer hover:text-foreground py-3">
                          <div className="flex items-center">{currentDict.lastUpdated}{getSortIcon('updatedAt')}</div>
                        </TableHead>
                        <TableHead className="py-3 pr-5 text-right">{currentDict.action}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentProjects.map(p => {
                        const Icon = projectIconComponents[p.icon] || ProjectIcon; // resolve icone
                        return (
                          <TableRow key={p.id} className="border-b border-border/40 hover:bg-muted/30 transition-colors">
                            <TableCell className="py-3.5 pl-5 font-medium">
                              <Link href={`/report/9a4f2c1b8e7d3a6e/${p.id}`} className="flex items-center gap-2.5 text-foreground hover:text-primary transition-colors">
                                <div className="p-1.5 rounded-lg bg-secondary/80 text-primary shrink-0">
                                  <Icon className="h-4 w-4" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-semibold text-sm truncate max-w-[200px]">{p.name}</span>
                                    <span
                                      className={`inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                                        p.type === 'writeup'
                                          ? 'border-amber-500/40 bg-amber-500/10 text-amber-500'
                                          : 'border-primary/40 bg-primary/10 text-primary'
                                      }`}
                                    >
                                      {p.type === 'writeup' ? 'Writeup' : 'Pentest'}
                                    </span>
                                  </div>
                                  <span className="text-[11px] text-muted-foreground font-mono">{p.id}</span>
                                </div>
                              </Link>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">{p.clientName}</TableCell>
                            <TableCell className="text-center">
                              <span className="inline-flex items-center justify-center h-6 min-w-6 px-2 rounded-full text-xs font-bold bg-destructive/15 text-destructive">
                                {p.findingCount}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge variant={getStatusVariant(p.status)} className="font-semibold text-[11px] rounded-md px-2 py-0.5">
                                {getStatus(p.status)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                              {formatDistanceToNow(new Date(p.updatedAt), { addSuffix: true, locale: dateLocale })}
                            </TableCell>
                            <TableCell className="py-3.5 pr-5 text-right">
                              <Button asChild size="sm" variant="outline" className="h-7 text-xs px-2.5 rounded-md hover:bg-primary hover:text-primary-foreground">
                                <Link href={`/report/9a4f2c1b8e7d3a6e/${p.id}`}>
                                  {currentDict.open}
                                </Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  Nenhum projeto encontrado para este filtro.
                </div>
              )}
              {/* paginacao limpa no rodape */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-border/40">
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="h-8 text-xs"
                  >
                    <ChevronLeft className="mr-1 h-3.5 w-3.5" />
                    {currentDict.previous}
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    {currentDict.page} {currentPage} {currentDict.of} {totalPages}
                  </span>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="h-8 text-xs"
                  >
                    {currentDict.next}
                    <ChevronRight className="ml-1 h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* coluna direita (4 de 12): the latest feed + status operacional */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* card the latest feed */}
          <Card className="border border-border/60 bg-card/60 shadow-sm rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/40">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <CardTitle className="font-headline text-base font-bold text-foreground">{currentDict.latestActivity}</CardTitle>
              </div>
              <span className="text-[11px] text-muted-foreground font-medium">{currentDict.realtime}</span>
            </CardHeader>
            <CardContent className="p-4 flex flex-col gap-3.5">
              {latestFindings.length > 0 ? (
                latestFindings.map((f, idx) => (
                  <div key={f.id || idx} className="flex flex-col gap-1 p-2.5 rounded-lg bg-secondary/30 hover:bg-secondary/60 transition-colors border border-border/30">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-foreground truncate max-w-[210px]">{f.title}</span>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">Recente</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                      {f.markdown ? f.markdown.replace(/[#*`_]/g, '').slice(0, 100) : 'Evidência documentada e validada pelo operador de segurança.'} {/* preview do texto do finding */}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-3 rounded-lg bg-secondary/30 border border-border/30">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">Ambiente Pronto</span>
                    <span className="text-[10px] text-muted-foreground">Agora</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Nenhum finding recente registrado no momento.
                  </p>
                </div>
              )}
              {/* link para todas as evidencias */}
              <Link href={DASHBOARD_ROUTES.evidences} className="text-xs font-semibold text-primary hover:underline text-center pt-1 block">
                {currentDict.viewAllAudit}
              </Link>
            </CardContent>
          </Card>

          {/* card status operacional do sistema */}
          <Card className="border border-primary/30 bg-primary/5 shadow-sm rounded-xl p-4">
            <div className="flex items-center justify-between pb-2">
              <span className="text-[11px] font-bold tracking-wider text-primary uppercase">{currentDict.operationalStatus}</span>
              <span className="h-2 w-2 rounded-full bg-primary" />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {currentDict.operationalDesc}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
