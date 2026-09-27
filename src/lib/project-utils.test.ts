import { describe, expect, it } from 'vitest';
import { generateProjectId, normalizeProject, normalizeProjectLanguage, resolveProjectId, PROJECT_ID_ALIASES } from './project-utils';
import { initialProjects } from './projects-data';
import { initialImages } from './images-data';
import type { Project, Finding } from './types';

describe('normalizeProjectLanguage', () => {
  it('normaliza variacoes de portugues para pt-br', () => {
    expect(normalizeProjectLanguage('pt')).toBe('pt-br');
    expect(normalizeProjectLanguage('pt-br')).toBe('pt-br');
    expect(normalizeProjectLanguage('PT_BR')).toBe('pt-br');
    expect(normalizeProjectLanguage('pt-PT')).toBe('pt-br');
  });

  it('preserva espanhol e ingles', () => {
    expect(normalizeProjectLanguage('es')).toBe('es');
    expect(normalizeProjectLanguage('en')).toBe('en');
    expect(normalizeProjectLanguage('EN')).toBe('en');
  });

  it('faz fallback seguro para en em idiomas invalidos ou vazios', () => {
    expect(normalizeProjectLanguage('')).toBe('en');
    expect(normalizeProjectLanguage(null)).toBe('en');
    expect(normalizeProjectLanguage(undefined)).toBe('en');
    expect(normalizeProjectLanguage('invalid-lang')).toBe('en');
  });
});

describe('normalizeProject', () => {
  it('migra projetos legados sem type para pentest por padrao', () => {
    const raw = {
      id: 'proj-1',
      name: 'Auditoria Web',
      clientId: 'cli-1',
      icon: 'Scan',
      reportBody: '',
      startDate: '2026-01-01',
      endDate: '2026-01-05',
      status: 'Completed',
      language: 'pt' as any,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-05',
    } as Project;

    const normalized = normalizeProject(raw);
    expect(normalized.type).toBe('pentest');
    expect(normalized.language).toBe('pt-br');
  });

  it('reconhece proj-writeup-haze-2026 e alias proj-htb-haze como writeup', () => {
    const hazeNew = {
      id: 'proj-writeup-haze-2026',
      name: 'Haze HTB Writeup',
      clientId: 'cli-htb',
      language: 'pt-br',
    } as Project;

    const hazeOld = {
      id: 'proj-htb-haze',
      name: 'Haze HTB Writeup',
      clientId: 'cli-htb',
      language: 'pt-br',
    } as Project;

    expect(normalizeProject(hazeNew).type).toBe('writeup');
    expect(normalizeProject(hazeOld).type).toBe('writeup');
  });

  it('respeita o type explicitamente definido', () => {
    const p1 = { id: 'proj-2', type: 'writeup', language: 'en' } as Project;
    const p2 = { id: 'proj-3', type: 'pentest', language: 'es' } as Project;
    expect(normalizeProject(p1).type).toBe('writeup');
    expect(normalizeProject(p2).type).toBe('pentest');
  });
});

describe('generateProjectId', () => {
  it('gera ID padrao para writeup: proj-writeup-<nome>-<ano>', () => {
    const id = generateProjectId({
      type: 'writeup',
      name: 'Haze HTB Box',
      startDate: '2026-05-10',
    });
    expect(id).toBe('proj-writeup-haze-htb-box-2026');
  });

  it('gera ID padrao para pentest baseado no cliente: proj-pentest-<cliente>-<ano>', () => {
    const id = generateProjectId({
      type: 'pentest',
      name: 'Web App Pentest Q3',
      clientName: 'Acme Corp',
      startDate: '2026-09-01',
    });
    expect(id).toBe('proj-pentest-acme-corp-2026');
  });

  it('adiciona sufixo sequencial quando houver colisao com existente', () => {
    const existing = ['proj-pentest-acme-corp-2026', 'proj-pentest-acme-corp-2026-2'];
    const id = generateProjectId({
      type: 'pentest',
      name: 'Web Pentest',
      clientName: 'Acme Corp',
      startDate: '2026-09-01',
      existingIds: existing,
    });
    expect(id).toBe('proj-pentest-acme-corp-2026-3');
  });

  it('higieniza acentos e caracteres especiais no slug', () => {
    const id = generateProjectId({
      type: 'pentest',
      name: 'Teste',
      clientName: 'Indústria São José & Cia Ltda.',
      startDate: '2026-03-15',
    });
    expect(id).toBe('proj-pentest-industria-sao-jose-cia-ltda-2026');
  });
});

