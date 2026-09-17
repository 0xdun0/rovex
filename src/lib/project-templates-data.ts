import type { ProjectTemplate } from './types';
import { format } from 'date-fns';

// templates de projetos
// convencoes:
// - markdown puro sem html inline
// - hierarquia: H1 secoes principais, H2 subsecoes, H3 detalhes
// - cada heading sempre tem conteudo pra evitar secao vazia
// - tabelas usam emojis para severidade
// - variaveis: {{client.name}}, {{project.startDate}}, {{pentester.*}}, etc.
// - marcador {{findings.table}} eh trocado pela tabela viva no render do relatorio

const SEVERITY_TABLE_EN = `| Severity | CVSS v3.1 | Description |
|---|---|---|
| 🔴 Critical | 9.0 – 10.0 | Vulnerabilities that lead to immediate system compromise. |
| 🟠 High | 7.0 – 8.9 | Vulnerabilities that grant an attacker unauthorized access. |
| 🟡 Medium | 4.0 – 6.9 | Weaknesses that can expose sensitive information. |
| 🔵 Low | 0.1 – 3.9 | Minor issues that reduce the overall security posture. |
| ⚪ Informational | 0.0 | Observations and hardening recommendations. |`;

const SEVERITY_TABLE_PT = `| Severidade | CVSS v3.1 | Descrição |
|---|---|---|
| 🔴 Crítica | 9.0 – 10.0 | Vulnerabilidades que causam comprometimento imediato do sistema. |
| 🟠 Alta | 7.0 – 8.9 | Vulnerabilidades que concedem acesso não autorizado a invasores. |
| 🟡 Média | 4.0 – 6.9 | Falhas de segurança que podem expor dados confidenciais. |
| 🔵 Baixa | 0.1 – 3.9 | Problemas pontuais que reduzem a postura defensiva geral. |
| ⚪ Informativa | 0.0 | Observações de hardening e recomendações de conformidade. |`;

const SEVERITY_TABLE_ES = SEVERITY_TABLE_PT;

