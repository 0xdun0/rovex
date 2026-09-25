'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Search,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  FileText,
  Calendar,
  ExternalLink,
  FolderOpen,
  Terminal,
  Crosshair,
  AlertTriangle,
  User,
  CheckCircle,
} from '@/components/icons';
import { useLanguage } from '@/context/language-context';
import type { Finding, Severity } from '@/lib/types';
import type { Icon } from '@phosphor-icons/react';
import { useData } from '@/context/data-context';
import { getVulnerabilityIcon } from '@/lib/vulnerability-icons';
import { Input } from '@/components/ui/input';
import { MarkdownPreview } from '@/components/markdown-preview';
import { cn } from '@/lib/utils';

type EnrichedFinding = Finding & {
  projectName: string;
  projectType: string;
  clientName: string;
  icon: Icon;
};

// Cores taticas sobrias (zero neon) para classificacao de severidade
const SEVERITY_THEME: Record<
  Severity,
  {
    badge: string;
    scoreBg: string;
    border: string;
    text: string;
    dot: string;
  }
> = {
  Critical: {
    badge: 'bg-rose-950/40 text-rose-400 border-rose-800/50',
    scoreBg: 'bg-rose-950/50 text-rose-300 border-rose-800/60',
    border: 'border-l-rose-600',
    text: 'text-rose-400',
    dot: 'bg-rose-500',
  },
  High: {
    badge: 'bg-orange-950/40 text-orange-400 border-orange-800/50',
    scoreBg: 'bg-orange-950/50 text-orange-300 border-orange-800/60',
    border: 'border-l-orange-600',
    text: 'text-orange-400',
    dot: 'bg-orange-500',
  },
  Medium: {
    badge: 'bg-amber-950/40 text-amber-400 border-amber-800/50',
    scoreBg: 'bg-amber-950/50 text-amber-300 border-amber-800/60',
    border: 'border-l-amber-600',
    text: 'text-amber-400',
    dot: 'bg-amber-500',
  },
  Low: {
    badge: 'bg-sky-950/40 text-sky-400 border-sky-800/50',
    scoreBg: 'bg-sky-950/50 text-sky-300 border-sky-800/60',
    border: 'border-l-sky-600',
    text: 'text-sky-400',
    dot: 'bg-sky-500',
  },
  Informational: {
    badge: 'bg-zinc-900 text-zinc-400 border-zinc-800',
    scoreBg: 'bg-zinc-900 text-zinc-300 border-zinc-800',
    border: 'border-l-zinc-600',
    text: 'text-zinc-400',
    dot: 'bg-zinc-500',
  },
};

