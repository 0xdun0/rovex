// Este arquivo esta em processo de depreciacao e sera removido em atualizacao futura.
// Os templates de projetos agora sao gerenciados pelo DataContext.
// Consulte `src/lib/project-templates-data.ts` para o catalogo ativo.
import type { ProjectTemplate } from './types';

export const projectTemplates: ProjectTemplate[] = [
  {
    id: 'ptpl-1',
    name_en: 'Standard Web App Pentest',
    name_es: 'Pentest de Aplicación Web (Estándar)',
    name_pt: 'Pentest de Aplicação Web (Padrão)',
    description_en: 'A comprehensive security assessment for web applications, covering OWASP Top 10 and other common vulnerabilities.',
    description_es: 'Evaluación de seguridad integral para aplicaciones web, cubriendo OWASP Top 10 y vulnerabilidades comunes.',
    description_pt: 'Uma avaliação de segurança completa para aplicações web, cobrindo o OWASP Top 10 e outras vulnerabilidades comuns.',
    icon: 'Scan',
    scope_en: `# Executive Summary

This report outlines the results of a penetration test performed on the internet-facing assets of **{{client.name}}**. The engagement ran from **{{project.startDate}}** to **{{project.endDate}}** from the perspective of an unauthenticated external attacker (black-box).

# Scope

- **Web applications:** [TODO: hostnames or URLs]
- **External network:** [TODO: IP ranges]

# Methodology

1. Reconnaissance.
2. Vulnerability identification.
3. Manual validation and exploitation.
4. Post-exploitation.
5. Reporting.

# Findings Summary

{{findings.table}}
`,
    appendix_en: `# Appendix

A combination of automated tools and manual techniques was used:

- **Proxy:** Burp Suite Professional
- **Scanners:** Nessus, Nuclei
- **Reconnaissance:** Amass, Subfinder
`,
    scope_es: `# Resumo Executivo

Este relatório descreve os resultados do teste de intrusão realizado nos ativos externos de **{{client.name}}**. A avaliação foi realizada entre **{{project.startDate}}** e **{{project.endDate}}** a partir da perspectiva de um atacante externo não autenticado (black-box).

# Escopo

- **Aplicações web:** [TODO: hostnames ou URLs]
- **Rede externa:** [TODO: faixas de IP]

# Metodologia

1. Reconhecimento.
2. Identificação de vulnerabilidades.
3. Validação e exploração manual.
4. Pós-exploração.
5. Relatório.

# Resumo de Achados

{{findings.table}}
`,
    appendix_es: `# Apêndice

Foi utilizada uma combinação de ferramentas automatizadas e técnicas manuais:

- **Proxy:** Burp Suite Professional
- **Scanners:** Nessus, Nuclei
- **Reconhecimento:** Amass, Subfinder
`,
    scope_pt: `# Resumo Executivo

Este relatório descreve os resultados do teste de intrusão realizado nos ativos externos de **{{client.name}}**. A avaliação foi realizada entre **{{project.startDate}}** e **{{project.endDate}}** a partir da perspectiva de um atacante externo não autenticado (black-box).

# Escopo

- **Aplicações web:** [TODO: hostnames ou URLs]
- **Rede externa:** [TODO: faixas de IP]

# Metodologia

1. Reconhecimento.
2. Identificação de vulnerabilidades.
3. Validação e exploração manual.
4. Pós-exploração.
5. Relatório.

# Resumo de Achados

{{findings.table}}
`,
    appendix_pt: `# Apêndice

Foi utilizada uma combinação de ferramentas automatizadas e técnicas manuais:

- **Proxy:** Burp Suite Professional
- **Scanners:** Nessus, Nuclei
- **Reconhecimento:** Amass, Subfinder
`,
  },
];
