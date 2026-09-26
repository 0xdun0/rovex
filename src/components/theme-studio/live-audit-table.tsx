'use client';

import React, { useState } from 'react';
import type { ReportTheme } from '@/lib/report-themes';
import { hslChannelsToHex } from '@/lib/color-utils';
import { Search, ShieldAlert, CheckCircle, Clock, ChevronLeft, ChevronRight } from '@/components/icons';

interface LiveAuditTableProps {
  theme: ReportTheme;
  mode: 'light' | 'dark';
  containerMode?: 'default' | 'fluid' | 'fixed';
}

interface FindingRow {
  id: string;
  lead: string;
  target: string;
  title: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Informational';
  cvss: number;
  status: 'Confirmed' | 'Mitigated' | 'In Review' | 'Verified';
  date: string;
}

const SAMPLE_FINDINGS: FindingRow[] = [
  {
    id: 'SEC-01',
    lead: 'Darrell Steward',
    target: 'auth.api.internal/v2/oauth',
    title: 'Unauthenticated RCE via Deserialization',
    severity: 'Critical',
    cvss: 9.8,
    status: 'Confirmed',
    date: '2026-09-24',
  },
  {
    id: 'SEC-02',
    lead: 'Arlene McCoy',
    target: 'portal.corp.io/account',
    title: 'Stored Cross-Site Scripting in Tenant Name',
    severity: 'High',
    cvss: 7.6,
    status: 'In Review',
    date: '2026-09-25',
  },
  {
    id: 'SEC-03',
    lead: 'Tony Smith',
    target: 'backup-s3-archive.internal',
    title: 'Public Read ACL on Sensitive Storage Bucket',
    severity: 'Medium',
    cvss: 5.4,
    status: 'Mitigated',
    date: '2026-09-23',
  },
  {
    id: 'SEC-04',
    lead: 'Cody Fisher',
    target: 'gateway.vpn.infra.net:1194',
    title: 'Weak Diffie-Hellman Key Exchange Group',
    severity: 'Low',
    cvss: 3.1,
    status: 'Verified',
    date: '2026-09-21',
  },
  {
    id: 'SEC-05',
    lead: 'Kathryn Murphy',
    target: 'mx1.mail.corp.com:25',
    title: 'SPF Permissive Configuration (~all)',
    severity: 'Informational',
    cvss: 0.0,
    status: 'In Review',
    date: '2026-09-20',
  },
  {
    id: 'SEC-06',
    lead: 'Floyd Miles',
    target: 'graphql.payment.api:443',
    title: 'Introspection Enabled in Production Gateway',
    severity: 'Low',
    cvss: 2.8,
    status: 'Confirmed',
    date: '2026-09-26',
  },
];