export default function AllFindingsPage() {
  const { currentLocale } = useLanguage();
  const { findings, projects, clients, vulnerabilities } = useData();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [severityFilter, setSeverityFilter] = useState<string>(searchParams.get('severity') || 'All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFindingId, setSelectedFindingId] = useState<string>('');

  // Mapeamento auxiliar de vulnerabilidades por titulo
  const vulnerabilityIdByTitle = useMemo(() => {
    const byTitle = new Map<string, string>();
    vulnerabilities.forEach((v) => {
      [v.title_en, v.title_es].forEach((title) => {
        if (title) byTitle.set(title.trim().toLowerCase(), v.id);
      });
    });
    return byTitle;
  }, [vulnerabilities]);

  // Enriquecimento de achados com metadados de projeto, cliente e icone
  const enrichedFindings: EnrichedFinding[] = useMemo(() => {
    return findings.map((f) => {
      const project = projects.find((p) => p.id === f.projectId);
      const client = clients.find((c) => c.id === project?.clientId);
      const vulnerabilityId = f.vulnerabilityId || vulnerabilityIdByTitle.get(f.title.trim().toLowerCase());
      return {
        ...f,
        projectName: project?.name || 'N/A',
        projectType: project?.type || (project?.id.includes('writeup') ? 'writeup' : 'pentest'),
        clientName: client?.name || 'N/A',
        icon: vulnerabilityId ? getVulnerabilityIcon(vulnerabilityId) : ShieldAlert,
      };
    });
  }, [findings, projects, clients, vulnerabilityIdByTitle]);

  // Contagens de cada severidade para as abas
  const counts = useMemo(() => {
    const total = enrichedFindings.length;
    const critical = enrichedFindings.filter((f) => f.severity === 'Critical').length;
    const high = enrichedFindings.filter((f) => f.severity === 'High').length;
    const medium = enrichedFindings.filter((f) => f.severity === 'Medium').length;
    const low = enrichedFindings.filter((f) => f.severity === 'Low').length;
    const info = enrichedFindings.filter((f) => f.severity === 'Informational').length;
    return { all: total, critical, high, medium, low, info };
  }, [enrichedFindings]);

  // Filtragem e ordenacao por CVSS decrescente
  const filteredFindings = useMemo(() => {
    let list = [...enrichedFindings];

    if (severityFilter !== 'All') {
      list = list.filter((f) => f.severity === severityFilter);
    }

    const q = searchTerm.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (f) =>
          f.title.toLowerCase().includes(q) ||
          f.projectName.toLowerCase().includes(q) ||
          f.clientName.toLowerCase().includes(q) ||
          (f.vulnerabilityId && f.vulnerabilityId.toLowerCase().includes(q))
      );
    }

    // Ordenacao prioritária por CVSS decrescente
    list.sort((a, b) => b.cvss - a.cvss);
    return list;
  }, [enrichedFindings, severityFilter, searchTerm]);

  // Sincroniza selecao com a lista filtrada
  useEffect(() => {
    if (filteredFindings.length === 0) {
      setSelectedFindingId('');
      return;
    }
    const currentStillExists = filteredFindings.some((f) => f.id === selectedFindingId);
    if (!currentStillExists) {
      setSelectedFindingId(filteredFindings[0].id);
    }
  }, [filteredFindings, selectedFindingId]);

  // Achado ativo no inspector lateral
  const activeFinding = useMemo(() => {
    return enrichedFindings.find((f) => f.id === selectedFindingId) || filteredFindings[0];
  }, [enrichedFindings, filteredFindings, selectedFindingId]);

  const formatDateDisplay = (dateString?: string) => {
    if (!dateString) return '—';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString;
      return d.toLocaleDateString(currentLocale === 'pt-br' ? 'pt-BR' : 'en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const dictMap = {
    en: {
      title: 'Evidence Vault',
      subtitle: 'Repository of confirmed vulnerabilities, threat vectors, and verified exploit proofs',
      all: 'All',
      critical: 'Critical',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      info: 'Info',
      searchPlaceholder: 'Search vulnerabilities, targets, projects or CWE…',
      cvssScore: 'CVSS v3.1',
      severity: 'Severity',
      project: 'Project',
      target: 'Target',
      recorded: 'Recorded',
      lastUpdate: 'Last Update',
      technicalAnalysis: 'Technical Proof Dossier',
      noMarkdown: 'No technical markdown report attached to this evidence.',
      openFinding: 'Edit Finding in Project',
      viewProject: 'Open Project',
      viewReport: 'View Report',
      emptyList: 'No evidences match current filters.',
    },
    'pt-br': {
      title: 'Evidence Vault',
      subtitle: 'Repositório de vulnerabilidades identificadas, vetor de risco e evidências de invasão',
      all: 'Todos',
      critical: 'Crítico',
      high: 'Alto',
      medium: 'Médio',
      low: 'Baixo',
      info: 'Info',
      searchPlaceholder: 'Buscar por vulnerabilidade, projeto, alvo ou CWE…',
      cvssScore: 'CVSS v3.1',
      severity: 'Severidade',
      project: 'Projeto',
      target: 'Alvo',
      recorded: 'Registrado em',
      lastUpdate: 'Última Atualização',
      technicalAnalysis: 'Dossiê Técnico da Evidência',
      noMarkdown: 'Nenhum relatório técnico em markdown anexado a esta evidência.',
      openFinding: 'Editar Evidência no Projeto',
      viewProject: 'Abrir Projeto',
      viewReport: 'Ver Relatório',
      emptyList: 'Nenhuma evidência localizada com os filtros ativos.',
    },
    es: {
      title: 'Evidence Vault',
      subtitle: 'Repositorio de vulnerabilidades confirmadas, vectores de riesgo y evidencias de explotación',
      all: 'Todos',
      critical: 'Crítico',
      high: 'Alto',
      medium: 'Medio',
      low: 'Bajo',
      info: 'Info',
      searchPlaceholder: 'Buscar por vulnerabilidad, proyecto, objetivo o CWE…',
      cvssScore: 'CVSS v3.1',
      severity: 'Severidad',
      project: 'Proyecto',
      target: 'Objetivo',
      recorded: 'Registrado el',
      lastUpdate: 'Última Actualización',
      technicalAnalysis: 'Dossier Técnico de Evidencia',
      noMarkdown: 'Ningún informe técnico en markdown adjunto a esta evidencia.',
      openFinding: 'Editar Hallazgo en Proyecto',
      viewProject: 'Abrir Proyecto',
      viewReport: 'Ver Informe',
      emptyList: 'Ninguna evidencia coincide con los filtros actuales.',
    },
  };

  const dict = dictMap[currentLocale] || dictMap.en;

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-[1720px] mx-auto">
      {/* Cabecalho Superior: Titulo + Subtitulo + Busca */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100">
                {dict.title}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700/80">
                {filteredFindings.length}
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
                className="w-full sm:w-[280px] lg:w-[340px] pl-9 h-9 rounded-lg bg-zinc-950/60 border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-emerald-600/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Abas Horizontais com Filtros de Severidade */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-zinc-800/80">
          {/* Aba: Todos */}
          <button
            onClick={() => setSeverityFilter('All')}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border',
              severityFilter === 'All'
                ? 'bg-zinc-800 text-zinc-100 border-zinc-700'
                : 'bg-zinc-950/40 text-zinc-400 hover:text-zinc-200 border-transparent hover:border-zinc-800'
            )}
          >
            <span>{dict.all}</span>
            <span className="font-mono text-[11px] text-zinc-400">({counts.all})</span>
          </button>

          {/* Aba: Critical */}
          <button
            onClick={() => setSeverityFilter('Critical')}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border',
              severityFilter === 'Critical'
                ? 'bg-rose-950/50 text-rose-300 border-rose-800/60'
                : 'bg-zinc-950/40 text-zinc-400 hover:text-rose-400 border-transparent hover:border-zinc-800'
            )}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>Critical</span>
            <span className="font-mono text-[11px] opacity-75">({counts.critical})</span>
          </button>

          {/* Aba: High */}
          <button
            onClick={() => setSeverityFilter('High')}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border',
              severityFilter === 'High'
                ? 'bg-orange-950/50 text-orange-300 border-orange-800/60'
                : 'bg-zinc-950/40 text-zinc-400 hover:text-orange-400 border-transparent hover:border-zinc-800'
            )}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
            <span>High</span>
            <span className="font-mono text-[11px] opacity-75">({counts.high})</span>
          </button>

          {/* Aba: Medium */}
          <button
            onClick={() => setSeverityFilter('Medium')}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border',
              severityFilter === 'Medium'
                ? 'bg-amber-950/50 text-amber-300 border-amber-800/60'
                : 'bg-zinc-950/40 text-zinc-400 hover:text-amber-400 border-transparent hover:border-zinc-800'
            )}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>Medium</span>
            <span className="font-mono text-[11px] opacity-75">({counts.medium})</span>
          </button>

          {/* Aba: Low */}
          <button
            onClick={() => setSeverityFilter('Low')}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border',
              severityFilter === 'Low'
                ? 'bg-sky-950/50 text-sky-300 border-sky-800/60'
                : 'bg-zinc-950/40 text-zinc-400 hover:text-sky-400 border-transparent hover:border-zinc-800'
            )}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
            <span>Low</span>
            <span className="font-mono text-[11px] opacity-75">({counts.low})</span>
          </button>

          {/* Aba: Info */}
          <button
            onClick={() => setSeverityFilter('Informational')}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border',
              severityFilter === 'Informational'
                ? 'bg-zinc-800 text-zinc-200 border-zinc-700'
                : 'bg-zinc-950/40 text-zinc-400 hover:text-zinc-200 border-transparent hover:border-zinc-800'
            )}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
            <span>Info</span>
            <span className="font-mono text-[11px] opacity-75">({counts.info})</span>
          </button>
        </div>
      </div>

      {/* Layout Master-Detail: Coluna Esquerda (Lista de Evidencias) + Coluna Direita (Dossie / Inspector) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* COLUNA ESQUERDA: Master List */}
        <div className="lg:col-span-5 xl:col-span-5 space-y-2">
          <Card className="bg-zinc-950/40 border border-zinc-800/80 rounded-2xl overflow-hidden p-2 sm:p-2.5">
            <CardContent className="p-0 space-y-1.5 max-h-[calc(100vh-250px)] overflow-y-auto pr-1">
              {filteredFindings.length === 0 ? (
                <div className="text-center py-16 px-4 text-zinc-500 text-sm">
                  {dict.emptyList}
                </div>
              ) : (
                filteredFindings.map((finding) => {
                  const isSelected = activeFinding?.id === finding.id;
                  const theme = SEVERITY_THEME[finding.severity] || SEVERITY_THEME.Informational;

                  return (
                    <div
                      key={finding.id}
                      onClick={() => setSelectedFindingId(finding.id)}
                      className={cn(
                        'group relative flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border text-left',
                        isSelected
                          ? `bg-zinc-900/90 border-zinc-700/80 border-l-[3px] ${theme.border} shadow-sm`
                          : 'bg-zinc-900/30 hover:bg-zinc-900/60 border-zinc-800/50 border-l-[3px] border-l-transparent'
                      )}
                    >
                      {/* Bloco CVSS Score quadrado sobrio */}
                      <div
                        className={cn(
                          'w-11 h-11 rounded-lg flex flex-col items-center justify-center shrink-0 border font-mono transition-colors',
                          isSelected ? theme.scoreBg : 'bg-zinc-950/70 border-zinc-800/80 text-zinc-300'
                        )}
                      >
                        <span className="text-xs font-bold leading-none">{finding.cvss.toFixed(1)}</span>
                        <span className="text-[9px] uppercase tracking-wider font-semibold opacity-75 mt-0.5">
                          {finding.severity.slice(0, 4)}
                        </span>
                      </div>

                      {/* Bloco Central: Titulo e Origem */}
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="font-semibold text-sm text-zinc-100 truncate group-hover:text-white">
                          {finding.title}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-zinc-400 truncate mt-0.5">
                          <span className="truncate">{finding.projectName}</span>
                          <span className="text-zinc-600">·</span>
                          <span className="text-zinc-500 truncate">{finding.clientName}</span>
                        </div>
                      </div>

                      {/* Bloco Direito: Badge de Severidade e Seta */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-medium border', theme.badge)}>
                          {finding.severity}
                        </span>
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

        {/* COLUNA DIREITA: Contextual Inspector (Dossie Tecnico Completo) */}
        <div className="lg:col-span-7 xl:col-span-7">
          {activeFinding ? (
            <Card className="bg-zinc-950/40 border border-zinc-800/80 rounded-2xl overflow-hidden p-6 sm:p-7 space-y-6">
              {/* Header do Dossie: CVSS Gauge, Titulo, Severidade */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-zinc-800/80 pb-5">
                <div className="flex items-start gap-4">
                  {/* Badge Grande de CVSS */}
                  <div
                    className={cn(
                      'w-14 h-14 rounded-xl flex flex-col items-center justify-center shrink-0 border font-mono shadow-sm',
                      SEVERITY_THEME[activeFinding.severity]?.scoreBg
                    )}
                  >
                    <span className="text-base font-bold leading-none">{activeFinding.cvss.toFixed(1)}</span>
                    <span className="text-[10px] uppercase font-semibold opacity-80 mt-1">CVSS</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className={cn('text-xs font-semibold uppercase tracking-wider', SEVERITY_THEME[activeFinding.severity]?.text)}>
                        {activeFinding.severity} Risk
                      </span>
                      {activeFinding.vulnerabilityId && (
                        <span className="font-mono text-[11px] text-zinc-500 border border-zinc-800 px-1.5 rounded">
                          {activeFinding.vulnerabilityId}
                        </span>
                      )}
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-zinc-100 tracking-tight mt-1">
                      {activeFinding.title}
                    </h2>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {activeFinding.projectName} · {activeFinding.clientName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/report/9a4f2c1b8e7d3a6e/${activeFinding.projectId}/findings/${activeFinding.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 transition-colors"
                  >
                    <span>{dict.openFinding}</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              {/* Grid com 4 Metricas Taticas da Evidencia */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* CVSS */}
                <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3 flex flex-col justify-between">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                    CVSS v3.1
                  </div>
                  <div className="text-xl font-bold font-mono text-zinc-100 mt-1">
                    {activeFinding.cvss.toFixed(1)}
                  </div>
                </div>

                {/* SEVERITY */}
                <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3 flex flex-col justify-between">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                    {dict.severity}
                  </div>
                  <div className={cn('text-sm font-bold mt-1', SEVERITY_THEME[activeFinding.severity]?.text)}>
                    {activeFinding.severity}
                  </div>
                </div>

                {/* TARGET / CLIENT */}
                <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3 flex flex-col justify-between">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                    {dict.target}
                  </div>
                  <div className="text-xs font-medium text-zinc-200 mt-1 truncate">
                    {activeFinding.clientName}
                  </div>
                </div>

                {/* RECORDED DATE */}
                <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3 flex flex-col justify-between">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                    {dict.recorded}
                  </div>
                  <div className="text-xs font-mono text-zinc-200 mt-1 font-medium">
                    {formatDateDisplay(activeFinding.updatedAt)}
                  </div>
                </div>
              </div>

              {/* Dossie Tecnico Renderizado */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                  <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-emerald-500" />
                    <span>{dict.technicalAnalysis}</span>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-500">
                    ID: {activeFinding.id}
                  </span>
                </div>

                <div className="bg-zinc-900/30 border border-zinc-800/70 rounded-xl p-4 sm:p-5 max-h-[420px] overflow-y-auto text-xs text-zinc-300 leading-relaxed">
                  {activeFinding.markdown ? (
                    <MarkdownPreview content={activeFinding.markdown} />
                  ) : (
                    <div className="py-8 text-center text-zinc-500">
                      {dict.noMarkdown}
                    </div>
                  )}
                </div>
              </div>

              {/* Barra de Acoes Inferior */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-3 border-t border-zinc-800/80">
                <Button
                  onClick={() =>
                    router.push(
                      `/report/9a4f2c1b8e7d3a6e/${activeFinding.projectId}/findings/${activeFinding.id}`
                    )
                  }
                  className="w-full sm:flex-1 h-10 px-4 rounded-xl font-medium text-sm gap-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 border border-zinc-700/80 shadow-sm transition-colors group"
                >
                  <Terminal className="h-4 w-4 text-emerald-400" />
                  <span>{dict.openFinding}</span>
                  <ArrowRight className="h-4 w-4 ml-auto text-zinc-400 group-hover:text-zinc-200 transition-transform group-hover:translate-x-0.5" />
                </Button>

                <Button
                  variant="outline"
                  onClick={() => router.push(`/report/9a4f2c1b8e7d3a6e/${activeFinding.projectId}`)}
                  className="w-full sm:w-auto h-10 px-4 rounded-xl bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 text-xs font-medium"
                >
                  <FolderOpen className="h-4 w-4 mr-1.5 text-zinc-400" />
                  <span>{dict.viewProject}</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() =>
                    router.push(`/report/9a4f2c1b8e7d3a6e/${activeFinding.projectId}/report`)
                  }
                  className="w-full sm:w-auto h-10 px-4 rounded-xl bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 text-xs font-medium"
                >
                  <FileText className="h-4 w-4 mr-1.5 text-zinc-400" />
                  <span>{dict.viewReport}</span>
                </Button>
              </div>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