export const initialProjectTemplates: ProjectTemplate[] = [
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

This report outlines the results of a penetration test performed on the internet-facing assets of **{{client.name}}**. The assessment aimed to identify vulnerabilities that could be exploited by a remote attacker to compromise the security of the organization's perimeter.

The engagement ran from **{{project.startDate}}** to **{{project.endDate}}** and was conducted from the perspective of an unauthenticated external attacker (black-box).

# Scope

The following assets were in-scope for the assessment:

- **Web applications:** [TODO: Add target hostnames or URLs]
- **External network:** [TODO: Add IP ranges in scope]
- **Out of scope:** [TODO: Add anything that must not be tested]

# Methodology

The engagement followed a standard offensive workflow:

1. **Reconnaissance.** Subdomains, exposed services and technologies were enumerated.
2. **Vulnerability identification.** Automated scanners and manual review were combined to detect weaknesses.
3. **Exploitation.** Every relevant finding was validated manually to confirm impact and avoid false positives.
4. **Post-exploitation.** Where applicable, paths for lateral movement and data exfiltration were explored.
5. **Reporting.** Findings were documented with reproducible evidence and remediation guidance.

# Findings Summary

The following table is generated automatically from the findings registered in the project. Add, edit or remove findings to update it.

{{findings.table}}

# Findings Classification

${SEVERITY_TABLE_EN}

# Attack Narrative

[TODO: High level summary of the attack path and key findings.]
`,
    appendix_en: `# Appendix

A combination of automated tools and manual techniques was used:

- **Proxy:** Burp Suite Professional
- **Scanners:** Nessus, Nuclei
- **Reconnaissance:** Amass, Subfinder, Httpx
`,
    scope_es: `# Resumo Executivo

Este relatório descreve os resultados do teste de intrusão realizado nos ativos da **{{client.name}}** expostos à Internet. A avaliação teve como objetivo identificar vulnerabilidades que um invasor remoto poderia explorar para comprometer o perímetro da organização.

O engajamento ocorreu entre **{{project.startDate}}** e **{{project.endDate}}**, conduzido sob a perspectiva de um atacante externo não autenticado (black-box).

# Escopo

Os seguintes ativos fizeram parte do escopo do projeto:

- **Aplicações web:** [TODO: Adicionar hostnames ou URLs objetivo]
- **Rede externa:** [TODO: Adicionar blocos ou faixas de IP no escopo]
- **Fora de escopo:** [TODO: Adicionar sistemas ou domínios excluídos]

# Metodologia

A avaliação seguiu um fluxo ofensivo profissional padrão:

1. **Reconhecimento.** Enumeração de subdomínios, portas abertas, serviços e tecnologias expostas.
2. **Identificação de vulnerabilidades.** Combinação de ferramentas automatizadas e análise manual aprofundada.
3. **Exploração.** Cada vulnerabilidade relevante foi validada manualmente para confirmar o impacto e evitar falsos positivos.
4. **Pós-exploração.** Análise de movimentação lateral e exfiltração de dados sensíveis quando aplicável.
5. **Relatório.** Achados documentados com evidências reproduzíveis e recomendações práticas de mitigação.

# Resumo de Vulnerabilidades

A tabela a seguir é gerada dinamicamente a partir dos achados registrados no projeto. Adicione, edite ou remova achados para atualizá-la.

{{findings.table}}

# Classificação de Severidade

${SEVERITY_TABLE_PT}

# Narrativa do Ataque

[TODO: Resumo executivo da cadeia de ataque e principais vulnerabilidades exploradas.]
`,
    appendix_es: `# Apêndice

Foi utilizada uma combinação de ferramentas automatizadas e técnicas manuais de auditoria:

- **Proxy de Interceptação:** Burp Suite Professional
- **Scanners:** Nessus, Nuclei
- **Reconhecimento & OSINT:** Amass, Subfinder, Httpx
`,
    scope_pt: `# Resumo Executivo

Este relatório descreve os resultados do teste de intrusão realizado nos ativos da **{{client.name}}** expostos à Internet. A avaliação teve como objetivo identificar vulnerabilidades que um invasor remoto poderia explorar para comprometer o perímetro da organização.

O engajamento ocorreu entre **{{project.startDate}}** e **{{project.endDate}}**, conduzido sob a perspectiva de um atacante externo não autenticado (black-box).

# Escopo

Os seguintes ativos fizeram parte do escopo do projeto:

- **Aplicações web:** [TODO: Adicionar hostnames ou URLs objetivo]
- **Rede externa:** [TODO: Adicionar blocos ou faixas de IP no escopo]
- **Fora de escopo:** [TODO: Adicionar sistemas ou domínios excluídos]

# Metodologia

A avaliação seguiu um fluxo ofensivo profissional padrão:

1. **Reconhecimento.** Enumeração de subdomínios, portas abertas, serviços e tecnologias expostas.
2. **Identificação de vulnerabilidades.** Combinação de ferramentas automatizadas e análise manual aprofundada.
3. **Exploração.** Cada vulnerabilidade relevante foi validada manualmente para confirmar o impacto e evitar falsos positivos.
4. **Pós-exploração.** Análise de movimentação lateral e exfiltração de dados sensíveis quando aplicável.
5. **Relatório.** Achados documentados com evidências reproduzíveis e recomendações práticas de mitigação.

# Resumo de Vulnerabilidades

A tabela a seguir é gerada dinamicamente a partir dos achados registrados no projeto. Adicione, edite ou remova achados para atualizá-la.

{{findings.table}}

# Classificação de Severidade

${SEVERITY_TABLE_PT}

# Narrativa do Ataque

[TODO: Resumo executivo da cadeia de ataque e principais vulnerabilidades exploradas.]
`,
    appendix_pt: `# Apêndice

Foi utilizada uma combinação de ferramentas automatizadas e técnicas manuais de auditoria:

- **Proxy de Interceptação:** Burp Suite Professional
- **Scanners:** Nessus, Nuclei
- **Reconhecimento & OSINT:** Amass, Subfinder, Httpx
`,
  },
  {
    id: 'ptpl-2',
    name_en: 'Internal Network Assessment',
    name_es: 'Evaluación de Red Interna',
    name_pt: 'Avaliação de Rede Interna',
    description_en: 'An assessment of the internal network to identify misconfigurations, vulnerable services, and pathways for lateral movement.',
    description_es: 'Evaluación de infraestructura interna para identificar configuraciones erróneas, servicios vulnerables y rutas de movimiento lateral.',
    description_pt: 'Uma avaliação da infraestrutura interna para identificar configurações incorretas, serviços vulneráveis e caminhos para movimentação lateral.',
    icon: 'Network',
    scope_en: `# Executive Summary

This report summarises the internal network assessment performed for **{{client.name}}** between **{{project.startDate}}** and **{{project.endDate}}**. The assessment simulates an attacker who has gained an initial foothold inside the corporate network.

# Scope

- **IP ranges:** [TODO: Add IP ranges, e.g. 10.0.0.0/8]
- **Active Directory domains:** [TODO: Add domain FQDNs]
- **Assumptions:** Compromised standard workstation, no domain credentials.
- **Out of scope:** [TODO: Systems or segments that must be excluded]

# Methodology

1. **Network discovery** with Nmap and Masscan.
2. **Service enumeration** of SMB, LDAP, Kerberos and management protocols.
3. **Active Directory mapping** using BloodHound and SharpHound collectors.
4. **Credential access** through relay, password spraying and ticket attacks.
5. **Lateral movement** with Impacket and CrackMapExec.
6. **Reporting** of findings, paths and remediation actions.

# Findings Summary

{{findings.table}}
`,
    appendix_en: `# Appendix

- **Network scanners:** Nmap, Masscan
- **Vulnerability scanners:** Nessus
- **Active Directory tooling:** BloodHound, SharpHound, Impacket, Kerbrute
- **Manual exploitation:** Metasploit, CrackMapExec, NetExec
`,
    scope_es: `# Resumo Executivo

Este relatório consolida os resultados da avaliação de rede interna realizada para a **{{client.name}}** entre **{{project.startDate}}** e **{{project.endDate}}**. A avaliação simula o cenário de um atacante com um ponto de apoio inicial (foothold) dentro da rede corporativa.

# Escopo

- **Faixas de IP:** [TODO: Adicionar faixas de IP, ex: 10.0.0.0/8]
- **Domínios Active Directory:** [TODO: Adicionar FQDNs dos domínios]
- **Premissas:** Estação de trabalho padrão comprometida, sem credenciais de domínio.
- **Fora de escopo:** [TODO: Sistemas, servidores legados ou segmentos excluídos]

# Metodologia

1. **Descoberta de rede** com Nmap e Masscan.
2. **Enumeração de serviços** SMB, LDAP, Kerberos e protocolos de gerenciamento.
3. **Mapeamento de Active Directory** utilizando BloodHound e coletores SharpHound.
4. **Obtenção de credenciais** através de relay attacks, password spraying e exploração de tickets Kerberos.
5. **Movimentação lateral** com Impacket e CrackMapExec/NetExec.
6. **Relatório técnico** documentando achados, vetores de ataque e plano de mitigação.

# Resumo de Vulnerabilidades

{{findings.table}}
`,
    appendix_es: `# Apêndice

- **Scanners de rede:** Nmap, Masscan
- **Scanners de vulnerabilidades:** Nessus
- **Ferramental Active Directory:** BloodHound, SharpHound, Impacket, Kerbrute
- **Exploração e movimentação:** Metasploit, CrackMapExec, NetExec
`,
    scope_pt: `# Resumo Executivo

Este relatório consolida os resultados da avaliação de rede interna realizada para a **{{client.name}}** entre **{{project.startDate}}** e **{{project.endDate}}**. A avaliação simula o cenário de um atacante com um ponto de apoio inicial (foothold) dentro da rede corporativa.

# Escopo

- **Faixas de IP:** [TODO: Adicionar faixas de IP, ex: 10.0.0.0/8]
- **Domínios Active Directory:** [TODO: Adicionar FQDNs dos domínios]
- **Premissas:** Estação de trabalho padrão comprometida, sem credenciais de domínio.
- **Fora de escopo:** [TODO: Sistemas, servidores legados ou segmentos excluídos]

# Metodologia

1. **Descoberta de rede** com Nmap e Masscan.
2. **Enumeração de serviços** SMB, LDAP, Kerberos e protocolos de gerenciamento.
3. **Mapeamento de Active Directory** utilizando BloodHound e coletores SharpHound.
4. **Obtenção de credenciais** através de relay attacks, password spraying e exploração de tickets Kerberos.
5. **Movimentação lateral** com Impacket e CrackMapExec/NetExec.
6. **Relatório técnico** documentando achados, vetores de ataque e plano de mitigação.

# Resumo de Vulnerabilidades

{{findings.table}}
`,
    appendix_pt: `# Apêndice

- **Scanners de rede:** Nmap, Masscan
- **Scanners de vulnerabilidades:** Nessus
- **Ferramental Active Directory:** BloodHound, SharpHound, Impacket, Kerbrute
- **Exploração e movimentação:** Metasploit, CrackMapExec, NetExec
`,
  },
  {
    id: 'ptpl-3',
    name_en: 'Mobile App Pentest (iOS/Android)',
    name_es: 'Pentest de Aplicaciones Móviles (iOS/Android)',
    name_pt: 'Pentest de Aplicativo Mobile (iOS/Android)',
    description_en: 'A security assessment of an iOS or Android mobile application, focusing on client-side vulnerabilities and backend API security.',
    description_es: 'Evaluación de seguridad enfocada en aplicaciones móviles iOS y Android, cubriendo vulnerabilidades del lado del cliente y APIs de backend.',
    description_pt: 'Uma avaliação de segurança focada em aplicações móveis iOS e Android, cobrindo vulnerabilidades no client-side e nas APIs de backend.',
    icon: 'Smartphone',
    scope_en: `# Executive Summary

This report documents the security assessment of the mobile application of **{{client.name}}**. The evaluation covered the client-side application, local data storage and the backend APIs consumed by the app.

The assessment was performed between **{{project.startDate}}** and **{{project.endDate}}**.

# Scope

- **Application:** [TODO: Add application name and package/bundle ID]
- **Platform:** iOS / Android
- **Backend APIs:** [TODO: List backend endpoints in scope]
- **Out of scope:** [TODO: Third-party SDKs, external integrations, etc.]

# Methodology

1. **Static analysis** of the application package (MobSF, jadx, Hopper).
2. **Dynamic analysis** with a rooted/jailbroken device, Frida and Objection.
3. **Network analysis** with Burp Suite to inspect API traffic.
4. **Local storage review** (keychain, shared preferences, SQLite, files).
5. **Authentication & authorization tests** on the backend.
6. **Reporting** with proof of concept and remediation guidance.

# Findings Summary

{{findings.table}}
`,
    appendix_en: `# Appendix

- **Static analysis:** MobSF, jadx, Hopper
- **Dynamic analysis:** Burp Suite, Frida, Objection
- **Test devices:** Google Pixel 6 (rooted), iPhone 12 (jailbroken)
`,
    scope_es: `# Resumo Executivo

Este relatório documenta a avaliação de segurança do aplicativo móvel da **{{client.name}}**. A análise cobriu a aplicação client-side, o armazenamento local de dados e as APIs de backend consumidas pelo app.

A avaliação foi realizada entre **{{project.startDate}}** e **{{project.endDate}}**.

# Escopo

- **Aplicação:** [TODO: Adicionar nome do app e package/bundle ID]
- **Plataformas:** iOS / Android
- **APIs de Backend:** [TODO: Listar endpoints e microserviços no escopo]
- **Fora de escopo:** [TODO: SDKs de terceiros e integrações externas fora do controle da organização]

# Metodologia

1. **Análise estática** do pacote do aplicativo (MobSF, jadx, Hopper/Ghidra).
2. **Análise dinâmica** utilizando dispositivo rooteado/jailbroken com Frida e Objection.
3. **Análise de tráfego de rede** com Burp Suite para inspecionar requisições da API e SSL Pinning bypass.
4. **Revisão de armazenamento local** (Keychain, SharedPreferences, SQLite, arquivos em cache).
5. **Testes de autenticação e autorização** nos endpoints de backend.
6. **Relatório** com provas de conceito reproduzíveis e plano de mitigação.

# Resumo de Vulnerabilidades

{{findings.table}}
`,
    appendix_es: `# Apêndice

- **Análise estática:** MobSF, jadx, Hopper
- **Análise dinâmica:** Burp Suite, Frida, Objection
- **Dispositivos de teste:** Google Pixel (root) e iPhone (jailbreak)
`,
    scope_pt: `# Resumo Executivo

Este relatório documenta a avaliação de segurança do aplicativo móvel da **{{client.name}}**. A análise cobriu a aplicação client-side, o armazenamento local de dados e as APIs de backend consumidas pelo app.

A avaliação foi realizada entre **{{project.startDate}}** e **{{project.endDate}}**.

# Escopo

- **Aplicação:** [TODO: Adicionar nome do app e package/bundle ID]
- **Plataformas:** iOS / Android
- **APIs de Backend:** [TODO: Listar endpoints e microserviços no escopo]
- **Fora de escopo:** [TODO: SDKs de terceiros e integrações externas fora do controle da organização]

# Metodologia

1. **Análise estática** do pacote do aplicativo (MobSF, jadx, Hopper/Ghidra).
2. **Análise dinâmica** utilizando dispositivo rooteado/jailbroken com Frida e Objection.
3. **Análise de tráfego de rede** com Burp Suite para inspecionar requisições da API e SSL Pinning bypass.
4. **Revisão de armazenamento local** (Keychain, SharedPreferences, SQLite, arquivos em cache).
5. **Testes de autenticação e autorização** nos endpoints de backend.
6. **Relatório** com provas de conceito reproduzíveis e plano de mitigação.

# Resumo de Vulnerabilidades

{{findings.table}}
`,
    appendix_pt: `# Apêndice

- **Análise estática:** MobSF, jadx, Hopper
- **Análise dinâmica:** Burp Suite, Frida, Objection
- **Dispositivos de teste:** Google Pixel (root) e iPhone (jailbreak)
`,
  },
  {
    id: 'ptpl-4',
    name_en: 'Certification Report',
    name_es: 'Informe Ejecutivo de Certificación',
    name_pt: 'Relatório Executivo de Certificação',
    description_en: 'Certification exam report following standard offensive auditing guidelines: executive summary, approach, scope, assessment overview, network pentest summary, compromise walkthrough, remediation summary and technical appendices.',
    description_es: 'Informe de examen de certificación profesional siguiendo estándares de auditoría ofensiva: resumen ejecutivo, enfoque, alcance, compromiso de red, walkthrough y mitigación.',
    description_pt: 'Relatório de exame de certificação profissional seguindo padrões de auditoria ofensiva: resumo executivo, abordagem, escopo, visão geral, compromisso de rede, walkthrough detalhado, remediação e apêndices técnicos.',
    icon: 'Award',
    scope_en: `# Executive Summary

{{client.name}} contracted {{pentester.name}} to perform a penetration test of {{client.name}}'s network to identify security weaknesses, determine the impact to {{client.name}}, document all findings in a clear and repeatable manner, and provide remediation recommendations.

This report is submitted as part of the **[TODO: Certification Name]** certification exam and documents the assessment methodology, the attack path taken to compromise the target environment, and the findings identified along the way.

# Approach

{{pentester.name}} performed testing under a **[TODO: Black Box / Grey Box / White Box]** approach from {{project.startDate}} to {{project.endDate}} without advance knowledge of {{client.name}}'s environment, with the goal of identifying unknown weaknesses. Testing was performed from a non-evasive standpoint with the goal of uncovering as many misconfigurations and vulnerabilities as possible.

Each weakness identified was documented and manually investigated to determine exploitation possibilities and escalation potential. {{pentester.name}} sought to demonstrate the full impact of every vulnerability, up to and including full domain compromise. Where a foothold was obtained, further testing including lateral movement and horizontal and vertical privilege escalation was performed to demonstrate the impact of an internal network compromise.

# Scope

The scope of this assessment was the target network range(s) assigned for the exam and any hosts or Active Directory domains discovered to be in scope during testing.

## In Scope Assets

| Host / URL / IP Address | Description |
|:---|:---|
| [TODO: 10.129.X.X] | [TODO: External target] |
| [TODO: 172.16.X.0/24] | [TODO: Internal network range] |
| [TODO: domain.local] | [TODO: Active Directory domain] |

# Assessment Overview and Recommendations

During the penetration test against {{client.name}}, {{pentester.name}} identified {{vulnerabilities.count}} findings that threaten the confidentiality, integrity, and availability of {{client.name}}'s information systems. The findings were categorized by severity level: {{vulnerabilities.critical}} critical, {{vulnerabilities.high}} high, {{vulnerabilities.medium}} medium, {{vulnerabilities.low}} low, and {{vulnerabilities.informational}} informational.

[TODO: Executive-level narrative summarizing the overall security posture, the most significant risks, and their business impact.]

{{client.name}} should create a remediation plan based on the Remediation Summary section of this report, addressing all critical and high findings as soon as possible according to the needs of the business. {{client.name}} should also consider performing periodic vulnerability assessments if they are not already being performed.

# Network Penetration Test Assessment Summary

This section summarizes the testing perspective and the findings identified during the network penetration test.

## Network Summary

{{pentester.name}} began all testing activities from the perspective of an unauthenticated user on the network. {{client.name}} provided network ranges but did not provide additional information such as operating system, credentials, or configuration details.

## Summary of Findings

During the course of testing, {{pentester.name}} uncovered a total of {{vulnerabilities.count}} findings that pose a material risk to {{client.name}}'s information systems. Informational findings are observations for areas of improvement and do not represent security vulnerabilities on their own. The table below summarizes the findings; full technical details for each are provided in the Technical Findings Details section.

{{findings.table}}

# Technical Findings Details

The findings below are ordered by severity. Each finding includes a description, evidence, impact, and remediation guidance. If no findings are registered yet, this section will be empty.

{{findings.details}}

# Internal Network Compromise Walkthrough

This section describes the end-to-end attack path used to compromise the environment.

## Walkthrough Summary

During the assessment {{pentester.name}} was able to gain a foothold, move laterally, and compromise the environment, leading to full administrative control over the [TODO: domain.local] domain. The steps below demonstrate the path taken from initial access to compromise and do not include every vulnerability discovered. Issues not used as part of the path to compromise are listed as standalone findings in the Findings section, ranked by severity.

## Detailed Walkthrough

{{pentester.name}} performed the following to fully compromise the [TODO: domain.local] domain:

1. [TODO: High-level step 1]
2. [TODO: High-level step 2]
3. [TODO: High-level step 3]

**Detailed reproduction steps:**

[TODO: Fill in the detailed attack chain with commands, screenshots, and evidence for each step above.]

# Remediation Summary

As a result of this assessment there are several opportunities for {{client.name}} to strengthen its network security. Remediation efforts are prioritized below, starting with those that will likely take the least amount of time and effort to complete. All remediation steps should be carefully planned and tested to prevent service disruption or data loss.

## Short Term

- [TODO: Finding reference] - [TODO: Short-term remediation action]
- [TODO: Finding reference] - [TODO: Short-term remediation action]

## Medium Term

- [TODO: Finding reference] - [TODO: Medium-term remediation action]
- [TODO: Finding reference] - [TODO: Medium-term remediation action]

## Long Term

- Perform ongoing internal network vulnerability assessments and password audits.
- Perform periodic Active Directory security assessments.
- Educate systems, network administrators, and developers on security hardening best practices.
- Enhance network segmentation to isolate critical hosts and limit the effect of an internal compromise.
- [TODO: Additional long-term recommendation]
`,
    appendix_en: `# Appendix

The following supporting information was collected during the assessment.

## Finding Severities

Each finding is assigned a severity rating of critical, high, medium, low, or informational. The rating is based on the priority with which each finding should be addressed and the potential impact each has on the confidentiality, integrity, and availability of {{client.name}}'s data.

| Rating | CVSS Score Range |
|:---|:---|
| Critical | 9.0 – 10.0 |
| High | 7.0 – 8.9 |
| Medium | 4.0 – 6.9 |
| Low | 0.1 – 3.9 |
| Informational | 0.0 |

## Host and Service Discovery

| IP Address | Port | Service | Notes |
|:---|:---|:---|:---|
| [TODO: IP] | [TODO: Port] | [TODO: Service] | [TODO: Notes] |

## Subdomain Discovery

| URL | Description | Discovery Method |
|:---|:---|:---|
| [TODO: Subdomain or VHost] | [TODO: Description] | [TODO: Method] |

## Exploited Hosts

| Host | Scope | Method | Notes |
|:---|:---|:---|:---|
| [TODO: Host] | [TODO: Scope] | [TODO: Method] | [TODO: Notes] |

## Compromised Users

| Username | Type | Method | Notes |
|:---|:---|:---|:---|
| [TODO: Username] | [TODO: Type] | [TODO: Method] | [TODO: Notes] |

## Changes and Host Cleanup

| Host | Scope | Change or Cleanup Needed |
|:---|:---|:---|
| [TODO: Host] | [TODO: Scope] | [TODO: Change or cleanup performed] |

## Flags Discovered

| Flag # | Host | Flag Value | Flag Location | Method Used |
|:---|:---|:---|:---|:---|
| 1 | [TODO: Hostname] | [TODO: Flag value] | [TODO: Location] | [TODO: Method] |
| 2 | | | | |
| 3 | | | | |
| 4 | | | | |
| 5 | | | | |
| 6 | | | | |
| 7 | | | | |
| 8 | | | | |
| 9 | | | | |
| 10 | | | | |
| 11 | | | | |
| 12 | | | | |
| 13 | | | | |
`,
    scope_es: `# Resumo Executivo

A **{{client.name}}** contratou **{{pentester.name}}** para realizar um teste de intrusão na rede da {{client.name}} com o objetivo de identificar fragilidades de segurança, determinar seu impacto para o negócio, documentar todos os achados de forma clara e reproduzível, e fornecer recomendações práticas de remediação.

Este relatório é apresentado como parte do exame de certificação **[TODO: Nome da Certificação]** e documenta a metodologia de avaliação, a cadeia de ataque utilizada para comprometer o ambiente alvo e as vulnerabilidades identificadas.

# Abordagem

O auditor **{{pentester.name}}** executou os testes sob a abordagem **[TODO: Caixa Preta / Caixa Cinza / Caixa Branca]** entre {{project.startDate}} e {{project.endDate}}, sem conhecimento prévio do ambiente da {{client.name}}, visando descobrir vulnerabilidades desconhecidas. Os testes foram conduzidos de forma não evasiva, priorizando a identificação da maior quantidade possível de configurações inseguras.

Cada vulnerabilidade identificada foi documentada e investigada manualmente para comprovar a viabilidade de exploração e escalonamento. O objetivo foi demonstrar o impacto real de cada falha, incluindo o comprometimento de controladores de domínio (DC). Onde um ponto de apoio (foothold) foi estabelecido, foram realizados testes adicionais de movimentação lateral e escalonamento de privilégios horizontal e vertical.

# Escopo

O escopo desta avaliação compreendeu as faixas de rede atribuídas ao exame e quaisquer hosts ou domínios de Active Directory descobertos durante as fases de reconhecimento.

## Ativos no Escopo

| Host / URL / Endereço IP | Descrição |
|:---|:---|
| [TODO: 10.129.X.X] | [TODO: Alvo externo] |
| [TODO: 172.16.X.0/24] | [TODO: Faixa de rede interna] |
| [TODO: domain.local] | [TODO: Domínio Active Directory] |

# Visão Geral e Recomendações

Durante o teste de intrusão contra a {{client.name}}, foram identificadas {{vulnerabilities.count}} vulnerabilidades que ameaçam a confidencialidade, integridade e disponibilidade dos sistemas. Os achados foram categorizados por severidade: {{vulnerabilities.critical}} críticas, {{vulnerabilities.high}} altas, {{vulnerabilities.medium}} médias, {{vulnerabilities.low}} baixas e {{vulnerabilities.informational}} informativas.

[TODO: Narrativa executiva resumindo a postura geral de segurança, os riscos mais significativos e seu impacto nos negócios.]

A {{client.name}} deve estruturar um plano de remediação prioritário focado nas vulnerabilidades críticas e altas, além de implementar avaliações contínuas de segurança.

# Resumo do Teste de Intrusão em Rede

Esta seção resume a perspectiva dos testes e os achados identificados durante a avaliação de infraestrutura de rede.

## Resumo Operacional

As atividades foram iniciadas a partir da perspectiva de um usuário não autenticado na rede interna. A {{client.name}} forneceu apenas as faixas de rede, sem credenciais prévias ou documentação arquitetural.

## Resumo de Achados

Durante os testes, foram descobertos {{vulnerabilities.count}} achados que representam risco material para os sistemas da {{client.name}}.

{{findings.table}}

# Detalhes Técnicos dos Achados

Os achados abaixo estão ordenados por severidade técnica, contendo descrição, evidências de exploração, impacto e recomendações corretivas.

{{findings.details}}

# Walkthrough de Comprometimento da Rede Interna

Esta seção descreve a cadeia de ataque ponta a ponta que resultou no comprometimento do ambiente.

## Resumo do Ataque

Durante a avaliação, o auditor obteve acesso inicial (foothold), realizou movimentação lateral e comprometeu o ambiente até assumir o controle administrativo total do domínio [TODO: domain.local].

## Cadeia de Ataque Detalhada

Etapas executadas para comprometer o domínio [TODO: domain.local]:

1. [TODO: Etapa de alto nível 1]
2. [TODO: Etapa de alto nível 2]
3. [TODO: Etapa de alto nível 3]

**Passos detalhados de reprodução:**

[TODO: Preencher com os comandos exatos, saídas de terminal e capturas de tela demonstrando a exploração.]

# Resumo de Remediação

Recomendações técnicas organizadas por horizonte temporal de implementação:

## Curto Prazo (Imediato)

- [TODO: Referência do achado] - [TODO: Ação imediata de contenção]
- [TODO: Referência do achado] - [TODO: Correção de configuração incorreta]

## Médio Prazo

- [TODO: Referência do achado] - [TODO: Implementação de defesas em camadas]
- [TODO: Referência do achado] - [TODO: Atualização de softwares vulneráveis]

## Longo Prazo (Estratégico)

- Realizar avaliações periódicas de vulnerabilidade interna e auditorias de senhas.
- Executar auditorias estruturais de segurança no Active Directory.
- Treinar equipes de infraestrutura, administradores de rede e desenvolvedores em práticas de hardening.
- Aprimorar a segmentação de rede para isolar sistemas críticos e conter movimentações laterais.
`,
    appendix_es: `# Apêndice

Informações de suporte e inventário coletados durante a avaliação.

## Classificação de Severidade

Cada achado é classificado com uma nota de severidade baseada no framework CVSS v3.1:

| Severidade | Pontuação CVSS |
|:---|:---|
| Crítica | 9.0 – 10.0 |
| Alta | 7.0 – 8.9 |
| Média | 4.0 – 6.9 |
| Baixa | 0.1 – 3.9 |
| Informativa | 0.0 |

## Descoberta de Hosts e Serviços

| Endereço IP | Porta | Serviço | Observações |
|:---|:---|:---|:---|
| [TODO: IP] | [TODO: Porta] | [TODO: Serviço] | [TODO: Notas] |

## Descoberta de Subdomínios e VHosts

| URL / FQDN | Descrição | Método de Descoberta |
|:---|:---|:---|
| [TODO: Subdomínio ou VHost] | [TODO: Descrição] | [TODO: Ferramenta / Método] |

## Hosts Comprometidos

| Host | Escopo | Vetor de Exploração | Observações |
|:---|:---|:---|:---|
| [TODO: Hostname] | [TODO: Escopo] | [TODO: Vulnerabilidade] | [TODO: Nível de Acesso] |

## Usuários Comprometidos

| Usuário | Tipo de Conta | Método de Obtenção | Observações |
|:---|:---|:---|:---|
| [TODO: Username] | [TODO: Domínio / Local] | [TODO: Kerberoasting / Dump] | [TODO: Privilégios] |

## Flags e Evidências do Exame

| Flag # | Host | Valor da Flag | Localização | Método Utilizado |
|:---|:---|:---|:---|:---|
| 1 | [TODO: Hostname] | [TODO: Valor da flag] | [TODO: Caminho] | [TODO: Exploração] |
| 2 | | | | |
| 3 | | | | |
| 4 | | | | |
| 5 | | | | |
| 6 | | | | |
| 7 | | | | |
| 8 | | | | |
| 9 | | | | |
| 10 | | | | |
| 11 | | | | |
| 12 | | | | |
| 13 | | | | |
`,
    scope_pt: `# Resumo Executivo

A **{{client.name}}** contratou **{{pentester.name}}** para realizar um teste de intrusão na rede da {{client.name}} com o objetivo de identificar fragilidades de segurança, determinar seu impacto para o negócio, documentar todos os achados de forma clara e reproduzível, e fornecer recomendações práticas de remediação.

Este relatório é apresentado como parte do exame de certificação **[TODO: Nome da Certificação]** e documenta a metodologia de avaliação, a cadeia de ataque utilizada para comprometer o ambiente alvo e as vulnerabilidades identificadas.

# Abordagem

O auditor **{{pentester.name}}** executou os testes sob a abordagem **[TODO: Caixa Preta / Caixa Cinza / Caixa Branca]** entre {{project.startDate}} e {{project.endDate}}, sem conhecimento prévio do ambiente da {{client.name}}, visando descobrir vulnerabilidades desconhecidas. Os testes foram conduzidos de forma não evasiva, priorizando a identificação da maior quantidade possível de configurações inseguras.

Cada vulnerabilidade identificada foi documentada e investigada manualmente para comprovar a viabilidade de exploração e escalonamento. O objetivo foi demonstrar o impacto real de cada falha, incluindo o comprometimento de controladores de domínio (DC). Onde um ponto de apoio (foothold) foi estabelecido, foram realizados testes adicionais de movimentação lateral e escalonamento de privilégios horizontal e vertical.

# Escopo

O escopo desta avaliação compreendeu as faixas de rede atribuídas ao exame e quaisquer hosts ou domínios de Active Directory descobertos durante as fases de reconhecimento.

## Ativos no Escopo

| Host / URL / Endereço IP | Descrição |
|:---|:---|
| [TODO: 10.129.X.X] | [TODO: Alvo externo] |
| [TODO: 172.16.X.0/24] | [TODO: Faixa de rede interna] |
| [TODO: domain.local] | [TODO: Domínio Active Directory] |

# Visão Geral e Recomendações

Durante o teste de intrusão contra a {{client.name}}, foram identificadas {{vulnerabilities.count}} vulnerabilidades que ameaçam a confidencialidade, integridade e disponibilidade dos sistemas. Os achados foram categorizados por severidade: {{vulnerabilities.critical}} críticas, {{vulnerabilities.high}} altas, {{vulnerabilities.medium}} médias, {{vulnerabilities.low}} baixas e {{vulnerabilities.informational}} informativas.

[TODO: Narrativa executiva resumindo a postura geral de segurança, os riscos mais significativos e seu impacto nos negócios.]

A {{client.name}} deve estruturar um plano de remediação prioritário focado nas vulnerabilidades críticas e altas, além de implementar avaliações contínuas de segurança.

# Resumo do Teste de Intrusão em Rede

Esta seção resume a perspectiva dos testes e os achados identificados durante a avaliação de infraestrutura de rede.

## Resumo Operacional

As atividades foram iniciadas a partir da perspectiva de um usuário não autenticado na rede interna. A {{client.name}} forneceu apenas as faixas de rede, sem credenciais prévias ou documentação arquitetural.

## Resumo de Achados

Durante os testes, foram descobertos {{vulnerabilities.count}} achados que representam risco material para os sistemas da {{client.name}}.

{{findings.table}}

# Detalhes Técnicos dos Achados

Os achados abaixo estão ordenados por severidade técnica, contendo descrição, evidências de exploração, impacto e recomendações corretivas.

{{findings.details}}

# Walkthrough de Comprometimento da Rede Interna

Esta seção descreve a cadeia de ataque ponta a ponta que resultou no comprometimento do ambiente.

## Resumo do Ataque

Durante a avaliação, o auditor obteve acesso inicial (foothold), realizou movimentação lateral e comprometeu o ambiente até assumir o controle administrativo total do domínio [TODO: domain.local].

## Cadeia de Ataque Detalhada

Etapas executadas para comprometer o domínio [TODO: domain.local]:

1. [TODO: Etapa de alto nível 1]
2. [TODO: Etapa de alto nível 2]
3. [TODO: Etapa de alto nível 3]

**Passos detalhados de reprodução:**

[TODO: Preencher com os comandos exatos, saídas de terminal e capturas de tela demonstrando a exploração.]

# Resumo de Remediação

Recomendações técnicas organizadas por horizonte temporal de implementação:

## Curto Prazo (Imediato)

- [TODO: Referência do achado] - [TODO: Ação imediata de contenção]
- [TODO: Referência do achado] - [TODO: Correção de configuração incorreta]

## Médio Prazo

- [TODO: Referência do achado] - [TODO: Implementação de defesas em camadas]
- [TODO: Referência do achado] - [TODO: Atualização de softwares vulneráveis]

## Longo Prazo (Estratégico)

- Realizar avaliações periódicas de vulnerabilidade interna e auditorias de senhas.
- Executar auditorias estruturais de segurança no Active Directory.
- Treinar equipes de infraestrutura, administradores de rede e desenvolvedores em práticas de hardening.
- Aprimorar a segmentação de rede para isolar sistemas críticos e conter movimentações laterais.
`,
    appendix_pt: `# Apêndice

Informações de suporte e inventário coletados durante a avaliação.

## Classificação de Severidade

Cada achado é classificado com uma nota de severidade baseada no framework CVSS v3.1:

| Severidade | Pontuação CVSS |
|:---|:---|
| Crítica | 9.0 – 10.0 |
| Alta | 7.0 – 8.9 |
| Média | 4.0 – 6.9 |
| Baixa | 0.1 – 3.9 |
| Informativa | 0.0 |

## Descoberta de Hosts e Serviços

| Endereço IP | Porta | Serviço | Observações |
|:---|:---|:---|:---|
| [TODO: IP] | [TODO: Porta] | [TODO: Serviço] | [TODO: Notas] |

## Descoberta de Subdomínios e VHosts

| URL / FQDN | Descrição | Método de Descoberta |
|:---|:---|:---|
| [TODO: Subdomínio ou VHost] | [TODO: Descrição] | [TODO: Ferramenta / Método] |

## Hosts Comprometidos

| Host | Escopo | Vetor de Exploração | Observações |
|:---|:---|:---|:---|
| [TODO: Hostname] | [TODO: Escopo] | [TODO: Vulnerabilidade] | [TODO: Nível de Acesso] |

## Usuários Comprometidos

| Usuário | Tipo de Conta | Método de Obtenção | Observações |
|:---|:---|:---|:---|
| [TODO: Username] | [TODO: Domínio / Local] | [TODO: Kerberoasting / Dump] | [TODO: Privilégios] |

## Flags e Evidências do Exame

| Flag # | Host | Valor da Flag | Localização | Método Utilizado |
|:---|:---|:---|:---|:---|
| 1 | [TODO: Hostname] | [TODO: Valor da flag] | [TODO: Caminho] | [TODO: Exploração] |
| 2 | | | | |
| 3 | | | | |
| 4 | | | | |
| 5 | | | | |
| 6 | | | | |
| 7 | | | | |
| 8 | | | | |
| 9 | | | | |
| 10 | | | | |
| 11 | | | | |
| 12 | | | | |
| 13 | | | | |
`,
  },
  {
    id: 'ptpl-5',
    name_en: 'Machine Writeup',
    name_es: 'Writeup Técnico de Máquina',
    name_pt: 'Writeup Técnico de Máquina',
    description_en: 'A template for documenting the process of solving a CTF machine, such as those on Hack The Box.',
    description_es: 'Plantilla técnica para documentar paso a paso la resolución de máquinas CTF y laboratorios prácticos.',
    description_pt: 'Modelo para documentação técnica passo a passo do processo de exploração e comprometimento de máquinas CTF e laboratórios práticos.',
    icon: 'FileText',
    scope_en: `# General Information

In this writeup we solve the [TODO: machine name] machine from Hack The Box, a Linux box rated [TODO: Easy / Medium / Hard].

- **Machine name:** [TODO: machine name]
- **IP address:** [TODO: IP address]
- **Operating system:** Linux
- **Difficulty:** 🟢 Easy | 🟡 Medium | 🔴 Hard [TODO: select difficulty]
- **Date:** ${format(new Date(), 'dd-MM-yyyy')}

# Initial Reconnaissance

Map the target attack surface: host resolution, open ports and running services.

## Add IP to /etc/hosts

Add the machine IP to /etc/hosts:

\`\`\`bash
sudo echo "[TODO: IP address] [TODO: machine.htb]" | sudo tee -a /etc/hosts
\`\`\`

## Port Scanning

Identify exposed ports and services with Nmap.

### Simple Scan

\`\`\`bash
sudo nmap -v -sV -T5 [TODO: IP address]
\`\`\`

\`\`\`
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.12 (Ubuntu Linux; protocol 2.0)
80/tcp open  http    Apache httpd 2.4.41 ((Ubuntu))
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
\`\`\`

Only common ports (22 and 80) were found open. We focus on the web service.

## Web Access

We browse to \`http://[TODO: machine.htb]\` and observe what looks like [TODO: site description, e.g. an online learning platform].

[TODO: add screenshots or useful commands from the initial web access]

# Web Enumeration

Discover endpoints, technologies and hidden content on the exposed web stack.

## WSTG Scan

This tool automatically performs:

- Web technology enumeration
- Port and service scanning with Nmap
- Vulnerability analysis with Nuclei
- Subdomain fuzzing with ffuf
- Directory fuzzing with ffuf
- Spidering / full site mapping
- Form detection and injection testing
- API testing (OWASP API Top 10)
- User enumeration and bruteforce with hydra

\`\`\`bash
git clone https://github.com/0xdun0/WSTG-Scan.git
cd WSTG-Scan
python3 wstg-scan.py
\`\`\`

## Relevant Findings

[TODO: summarise the most relevant findings from the enumeration]

### Subdomain Enumeration (VHosts)

Check the base Content-Length and fuzz VHosts with FFUF:

\`\`\`bash
ffuf -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt:FUZZ \\
     -u http://[TODO: machine.htb]/ \\
     -H 'Host: FUZZ.[TODO: machine.htb]' \\
     -fs [TODO: base_response_size]
\`\`\`

We find the subdomain: [TODO: e.g. grafana.planning.htb]. We add it to /etc/hosts and reach a [TODO: technology and version, e.g. Grafana v11.0.0] panel.

# Exploitation

Identify the vulnerable surface, weaponise a known exploit and gain a first foothold.

## XSS Test

We try the following script in the form fields to check whether it is vulnerable to Cross Site Scripting (XSS):

\`\`\`html
[TODO: XSS payload, e.g. <img src=x onerror="fetch('http://[TODO: your IP]:9000')">]
\`\`\`

We replace the IP with ours and start a Netcat listener on port 9000:

\`\`\`bash
nc -lvnp 9000
\`\`\`

We click the Send button and check whether the listener receives a call to confirm the vulnerability.

## CVE / Exploit Research

We look for CVEs related to [TODO: service and version, e.g. Grafana 11.0.0] on sources such as:

- https://sploitus.com
- https://exploit-db.com
- https://github.com

**Selected exploit:** [TODO: describe the exploit used and its reference URL]

## Exploit Execution

[TODO: step-by-step description of how remote execution or the initial access was achieved]

## Stabilise the Session

We use Penelope to stabilise our session and gain persistence. We use the bash payload from the tun0 section, since we are connected through the VPN.

[TODO: Penelope bash payload (tun0 section)]

We run it on the target machine and automatically receive a PTY shell with persistence. With F12 we can detach the session to interact with it later.

# Initial Access

Once we have access, we verify the user and system context.

- Current user: \`whoami\`
- Environment: \`uname -a\`, \`id\`, \`sudo -l\`

## User Flag

Locate and obtain the user flag:

\`\`\`bash
cat /home/[TODO: user]/user.txt
\`\`\`

[TODO: paste the user flag value]

# Privilege Escalation

Enumerate the local environment and abuse misconfigurations to escalate to root.

## Privilege Enumeration

We do not have sudo as the user [TODO: user, e.g. Oliver]:

\`\`\`bash
sudo -l
\`\`\`

### SUDO Version

[TODO: state the sudo version]. This version is vulnerable to [TODO: CVE, e.g. CVE-2025-32463] and we find several PoCs to exploit it.

### Files with Special Permissions

Searching for files with special permissions we find a suspicious binary [TODO: e.g. ndsudo]:

\`\`\`bash
find / -perm -4000 2>/dev/null
\`\`\`

### Internal Running Services

\`\`\`bash
ss -tuln
\`\`\`

Tools used: \`sudo -l\`, \`find / -perm -4000 2>/dev/null\`, \`linpeas.sh\`, \`pspy\`.

## Applied Technique

[TODO: describe the technique used: SUID binary, misconfigured cronjob, hardcoded credentials, etc.]

# 👑 Root Flag

Obtain the root flag:

\`\`\`bash
cat /root/root.txt
\`\`\`

[TODO: paste the root flag value]
`,
    appendix_en: `# Appendix

- **Network scanner:** Nmap
- **Web enumeration:** WSTG-Scan, ffuf, whatweb
- **Exploitation:** [TODO: exploit/PoC used], Netcat
- **Shell stabilisation:** Penelope
- **Privilege escalation:** linpeas.sh, pspy
`,
    scope_es: `# Informações Gerais

Neste writeup documentamos a resolução técnica da máquina **[TODO: nome da máquina]**, um ambiente Linux classificado com dificuldade **[TODO: Fácil / Médio / Difícil]**.

- **Nome da máquina:** [TODO: nome da máquina]
- **Endereço IP:** [TODO: IP alvo]
- **Sistema Operacional:** Linux
- **Dificuldade:** 🟢 Fácil | 🟡 Média | 🔴 Difícil [TODO: selecionar dificuldade]
- **Data da auditoria:** [TODO: Data]

# Reconhecimento Inicial

Mapeamento da superfície de ataque do alvo: resolução de nomes, portas abertas e serviços em execução.

## Adicionar IP ao /etc/hosts

Adicione o IP da máquina ao arquivo local \`/etc/hosts\`:

\`\`\`bash
sudo echo "[TODO: IP alvo] [TODO: machine.htb]" | sudo tee -a /etc/hosts
\`\`\`

## Varredura de Portas (Port Scanning)

Identificação de serviços e versões através do Nmap:

### Varredura Rápida

\`\`\`bash
sudo nmap -v -sV -T5 [TODO: IP alvo]
\`\`\`

### Varredura Completa

\`\`\`bash
sudo nmap -p- -sCV -O [TODO: IP alvo] -oN nmap_full.txt
\`\`\`

# Enumeração Web

Análise dos serviços HTTP e tecnologias detectadas:

\`\`\`bash
whatweb http://[TODO: machine.htb]
ffuf -w /usr/share/wordlists/dirb/common.txt -u http://[TODO: machine.htb]/FUZZ
\`\`\`

# Exploração & Acesso Inicial (Foothold)

Identificação da falha e execução do exploit para obter shell inicial:

[TODO: Detalhes do vetor de invasão, payload utilizado e código do PoC]

\`\`\`bash
nc -lvnp 4444
\`\`\`

# 🏁 Flag de Usuário (User Flag)

Captura da flag de usuário:

\`\`\`bash
cat /home/user/user.txt
\`\`\`

[TODO: Colar a flag do usuário]

# Escalonamento de Privilégios (Privilege Escalation)

Identificação de vetores locais para obtenção de privilégios de superusuário (root):

[TODO: Descrever a técnica utilizada: binário SUID, cronjob inseguro, credenciais em arquivos, etc.]

# 👑 Flag de Root

Captura da flag de root:

\`\`\`bash
cat /root/root.txt
\`\`\`

[TODO: Colar a flag de root]
`,
    appendix_es: `# Apêndice

- **Varredura de rede:** Nmap, Rustscan
- **Enumeração web:** ffuf, Gobuster, Whatweb
- **Exploração:** Netcat, Metasploit
- **Pós-exploração:** LinPEAS, pspy
`,
    scope_pt: `# Informações Gerais

Neste writeup documentamos a resolução técnica da máquina **[TODO: nome da máquina]**, um ambiente Linux classificado com dificuldade **[TODO: Fácil / Médio / Difícil]**.

- **Nome da máquina:** [TODO: nome da máquina]
- **Endereço IP:** [TODO: IP alvo]
- **Sistema Operacional:** Linux
- **Dificuldade:** 🟢 Fácil | 🟡 Média | 🔴 Difícil [TODO: selecionar dificuldade]
- **Data da auditoria:** [TODO: Data]

# Reconhecimento Inicial

Mapeamento da superfície de ataque do alvo: resolução de nomes, portas abertas e serviços em execução.

## Adicionar IP ao /etc/hosts

Adicione o IP da máquina ao arquivo local \`/etc/hosts\`:

\`\`\`bash
sudo echo "[TODO: IP alvo] [TODO: machine.htb]" | sudo tee -a /etc/hosts
\`\`\`

## Varredura de Portas (Port Scanning)

Identificação de serviços e versões através do Nmap:

### Varredura Rápida

\`\`\`bash
sudo nmap -v -sV -T5 [TODO: IP alvo]
\`\`\`

### Varredura Completa

\`\`\`bash
sudo nmap -p- -sCV -O [TODO: IP alvo] -oN nmap_full.txt
\`\`\`

# Enumeração Web

Análise dos serviços HTTP e tecnologias detectadas:

\`\`\`bash
whatweb http://[TODO: machine.htb]
ffuf -w /usr/share/wordlists/dirb/common.txt -u http://[TODO: machine.htb]/FUZZ
\`\`\`

# Exploração & Acesso Inicial (Foothold)

Identificação da falha e execução do exploit para obter shell inicial:

[TODO: Detalhes do vetor de invasão, payload utilizado e código do PoC]

\`\`\`bash
nc -lvnp 4444
\`\`\`

# 🏁 Flag de Usuário (User Flag)

Captura da flag de usuário:

\`\`\`bash
cat /home/user/user.txt
\`\`\`

[TODO: Colar a flag do usuário]

# Escalonamento de Privilégios (Privilege Escalation)

Identificação de vetores locais para obtenção de privilégios de superusuário (root):

[TODO: Descrever a técnica utilizada: binário SUID, cronjob inseguro, credenciais em arquivos, etc.]

# 👑 Flag de Root

Captura da flag de root:

\`\`\`bash
cat /root/root.txt
\`\`\`

[TODO: Colar a flag de root]
`,
    appendix_pt: `# Apêndice

- **Varredura de rede:** Nmap, Rustscan
- **Enumeração web:** ffuf, Gobuster, Whatweb
- **Exploração:** Netcat, Metasploit
- **Pós-exploração:** LinPEAS, pspy
`,
  },
];
