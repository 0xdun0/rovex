import type { Project, ProjectLanguage, ProjectType } from './types';

/**
 * Normaliza qualquer variacao de string de idioma para os tipos suportados:
 * 'en' | 'pt-br' | 'es' (com fallback seguro para 'en').
 */
export function normalizeProjectLanguage(lang?: string | null): ProjectLanguage {
  if (!lang) return 'en';
  const clean = lang.toLowerCase().trim();
  if (clean === 'pt' || clean === 'pt-br' || clean === 'pt_br' || clean.startsWith('pt')) return 'pt-br';
  if (clean === 'es' || clean === 'es-es' || clean.startsWith('es')) return 'es';
  return 'en';
}

/**
 * Mapa central de redirecionamento e integridade referencial para projetos migrados.
 * Permite resolver identificadores historicos ou legados para o padrao novo.
 */
export const PROJECT_ID_ALIASES: Record<string, string> = {
  'proj-htb-haze': 'proj-writeup-haze-2026',
};

/**
 * Resolve qualquer ID historico para seu ID canônico consolidado.
 */
export function resolveProjectId(id?: string | null): string {
  if (!id) return '';
  return PROJECT_ID_ALIASES[id] ?? id;
}

/**
 * Normaliza um projeto garantindo tipo default ('pentest') e idioma valido.
 * Detecta automaticamente writeups conhecidos (ex: proj-writeup-haze-2026 ou proj-htb-haze).
 */
export function normalizeProject(project: Project): Project {
  const normLang = normalizeProjectLanguage(project.language);
  const resolvedId = resolveProjectId(project.id);
  const isWriteup =
    project.type === 'writeup' ||
    (!project.type &&
      (resolvedId === 'proj-writeup-haze-2026' ||
        resolvedId.startsWith('proj-writeup') ||
        (project.name && project.name.toLowerCase().includes('writeup'))));

  return {
    ...project,
    type: isWriteup ? 'writeup' : (project.type || 'pentest'),
    language: normLang,
  };
}

export interface GenerateProjectIdParams {
  type: ProjectType;
  name: string;
  clientName?: string;
  startDate?: Date | string;
  existingIds?: string[];
}

/**
 * Padroniza os identificadores de novos projetos:
 * - lab/writeup: proj-writeup-<nome>-<ano> (ex: proj-writeup-haze-2026)
 * - cliente/pentest: proj-pentest-<cliente>-<ano> (ex: proj-pentest-acme-2026)
 * Se houver colisao com existente, adiciona sufixo incremental (-2, -3, etc.).
 */
export function generateProjectId(params: GenerateProjectIdParams): string {
  const dateObj = params.startDate ? new Date(params.startDate) : new Date();
  const year = isNaN(dateObj.getFullYear()) ? new Date().getFullYear() : dateObj.getFullYear();

  const rawTarget = params.type === 'writeup'
    ? params.name
    : (params.clientName || params.name);

  // Normaliza slug: sem acentos, apenas minusculas a-z, 0-9 e hifens
  const slug = (rawTarget || 'novo')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 28) || 'novo';

  const prefix = params.type === 'writeup' ? 'proj-writeup' : 'proj-pentest';
  const baseId = `${prefix}-${slug}-${year}`;

  if (!params.existingIds || !params.existingIds.includes(baseId)) {
    return baseId;
  }

  let counter = 2;
  while (params.existingIds.includes(`${baseId}-${counter}`)) {
    counter++;
  }
  return `${baseId}-${counter}`;
}
