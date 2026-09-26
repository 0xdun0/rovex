'use client'; // componente client side interativo

import React, { useState, useMemo } from 'react'; // hooks do react
import { Input } from "@/components/ui/input"; // campo de busca
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; // estrutura de tabela
import { Badge } from "@/components/ui/badge"; // badges de severidade
import { Card, CardContent } from "@/components/ui/card"; // cards visuais
import { Search, PlusCircle, ArrowUpDown, Edit, Trash2, ChevronLeft, ChevronRight, GridFour, Rows, ShieldCheck, ShieldWarning } from "@/components/icons"; // icones
import { useLanguage } from "@/context/language-context"; // internacionalizacao
import Link from 'next/link'; // navegacao interna
import { Button } from "@/components/ui/button"; // botoes
import type { Vulnerability } from '@/lib/types'; // tipagem de vulnerabilidade
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'; // dialogo de exclusao
import { useToast } from '@/hooks/use-toast'; // notificacoes toast
import { useRouter } from 'next/navigation'; // roteamento
import { useData } from '@/context/data-context'; // dados do sistema
import { getVulnerabilityIcon } from '@/lib/vulnerability-icons'; // icones tematicos
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // selecao

type SortKey = keyof Vulnerability | 'cvssScore'; // campos ordenaveis

// categorias operacionais de riscos
const vulnerabilityCategories = [
  { value: 'All', label_en: 'All Categories', label_es: 'Todas las Categorías', label_pt: 'Todas as Categorias' },
  { value: 'Web', label_en: 'Web Applications', label_es: 'Aplicaciones Web', label_pt: 'Aplicações Web' },
  { value: 'Mobile', label_en: 'Mobile Apps', label_es: 'Aplicaciones Móviles', label_pt: 'Aplicações Mobile' },
  { value: 'Network', label_en: 'Network & Infra', label_es: 'Redes e Infra', label_pt: 'Redes e Infra' },
  { value: 'Infrastructure', label_en: 'Cloud & System', label_es: 'Nube y Sistemas', label_pt: 'Cloud e Sistemas' },
  { value: 'Authentication', label_en: 'Identity & Auth', label_es: 'Identidad y Auth', label_pt: 'Identidade e Auth' },
  { value: 'Cryptography', label_en: 'Cryptography', label_es: 'Criptografía', label_pt: 'Criptografia' },
  { value: 'Additional', label_en: 'Specialized', label_es: 'Especializados', label_pt: 'Especializados' },
];