// tabela interativa de auditoria que adota as cores, fontes e bordas do tema em tempo real
export function LiveAuditTable({
  theme,
  mode,
  containerMode = 'default',
}: LiveAuditTableProps) {
  // linhas selecionadas e filtro de busca
  const [selectedIds, setSelectedIds] = useState<string[]>(['SEC-01']);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  const colors = mode === 'dark' ? theme.dark : theme.light;

  // extrai os valores de cor e raio do tema ativo para aplicar na tabela
  const borderColor = hslChannelsToHex(colors.border);
  const bgColor = hslChannelsToHex(colors.background);
  const fgColor = hslChannelsToHex(colors.foreground);
  const cardColor = hslChannelsToHex(colors.card);
  const cardFg = hslChannelsToHex(colors.cardForeground);
  const mutedFg = hslChannelsToHex(colors.mutedForeground);
  const primaryColor = hslChannelsToHex(colors.primary);
  const brandColor = hslChannelsToHex(colors.brand);

  const sevCritical = hslChannelsToHex(colors.severityCritical);
  const sevHigh = hslChannelsToHex(colors.severityHigh);
  const sevMedium = hslChannelsToHex(colors.severityMedium);
  const sevLow = hslChannelsToHex(colors.severityLow);
  const sevInfo = hslChannelsToHex(colors.severityInformational);

  const radiusPx = `${theme.shape.radius}px`;
  const borderWidthPx = `${theme.shape.borderWidth || 1}px`;
  const fontFamily = theme.typography.familyBody || 'Inter, sans-serif';
  const headlineFont = theme.typography.familyHeadline || 'Inter, sans-serif';
  const fontSizePx = `${theme.typography.baseSize || 14}px`;

  const getSeverityColor = (sev: FindingRow['severity']) => {
    switch (sev) {
      case 'Critical':
        return sevCritical;
      case 'High':
        return sevHigh;
      case 'Medium':
        return sevMedium;
      case 'Low':
        return sevLow;
      case 'Informational':
        return sevInfo;
    }
  };

  const filtered = SAMPLE_FINDINGS.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.lead.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((f) => f.id));
    }
  };

  const containerWidthClass =
    containerMode === 'fluid'
      ? 'w-full'
      : containerMode === 'fixed'
      ? 'max-w-[760px] mx-auto'
      : 'max-w-full';

  return (
    <div
      className={`transition-all duration-300 ${containerWidthClass}`}
      style={{
        backgroundColor: bgColor,
        color: fgColor,
        fontFamily: fontFamily,
        fontSize: fontSizePx,
        borderRadius: radiusPx,
        padding: '1.25rem',
      }}
    >
      {/* Top Header / Breadcrumb Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: brandColor }}
            />
            <h3
              className="font-bold tracking-tight text-base sm:text-lg"
              style={{ fontFamily: headlineFont, color: fgColor }}
            >
              Auditoria de Segurança — Matriz de Vulnerabilidades
            </h3>
          </div>
          <p className="text-xs mt-0.5" style={{ color: mutedFg }}>
            Visualização interativa com aplicação em tempo real das regras do tema
          </p>
        </div>

        {/* Search Input inside preview */}
        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-2 px-2.5 py-1 rounded-md border"
            style={{
              borderColor: borderColor,
              backgroundColor: cardColor,
              borderRadius: `calc(${radiusPx} - 2px)`,
            }}
          >
            <Search className="h-3.5 w-3.5" style={{ color: mutedFg }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filtrar vulnerabilidades..."
              className="bg-transparent text-xs border-0 outline-none w-36 sm:w-48 placeholder:text-muted-foreground"
              style={{ color: fgColor }}
            />
          </div>
        </div>
      </div>

      {/* The Styled Table matching Reference Image 2 & 3 */}
      <div
        className="overflow-hidden border transition-all duration-200 shadow-sm"
        style={{
          borderColor: borderColor,
          borderWidth: borderWidthPx,
          borderRadius: radiusPx,
          backgroundColor: cardColor,
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr
                className="border-b text-xs font-semibold select-none"
                style={{
                  borderColor: borderColor,
                  backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                  color: cardFg,
                }}
              >
                <th className="py-3 px-3.5 w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.length > 0 && selectedIds.length === filtered.length}
                    onChange={toggleSelectAll}
                    className="rounded cursor-pointer h-3.5 w-3.5"
                    style={{ accentColor: primaryColor }}
                  />
                </th>
                <th className="py-3 px-3.5">Auditor / Operador</th>
                <th className="py-3 px-3.5">Alvo / Endpoint</th>
                <th className="py-3 px-3.5">Vulnerabilidade</th>
                <th className="py-3 px-3.5">Severidade</th>
                <th className="py-3 px-3.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => {
                const isSelected = selectedIds.includes(item.id);
                const sevColor = getSeverityColor(item.severity);

                return (
                  <tr
                    key={item.id}
                    onClick={() => toggleSelect(item.id)}
                    className="border-b last:border-b-0 text-xs cursor-pointer transition-colors duration-150"
                    style={{
                      borderColor: borderColor,
                      backgroundColor: isSelected
                        ? mode === 'dark'
                          ? 'rgba(59, 130, 246, 0.08)'
                          : 'rgba(59, 130, 246, 0.06)'
                        : idx % 2 === 1
                        ? mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.015)'
                          : 'rgba(0, 0, 0, 0.015)'
                        : 'transparent',
                    }}
                  >
                    <td className="py-3 px-3.5" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(item.id)}
                        className="rounded cursor-pointer h-3.5 w-3.5"
                        style={{ accentColor: primaryColor }}
                      />
                    </td>
                    <td className="py-3 px-3.5 font-medium whitespace-nowrap" style={{ color: fgColor }}>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-6 w-6 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0"
                          style={{
                            backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
                            color: fgColor,
                          }}
                        >
                          {item.lead.charAt(0)}
                        </div>
                        <span>{item.lead}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3.5 font-mono text-[11px]" style={{ color: mutedFg }}>
                      {item.target}
                    </td>
                    <td className="py-3 px-3.5 font-medium" style={{ color: fgColor }}>
                      {item.title}
                    </td>
                    <td className="py-3 px-3.5">
                      <span
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-mono text-[10px] font-bold"
                        style={{
                          backgroundColor: `${sevColor}1a`,
                          color: sevColor,
                          border: `1px solid ${sevColor}33`,
                        }}
                      >
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: sevColor }}
                        />
                        {item.severity} {item.cvss > 0 ? `(${item.cvss})` : ''}
                      </span>
                    </td>
                    <td className="py-3 px-3.5">
                      <span
                        className="inline-flex items-center gap-1 text-[11px] font-medium"
                        style={{ color: mutedFg }}
                      >
                        {item.status === 'Confirmed' && <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />}
                        {item.status === 'Mitigated' && <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />}
                        {item.status === 'In Review' && <Clock className="h-3.5 w-3.5 text-amber-400" />}
                        {item.status === 'Verified' && <CheckCircle className="h-3.5 w-3.5 text-blue-400" />}
                        {item.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Pagination */}
        <div
          className="flex items-center justify-between px-4 py-2.5 border-t text-xs select-none"
          style={{ borderColor: borderColor, color: mutedFg }}
        >
          <div className="flex items-center gap-2">
            <span>
              Mostrando <strong style={{ color: fgColor }}>{filtered.length}</strong> itens
            </span>
            {selectedIds.length > 0 && (
              <span
                className="px-1.5 py-0.5 rounded text-[10px] font-mono"
                style={{
                  backgroundColor: `${primaryColor}20`,
                  color: primaryColor,
                }}
              >
                {selectedIds.length} selecionados
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1 rounded hover:bg-muted/40 disabled:opacity-40"
              style={{ color: fgColor }}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className="font-mono text-[11px]">Página {page} de 1</span>
            <button
              type="button"
              disabled
              className="p-1 rounded hover:bg-muted/40 disabled:opacity-40"
              style={{ color: fgColor }}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
