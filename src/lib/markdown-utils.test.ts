import { describe, expect, it } from 'vitest';
import {
  blocksToMarkdown,
  htmlToMarkdown,
  joinMarkdownSections,
  parseMarkdownToBlocks,
  resolveVariables,
  splitMarkdownIntoSections,
} from './markdown-utils';
import type { ContentBlock } from './types';

describe('resolveVariables', () => {
  it('sustituye {{grupo.clave}} por el valor del contexto', () => {
    expect(resolveVariables('Cliente: {{client.name}}', { client: { name: 'Acme' } })).toBe('Cliente: Acme');
  });

  it('usa el fallback "—" cuando el grupo o la clave no existen', () => {
    expect(resolveVariables('{{client.name}}', {})).toBe('—');
    expect(resolveVariables('{{client.missing}}', { client: { name: 'Acme' } })).toBe('—');
  });

  it('deja intacto el texto sin variables', () => {
    expect(resolveVariables('sin variables aqui', {})).toBe('sin variables aqui');
  });

  it('resuelve propiedades anidadas de 3 niveles como finding.cvss.score', () => {
    const ctx = {
      finding: {
        title: 'SQLi',
        cvss: { score: 9.8, vector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H', level: 'Critical' },
      },
    };
    expect(resolveVariables('Score: {{finding.cvss.score}} ({{finding.cvss.level}})', ctx)).toBe('Score: 9.8 (Critical)');
  });

  it('resuelve campos personalizados dinámicos report.field_*', () => {
    const ctx = {
      report: {
        field_string: 'Texto Personalizado',
        field_number: 42,
        field_user: { name: '0xdun0', email: 'auditor@rovex.local' },
        field_enum: { value: 'approved', label: 'Aprovado' },
      },
    };
    expect(resolveVariables('{{report.field_string}} - {{report.field_number}}', ctx)).toBe('Texto Personalizado - 42');
    expect(resolveVariables('Auditor: {{report.field_user.name}} <{{report.field_user.email}}>', ctx)).toBe('Auditor: 0xdun0 <auditor@rovex.local>');
    expect(resolveVariables('Status: {{report.field_enum.label}}', ctx)).toBe('Status: Aprovado');
  });

  it('resuelve alias report_customer_short e findings.info', () => {
    const ctx = {
      client: { name: 'Empresa Alpha Ltda', shortName: 'Alpha' },
      findings: { count: 5, critical: 1, info: 2 },
    };
    expect(resolveVariables('Cliente: {{report_customer_short}}', ctx)).toBe('Cliente: Alpha');
    expect(resolveVariables('Total: {{findings.count}} (Info: {{findings.info}})', ctx)).toBe('Total: 5 (Info: 2)');
  });

  it('executa funções de formatação formatDate, uppercase, lowercase e truncate', () => {
    const ctx = {
      project: { startDate: '2026-09-27T00:00:00.000Z' },
      client: { name: 'Corp Solutions' },
      finding: { description: 'Esta é uma vulnerabilidade crítica de injeção que afeta o backend.' },
    };
    expect(resolveVariables('Data: {{formatDate(project.startDate, "iso")}}', ctx)).toBe('Data: 2026-09-27');
    expect(resolveVariables('Cliente: {{uppercase(client.name)}}', ctx)).toBe('Cliente: CORP SOLUTIONS');
    expect(resolveVariables('Cliente: {{lowercase(client.name)}}', ctx)).toBe('Cliente: corp solutions');
    expect(resolveVariables('Desc: {{truncate(finding.description, 20)}}', ctx)).toBe('Desc: Esta é uma vulnerabi...');
  });
});

describe('htmlToMarkdown', () => {
  it('convierte HTML basico a Markdown', () => {
    expect(htmlToMarkdown('<strong>hola</strong>')).toBe('**hola**');
  });

  it('devuelve cadena vacia para entrada vacia', () => {
    expect(htmlToMarkdown('')).toBe('');
  });
});

describe('joinMarkdownSections', () => {
  it('une secciones no vacias con un separador horizontal', () => {
    expect(joinMarkdownSections(['# Uno', '', '# Dos'])).toBe('# Uno\n\n---\n\n# Dos');
  });

  it('ignora secciones nulas, vacias o solo con separadores', () => {
    expect(joinMarkdownSections([null, undefined, '   ', '---', '# Contenido'])).toBe('# Contenido');
  });
});

describe('splitMarkdownIntoSections', () => {
  it('parte por encabezados de nivel <= maxHeadingLevel', () => {
    const sections = splitMarkdownIntoSections('# Uno\ncontenido uno\n## Dos\ncontenido dos', { maxHeadingLevel: 2 });
    expect(sections).toEqual(['# Uno\ncontenido uno', '## Dos\ncontenido dos']);
  });

  it('no corta encabezados dentro de un bloque de codigo', () => {
    const md = '# Titulo\n```\n# esto no es un encabezado\n```\ntexto final';
    const sections = splitMarkdownIntoSections(md, { maxHeadingLevel: 2 });
    expect(sections).toHaveLength(1);
    expect(sections[0]).toContain('# esto no es un encabezado');
  });

  it('devuelve un array vacio para entrada vacia', () => {
    expect(splitMarkdownIntoSections('')).toEqual([]);
  });
});

describe('parseMarkdownToBlocks / blocksToMarkdown', () => {
  it('infiere "h1" cuando la seccion empieza con un encabezado de nivel 1', () => {
    const blocks = parseMarkdownToBlocks('# Titulo\ncontenido');
    expect(blocks.map((b) => b.tag)).toEqual(['h1']);
  });

  it('infiere "ul" para una lista sin encabezado', () => {
    const blocks = parseMarkdownToBlocks('- item uno\n- item dos');
    expect(blocks.map((b) => b.tag)).toEqual(['ul']);
  });

  it('infiere "ol" para una lista numerada sin encabezado', () => {
    const blocks = parseMarkdownToBlocks('1. paso uno\n2. paso dos');
    expect(blocks.map((b) => b.tag)).toEqual(['ol']);
  });

  it('produce un bloque de parrafo vacio para entrada vacia', () => {
    const blocks = parseMarkdownToBlocks('');
    expect(blocks).toHaveLength(1);
    expect(blocks[0].tag).toBe('p');
    expect(blocks[0].content).toBe('');
  });

  it('blocksToMarkdown antepone el marcador correcto por tag cuando falta', () => {
    const blocks: ContentBlock[] = [
      { id: '1', tag: 'ul', content: 'item suelto' },
      { id: '2', tag: 'ol', content: 'paso suelto' },
      { id: '3', tag: 'hr', content: '' },
    ];
    expect(blocksToMarkdown(blocks)).toBe('- item suelto\n\n1. paso suelto\n\n---');
  });
});
