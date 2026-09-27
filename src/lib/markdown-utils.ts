import TurndownService from 'turndown';
import type { ContentBlock } from './types';

export type VariableContext = {
  client?: {
    name?: string;
    shortName?: string;
    contactName?: string;
    contactEmail?: string;
    contact?: string;
    phone?: string;
    address?: string;
    logoUrl?: string;
  };
  project?: {
    name?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    reportDate?: string;
    language?: string;
    date?: string;
    scope?: string;
    executiveSummary?: string;
  };
  assessment?: {
    window?: string;
    startDate?: string;
    endDate?: string;
  };
  pentester?: {
    name?: string;
    role?: string;
    company?: string;
    email?: string;
    phone?: string;
    website?: string;
    location?: string;
  };
  report?: {
    title?: string;
    date?: string;
    reportDate?: string;
    customer?: string;
    customer_short?: string;
    report_customer_short?: string;
    scope?: string;
    executiveSummary?: string;
    [key: string]: any;
  };
  finding?: {
    title?: string;
    summary?: string;
    description?: string;
    precondition?: string;
    impact?: string;
    recommendation?: string;
    shortRecommendation?: string;
    severity?: string;
    cvss?: number | string | {
      score?: number | string;
      vector?: string;
      level?: string;
      levelNumber?: number;
      version?: string;
    };
    references?: string;
    affectedComponents?: string;
    retestStatus?: string;
    [key: string]: any;
  };
  findings?: {
    count?: number | string;
    critical?: number | string;
    high?: number | string;
    medium?: number | string;
    low?: number | string;
    info?: number | string;
    informational?: number | string;
  };
  vulnerabilities?: {
    count?: number | string;
    critical?: number | string;
    high?: number | string;
    medium?: number | string;
    low?: number | string;
    info?: number | string;
    informational?: number | string;
  };
  [key: string]: any;
};

const VARIABLE_FALLBACKS: Record<string, string> = {
  unknown: '—',
};

function formatTemplateDate(value: any, formatType = 'iso', locale = 'pt-BR'): string {
  if (!value) return VARIABLE_FALLBACKS.unknown;
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return String(value);
    if (formatType === 'iso') {
      return d.toISOString().split('T')[0];
    }
    if (formatType === 'long') {
      return d.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
    }
    if (formatType === 'short') {
      return d.toLocaleDateString(locale, { year: 'numeric', month: '2-digit', day: '2-digit' });
    }
    return d.toISOString().split('T')[0];
  } catch {
    return String(value);
  }
}

function getNestedValue(path: string, ctx: any): any {
  if (!path || !ctx) return undefined;

  // alias especifico de metadados
  if (path === 'report_customer_short') {
    return ctx.report_customer_short || ctx.report?.report_customer_short || ctx.report?.customer_short || ctx.client?.shortName || ctx.client?.name;
  }

  const parts = path.split('.');
  const group = parts[0];
  let current: any;

  if (group === 'report') {
    current = ctx.report || {
      title: ctx.project?.name,
      date: ctx.project?.reportDate || ctx.project?.date,
      reportDate: ctx.project?.reportDate || ctx.project?.date,
      customer: ctx.client?.name,
      customer_short: ctx.client?.shortName || ctx.client?.name,
      report_customer_short: ctx.client?.shortName || ctx.client?.name,
      scope: ctx.project?.scope || ctx.project?.description,
      executiveSummary: ctx.project?.executiveSummary,
      ...ctx.report,
    };
  } else if (group === 'findings') {
    current = ctx.findings || ctx.vulnerabilities || {};
  } else if (group === 'vulnerabilities') {
    current = ctx.vulnerabilities || ctx.findings || {};
  } else {
    current = ctx[group];
  }

  for (let i = 1; i < parts.length; i++) {
    if (current == null) return undefined;
    current = current[parts[i]];
  }

  // fallbacks e normalizacoes de aliases
  if (current == null) {
    if (path === 'client.shortName') return ctx.client?.contactName || ctx.client?.contact || ctx.client?.name;
    if (path === 'client.contactName') return ctx.client?.contact || ctx.client?.name;
    if (path === 'client.contactEmail') return ctx.client?.email || ctx.client?.contact;
    if (path === 'project.reportDate') return ctx.project?.date || ctx.report?.date;
    if (path === 'findings.info') return ctx.findings?.informational || ctx.vulnerabilities?.informational;
    if (path === 'vulnerabilities.info') return ctx.vulnerabilities?.informational || ctx.findings?.informational;
    if (path === 'finding.cvss.score' && typeof ctx.finding?.cvss === 'number') return ctx.finding.cvss;
    if (path === 'finding.cvss' && typeof ctx.finding?.cvss === 'object') return ctx.finding.cvss.score;
  }

  return current;
}