export default function VulnerabilitiesPage() {
  const { currentLocale } = useLanguage(); // locale ativo
  const { toast } = useToast(); // toast
  const router = useRouter(); // roteador
  const { vulnerabilities, deleteVulnerability } = useData(); // colecao global
  
  // estados de filtro, busca e ordenacao
  const [searchTerm, setSearchTerm] = useState(''); // termo de pesquisa
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'ascending' | 'descending' } | null>({ key: 'cvssScore', direction: 'descending' }); // ordenacao padrao por cvss
  const [vulnerabilityToDelete, setVulnerabilityToDelete] = useState<Vulnerability | null>(null); // item para exclusao
  const [selectedCategory, setSelectedCategory] = useState<string>('All'); // categoria selecionada
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All'); // filtro por severidade
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table'); // modo de exibicao tabela vs grid

  // estados de paginacao
  const [currentPage, setCurrentPage] = useState(1); // pagina atual
  const [pageSize, setPageSize] = useState(8); // itens por pagina

  // variante visual de cor para severidade
  const getSeverityVariant = (severity: string): 'critical' | 'high' | 'medium' | 'low' | 'informational' => {
    switch (severity) {
      case 'Critical': return 'critical';
      case 'High': return 'high';
      case 'Medium': return 'medium';
      case 'Low': return 'low';
      default: return 'informational';
    }
  };

  // dicionario com termos tecnicos solicitados por dj
  const t = {
    en: {
      title: "Risks Knowledge Base", // titulo executivo
      subtitle: "Catalog of security risks, threat vectors and remediation guidance.", // subtitulo
      search: "Filter risks by name, CWE or tags...", // placeholder
      categoryPlaceholder: "All Categories", // seletor
      tableTitle: "Risk & Threat Vector", // coluna titulo
      tableSeverity: "Severity", // coluna severidade
      tableCvss: "CVSS v3.1", // coluna cvss
      tableReference: "CWE Reference", // coluna cwe
      tableCategory: "Domain", // coluna categoria
      tableActions: "Actions", // coluna acoes
      edit: "Edit", // editar
      delete: "Delete", // excluir
      newVulnerability: "New Risk Entry", // novo risco
      confirmDeleteTitle: "Delete Risk Definition?", // confirmacao
      confirmDeleteDesc: "This action cannot be undone. This definition will be permanently removed from your catalog.", // descricao
      cancel: "Cancel", // cancelar
      vulnerabilityDeleted: "Risk entry deleted successfully.", // sucesso
      showing: "Showing", // paginacao
      to: "to", // paginacao
      of: "of", // paginacao
      results: "risks", // paginacao
      perPage: "per page", // por pagina
      viewTable: "Matrix Table", // visualizacao tabela
      viewGrid: "Tactical Cards", // visualizacao cards
      allSeverities: "All Severities", // aba todos
      critical: "Critical", // aba critico
      high: "High", // aba alto
      medium: "Medium", // aba medio
      low: "Low", // aba baixo
      totalRisks: "Total Cataloged", // kpi
      criticalCount: "Critical Impact", // kpi
      avgScore: "Average Score", // kpi
    },
    'pt-br': {
      title: "Base de Conhecimento de Riscos", // titulo executivo
      subtitle: "Catálogo centralizado de riscos de segurança, vetores de ameaça e guias de correção.", // subtitulo
      search: "Filtrar riscos por título, CWE ou tags…", // placeholder
      categoryPlaceholder: "Todas as Categorias", // seletor
      tableTitle: "Risco & Vetor de Ameaça", // coluna titulo
      tableSeverity: "Severidade", // coluna severidade
      tableCvss: "CVSS v3.1", // coluna cvss
      tableReference: "Referência CWE", // coluna cwe
      tableCategory: "Domínio", // coluna categoria
      tableActions: "Ações", // coluna acoes
      edit: "Editar", // editar
      delete: "Excluir", // excluir
      newVulnerability: "Novo Risco", // novo risco
      confirmDeleteTitle: "Excluir Definição de Risco?", // confirmacao
      confirmDeleteDesc: "Esta ação não pode ser desfeita. A definição será removida permanentemente do catálogo.", // descricao
      cancel: "Cancelar", // cancelar
      vulnerabilityDeleted: "Risco excluído com sucesso.", // sucesso
      showing: "Exibindo", // paginacao
      to: "a", // paginacao
      of: "de", // paginacao
      results: "riscos", // paginacao
      perPage: "por página", // por pagina
      viewTable: "Tabela Matriz", // visualizacao tabela
      viewGrid: "Cards Táticos", // visualizacao cards
      allSeverities: "Todas as Severidades", // aba todos
      critical: "Crítico", // aba critico
      high: "Alto", // aba alto
      medium: "Médio", // aba medio
      low: "Baixo", // aba baixo
      totalRisks: "Total Catalogado", // kpi
      criticalCount: "Impacto Crítico", // kpi
      avgScore: "Média CVSS", // kpi
    },
    es: {
      title: "Base de Conocimiento de Riesgos", // titulo executivo
      subtitle: "Catálogo de riesgos de seguridad, vectores de amenaza y guías de remediación.", // subtitulo
      search: "Buscar riesgos por nombre, CWE o etiquetas...", // placeholder
      categoryPlaceholder: "Todas las Categorías", // seletor
      tableTitle: "Riesgo y Vector de Amenaza", // coluna titulo
      tableSeverity: "Severidad", // coluna severidade
      tableCvss: "CVSS v3.1", // coluna cvss
      tableReference: "Referencia CWE", // coluna cwe
      tableCategory: "Dominio", // coluna categoria
      tableActions: "Acciones", // coluna acoes
      edit: "Editar", // editar
      delete: "Eliminar", // excluir
      newVulnerability: "Nuevo Riesgo", // novo risco
      confirmDeleteTitle: "¿Eliminar definición de riesgo?", // confirmacao
      confirmDeleteDesc: "Esta acción no se puede deshacer. Se eliminará permanentemente del catálogo.", // descricao
      cancel: "Cancelar", // cancelar
      vulnerabilityDeleted: "Riesgo eliminado correctamente.", // sucesso
      showing: "Mostrando", // paginacao
      to: "a", // paginacao
      of: "de", // paginacao
      results: "riesgos", // paginacao
      perPage: "por página", // por pagina
      viewTable: "Tabla Matriz", // visualizacao tabela
      viewGrid: "Tarjetas Tácticas", // visualizacao cards
      allSeverities: "Todas las Severidades", // aba todos
      critical: "Crítico", // aba critico
      high: "Alto", // aba alto
      medium: "Medio", // aba medio
      low: "Bajo", // aba baixo
      totalRisks: "Total Catalogado", // kpi
      criticalCount: "Impacto Crítico", // kpi
      avgScore: "Promedio CVSS", // kpi
    }
  };

  const dict = (t as Record<string, typeof t.en>)[currentLocale] || (currentLocale === 'pt-br' ? t['pt-br'] : (currentLocale === 'es' ? t.es : t.en));

  // exclui a vulnerabilidade
  const handleDeleteVulnerability = () => {
    if (!vulnerabilityToDelete) return;
    deleteVulnerability(vulnerabilityToDelete.id); // remove do banco
    toast({ title: dict.vulnerabilityDeleted }); // notifica
    setVulnerabilityToDelete(null); // fecha modal
  };

  // navega para a tela de edicao
  const handleEditVulnerability = (vulnerabilityId: string) => {
    router.push(`/report/3b8e4f1a9c2d7e6f/${vulnerabilityId}`); // abre tela de edicao
  };

  // metricas kpi resumidas
  const kpis = useMemo(() => {
    const total = vulnerabilities.length;
    const critical = vulnerabilities.filter(v => v.severity === 'Critical').length;
    const high = vulnerabilities.filter(v => v.severity === 'High').length;
    const avg = total > 0 ? (vulnerabilities.reduce((acc, v) => acc + (v.cvss?.score || 0), 0) / total).toFixed(1) : '0.0';
    return { total, critical, high, avg };
  }, [vulnerabilities]);

  // lista filtrada e ordenada
  const filteredVulnerabilities = useMemo(() => {
    let filtered = vulnerabilities.filter(vuln => {
      const term = searchTerm.toLowerCase();
      const categoryMatch = selectedCategory === 'All' || vuln.tags.includes(selectedCategory); // filtro categoria
      const severityMatch = selectedSeverity === 'All' || vuln.severity.toLowerCase() === selectedSeverity.toLowerCase(); // filtro severidade
      const searchMatch = vuln.title_en.toLowerCase().includes(term) ||
                          (vuln.title_es && vuln.title_es.toLowerCase().includes(term)) ||
                          vuln.cwe.toLowerCase().includes(term) ||
                          vuln.tags.some(tag => tag.toLowerCase().includes(term));
      return categoryMatch && severityMatch && searchMatch;
    });

    if (sortConfig !== null) {
      filtered.sort((a, b) => {
        let aValue, bValue;
        if (sortConfig.key === 'cvssScore') {
          aValue = a.cvss?.score || 0;
          bValue = b.cvss?.score || 0;
        } else if (sortConfig.key === 'title_en') {
          aValue = currentLocale === 'es' ? a.title_es : a.title_en;
          bValue = currentLocale === 'es' ? b.title_es : b.title_en;
        } else {
          aValue = (a as any)[sortConfig.key];
          bValue = (b as any)[sortConfig.key];
        }

        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [searchTerm, sortConfig, vulnerabilities, currentLocale, selectedCategory, selectedSeverity]);

  // dados paginados
  const totalItems = filteredVulnerabilities.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedVulnerabilities = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredVulnerabilities.slice(start, start + pageSize);
  }, [filteredVulnerabilities, safeCurrentPage, pageSize]);

  // acao de ordenacao
  const requestSort = (key: SortKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  // icone de ordenacao
  const getSortIcon = (key: SortKey) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown className="ml-1.5 h-3.5 w-3.5 opacity-40" />;
    }
    return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
  };

  return (
    <>
      <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
        {/* cabecalho com titulo e acao primária */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
              {dict.title}
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/25">
                {totalItems} {dict.results}
              </span>
            </h1>
            <p className="text-sm text-muted-foreground">{dict.subtitle}</p>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild className="rounded-xl shadow-sm bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/report/3b8e4f1a9c2d7e6f/new">
                <PlusCircle className="mr-2 h-4 w-4" /> {dict.newVulnerability}
              </Link>
            </Button>
          </div>
        </div>

        {/* cards de kpi executivo para diferenciacao visual */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="rounded-xl border border-border/70 bg-card/40 backdrop-blur-sm p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{dict.totalRisks}</p>
            <p className="text-2xl font-bold font-headline mt-1 text-foreground">{kpis.total}</p>
          </Card>
          <Card className="rounded-xl border border-destructive/30 bg-destructive/5 backdrop-blur-sm p-4">
            <p className="text-xs font-medium text-destructive uppercase tracking-wider">{dict.criticalCount}</p>
            <p className="text-2xl font-bold font-headline mt-1 text-destructive">{kpis.critical}</p>
          </Card>
          <Card className="rounded-xl border border-amber-500/30 bg-amber-500/5 backdrop-blur-sm p-4">
            <p className="text-xs font-medium text-amber-500 uppercase tracking-wider">High Exposure</p>
            <p className="text-2xl font-bold font-headline mt-1 text-amber-500">{kpis.high}</p>
          </Card>
          <Card className="rounded-xl border border-border/70 bg-card/40 backdrop-blur-sm p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{dict.avgScore}</p>
            <p className="text-2xl font-bold font-mono mt-1 text-foreground">{kpis.avg}</p>
          </Card>
        </div>

        {/* barra de filtros avancados e alternador de visualizacao */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-card/50 p-3 rounded-2xl border border-border/60">
          {/* busca e categoria */}
          <div className="flex flex-wrap items-center gap-2 flex-1">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={dict.search}
                className="w-full rounded-xl bg-background/80 pl-9 h-9 text-sm"
                value={searchTerm}
                onChange={e => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // reinicia pagina
                }}
              />
            </div>

            {/* seletor de categorias */}
            <Select 
              value={selectedCategory} 
              onValueChange={val => {
                setSelectedCategory(val);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-auto min-w-[170px] h-9 rounded-xl text-xs bg-background/80">
                <SelectValue placeholder={dict.categoryPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {vulnerabilityCategories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value} className="text-xs">
                    {currentLocale === 'pt-br' ? cat.label_pt : (currentLocale === 'es' ? cat.label_es : cat.label_en)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* tabs de severidade rapida e alternador de grid/tabela */}
          <div className="flex items-center gap-2 justify-between lg:justify-end">
            {/* abas de severidade */}
            <div className="inline-flex items-center p-1 bg-muted/40 rounded-xl border border-border/50 text-xs">
              {['All', 'Critical', 'High', 'Medium'].map((sev) => {
                const isActive = selectedSeverity === sev;
                return (
                  <button
                    key={sev}
                    onClick={() => {
                      setSelectedSeverity(sev);
                      setCurrentPage(1);
                    }}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                      isActive 
                        ? 'bg-background text-foreground shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {sev === 'All' ? dict.allSeverities.split(' ')[0] : sev}
                  </button>
                );
              })}
            </div>

            {/* seletor de modo de visualizacao (tabela vs grid) */}
            <div className="inline-flex items-center p-1 bg-muted/40 rounded-xl border border-border/50">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('table')}
                className={`h-7 px-2.5 rounded-lg text-xs gap-1.5 ${viewMode === 'table' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}
              >
                <Rows className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{dict.viewTable}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('grid')}
                className={`h-7 px-2.5 rounded-lg text-xs gap-1.5 ${viewMode === 'grid' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}
              >
                <GridFour className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{dict.viewGrid}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* exibicao no modo tabela matriz */}
        {viewMode === 'table' ? (
          <Card className="rounded-2xl border border-border/70 shadow-sm overflow-hidden bg-card/60 backdrop-blur-sm">
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border/70 bg-muted/30 hover:bg-muted/30">
                    <TableHead onClick={() => requestSort('title_en')} className="cursor-pointer hover:bg-muted/50 font-semibold text-xs tracking-wider uppercase text-muted-foreground pl-6">
                      <div className="flex flex-row items-center">{dict.tableTitle} {getSortIcon('title_en')}</div>
                    </TableHead>
                    <TableHead onClick={() => requestSort('severity')} className="cursor-pointer hover:bg-muted/50 font-semibold text-xs tracking-wider uppercase text-muted-foreground">
                      <div className="flex flex-row items-center">{dict.tableSeverity} {getSortIcon('severity')}</div>
                    </TableHead>
                    <TableHead onClick={() => requestSort('cvssScore')} className="cursor-pointer hover:bg-muted/50 font-semibold text-xs tracking-wider uppercase text-muted-foreground">
                      <div className="flex items-center">{dict.tableCvss} {getSortIcon('cvssScore')}</div>
                    </TableHead>
                    <TableHead onClick={() => requestSort('cwe')} className="cursor-pointer hover:bg-muted/50 font-semibold text-xs tracking-wider uppercase text-muted-foreground">
                      <div className="flex flex-row items-center">{dict.tableReference} {getSortIcon('cwe')}</div>
                    </TableHead>
                    <TableHead className="font-semibold text-xs tracking-wider uppercase text-muted-foreground">{dict.tableCategory}</TableHead>
                    <TableHead className="text-right pr-6 font-semibold text-xs tracking-wider uppercase text-muted-foreground">{dict.tableActions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedVulnerabilities.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-muted-foreground text-sm">
                        Nenhum risco encontrado para os filtros selecionados.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedVulnerabilities.map((vuln) => {
                      const VulnIcon = getVulnerabilityIcon(vuln.id);
                      return (
                        <TableRow key={vuln.id} className="border-b border-border/50 hover:bg-muted/40 transition-colors">
                          <TableCell className="font-medium pl-6 py-3.5">
                            <Link href={`/report/3b8e4f1a9c2d7e6f/${vuln.id}`} className="flex items-center gap-3 font-semibold text-sm hover:text-primary transition-colors">
                              <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                                <VulnIcon weight="duotone" className="h-4 w-4 text-primary" />
                              </div>
                              <span className="line-clamp-1">{currentLocale === 'es' ? vuln.title_es : vuln.title_en}</span>
                            </Link>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getSeverityVariant(vuln.severity)} className="rounded-full px-2.5 py-0.5 font-semibold text-xs">{vuln.severity}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-12 h-1.5 rounded-full bg-muted overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${
                                    vuln.cvss.score >= 9 ? 'bg-destructive' :
                                    vuln.cvss.score >= 7 ? 'bg-amber-500' :
                                    vuln.cvss.score >= 4 ? 'bg-blue-500' : 'bg-emerald-500'
                                  }`}
                                  style={{ width: `${(vuln.cvss.score / 10) * 100}%` }}
                                />
                              </div>
                              <span className="font-mono text-xs font-bold text-foreground">{vuln.cvss.score.toFixed(1)}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">{vuln.cwe}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 flex-wrap">
                              {vuln.tags.slice(0, 2).map(tag => (
                                <span key={tag} className="text-[10px] px-2 py-0.5 rounded-md bg-accent/20 text-muted-foreground border border-border/50">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" onClick={() => handleEditVulnerability(vuln.id)} className="h-8 w-8 rounded-lg hover:bg-accent/15">
                                <Edit className="h-3.5 w-3.5" />
                                <span className="sr-only">{dict.edit}</span>
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => setVulnerabilityToDelete(vuln)} className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/15">
                                <Trash2 className="h-3.5 w-3.5" />
                                <span className="sr-only">{dict.delete}</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          /* exibicao no modo cards taticos */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginatedVulnerabilities.map((vuln) => {
              const VulnIcon = getVulnerabilityIcon(vuln.id);
              return (
                <Card key={vuln.id} className="rounded-2xl border border-border/70 hover:border-primary/40 transition-all duration-200 bg-card/60 backdrop-blur-sm p-4 flex flex-col justify-between group shadow-sm hover:shadow-md">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                        <VulnIcon weight="duotone" className="h-5 w-5 text-primary" />
                      </div>
                      <Badge variant={getSeverityVariant(vuln.severity)} className="rounded-full px-2.5 py-0.5 font-semibold text-xs">
                        {vuln.severity}
                      </Badge>
                    </div>

                    <div>
                      <Link href={`/report/3b8e4f1a9c2d7e6f/${vuln.id}`} className="font-semibold text-sm text-foreground hover:text-primary transition-colors line-clamp-2 leading-snug">
                        {currentLocale === 'es' ? vuln.title_es : vuln.title_en}
                      </Link>
                      <p className="text-xs font-mono text-muted-foreground mt-1">{vuln.cwe}</p>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      {vuln.tags.map(tag => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">CVSS</span>
                      <span className="text-xs font-mono font-bold text-foreground bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">
                        {vuln.cvss.score.toFixed(1)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEditVulnerability(vuln.id)} className="h-7 w-7 rounded-lg">
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setVulnerabilityToDelete(vuln)} className="h-7 w-7 rounded-lg text-destructive hover:bg-destructive/15">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* barra de paginacao robusta */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-muted-foreground">
          {/* contador de itens */}
          <div>
            {dict.showing} <span className="font-semibold text-foreground">{totalItems > 0 ? (safeCurrentPage - 1) * pageSize + 1 : 0}</span> {dict.to} <span className="font-semibold text-foreground">{Math.min(safeCurrentPage * pageSize, totalItems)}</span> {dict.of} <span className="font-semibold text-foreground">{totalItems}</span> {dict.results}
          </div>

          {/* controles de pagina */}
          <div className="flex items-center gap-2">
            {/* seletor de itens por pagina */}
            <Select 
              value={String(pageSize)} 
              onValueChange={val => {
                setPageSize(Number(val));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-auto h-8 text-xs rounded-xl bg-background/80">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[6, 8, 12, 24].map(size => (
                  <SelectItem key={size} value={String(size)} className="text-xs">
                    {size} {dict.perPage}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* botoes anterior e proximo */}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                disabled={safeCurrentPage <= 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="h-8 w-8 rounded-xl"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {/* indicador de pagina atual */}
              <div className="px-3 py-1 font-medium text-foreground bg-muted/30 rounded-xl border border-border/50">
                {safeCurrentPage} / {totalPages}
              </div>

              <Button
                variant="outline"
                size="icon"
                disabled={safeCurrentPage >= totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="h-8 w-8 rounded-xl"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* dialogo modal para confirmar exclusao */}
      <AlertDialog open={!!vulnerabilityToDelete} onOpenChange={() => setVulnerabilityToDelete(null)}>
        <AlertDialogContent className="rounded-2xl border-border/80">
          <AlertDialogHeader>
            <AlertDialogTitle>{dict.confirmDeleteTitle}</AlertDialogTitle>
            <AlertDialogDescription>{dict.confirmDeleteDesc}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">{dict.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteVulnerability} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl">
              {dict.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