describe('VulnerabilityTemplatePicker language fallback & safety', () => {
  const dictionary = {
    en: {
      title: 'Load vulnerability template',
      description: 'Search by name, severity, CWE or tag.',
      placeholder: 'Search vulnerabilities…',
      empty: 'No templates match your search.',
      tags: 'Tags',
      cwe: 'CWE',
    },
    'pt-br': {
      title: 'Carregar modelo de vulnerabilidade',
      description: 'Buscar por nome, severidade, CWE ou tag.',
      placeholder: 'Buscar vulnerabilidades…',
      empty: 'Nenhum modelo encontrado para a busca.',
      tags: 'Tags',
      cwe: 'CWE',
    },
    es: {
      title: 'Cargar modelo de vulnerabilidad',
      description: 'Busca por nombre, severidad, CWE o etiqueta.',
      placeholder: 'Buscar vulnerabilidades…',
      empty: 'Ningún modelo coincide con la búsqueda.',
      tags: 'Etiquetas',
      cwe: 'CWE',
    },
  };

  function getSafeDict(lang: any) {
    const safeLang = normalizeProjectLanguage(lang);
    return dictionary[safeLang] ?? dictionary['pt-br'] ?? dictionary['en'];
  }

  it('evita TypeError ao receber "pt" como language (reproducao exata do bug reportado)', () => {
    // No codigo legado sem normalizacao: (dictionary as any)["pt"].title gerava TypeError: Cannot read properties of undefined (reading 'title')
    const dict = getSafeDict('pt');
    expect(dict).toBeDefined();
    expect(dict.title).toBe('Carregar modelo de vulnerabilidade');
  });

  it('resolve corretamente para pt-br, es e en', () => {
    expect(getSafeDict('pt-br').title).toBe('Carregar modelo de vulnerabilidade');
    expect(getSafeDict('es').title).toBe('Cargar modelo de vulnerabilidad');
    expect(getSafeDict('en').title).toBe('Load vulnerability template');
  });

  it('faz fallback seguro quando language for nulo, indefinido ou string arbitraria', () => {
    expect(getSafeDict(null).title).toBe('Load vulnerability template');
    expect(getSafeDict(undefined).title).toBe('Load vulnerability template');
    expect(getSafeDict('fr-FR').title).toBe('Load vulnerability template');
  });
});

describe('Migracao proj-htb-haze e integridade referencial', () => {
  it('resolve alias proj-htb-haze para o novo ID proj-writeup-haze-2026', () => {
    expect(resolveProjectId('proj-htb-haze')).toBe('proj-writeup-haze-2026');
    expect(PROJECT_ID_ALIASES['proj-htb-haze']).toBe('proj-writeup-haze-2026');
  });

  it('mantem IDs canonicos inalterados e nao toca nos outros projetos legados', () => {
    expect(resolveProjectId('proj-writeup-haze-2026')).toBe('proj-writeup-haze-2026');
    expect(resolveProjectId('proj-htb-cpts')).toBe('proj-htb-cpts');
    expect(resolveProjectId('proj-1')).toBe('proj-1');
    expect(resolveProjectId('proj-2')).toBe('proj-2');
    expect(resolveProjectId('proj-outro')).toBe('proj-outro');
  });

  it('elimina duplicatas na migracao garantindo apenas uma instancia do Haze', () => {
    const listBeforeMigration: Project[] = [
      { id: 'proj-htb-haze', name: 'Haze HTB Writeup', clientId: 'cli-htb' } as Project,
      { id: 'proj-writeup-haze-2026', name: 'Haze HTB Writeup', clientId: 'cli-htb' } as Project,
      { id: 'proj-htb-cpts', name: 'CPTS Report', clientId: 'cli-trilocor' } as Project,
    ];

    const retired = new Set(['proj-htb-imagery', 'proj-htb-haze']);
    const migrated = listBeforeMigration.map(p => {
      if (p.id === 'proj-htb-haze') {
        return { ...p, id: 'proj-writeup-haze-2026', type: 'writeup' as const };
      }
      return p;
    });

    const uniqueMap = new Map<string, Project>();
    for (const p of migrated) {
      if (!retired.has(p.id) || p.id === 'proj-writeup-haze-2026') {
        if (!uniqueMap.has(p.id)) {
          uniqueMap.set(p.id, p);
        }
      }
    }

    const result = Array.from(uniqueMap.values());
    expect(result.length).toBe(2);
    expect(result.filter(p => p.id === 'proj-writeup-haze-2026').length).toBe(1);
    expect(result.filter(p => p.id === 'proj-htb-haze').length).toBe(0);
  });

  it('reatribui findings vinculados ao id legado sem deixar orfaos', () => {
    const mockFindings: Finding[] = [
      {
        id: 'find-101',
        projectId: 'proj-htb-haze',
        title: 'SeImpersonate Privilege Escalation',
        severity: 'Critical',
        cvss: 9.0,
        markdown: 'Test finding',
        createdAt: '2026-09-01',
        updatedAt: '2026-09-01',
      },
      {
        id: 'find-102',
        projectId: 'proj-1',
        title: 'SQLi',
        severity: 'High',
        cvss: 8.0,
        markdown: 'Test',
        createdAt: '2026-09-01',
        updatedAt: '2026-09-01',
      },
    ];

    const migratedFindings = mockFindings.map(f => ({
      ...f,
      projectId: resolveProjectId(f.projectId),
    }));

    expect(migratedFindings.find(f => f.id === 'find-101')?.projectId).toBe('proj-writeup-haze-2026');
    expect(migratedFindings.find(f => f.id === 'find-102')?.projectId).toBe('proj-1');
    expect(migratedFindings.filter(f => f.projectId === 'proj-htb-haze').length).toBe(0);
  });

  it('valida que todas as 10 imagens img-haze-* estao disponiveis para proj-writeup-haze-2026', () => {
    const hazeProject = initialProjects.find(p => p.id === 'proj-writeup-haze-2026');
    expect(hazeProject).toBeDefined();
    expect(hazeProject?.name).toBe('Haze HTB Writeup');
    expect(hazeProject?.language).toBe('pt-br');
    expect(hazeProject?.type).toBe('writeup');

    // Valida mencao no reportBody as imagens img-haze-01 a img-haze-10
    for (let i = 1; i <= 10; i++) {
      const imgId = `img-haze-${String(i).padStart(2, '0')}`;
      expect(hazeProject?.reportBody).toContain(imgId);

      const imgAsset = initialImages.find(img => img.id === imgId);
      expect(imgAsset).toBeDefined();
      expect(imgAsset?.dataUrl.startsWith('data:image/')).toBe(true);
    }
  });
});