export function resolveVariables(input: string, ctx: VariableContext = {}): string {
  if (!input) return input;

  // 1. Funcoes de formatacao: {{ formatDate(campo, 'long') }}, {{ uppercase(campo) }}, etc.
  let output = input.replace(/\{\{\s*([a-zA-Z0-9_]+)\(([^)]+)\)\s*\}\}/g, (raw, fnName, argsStr) => {
    const rawArgs = argsStr.split(',').map((a: string) => a.trim().replace(/^['"]|['"]$/g, ''));
    const targetExpr = rawArgs[0];
    const val = getNestedValue(targetExpr, ctx);

    if (fnName === 'formatDate') {
      const formatType = rawArgs[1] || 'iso';
      const defaultLocale = ctx.project?.language === 'en' ? 'en-US' : ctx.project?.language === 'es' ? 'es-ES' : 'pt-BR';
      const locale = rawArgs[2] || defaultLocale;
      return formatTemplateDate(val, formatType, locale);
    }
    if (fnName === 'uppercase') {
      return val != null && val !== '' ? String(val).toUpperCase() : VARIABLE_FALLBACKS.unknown;
    }
    if (fnName === 'lowercase') {
      return val != null && val !== '' ? String(val).toLowerCase() : VARIABLE_FALLBACKS.unknown;
    }
    if (fnName === 'truncate') {
      const len = parseInt(rawArgs[1], 10) || 100;
      if (val == null || val === '') return VARIABLE_FALLBACKS.unknown;
      const str = String(val);
      return str.length > len ? str.slice(0, len) + '...' : str;
    }
    return raw;
  });

  // 2. Variaveis aninhadas {{ group.prop.subprop }} ou {{ single_var }}
  output = output.replace(/\{\{\s*([a-zA-Z0-9_]+(?:\.[a-zA-Z0-9_]+)*)\s*\}\}/g, (raw, path) => {
    // Preserva marcadores estruturais do relatorio
    if (path === 'findings.table' || path === 'findings.details') {
      return raw;
    }

    const val = getNestedValue(path, ctx);
    if (val == null || val === '') return VARIABLE_FALLBACKS.unknown;

    if (typeof val === 'object') {
      if ('name' in val) return String(val.name);
      if ('value' in val) return String(val.value);
      if ('label' in val) return String(val.label);
      if ('score' in val) return String(val.score);
      return JSON.stringify(val);
    }

    return String(val);
  });

  return output;
}

const turndown = new TurndownService({ codeBlockStyle: 'fenced' });
const horizontalRulePattern = /^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/;

type SplitMarkdownIntoSectionsOptions = {
  maxHeadingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  fallbackToHorizontalRules?: boolean;
};

export function htmlToMarkdown(html: string): string {
  if (!html) return '';
  return turndown.turndown(html);
}

function normalizeMarkdownInput(input: string): string {
  const hasHtmlTags = /<\/?[a-z][\s\S]*>/i.test(input);
  const hasMarkdownStructure = /(^|\n)\s{0,3}#{1,6}\s+/.test(input)
    || /(^|\n)\s*[-*]\s+/.test(input)
    || /(^|\n)\s*\|.+\|\s*$/.test(input)
    || /```/.test(input);

  return (hasHtmlTags && !hasMarkdownStructure ? htmlToMarkdown(input) : input).replace(/\r\n/g, '\n');
}

function trimBoundarySeparators(lines: string[]) {
  const nextLines = [...lines];

  while (nextLines.length > 0 && (!nextLines[0].trim() || horizontalRulePattern.test(nextLines[0]))) {
    nextLines.shift();
  }

  while (nextLines.length > 0 && (!nextLines[nextLines.length - 1].trim() || horizontalRulePattern.test(nextLines[nextLines.length - 1]))) {
    nextLines.pop();
  }

  return nextLines;
}

function hasSectionContent(lines: string[]) {
  return trimBoundarySeparators(lines).some(line => line.trim());
}

function cleanMarkdownSection(content: string) {
  return trimBoundarySeparators(content.replace(/\r\n/g, '\n').split('\n')).join('\n').trim();
}

export function joinMarkdownSections(sections: Array<string | null | undefined>): string {
  return sections
    .map(section => cleanMarkdownSection(section || ''))
    .filter(Boolean)
    .join('\n\n---\n\n');
}

export function splitMarkdownIntoSections(input: string, options: SplitMarkdownIntoSectionsOptions = {}): string[] {
  if (!input || typeof input !== 'string') return [];

  const md = normalizeMarkdownInput(input);
  if (!md.trim()) return [];

  const maxHeadingLevel = options.maxHeadingLevel ?? 2;
  const fallbackToHorizontalRules = options.fallbackToHorizontalRules ?? true;
  const headingPattern = new RegExp(`^\\s{0,3}#{1,${maxHeadingLevel}}\\s+`);
  const lines = md.split('\n');
  const sections: string[] = [];
  let buffer: string[] = [];
  let inCode = false;

  const flush = () => {
    const content = cleanMarkdownSection(buffer.join('\n'));
    if (content) {
      sections.push(content);
    }
    buffer = [];
  };

  for (const line of lines) {
    const isSectionHeading = !inCode && headingPattern.test(line);

    if (isSectionHeading && hasSectionContent(buffer)) {
      flush();
    }

    buffer.push(line);

    if (line.startsWith('```')) {
      inCode = !inCode;
    }
  }

  if (hasSectionContent(buffer)) {
    flush();
  }

  if (fallbackToHorizontalRules && sections.length <= 1) {
    const horizontalRuleSections = md
      .split(/\n\s*(?:-{3,}|\*{3,}|_{3,})\s*\n/g)
      .map(cleanMarkdownSection)
      .filter(Boolean);

    if (horizontalRuleSections.length > sections.length) {
      return horizontalRuleSections;
    }
  }

  return sections;
}

export function parseMarkdownToBlocks(input: string): ContentBlock[] {
  if (!input) return [{ id: `block-${Date.now()}`, tag: 'p', content: '' }];

  function inferTag(content: string): ContentBlock['tag'] {
    const headingMatch = content.match(/^\s{0,3}(#{1,6})\s+/m);
    if (headingMatch) {
      const level = Math.min(headingMatch[1].length, 4);
      return (`h${level}`) as ContentBlock['tag'];
    }

    if (/^\s*---\s*$/.test(content)) return 'hr';
    if (/^\s*\|.+\|\s*$/m.test(content)) return 'table';
    if (/^```/m.test(content)) return 'pre';
    if (/^>\s?/m.test(content)) return 'blockquote';
    if (/^\s*\d+\.\s+/m.test(content)) return 'ol';
    if (/^\s*[-*]\s+/m.test(content)) return 'ul';
    return 'p';
  }

  const blocks: ContentBlock[] = splitMarkdownIntoSections(input, { maxHeadingLevel: 2 })
    .map((content): ContentBlock => ({
      id: `block-${Date.now()}-${Math.random()}`,
      tag: inferTag(content),
      content,
      meta: { viewMode: 'split' },
    }));

  if (blocks.length === 0) return [{ id: `block-${Date.now()}`, tag: 'p', content: '', meta: { viewMode: 'split' } }];
  return blocks;
}

export function blocksToMarkdown(blocks: ContentBlock[]): string {
  return blocks.map(b => {
    const content = (b.content || '').trim();
    if (/^#{1,6}\s+/m.test(content)) return content;

    switch (b.tag) {
      case 'hr': return '---';
      case 'pre': return /^```/m.test(content) ? content : `\n\n\`\`\`\n${content}\n\`\`\`\n\n`;
      case 'ul': return content.split('\n').map(l => l.startsWith('-') ? l : `- ${l}`).join('\n');
      case 'ol': return content.split('\n').map(l => /^\d+\.\s/.test(l) ? l : `1. ${l}`).join('\n');
      case 'blockquote': return content.split('\n').map(l => l.startsWith('>') ? l : `> ${l}`).join('\n');
      case 'table': return content; // assume markdown table already
      default:
        if (b.tag && b.tag.startsWith('h')) {
          const level = b.tag.replace('h', '');
          return `${'#'.repeat(Number(level))} ${content}`;
        }
        return content;
    }
  }).join('\n\n');
}
