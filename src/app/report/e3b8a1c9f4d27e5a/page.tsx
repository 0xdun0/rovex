'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Search,
  BookOpen,
  Sparkles,
  FileText,
  Terminal,
  ArrowRight,
  Check,
  Copy,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Layers,
  Activity,
  ExternalLink,
  Code,
  HardDrive,
  Cpu,
  Lock,
  X,
  User,
  CommandPaletteIcon,
} from '@/components/icons';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/context/language-context';
import { useUser } from '@/context/user-context';
import { RobotIcon } from '@/components/robot-icon';
import { cn } from '@/lib/utils';

interface LocalizedText {
  pt: string;
  es: string;
  en: string;
}

interface TemplateVariableItem {
  token: string;
  category: 'project' | 'client' | 'pentester' | 'report' | 'finding' | 'cvss' | 'counts' | 'custom' | 'functions' | 'syntax';
  categoryLabel: LocalizedText;
  source: LocalizedText;
  description: LocalizedText;
  example?: string | LocalizedText;
}

// recupera o texto de exemplo no idioma ativo
const getExampleText = (ex: string | LocalizedText | undefined, lang: 'pt' | 'es' | 'en'): string | undefined => {
  if (!ex) return undefined;
  if (typeof ex === 'string') return ex;
  return ex[lang] || ex['en'] || ex['pt'];
};

const ROVEX_TEMPLATE_VARIABLES: TemplateVariableItem[] = [
  // 1. Projeto
  {
    token: '{{ project.name }}',
    category: 'project',
    categoryLabel: { pt: 'Projeto', es: 'Proyecto', en: 'Project' },
    source: { pt: 'Metadados do Projeto', es: 'Metadatos del Proyecto', en: 'Project Metadata' },
    description: {
      pt: 'Nome formal ou título atribuído à auditoria de pentest.',
      es: 'Nombre formal o título asignado a la auditoría de pentest.',
      en: 'Formal name or title assigned to the pentest assessment.',
    },
    example: {
      pt: 'Auditoria de Segurança Web & API Q3',
      es: 'Auditoría de Seguridad Web & API Q3',
      en: 'Web & API Security Assessment Q3',
    },
  },
  {
    token: '{{ project.description }}',
    category: 'project',
    categoryLabel: { pt: 'Projeto', es: 'Proyecto', en: 'Project' },
    source: { pt: 'Metadados do Projeto', es: 'Metadatos del Proyecto', en: 'Project Metadata' },
    description: {
      pt: 'Descrição geral dos objetivos, premissas e escopo de alto nível do projeto.',
      es: 'Descripción general de objetivos, premisas y alcance de alto nivel.',
      en: 'General overview of project objectives, assumptions, and high-level scope.',
    },
    example: {
      pt: 'Avaliação de postura de segurança e testes de intrusão externos.',
      es: 'Evaluación de postura de seguridad y pruebas de penetración externas.',
      en: 'Comprehensive security posture assessment and external penetration testing.',
    },
  },
  {
    token: '{{ project.startDate }}',
    category: 'project',
    categoryLabel: { pt: 'Projeto', es: 'Proyecto', en: 'Project' },
    source: { pt: 'Cronograma', es: 'Cronograma', en: 'Timeline' },
    description: {
      pt: 'Data de início formal da execução dos testes de invasão.',
      es: 'Fecha de inicio formal de la ejecución de pruebas de intrusión.',
      en: 'Formal start date of offensive security testing activities.',
    },
    example: '2026-09-01',
  },
  {
    token: '{{ project.endDate }}',
    category: 'project',
    categoryLabel: { pt: 'Projeto', es: 'Proyecto', en: 'Project' },
    source: { pt: 'Cronograma', es: 'Cronograma', en: 'Timeline' },
    description: {
      pt: 'Data de encerramento dos testes de penetração.',
      es: 'Fecha de finalización de las pruebas de penetración.',
      en: 'Formal completion date of penetration testing activities.',
    },
    example: '2026-09-15',
  },
  {
    token: '{{ project.reportDate }}',
    category: 'project',
    categoryLabel: { pt: 'Projeto', es: 'Proyecto', en: 'Project' },
    source: { pt: 'Metadados do Projeto', es: 'Metadatos del Proyecto', en: 'Project Metadata' },
    description: {
      pt: 'Data oficial de emissão e entrega do relatório final.',
      es: 'Fecha oficial de emisión y entrega del reporte final.',
      en: 'Official issue and publication date of the final report.',
    },
    example: '2026-09-27',
  },
  {
    token: '{{ project.language }}',
    category: 'project',
    categoryLabel: { pt: 'Projeto', es: 'Proyecto', en: 'Project' },
    source: { pt: 'Configuração do Projeto', es: 'Configuración del Proyecto', en: 'Project Configuration' },
    description: {
      pt: 'Código de idioma configurado para a auditoria (pt-br, en-us, es).',
      es: 'Código de idioma configurado en la auditoría (pt-br, en-us, es).',
      en: 'Configured report language code (pt-br, en-us, es).',
    },
    example: 'pt-br',
  },

  // 2. Cliente
  {
    token: '{{ client.name }}',
    category: 'client',
    categoryLabel: { pt: 'Cliente', es: 'Cliente', en: 'Client' },
    source: { pt: 'Cadastro de Alvo', es: 'Registro de Objetivo', en: 'Target Record' },
    description: {
      pt: 'Razão social completa ou nome corporativo da empresa avaliada.',
      es: 'Razón social completa o nombre corporativo de la empresa evaluada.',
      en: 'Full corporate legal name of the audited organization.',
    },
    example: 'Acme Corporation S/A',
  },
  {
    token: '{{ client.shortName }}',
    category: 'client',
    categoryLabel: { pt: 'Cliente', es: 'Cliente', en: 'Client' },
    source: { pt: 'Cadastro de Alvo', es: 'Registro de Objetivo', en: 'Target Record' },
    description: {
      pt: 'Nome abreviado, sigla ou identificador comercial curto da empresa.',
      es: 'Nombre abreviado o identificador comercial corto de la empresa.',
      en: 'Abbreviated company name, acronym, or short identifier.',
    },
    example: 'Acme Corp',
  },
  {
    token: '{{ report_customer_short }}',
    category: 'client',
    categoryLabel: { pt: 'Cliente', es: 'Cliente', en: 'Client' },
    source: { pt: 'Cadastro de Alvo', es: 'Registro de Objetivo', en: 'Target Record' },
    description: {
      pt: 'Alias legado de compatibilidade para o nome abreviado do cliente.',
      es: 'Alias legado de compatibilidad en el nombre corto del cliente.',
      en: 'Legacy template alias for abbreviated customer name.',
    },
    example: 'Acme Corp',
  },
  {
    token: '{{ client.contactName }}',
    category: 'client',
    categoryLabel: { pt: 'Cliente', es: 'Cliente', en: 'Client' },
    source: { pt: 'Cadastro de Alvo', es: 'Registro de Objetivo', en: 'Target Record' },
    description: {
      pt: 'Nome completo do contato técnico, CISO ou gestor responsável no cliente.',
      es: 'Nombre completo del contacto técnico o CISO en el cliente.',
      en: 'Full name of the primary technical lead, CISO, or stakeholder.',
    },
    example: 'Carlos Silva',
  },
  {
    token: '{{ client.contactEmail }}',
    category: 'client',
    categoryLabel: { pt: 'Cliente', es: 'Cliente', en: 'Client' },
    source: { pt: 'Cadastro de Alvo', es: 'Registro de Objetivo', en: 'Target Record' },
    description: {
      pt: 'Endereço de e-mail institucional do contato direto na empresa.',
      es: 'Correo electrónico institucional del contacto directo en la empresa.',
      en: 'Institutional contact email address at the client organization.',
    },
    example: 'seguranca@acmecorp.com',
  },
  {
    token: '{{ client.address }}',
    category: 'client',
    categoryLabel: { pt: 'Cliente', es: 'Cliente', en: 'Client' },
    source: { pt: 'Cadastro de Alvo', es: 'Registro de Objetivo', en: 'Target Record' },
    description: {
      pt: 'Endereço físico, sede corporativa ou localização da organização.',
      es: 'Dirección física o sede corporativa de la organización.',
      en: 'Physical corporate headquarters address or location.',
    },
    example: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
  },
  {
    token: '{{ client.phone }}',
    category: 'client',
    categoryLabel: { pt: 'Cliente', es: 'Cliente', en: 'Client' },
    source: { pt: 'Cadastro de Alvo', es: 'Registro de Objetivo', en: 'Target Record' },
    description: {
      pt: 'Telefone comercial de contato do cliente.',
      es: 'Teléfono comercial de contacto de la empresa cliente.',
      en: 'Business contact phone number for the client organization.',
    },
    example: '+55 11 99999-9999',
  },
  {
    token: '{{ client.logoUrl }}',
    category: 'client',
    categoryLabel: { pt: 'Cliente', es: 'Cliente', en: 'Client' },
    source: { pt: 'Cadastro de Alvo', es: 'Registro de Objetivo', en: 'Target Record' },
    description: {
      pt: 'Caminho ou URL do logotipo corporativo horizontal do cliente.',
      es: 'Ruta o URL del logotipo corporativo horizontal del cliente.',
      en: 'Path or URL of the client organization horizontal logo.',
    },
    example: '/uploads/acme-logo.png',
  },

  // 3. Consultor / Pentester
  {
    token: '{{ pentester.name }}',
    category: 'pentester',
    categoryLabel: { pt: 'Consultor', es: 'Consultor', en: 'Consultant' },
    source: { pt: 'Perfil do Auditor', es: 'Perfil del Auditor', en: 'Auditor Profile' },
    description: {
      pt: 'Nome completo ou identificador do consultor de segurança responsável pelo teste.',
      es: 'Nombre completo o identificador del consultor de seguridad.',
      en: 'Full name or handle of the lead security consultant / pentester.',
    },
    example: '0xdun0',
  },
  {
    token: '{{ pentester.email }}',
    category: 'pentester',
    categoryLabel: { pt: 'Consultor', es: 'Consultor', en: 'Consultant' },
    source: { pt: 'Perfil do Auditor', es: 'Perfil del Auditor', en: 'Auditor Profile' },
    description: {
      pt: 'E-mail corporativo ou chave de contato do auditor de segurança.',
      es: 'Correo corporativo o clave de contacto del auditor.',
      en: 'Corporate email address of the security consultant.',
    },
    example: 'dun0@rovex.local',
  },
  {
    token: '{{ pentester.role }}',
    category: 'pentester',
    categoryLabel: { pt: 'Consultor', es: 'Consultor', en: 'Consultant' },
    source: { pt: 'Perfil do Auditor', es: 'Perfil del Auditor', en: 'Auditor Profile' },
    description: {
      pt: 'Cargo, função ou especialidade técnica (ex: Senior Red Team Consultant).',
      es: 'Cargo o especialidad técnica (ej: Senior Red Team Consultant).',
      en: 'Technical title or role (e.g. Senior Red Team Consultant).',
    },
    example: 'Senior Red Team Consultant',
  },
  {
    token: '{{ pentester.company }}',
    category: 'pentester',
    categoryLabel: { pt: 'Consultor', es: 'Consultor', en: 'Consultant' },
    source: { pt: 'Configuração Rovex', es: 'Configuración Rovex', en: 'Rovex Configuration' },
    description: {
      pt: 'Nome da consultoria ou equipe executora do pentest.',
      es: 'Nombre de la consultoría o equipo ejecutor del pentest.',
      en: 'Name of the offensive security firm or internal audit team.',
    },
    example: 'Rovex Security Labs',
  },

  // 4. Relatório
  {
    token: '{{ report.title }}',
    category: 'report',
    categoryLabel: { pt: 'Relatório', es: 'Reporte', en: 'Report' },
    source: { pt: 'Seções do Relatório', es: 'Secciones del Reporte', en: 'Report Sections' },
    description: {
      pt: 'Título formal exibido na capa e cabeçalhos do documento gerado.',
      es: 'Título formal mostrado en la carátula y encabezados del reporte.',
      en: 'Formal title displayed on the cover page and report headers.',
    },
    example: {
      pt: 'Relatório Executivo e Técnico de Intrusão',
      es: 'Reporte Ejecutivo y Técnico de Intrusión',
      en: 'Executive and Technical Penetration Test Report',
    },
  },
  {
    token: '{{ report.date }}',
    category: 'report',
    categoryLabel: { pt: 'Relatório', es: 'Reporte', en: 'Report' },
    source: { pt: 'Metadados do Relatório', es: 'Metadatos del Reporte', en: 'Report Metadata' },
    description: {
      pt: 'Data de geração/emissão do relatório em formato legível.',
      es: 'Fecha de emisión del reporte en formato legible.',
      en: 'Report publication/delivery date in human-readable format.',
    },
    example: {
      pt: '27 de Setembro de 2026',
      es: '27 de Septiembre de 2026',
      en: 'September 27, 2026',
    },
  },
  {
    token: '{{ report.customer }}',
    category: 'report',
    categoryLabel: { pt: 'Relatório', es: 'Reporte', en: 'Report' },
    source: { pt: 'Metadados do Relatório', es: 'Metadatos del Reporte', en: 'Report Metadata' },
    description: {
      pt: 'Nome da empresa destinatária informada no relatório.',
      es: 'Nombre de la empresa cliente destinataria en el reporte.',
      en: 'Client company name designated for the report.',
    },
    example: 'Acme Corporation S/A',
  },
  {
    token: '{{ report.customer_short }}',
    category: 'report',
    categoryLabel: { pt: 'Relatório', es: 'Reporte', en: 'Report' },
    source: { pt: 'Metadados do Relatório', es: 'Metadatos del Reporte', en: 'Report Metadata' },
    description: {
      pt: 'Nome abreviado do cliente inserido nas tabelas e rodapés do relatório.',
      es: 'Nombre corto del cliente insertado en tablas y pies de página.',
      en: 'Short client name used in tables and headers/footers.',
    },
    example: 'Acme Corp',
  },
  {
    token: '{{ report.scope }}',
    category: 'report',
    categoryLabel: { pt: 'Relatório', es: 'Reporte', en: 'Report' },
    source: { pt: 'Seção de Escopo', es: 'Sección de Alcance', en: 'Scope Section' },
    description: {
      pt: 'Texto consolidado contendo os ativos, IPs, domínios e aplicações testadas.',
      es: 'Texto consolidado con los activos, IPs y dominios evaluados.',
      en: 'Consolidated assessment target list, domains, and IP ranges.',
    },
    example: 'https://app.acmecorp.com, 192.168.10.0/24',
  },
  {
    token: '{{ report.executiveSummary }}',
    category: 'report',
    categoryLabel: { pt: 'Relatório', es: 'Reporte', en: 'Report' },
    source: { pt: 'Seção Executiva', es: 'Sección Ejecutiva', en: 'Executive Section' },
    description: {
      pt: 'Conteúdo integral redigido na seção de Sumário Executivo do relatório.',
      es: 'Contenido completo redactado en la sección de Resumen Ejecutivo.',
      en: 'Full narrative content from the Executive Summary section.',
    },
    example: {
      pt: 'Durante o período de auditoria foram identificadas...',
      es: 'Durante el período de auditoría se identificaron...',
      en: 'During the assessment period, multiple vulnerabilities were identified...',
    },
  },

  // 5. Achados / Vulnerabilidades
  {
    token: '{{ finding.title }}',
    category: 'finding',
    categoryLabel: { pt: 'Achados', es: 'Vulnerabilidades', en: 'Findings' },
    source: { pt: 'Achados Técnicos', es: 'Vulnerabilidades Técnicos', en: 'Technical Findings' },
    description: {
      pt: 'Título formal da vulnerabilidade identificada.',
      es: 'Título formal de la vulnerabilidad identificada.',
      en: 'Formal vulnerability title.',
    },
    example: {
      pt: 'Injeção de SQL Não Autenticada no Endpoint de Login',
      es: 'Inyección SQL No Autenticada en Endpoint de Login',
      en: 'Unauthenticated SQL Injection in Login Endpoint',
    },
  },
  {
    token: '{{ finding.summary }}',
    category: 'finding',
    categoryLabel: { pt: 'Achados', es: 'Vulnerabilidades', en: 'Findings' },
    source: { pt: 'Achados Técnicos', es: 'Vulnerabilidades Técnicos', en: 'Technical Findings' },
    description: {
      pt: 'Resumo conciso da falha para consumo gerencial e executivo.',
      es: 'Resumen conciso del fallo para consumo ejecutivo.',
      en: 'Concise executive summary of the security vulnerability.',
    },
    example: {
      pt: 'Falha crítica que permite extração irrestrita da base de dados.',
      es: 'Fallo crítico que permite extracción irrestricta de la base de datos.',
      en: 'Critical flaw allowing unauthorized exfiltration of backend database.',
    },
  },
  {
    token: '{{ finding.description }}',
    category: 'finding',
    categoryLabel: { pt: 'Achados', es: 'Vulnerabilidades', en: 'Findings' },
    source: { pt: 'Achados Técnicos', es: 'Vulnerabilidades Técnicos', en: 'Technical Findings' },
    description: {
      pt: 'Descrição técnica aprofundada, análise de causa e prova de conceito (PoC).',
      es: 'Descripción técnica detallada, análisis y prueba de concepto (PoC).',
      en: 'Deep technical description, root-cause analysis, and PoC walk-through.',
    },
    example: {
      pt: 'Constatou-se que o parâmetro user na requisição POST...',
      es: 'Se constató que el parámetro user en la solicitud POST...',
      en: 'The user parameter in the POST request is concatenated directly...',
    },
  },
  {
    token: '{{ finding.precondition }}',
    category: 'finding',
    categoryLabel: { pt: 'Achados', es: 'Vulnerabilidades', en: 'Findings' },
    source: { pt: 'Achados Técnicos', es: 'Vulnerabilidades Técnicos', en: 'Technical Findings' },
    description: {
      pt: 'Requisitos prévios ou contexto de acesso necessário para explorar o achado.',
      es: 'Requisitos previos o privilegios necesarios para explotar el fallo.',
      en: 'Prerequisites, privileges, or network position needed to exploit.',
    },
    example: {
      pt: 'Nenhum privilégio ou autenticação necessária; acesso à internet.',
      es: 'Ningún privilegio o autenticación necesaria; acceso a internet.',
      en: 'No privileges or authentication required; internet-accessible.',
    },
  },
  {
    token: '{{ finding.impact }}',
    category: 'finding',
    categoryLabel: { pt: 'Achados', es: 'Vulnerabilidades', en: 'Findings' },
    source: { pt: 'Achados Técnicos', es: 'Vulnerabilidades Técnicos', en: 'Technical Findings' },
    description: {
      pt: 'Consequências técnicas e impacto corporativo decorrentes da exploração.',
      es: 'Consecuencias técnicas e impacto corporativo de la explotación.',
      en: 'Technical consequences and business impact if exploited.',
    },
    example: {
      pt: 'Vazamento massivo de credenciais e comprometimento de confidencialidade.',
      es: 'Fuga masiva de credenciales y compromiso de confidencialidad.',
      en: 'Massive credential leakage and total loss of confidentiality.',
    },
  },
  {
    token: '{{ finding.recommendation }}',
    category: 'finding',
    categoryLabel: { pt: 'Achados', es: 'Vulnerabilidades', en: 'Findings' },
    source: { pt: 'Achados Técnicos', es: 'Vulnerabilidades Técnicos', en: 'Technical Findings' },
    description: {
      pt: 'Passo a passo recomendado e boas práticas técnicas para corrigir a vulnerabilidade.',
      es: 'Pasos recomendados y buenas prácticas técnicas de mitigación.',
      en: 'Step-by-step remediation guide and remediation best practices.',
    },
    example: {
      pt: 'Utilizar queries parametrizadas (Prepared Statements) em todas as consultas SQL.',
      es: 'Utilizar consultas parametrizadas (Prepared Statements) en todas las consultas SQL.',
      en: 'Implement parameterized queries (Prepared Statements) across all database operations.',
    },
  },
  {
    token: '{{ finding.shortRecommendation }}',
    category: 'finding',
    categoryLabel: { pt: 'Achados', es: 'Vulnerabilidades', en: 'Findings' },
    source: { pt: 'Achados Técnicos', es: 'Vulnerabilidades Técnicos', en: 'Technical Findings' },
    description: {
      pt: 'Recomendação resumida em uma linha para exibição em tabelas executivas.',
      es: 'Recomendación en una sola línea para tablas ejecutivas.',
      en: 'One-line remediation summary for executive matrices.',
    },
    example: {
      pt: 'Implementar consultas parametrizadas e sanitizar entradas.',
      es: 'Implementar consultas parametrizadas y sanitizar entradas.',
      en: 'Implement parameterized queries and sanitize user inputs.',
    },
  },
  {
    token: '{{ finding.severity }}',
    category: 'finding',
    categoryLabel: { pt: 'Achados', es: 'Vulnerabilidades', en: 'Findings' },
    source: { pt: 'Achados Técnicos', es: 'Vulnerabilidades Técnicos', en: 'Technical Findings' },
    description: {
      pt: 'Severidade textual padronizada (critical, high, medium, low, informational).',
      es: 'Severidad textual estandarizada (critical, high, medium, low, informational).',
      en: 'Standardized severity level (critical, high, medium, low, informational).',
    },
    example: 'critical',
  },
  {
    token: '{{ finding.cvss }}',
    category: 'finding',
    categoryLabel: { pt: 'Achados', es: 'Vulnerabilidades', en: 'Findings' },
    source: { pt: 'Calculadora CVSS', es: 'Calculadora CVSS', en: 'CVSS Calculator' },
    description: {
      pt: 'Pontuação numérica ou representação textual da pontuação CVSS.',
      es: 'Puntuación numérica o representación textual de CVSS.',
      en: 'Numeric score or textual representation of CVSS score.',
    },
    example: '9.8',
  },
  {
    token: '{{ finding.references }}',
    category: 'finding',
    categoryLabel: { pt: 'Achados', es: 'Vulnerabilidades', en: 'Findings' },
    source: { pt: 'Achados Técnicos', es: 'Vulnerabilidades Técnicos', en: 'Technical Findings' },
    description: {
      pt: 'Links técnicos de referência (OWASP Top 10, CWE, CVE, advisory da NIST).',
      es: 'Enlaces de referencia técnica (OWASP, CWE, CVE, NIST).',
      en: 'Technical reference links (OWASP Top 10, CWE, CVE, NIST).' },
    example: 'CWE-89, OWASP A03:2021-Injection',
  },
  {
    token: '{{ finding.affectedComponents }}',
    category: 'finding',
    categoryLabel: { pt: 'Achados', es: 'Vulnerabilidades', en: 'Findings' },
    source: { pt: 'Achados Técnicos', es: 'Vulnerabilidades Técnicos', en: 'Technical Findings' },
    description: {
      pt: 'Lista de URLs, parâmetros, hosts ou componentes de código vulneráveis.',
      es: 'Lista de URLs, parámetros, hosts o componentes vulnerables.',
      en: 'List of vulnerable URLs, parameters, hosts, or code components.',
    },
    example: 'https://app.acmecorp.com/api/v1/auth/login (param: user)',
  },
  {
    token: '{{ finding.retestStatus }}',
    category: 'finding',
    categoryLabel: { pt: 'Achados', es: 'Vulnerabilidades', en: 'Findings' },
    source: { pt: 'Achados Técnicos', es: 'Vulnerabilidades Técnicos', en: 'Technical Findings' },
    description: {
      pt: 'Status atual do reteste de conformidade (aberto, mitigado, corrigido).',
      es: 'Estado actual del retest (abierto, mitigado, corregido).',
      en: 'Retest verification status (open, mitigated, resolved, accepted).',
    },
    example: 'open',
  },
  {
    token: '{{ findings.table }}',
    category: 'finding',
    categoryLabel: { pt: 'Achados', es: 'Vulnerabilidades', en: 'Findings' },
    source: { pt: 'Matriz Consolidada', es: 'Matriz Consolidada', en: 'Consolidated Matrix' },
    description: {
      pt: 'Tabela compilada com ID, título, severidade e pontuação CVSS de todos os achados.',
      es: 'Tabla compilada con ID, título, severidad y CVSS de todos los vulnerabilidades.',
      en: 'Compiled table containing ID, title, severity, and CVSS of all findings.',
    },
    example: {
      pt: 'Tabela HTML / Markdown renderizada dinamicamente',
      es: 'Tabla HTML / Markdown renderizada dinámicamente',
      en: 'Dynamically rendered HTML / Markdown table',
    },
  },
  {
    token: '{{ findings.details }}',
    category: 'finding',
    categoryLabel: { pt: 'Achados', es: 'Vulnerabilidades', en: 'Findings' },
    source: { pt: 'Matriz Consolidada', es: 'Matriz Consolidada', en: 'Consolidated Matrix' },
    description: {
      pt: 'Seção completa de vulnerabilidades com descrição detalhada, evidências e correção.',
      es: 'Sección completa de vulnerabilidades con PoC, evidencias y mitigación.',
      en: 'Full vulnerability section with descriptions, PoC evidence, and remediations.',
    },
    example: {
      pt: 'Blocos completos de achados técnicos',
      es: 'Bloques completos de vulnerabilidades técnicos',
      en: 'Complete technical finding blocks',
    },
  },

  // 6. CVSS v3.1
  {
    token: '{{ finding.cvss.score }}',
    category: 'cvss',
    categoryLabel: { pt: 'CVSS v3.1', es: 'CVSS v3.1', en: 'CVSS v3.1' },
    source: { pt: 'Vetor CVSS v3.1', es: 'Vector CVSS v3.1', en: 'CVSS v3.1 Vector' },
    description: {
      pt: 'Pontuação numérica decimal calculada na métrica CVSS v3.1 (0.0 até 10.0).',
      es: 'Puntuación numérica decimal calculada en CVSS v3.1 (0.0 a 10.0).',
      en: 'Exact decimal score calculated from the CVSS v3.1 vector (0.0 to 10.0).',
    },
    example: '9.8',
  },
  {
    token: '{{ finding.cvss.vector }}',
    category: 'cvss',
    categoryLabel: { pt: 'CVSS v3.1', es: 'CVSS v3.1', en: 'CVSS v3.1' },
    source: { pt: 'Vetor CVSS v3.1', es: 'Vector CVSS v3.1', en: 'CVSS v3.1 Vector' },
    description: {
      pt: 'String técnica completa do vetor CVSS padronizado.',
      es: 'Cadena técnica completa del vector CVSS estandarizado.',
      en: 'Full standardized CVSS v3.1 vector string.',
    },
    example: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
  },
  {
    token: '{{ finding.cvss.level }}',
    category: 'cvss',
    categoryLabel: { pt: 'CVSS v3.1', es: 'CVSS v3.1', en: 'CVSS v3.1' },
    source: { pt: 'Vetor CVSS v3.1', es: 'Vector CVSS v3.1', en: 'CVSS v3.1 Vector' },
    description: {
      pt: 'Rótulo qualitativo de severidade baseado no score (Critical, High, Medium, Low, None).',
      es: 'Etiqueta cualitativa de severidad (Critical, High, Medium, Low, None).',
      en: 'Qualitative severity rating based on CVSS score.',
    },
    example: 'Critical',
  },
  {
    token: '{{ finding.cvss.levelNumber }}',
    category: 'cvss',
    categoryLabel: { pt: 'CVSS v3.1', es: 'CVSS v3.1', en: 'CVSS v3.1' },
    source: { pt: 'Vetor CVSS v3.1', es: 'Vector CVSS v3.1', en: 'CVSS v3.1 Vector' },
    description: {
      pt: 'Nível numérico ordinal de 1 a 5 (5=Crítica, 4=Alta, 3=Média, 2=Baixa, 1=Info).',
      es: 'Nivel numérico ordinal de 1 a 5 (5=Crítica, 4=Alta, 3=Media, 2=Baja, 1=Info).',
      en: 'Ordinal severity number from 1 to 5 (5=Critical, 4=High, 3=Medium, 2=Low, 1=Info).',
    },
    example: '5',
  },
  {
    token: '{{ finding.cvss.version }}',
    category: 'cvss',
    categoryLabel: { pt: 'CVSS v3.1', es: 'CVSS v3.1', en: 'CVSS v3.1' },
    source: { pt: 'Calculadora CVSS', es: 'Calculadora CVSS', en: 'CVSS Calculator' },
    description: {
      pt: 'Versão da especificação da métrica CVSS adotada pelo Rovex.',
      es: 'Versión de la especificación CVSS adoptada por Rovex.',
      en: 'Version of the CVSS specification implemented by Rovex.',
    },
    example: '3.1',
  },
  {
    token: '{{ report.field_cvss.score }}',
    category: 'cvss',
    categoryLabel: { pt: 'CVSS v3.1', es: 'CVSS v3.1', en: 'CVSS v3.1' },
    source: { pt: 'Campos Customizados', es: 'Campos Personalizados', en: 'Custom Fields' },
    description: {
      pt: 'Pontuação de campo CVSS configurado em seções personalizadas de formulário.',
      es: 'Puntuación de campo CVSS configurado en secciones personalizadas.',
      en: 'Score of custom CVSS field configured in section templates.',
    },
    example: '7.5',
  },
  {
    token: '{{ report.field_cvss.vector }}',
    category: 'cvss',
    categoryLabel: { pt: 'CVSS v3.1', es: 'CVSS v3.1', en: 'CVSS v3.1' },
    source: { pt: 'Campos Customizados', es: 'Campos Personalizados', en: 'Custom Fields' },
    description: {
      pt: 'Vetor CVSS configurado em campo de seção customizada do relatório.',
      es: 'Vector CVSS configurado en campo de sección personalizada del reporte.',
      en: 'CVSS vector configured in custom report section field.',
    },
    example: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N',
  },
  {
    token: '{{ report.field_cvss.level }}',
    category: 'cvss',
    categoryLabel: { pt: 'CVSS v3.1', es: 'CVSS v3.1', en: 'CVSS v3.1' },
    source: { pt: 'Campos Customizados', es: 'Campos Personalizados', en: 'Custom Fields' },
    description: {
      pt: 'Nível qualitativo do campo CVSS de seção (ex: High).',
      es: 'Nivel cualitativo del campo CVSS de sección personalizada.',
      en: 'Qualitative severity level for section CVSS field.',
    },
    example: 'High',
  },
  {
    token: '{{ report.field_cvss.level_number }}',
    category: 'cvss',
    categoryLabel: { pt: 'CVSS v3.1', es: 'CVSS v3.1', en: 'CVSS v3.1' },
    source: { pt: 'Campos Customizados', es: 'Campos Personalizados', en: 'Custom Fields' },
    description: {
      pt: 'Nível ordinal numérico do campo CVSS customizado da seção.',
      es: 'Nivel ordinal numérico del campo CVSS personalizado de sección.',
      en: 'Numeric ordinal rank of section CVSS field.',
    },
    example: '4',
  },
  {
    token: '{{ report.field_cvss.version }}',
    category: 'cvss',
    categoryLabel: { pt: 'CVSS v3.1', es: 'CVSS v3.1', en: 'CVSS v3.1' },
    source: { pt: 'Campos Customizados', es: 'Campos Personalizados', en: 'Custom Fields' },
    description: {
      pt: 'Versão da especificação CVSS vinculada ao campo dinâmico de seção.',
      es: 'Versión de la especificación CVSS del campo de sección.',
      en: 'CVSS specification version of custom section field.',
    },
    example: '3.1',
  },

  // 7. Contadores & Estatísticas
  {
    token: '{{ findings.count }}',
    category: 'counts',
    categoryLabel: { pt: 'Contadores', es: 'Contadores', en: 'Counters' },
    source: { pt: 'Métricas do Projeto', es: 'Métricas del Proyecto', en: 'Project Metrics' },
    description: {
      pt: 'Quantidade total de vulnerabilidades identificadas e cadastradas no projeto.',
      es: 'Cantidad total de vulnerabilidades identificadas en el proyecto.',
      en: 'Total count of vulnerabilities identified and logged in the project.',
    },
    example: '14',
  },
  {
    token: '{{ findings.critical }}',
    category: 'counts',
    categoryLabel: { pt: 'Contadores', es: 'Contadores', en: 'Counters' },
    source: { pt: 'Métricas do Projeto', es: 'Métricas del Proyecto', en: 'Project Metrics' },
    description: {
      pt: 'Total de vulnerabilidades com classificação Crítica (CVSS 9.0 - 10.0).',
      es: 'Total de vulnerabilidades con clasificación Crítica (CVSS 9.0 - 10.0).',
      en: 'Total count of Critical severity vulnerabilities (CVSS 9.0 - 10.0).',
    },
    example: '2',
  },
  {
    token: '{{ findings.high }}',
    category: 'counts',
    categoryLabel: { pt: 'Contadores', es: 'Contadores', en: 'Counters' },
    source: { pt: 'Métricas do Projeto', es: 'Métricas del Proyecto', en: 'Project Metrics' },
    description: {
      pt: 'Total de vulnerabilidades com classificação Alta (CVSS 7.0 - 8.9).',
      es: 'Total de vulnerabilidades con clasificación Alta (CVSS 7.0 - 8.9).',
      en: 'Total count of High severity vulnerabilities (CVSS 7.0 - 8.9).' },
    example: '4',
  },
  {
    token: '{{ findings.medium }}',
    category: 'counts',
    categoryLabel: { pt: 'Contadores', es: 'Contadores', en: 'Counters' },
    source: { pt: 'Métricas do Projeto', es: 'Métricas del Proyecto', en: 'Project Metrics' },
    description: {
      pt: 'Total de vulnerabilidades com classificação Média (CVSS 4.0 - 6.9).',
      es: 'Total de vulnerabilidades con clasificación Media (CVSS 4.0 - 6.9).',
      en: 'Total count of Medium severity vulnerabilities (CVSS 4.0 - 6.9).' },
    example: '5',
  },
  {
    token: '{{ findings.low }}',
    category: 'counts',
    categoryLabel: { pt: 'Contadores', es: 'Contadores', en: 'Counters' },
    source: { pt: 'Métricas do Projeto', es: 'Métricas del Proyecto', en: 'Project Metrics' },
    description: {
      pt: 'Total de vulnerabilidades com classificação Baixa (CVSS 0.1 - 3.9).',
      es: 'Total de vulnerabilidades con clasificación Baja (CVSS 0.1 - 3.9).',
      en: 'Total count of Low severity vulnerabilities (CVSS 0.1 - 3.9).' },
    example: '2',
  },
  {
    token: '{{ findings.info }}',
    category: 'counts',
    categoryLabel: { pt: 'Contadores', es: 'Contadores', en: 'Counters' },
    source: { pt: 'Métricas do Projeto', es: 'Métricas del Proyecto', en: 'Project Metrics' },
    description: {
      pt: 'Total de apontamentos informativos ou boas práticas (CVSS 0.0).',
      es: 'Total de apuntes informativos o buenas prácticas (CVSS 0.0).',
      en: 'Total count of Informational or advisory notes (CVSS 0.0).' },
    example: '1',
  },

  // 8. Campos Personalizados Dinâmicos
  {
    token: '{{ report.field_<id> }}',
    category: 'custom',
    categoryLabel: { pt: 'Campos Dinâmicos', es: 'Campos Dinámicos', en: 'Custom Fields' },
    source: { pt: 'Designer de Seções', es: 'Diseñador de Secciones', en: 'Section Designer' },
    description: {
      pt: 'Padrão universal para acessar qualquer campo personalizado configurado pelo administrador.',
      es: 'Patrón universal para acceder a cualquier campo personalizado configurado.',
      en: 'Universal pattern to access any custom field configured in templates.',
    },
    example: '{{ report.field_ciso_approver }}',
  },
  {
    token: '{{ report.field_string }}',
    category: 'custom',
    categoryLabel: { pt: 'Campos Dinâmicos', es: 'Campos Dinámicos', en: 'Custom Fields' },
    source: { pt: 'Designer de Seções', es: 'Diseñador de Secciones', en: 'Section Designer' },
    description: {
      pt: 'Campo customizado de texto livre (string única ou linha de texto).',
      es: 'Campo personalizado de texto libre (cadena única o línea de texto).',
      en: 'Custom free-form text field (single-line or paragraph string).',
    },
    example: 'Aprovado para divulgação restrita',
  },
  {
    token: '{{ report.field_number }}',
    category: 'custom',
    categoryLabel: { pt: 'Campos Dinâmicos', es: 'Campos Dinámicos', en: 'Custom Fields' },
    source: { pt: 'Designer de Seções', es: 'Diseñador de Secciones', en: 'Section Designer' },
    description: {
      pt: 'Campo customizado de valor numérico (inteiro ou ponto flutuante).',
      es: 'Campo personalizado numérico (entero o decimal).',
      en: 'Custom numeric field (integer or floating-point number).',
    },
    example: '42',
  },
  {
    token: '{{ report.field_boolean }}',
    category: 'custom',
    categoryLabel: { pt: 'Campos Dinâmicos', es: 'Campos Dinámicos', en: 'Custom Fields' },
    source: { pt: 'Designer de Seções', es: 'Diseñador de Secciones', en: 'Section Designer' },
    description: {
      pt: 'Campo booleano de alternância (retorna verdadeiro ou falso).',
      es: 'Campo booleano de alternancia (devuelve verdadero o falso).',
      en: 'Boolean toggle field (resolves to true or false).',
    },
    example: 'true',
  },
  {
    token: '{{ report.field_date }}',
    category: 'custom',
    categoryLabel: { pt: 'Campos Dinâmicos', es: 'Campos Dinámicos', en: 'Custom Fields' },
    source: { pt: 'Designer de Seções', es: 'Diseñador de Secciones', en: 'Section Designer' },
    description: {
      pt: 'Campo de data customizado renderizado em formato ISO padrão.',
      es: 'Campo de fecha personalizada formateada en estándar ISO.',
      en: 'Custom date field rendered in standard ISO format.',
    },
    example: '2026-10-01',
  },
  {
    token: '{{ report.field_user.name }}',
    category: 'custom',
    categoryLabel: { pt: 'Campos Dinâmicos', es: 'Campos Dinámicos', en: 'Custom Fields' },
    source: { pt: 'Designer de Seções', es: 'Diseñador de Secciones', en: 'Section Designer' },
    description: {
      pt: 'Nome do usuário ou auditor atribuído ao campo dinâmico de membro.',
      es: 'Nombre del usuario o auditor asignado al campo dinámico de miembro.',
      en: 'Name of the user or team member assigned to custom user field.',
    },
    example: 'Dione Auditor',
  },
  {
    token: '{{ report.field_user.email }}',
    category: 'custom',
    categoryLabel: { pt: 'Campos Dinâmicos', es: 'Campos Dinámicos', en: 'Custom Fields' },
    source: { pt: 'Designer de Seções', es: 'Diseñador de Secciones', en: 'Section Designer' },
    description: {
      pt: 'E-mail do usuário vinculado ao campo dinâmico de equipe.',
      es: 'Correo del usuario asignado al campo dinámico de equipo.',
      en: 'Email address of the user assigned to custom user field.',
    },
    example: 'dione@seguranca.com',
  },
  {
    token: '{{ report.field_enum.value }}',
    category: 'custom',
    categoryLabel: { pt: 'Campos Dinâmicos', es: 'Campos Dinámicos', en: 'Custom Fields' },
    source: { pt: 'Designer de Seções', es: 'Diseñador de Secciones', en: 'Section Designer' },
    description: {
      pt: 'Identificador técnico da opção selecionada no campo enum (dropdown).',
      es: 'Identificador técnico de la opción seleccionada en el desplegable.',
      en: 'Internal technical value of the selected dropdown option.',
    },
    example: 'pci_dss_4',
  },
  {
    token: '{{ report.field_enum.label }}',
    category: 'custom',
    categoryLabel: { pt: 'Campos Dinâmicos', es: 'Campos Dinámicos', en: 'Custom Fields' },
    source: { pt: 'Designer de Seções', es: 'Diseñador de Secciones', en: 'Section Designer' },
    description: {
      pt: 'Rótulo amigável legível da opção selecionada no campo dropdown.',
      es: 'Etiqueta legible de la opción seleccionada en el campo desplegable.',
      en: 'Human-readable label of the selected dropdown option.',
    },
    example: 'PCI-DSS v4.0 Compliance',
  },
  {
    token: '{{ report.field_object.property1 }}',
    category: 'custom',
    categoryLabel: { pt: 'Campos Dinâmicos', es: 'Campos Dinámicos', en: 'Custom Fields' },
    source: { pt: 'Designer de Seções', es: 'Diseñador de Secciones', en: 'Section Designer' },
    description: {
      pt: 'Acesso a propriedades aninhadas em estruturas e objetos JSON personalizados.',
      es: 'Acceso a propiedades anidadas en objetos JSON personalizados.',
      en: 'Nested property access within complex JSON object fields.',
    },
    example: 'Valor da propriedade customizada',
  },

  // 9. Funções de Formatação
  {
    token: '{{ formatDate(report.reportDate) }}',
    category: 'functions',
    categoryLabel: { pt: 'Funções', es: 'Funciones', en: 'Functions' },
    source: { pt: 'Motor de Templates', es: 'Motor de Templates', en: 'Template Engine' },
    description: {
      pt: 'Formata um valor de data respeitando a localidade padrão do sistema (ex: DD/MM/YYYY).',
      es: 'Formatea una fecha respetando la localización estándar (ej: DD/MM/YYYY).',
      en: 'Formats date values according to default locale convention (e.g. DD/MM/YYYY).',
    },
    example: '27/09/2026',
  },
  {
    token: '{{ formatDate(project.startDate, "long") }}',
    category: 'functions',
    categoryLabel: { pt: 'Funções', es: 'Funciones', en: 'Functions' },
    source: { pt: 'Motor de Templates', es: 'Motor de Templates', en: 'Template Engine' },
    description: {
      pt: 'Formata a data de forma textual e por extenso para sumários e cartas de apresentação.',
      es: 'Formatea la fecha de forma textual extendida para cartas y resúmenes.',
      en: 'Formats date in full textual representation for letters and summaries.',
    },
    example: '1 de setembro de 2026',
  },
  {
    token: '{{ formatDate(report.date, "iso") }}',
    category: 'functions',
    categoryLabel: { pt: 'Funções', es: 'Funciones', en: 'Functions' },
    source: { pt: 'Motor de Templates', es: 'Motor de Templates', en: 'Template Engine' },
    description: {
      pt: 'Formata a data no padrão internacional estrito ISO 8601 (YYYY-MM-DD).',
      es: 'Formatea la fecha en estándar internacional estricto ISO 8601 (YYYY-MM-DD).',
      en: 'Formats date in strict international ISO 8601 (YYYY-MM-DD).',
    },
    example: '2026-09-27',
  },
  {
    token: '{{ uppercase(client.name) }}',
    category: 'functions',
    categoryLabel: { pt: 'Funções', es: 'Funciones', en: 'Functions' },
    source: { pt: 'Motor de Templates', es: 'Motor de Templates', en: 'Template Engine' },
    description: {
      pt: 'Converte todo o conteúdo de texto da variável para LETRAS MAIÚSCULAS.',
      es: 'Convierte todo el texto de la variable a LETRAS MAYÚSCULAS.',
      en: 'Converts variable text content to UPPERCASE.',
    },
    example: 'ACME CORPORATION S/A',
  },
  {
    token: '{{ lowercase(client.name) }}',
    category: 'functions',
    categoryLabel: { pt: 'Funções', es: 'Funciones', en: 'Functions' },
    source: { pt: 'Motor de Templates', es: 'Motor de Templates', en: 'Template Engine' },
    description: {
      pt: 'Converte todo o texto da variável para letras minúsculas.',
      es: 'Convierte todo el texto de la variable a letras minúsculas.',
      en: 'Converts variable text content to lowercase.',
    },
    example: 'acme corporation s/a',
  },
  {
    token: '{{ truncate(finding.description, 200) }}',
    category: 'functions',
    categoryLabel: { pt: 'Funções', es: 'Funciones', en: 'Functions' },
    source: { pt: 'Motor de Templates', es: 'Motor de Templates', en: 'Template Engine' },
    description: {
      pt: 'Limita um texto longo a um tamanho máximo especificado, adicionando reticências (...).',
      es: 'Limita un texto largo al número máximo de caracteres con puntos suspensivos.',
      en: 'Truncates long text to specified maximum characters with ellipsis (...).',
    },
    example: 'Foi constatado que o parâmetro user na requisição...',
  },

  // 10. Estruturas de Loops e Condicionais
  {
    token: '{% for finding in findings %} ... {% endfor %}',
    category: 'syntax',
    categoryLabel: { pt: 'Sintaxe & Loops', es: 'Sintaxis y Bucles', en: 'Loops & Syntax' },
    source: { pt: 'Sintaxe de Modelo', es: 'Sintaxis de Template', en: 'Template Syntax' },
    description: {
      pt: 'Itera sobre o array de vulnerabilidades do projeto gerando blocos repetidos dinamicamente.',
      es: 'Itera sobre el array de vulnerabilidades generando bloques dinámicos.',
      en: 'Iterates over the findings collection generating repeated dynamic blocks.',
    },
    example: '{% for finding in findings %}\\n  ### {{ finding.title }} ({{ finding.severity }})\\n{% endfor %}',
  },
  {
    token: '{% if finding.severity == "critical" %} ... {% endif %}',
    category: 'syntax',
    categoryLabel: { pt: 'Sintaxe & Loops', es: 'Sintaxis y Bucles', en: 'Loops & Syntax' },
    source: { pt: 'Sintaxe de Modelo', es: 'Sintaxis de Template', en: 'Template Syntax' },
    description: {
      pt: 'Bloco de controle condicional que renderiza o conteúdo interno apenas quando a condição for verdadeira.',
      es: 'Bloque condicional que renderiza contenido solo cuando la condición es verdadera.',
      en: 'Conditional block rendering enclosed content only when expression evaluates to true.',
    },
    example: '{% if finding.severity == "critical" %}\n  > ALERTA CRÍTICO: Requer remediação imediata.\n{% endif %}',
  },
];

export default function DocumentationPage() {
  const { currentLocale } = useLanguage();
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showAllNews, setShowAllNews] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [highlightedSectionId, setHighlightedSectionId] = useState<string | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Estados para Paleta de Variáveis (⌘)
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState('');
  const [selectedPaletteCat, setSelectedPaletteCat] = useState('all');
  const [activeVariableTab, setActiveVariableTab] = useState<'project' | 'client' | 'pentester' | 'report' | 'finding' | 'cvss' | 'counts' | 'custom' | 'functions' | 'syntax'>('project');

  // Fechar dropdown de busca ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Leitura inicial de parâmetros da URL (?q=... ou #section-...)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('q');
      if (q) {
        setSearchQuery(q);
        setIsSearchFocused(true);
        setTimeout(() => {
          document.getElementById('documentacao-resultados')?.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      }
      const hash = window.location.hash;
      if (hash) {
        const targetId = hash.replace('#', '');
        setTimeout(() => {
          const el = document.getElementById(targetId) || document.getElementById(`section-${targetId}`);
          el?.scrollIntoView({ behavior: 'smooth' });
        }, 400);
      }
    }
  }, []);

  const handleJumpToSection = (sectionId: string) => {
    setHighlightedSectionId(sectionId);
    setIsSearchFocused(false);
    const el = document.getElementById(`section-${sectionId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      document.getElementById('documentacao-resultados')?.scrollIntoView({ behavior: 'smooth' });
    }
    setTimeout(() => {
      setHighlightedSectionId(null);
    }, 3500);
  };

  // Atalho global ⌘ (Cmd+/ ou Cmd+K ou Alt+V) e Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdSlash = (e.metaKey || e.ctrlKey) && (e.key === '/' || e.code === 'Slash');
      const isCmdK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k';
      const isAltV = e.altKey && e.key.toLowerCase() === 'v';
      const isCmdV = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'v';

      if (isCmdSlash || isCmdK || isAltV || isCmdV) {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isCommandPaletteOpen) {
        e.preventDefault();
        setIsCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const isPt = currentLocale === 'pt-br';
  const isEs = currentLocale === 'es';

  // Textos internacionalizados
  const t = {
    heroTitle: isPt ? 'Como podemos ajudar?' : isEs ? '¿Cómo podemos ayudarte?' : 'How can we help?',
    searchPlaceholder: isPt
      ? 'Pergunte qualquer coisa sobre o Rovex ou busque na documentação...'
      : isEs
      ? 'Pregunta cualquier cosa sobre Rovex o busca en la documentación...'
      : 'Ask anything about Rovex or search documentation...',
    quickPills: [
      {
        id: 'start',
        text: isPt ? 'Como começar com o Rovex?' : isEs ? '¿Cómo empezar con Rovex?' : 'How do I get started with Rovex?',
        tab: 'get-started',
        targetSectionId: 'get-started-guide',
        relatedIds: ['overview'],
      },
      {
        id: 'docker-compose',
        text: isPt ? 'Como rodar com Docker Compose e persistência?' : isEs ? '¿Cómo ejecutar con Docker Compose y persistencia?' : 'How to run with Docker Compose and persistence?',
        tab: 'operations',
        targetSectionId: 'operations',
        relatedIds: ['get-started-guide', 'tech-stack'],
      },
      {
        id: 'apagar-container',
        text: isPt ? 'Posso apagar o container sem perder dados?' : isEs ? '¿Puedo borrar el contenedor sin perder datos?' : 'Can I delete the container without losing data?',
        tab: 'operations',
        targetSectionId: 'operations',
        relatedIds: ['tech-stack', 'security'],
      },
      {
        id: 'mcp',
        text: isPt ? 'Como funciona a integração MCP com IA?' : isEs ? '¿Cómo funciona la integración MCP con IA?' : 'Can I connect AI agents via MCP?',
        tab: 'data-flow',
        targetSectionId: 'data-flow',
        relatedIds: ['resources-doc'],
      },
      {
        id: 'export',
        text: isPt ? 'Como exportar para Word (.docx) e PDF?' : isEs ? '¿Cómo exportar a Word (.docx) y PDF?' : 'How do I export to Word and PDF?',
        tab: 'user-guide',
        targetSectionId: 'user-guide-doc',
        relatedIds: ['resources-doc'],
      },
      {
        id: 'template-vars',
        text: isPt ? 'Quais Variáveis de modelo compatíveis no rovex' : isEs ? '¿Cuáles son las variables de modelo compatibles en Rovex?' : 'What template variables are supported in Rovex?',
        tab: 'resources',
        targetSectionId: 'resources-doc',
        relatedIds: ['data-flow', 'user-guide-doc'],
      },
      {
        id: 'persistence',
        text: isPt ? 'Onde e como os dados e relatórios são salvos?' : isEs ? '¿Dónde y cómo se guardan los datos y reportes?' : 'Where and how are data and reports persisted?',
        tab: 'operations',
        targetSectionId: 'operations',
        relatedIds: ['tech-stack', 'security'],
      },
    ],
    cards: [
      {
        id: 'get-started',
        badge: isPt ? 'Início Rápido' : isEs ? 'Inicio Rápido' : 'Get started',
        title: isPt ? 'Primeiros Passos' : isEs ? 'Primeros Pasos' : 'Get started',
        desc: isPt
          ? 'Instalação rápida, configuração de persistência e deploy via Docker para sua equipe.'
          : isEs
          ? 'Instalación rápida, configuración local y despliegue Docker para tu equipo.'
          : 'Quick setup, local persistence, or deploying via Docker for your security team.',
        icon: Sparkles,
      },
      {
        id: 'overview',
        badge: isPt ? 'Arquitetura' : isEs ? 'Arquitectura' : 'Architecture',
        title: isPt ? 'Visão Geral & Stack' : isEs ? 'Visión General & Stack' : 'Guides',
        desc: isPt
          ? 'Objetivos, abordagem de monolito modular e stack completa do Rovex.'
          : isEs
          ? 'Objetivos, enfoque de monolito modular y tecnologías del sistema.'
          : 'System overview, modular monolith architecture, and complete technology stack.',
        icon: BookOpen,
      },
      {
        id: 'user-guide',
        badge: isPt ? 'Manual de Uso' : isEs ? 'Manual de Usuario' : 'Manuals',
        title: isPt ? 'User Guide' : isEs ? 'Guía de Usuario' : 'User Guide',
        desc: isPt
          ? 'Guia operacional: gestão de alvos, projetos, evidências, TODOs e exportação.'
          : isEs
          ? 'Guía operativa: gestión de objetivos, proyectos, vulnerabilidades, TODOs y exportación.'
          : 'Comprehensive manual for targets, projects, evidence, TODOs, and export workflows.',
        icon: FileText,
      },
      {
        id: 'resources',
        badge: isPt ? 'Referência' : isEs ? 'Referencia' : 'Reference',
        title: isPt ? 'Resources & MCP' : isEs ? 'Recursos & MCP' : 'Reference',
        desc: isPt
          ? 'Servidor MCP, endpoints de API, vetores CVSS v3.1 e motor DOCX.'
          : isEs
          ? 'Servidor MCP, endpoints de API, convenciones CVSS v3.1 y motor DOCX.'
          : 'Browse Model Context Protocol (MCP) server, REST APIs, and CVSS v3.1 reference.',
        icon: Terminal,
      },
    ],
    whatsNewTitle: isPt ? "O que há de novo" : isEs ? "Novedades" : "What's new",
    feedbackBtn: isPt ? "Dar feedback" : isEs ? "Enviar comentarios" : "Give feedback",
  };

  // Seções documentadas detalhadas
  const docSections = useMemo(
    () => [
      {
        id: 'overview',
        category: 'architecture',
        number: '1',
        title: isPt ? 'Visão Geral do Sistema' : isEs ? 'Visión General del Sistema' : 'System Overview',
        summary: isPt
          ? 'Objetivo da plataforma, problemas resolvidos e abordagem arquitetural de monolito modular.'
          : isEs
          ? 'Objetivo de la plataforma, problemas resueltos y arquitectura de monolito modular.'
          : 'Platform mission, problem statement, and modular monolith architectural approach.',
        content: (
          <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
            <div>
              <h4 className="text-base font-semibold text-foreground mb-2">
                {isPt ? '1. Objetivo & Missão' : isEs ? '1. Objetivo & Misión' : '1. Mission & Purpose'}
              </h4>
              <p>
                {isPt
                  ? 'O Rovex foi criado por 0xdun0 como uma plataforma moderna, auto-hospedada, soberana e totalmente GRATUITA para geração de relatórios de pentest. Resolve os gargalos críticos do ecossistema de segurança ofensiva: custos proibitivos de licenciamento corporativo, perda de tempo na formatação manual de relatórios em Word ou LaTeX, e preocupações severas de privacidade ao enviar dados sensíveis de clientes para provedores de nuvem de terceiros.'
                  : isEs
                  ? 'Rovex fue creado por 0xdun0 como una plataforma moderna, autoalojada, soberana y totalmente GRATUITA para reportes de pentest. Resuelve los problemas críticos de reportes: costes recurrentes de licencia, pérdida de tiempo con formatos rotos en Word/LaTeX y riesgos de privacidad al subir datos sensibles a la nube.'
                  : 'Rovex was created by 0xdun0 as a modern, self-hosted, sovereign, and 100% FREE platform for penetration test reporting. It eliminates the traditional pain points of offensive security reporting: high commercial licensing fees, fragile formatting breakdowns in Word/LaTeX templates, and severe data privacy risks when transmitting confidential client vulnerability data to external SaaS providers.'}
              </p>
            </div>

            <div>
              <h4 className="text-base font-semibold text-foreground mb-2">
                {isPt ? '2. Abordagem Arquitetural: Monolito Modular' : isEs ? '2. Enfoque Arquitectónico: Monolito Modular' : '2. Architectural Paradigm: Modular Monolith'}
              </h4>
              <p>
                {isPt
                  ? 'A plataforma adota a arquitetura de Monolito Modular Moderno sobre Next.js 15 e React 19, em vez de microsserviços dispersos ou computação serverless. Essa decisão garante latência zero na digitação e renderização de grandes relatórios, simplifica o deploy para um único container Docker e assegura autonomia total sem depender de infraestruturas externas ou conexões com a internet.'
                  : isEs
                  ? 'La plataforma utiliza una arquitectura de Monolito Modular Moderno con Next.js 15 y React 19, en lugar de microservicios o serverless. Esto garantiza latencia cero, despliegue inmediato en un solo contenedor Docker y funcionamiento autónomo sin depender de Internet.'
                  : 'Rovex adopts a Modern Modular Monolith architecture based on Next.js 15 and React 19 rather than fragmented microservices or serverless functions. This ensures sub-millisecond typing latency during live split-screen previewing, single-container deployment simplicity, and completely sovereign operation without external cloud dependencies.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-lg border border-border/60 bg-card/60">
                <div className="text-xs font-mono font-semibold text-primary mb-1">01 // INDEPENDÊNCIA</div>
                <div className="text-xs text-foreground font-medium mb-1">Plataforma 100% Gratuita e Aberta</div>
                <div className="text-[11px] text-muted-foreground">Sem mensalidades, limites de assentos ou recursos bloqueados.</div>
              </div>
              <div className="p-3.5 rounded-lg border border-border/60 bg-card/60">
                <div className="text-xs font-mono font-semibold text-foreground/80 mb-1">02 // PRIVACIDADE LOCAL</div>
                <div className="text-xs text-foreground font-medium mb-1">Zero Telemetria & Local-First</div>
                <div className="text-[11px] text-muted-foreground">Seus achados e capturas de tela nunca saem da sua rede controlada.</div>
              </div>
              <div className="p-3.5 rounded-lg border border-border/60 bg-card/60">
                <div className="text-xs font-mono font-semibold text-foreground/80 mb-1">03 // AUTORIA</div>
                <div className="text-xs text-foreground font-medium mb-1">Criado por 0xdun0</div>
                <div className="text-[11px] text-muted-foreground">Projetado por e para profissionais de segurança ofensiva e red teams.</div>
              </div>
            </div>

            {/* Diagrama de Arquitetura Minimalista & Profissional */}
            <div className="rounded-xl border border-border/70 bg-card/40 p-4 sm:p-5 space-y-4 font-sans mt-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-3">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-xs font-mono font-semibold tracking-wider uppercase text-foreground">
                    {isPt ? 'Diagrama // Arquitetura Sistêmica (Monolito Modular Soberano)' : isEs ? 'Diagrama // Arquitectura Sistémica' : 'Diagram // Sovereign Modular Monolith Architecture'}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-muted-foreground">Rovex Core · Local-First</span>
              </div>

              {/* Grid das 4 Camadas Conectadas */}
              <div className="space-y-3">
                {/* Tier 1: Ingestion & Clients */}
                <div className="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-primary font-semibold">
                    <span>CAMADA 1 // CANAIS DE ENTRADA & CLIENTES</span>
                    <span className="text-muted-foreground">SOVEREIGN INGESTION</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div className="p-2.5 rounded bg-card border border-border/60 flex items-center gap-2">
                      <Terminal className="h-3.5 w-3.5 text-primary shrink-0" />
                      <div>
                        <div className="font-medium text-foreground">Navegador do Auditor</div>
                        <div className="text-[10px] text-muted-foreground">UI Local-First (Offline Ready)</div>
                      </div>
                    </div>
                    <div className="p-2.5 rounded bg-card border border-border/60 flex items-center gap-2">
                      <Cpu className="h-3.5 w-3.5 text-primary shrink-0" />
                      <div>
                        <div className="font-medium text-foreground">Agentes de IA via MCP</div>
                        <div className="text-[10px] text-muted-foreground">Protocolo Stdio & SSE (/api/mcp)</div>
                      </div>
                    </div>
                    <div className="p-2.5 rounded bg-card border border-border/60 flex items-center gap-2">
                      <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />
                      <div>
                        <div className="font-medium text-foreground">Base CWE / OWASP</div>
                        <div className="text-[10px] text-muted-foreground">+100 Modelos de Riscos</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Conector Central */}
                <div className="flex justify-center items-center gap-2 py-0.5 text-xs text-muted-foreground font-mono">
                  <span className="h-3 border-l-2 border-dashed border-primary/60" />
                  <span className="text-[10px] uppercase tracking-wider text-primary">Barramento de Ações & Rotas Ofuscadas (/report/[hash])</span>
                  <span className="h-3 border-l-2 border-dashed border-primary/60" />
                </div>

                {/* Tier 2: Core do Monolito Modular */}
                <div className="rounded-lg border border-primary/40 bg-primary/5 p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-primary font-bold">
                    <span>CAMADA 2 // ROVEX CORE (NEXT.JS 15 + REACT 19 RUNTIME)</span>
                    <span className="px-1.5 py-0.5 rounded bg-primary/20 text-primary text-[10px]">MONOLITO MODULAR</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2 rounded bg-card/80 border border-border/60">
                      <div className="font-medium text-foreground">App Router & State</div>
                      <div className="text-[10px] text-muted-foreground">Rotas com Hash SHA</div>
                    </div>
                    <div className="p-2 rounded bg-card/80 border border-border/60">
                      <div className="font-medium text-foreground">Editor de Blocos</div>
                      <div className="text-[10px] text-muted-foreground">Live Split View & AST</div>
                    </div>
                    <div className="p-2 rounded bg-card/80 border border-border/60">
                      <div className="font-medium text-foreground">Motor de Variáveis</div>
                      <div className="text-[10px] text-muted-foreground">Interpolação de Metadados</div>
                    </div>
                    <div className="p-2 rounded bg-card/80 border border-border/60">
                      <div className="font-medium text-foreground">Calculadora CVSS</div>
                      <div className="text-[10px] text-muted-foreground">Matriz v3.1 Determinística</div>
                    </div>
                  </div>
                </div>

                {/* Conector Duplo */}
                <div className="grid grid-cols-2 gap-4 text-center text-[10px] font-mono text-muted-foreground py-0.5">
                  <div className="flex items-center justify-center gap-1.5 text-primary">
                    <span>↓</span>
                    <span>MOTOR DE EXPORTAÇÃO</span>
                  </div>
                  <div className="flex items-center justify-center gap-1.5 text-primary">
                    <span>↓</span>
                    <span>PERSISTÊNCIA SOBERANA</span>
                  </div>
                </div>

                {/* Tier 3 e Tier 4 lado a lado */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Tier 3: Multi-Format Exporter */}
                  <div className="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-2">
                    <div className="text-[11px] font-mono text-primary font-semibold">
                      CAMADA 3 // COMPILAÇÃO & EXPORTAÇÃO
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded bg-card border border-border/60">
                        <div className="font-medium text-foreground">DOCX OOXML</div>
                        <div className="text-[10px] text-muted-foreground">Word Nativo via AST</div>
                      </div>
                      <div className="p-2 rounded bg-card border border-border/60">
                        <div className="font-medium text-foreground">PDF Executivo</div>
                        <div className="text-[10px] text-muted-foreground">Paginação A4 Precisa</div>
                      </div>
                      <div className="p-2 rounded bg-card border border-border/60">
                        <div className="font-medium text-foreground">HTML Estático</div>
                        <div className="text-[10px] text-muted-foreground">Dossiê Independente</div>
                      </div>
                      <div className="p-2 rounded bg-card border border-border/60">
                        <div className="font-medium text-foreground">Markdown Puro</div>
                        <div className="text-[10px] text-muted-foreground">Raw com Frontmatter</div>
                      </div>
                    </div>
                  </div>

                  {/* Tier 4: Local Persistence */}
                  <div className="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-2">
                    <div className="text-[11px] font-mono text-primary font-semibold">
                      CAMADA 4 // DADOS & CRIPTOGRAFIA
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded bg-card border border-border/60">
                        <div className="font-medium text-foreground">IndexedDB</div>
                        <div className="text-[10px] text-muted-foreground">rovex-db (Imagens RAW)</div>
                      </div>
                      <div className="p-2 rounded bg-card border border-border/60">
                        <div className="font-medium text-foreground">JSON Atômico</div>
                        <div className="text-[10px] text-muted-foreground">rovex-state.json (.bak)</div>
                      </div>
                      <div className="p-2 rounded bg-card border border-border/60">
                        <div className="font-medium text-foreground">PBKDF2 / SHA-256</div>
                        <div className="text-[10px] text-muted-foreground">600k rounds WebCrypto</div>
                      </div>
                      <div className="p-2 rounded bg-card border border-border/60">
                        <div className="font-medium text-foreground">Docker Isolado</div>
                        <div className="text-[10px] text-muted-foreground">UID 1001 Non-Root</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ),
      },
      {
        id: 'tech-stack',
        category: 'architecture',
        number: '2',
        title: isPt ? 'Stack Tecnológica' : isEs ? 'Stack Tecnológica' : 'Technology Stack',
        summary: isPt
          ? 'Linguagens, frameworks de frontend, APIs de backend, bancos de dados e empacotamento.'
          : isEs
          ? 'Lenguajes, frameworks de interfaz, backend, base de datos e infraestructura.'
          : 'Frontend frameworks, backend processing, storage mechanisms, and container infrastructure.',
        content: (
          <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-border/60 bg-card/50 space-y-2">
                <div className="flex items-center gap-2 text-foreground font-semibold">
                  <Code className="h-4 w-4 text-foreground/80" />
                  <span>Frontend (Interface)</span>
                </div>
                <ul className="text-xs space-y-1.5 list-disc list-inside">
                  <li><strong className="text-foreground">Next.js 15 (App Router):</strong> Renderização híbrida SSR e Client Components.</li>
                  <li><strong className="text-foreground">React 19 & TypeScript 5:</strong> Tipagem estrita de contratos de dados e relatórios.</li>
                  <li><strong className="text-foreground">Tailwind CSS & HSL Tokens:</strong> Sistema visual flexível com troca de temas em tempo real.</li>
                  <li><strong className="text-foreground">Radix UI Primitives:</strong> Acessibilidade, modais e controles de interface.</li>
                  <li><strong className="text-foreground">Phosphor Icons:</strong> Iconografia tática unificada.</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl border border-border/60 bg-card/50 space-y-2">
                <div className="flex items-center gap-2 text-foreground font-semibold">
                  <Cpu className="h-4 w-4 text-foreground/80" />
                  <span>Backend (Processamento)</span>
                </div>
                <ul className="text-xs space-y-1.5 list-disc list-inside">
                  <li><strong className="text-foreground">Node.js 22 LTS:</strong> Runtime principal de alta performance.</li>
                  <li><strong className="text-foreground">Next.js Route Handlers:</strong> Endpoints REST e servidor MCP em <code>/api/mcp</code>.</li>
                  <li><strong className="text-foreground">Motor Nativo DOCX:</strong> Construtor OOXML via AST do Remark/Unified.</li>
                  <li><strong className="text-foreground">Calculadora CVSS v3.1:</strong> Motor matemático determinístico conforme FIRST.org.</li>
                  <li><strong className="text-foreground">CLI Python 3 (app.py):</strong> Gerenciador de portas, runtime e execução local.</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl border border-border/60 bg-card/50 space-y-2">
                <div className="flex items-center gap-2 text-foreground font-semibold">
                  <HardDrive className="h-4 w-4 text-foreground/80" />
                  <span>Armazenamento & Dados</span>
                </div>
                <ul className="text-xs space-y-1.5 list-disc list-inside">
                  <li><strong className="text-foreground">LocalStorage (Navegador):</strong> Cache local-first com latência zero para projetos e estados.</li>
                  <li><strong className="text-foreground">IndexedDB (rovex-db):</strong> Repositório de imagens e capturas em alta resolução sem limite de 5MB.</li>
                  <li><strong className="text-foreground">JSON Atômico no Servidor:</strong> Persistência em <code>./data/rovex-state.json</code> com backup <code>.bak</code> rotacionado.</li>
                  <li><strong className="text-foreground">Volumes Mapeados:</strong> Pastas <code>./data</code>, <code>./uploads</code> e <code>./logs</code> preservadas no host.</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl border border-border/60 bg-card/50 space-y-2">
                <div className="flex items-center gap-2 text-foreground font-semibold">
                  <Layers className="h-4 w-4 text-foreground/80" />
                  <span>Infraestrutura & Empacotamento</span>
                </div>
                <ul className="text-xs space-y-1.5 list-disc list-inside">
                  <li><strong className="text-foreground">Docker Multi-Stage:</strong> Imagem leve baseada em <code>node:22-alpine</code> (~180MB).</li>
                  <li><strong className="text-foreground">Usuário Não-Root:</strong> Execução segura sob UID/GID 1001 (<code>nextjs:nodejs</code>).</li>
                  <li><strong className="text-foreground">Porta Padrão:</strong> <code>127.0.0.1:1400</code> (desenvolvimento e produção).</li>
                  <li><strong className="text-foreground">Deploy Automatizado:</strong> Script <code>deploy.sh</code> com BuildKit e transição atômica.</li>
                </ul>
              </div>
            </div>

            {/* Convencao de Rotas e IDs de Projeto */}
            <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-2">
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <Layers className="h-4 w-4 text-primary" />
                <span>
                  {isPt
                    ? 'Convenção de URLs e Arquitetura de IDs (/report/[template]/[id])'
                    : isEs
                    ? 'Convención de URLs y Arquitectura de IDs (/report/[template]/[id])'
                    : 'URL Routing Architecture & Project IDs (/report/[template]/[id])'}
                </span>
              </div>
              <p className="text-xs">
                {isPt
                  ? 'Na arquitetura de rotas do Rovex (/report/[template]/[id]), o segmento [template] define o motor e estilo visual de apresentação (Writeup técnico condensado versus Relatório Corporativo formal de Pentest). O segmento [id] é a chave interna única e persistente do projeto no banco de dados — ela não requer estética na barra de endereço, pois serve como chave técnica de integridade.'
                  : isEs
                  ? 'En la arquitectura de rutas (/report/[template]/[id]), el segmento [template] define el estilo visual (Writeup técnico versus Reporte Corporativo de Pentest). El segmento [id] es la clave interna única en la base de datos local y funciona como identificador técnico de integridad referencial.'
                  : 'In the Rovex route architecture (/report/[template]/[id]), the [template] segment determines the presentation layout and visual engine (condensed technical writeup vs executive pentest report). The [id] segment is the internal persistent primary key — it prioritizes referential integrity over vanity styling.'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                <div className="p-2.5 rounded-lg bg-background/80 border border-border/60">
                  <span className="text-amber-500 font-bold">Laboratórios & Writeups:</span>
                  <div className="text-muted-foreground text-[10px] mt-0.5">proj-writeup-[nome]-[ano] (ex: proj-writeup-haze-2026)</div>
                </div>
                <div className="p-2.5 rounded-lg bg-background/80 border border-border/60">
                  <span className="text-primary font-bold">Auditorias & Pentests:</span>
                  <div className="text-muted-foreground text-[10px] mt-0.5">proj-pentest-[cliente]-[ano] (ex: proj-pentest-acme-2026)</div>
                </div>
              </div>
            </div>
          </div>
        ),
      },
      {
        id: 'data-flow',
        category: 'workflow',
        number: '3',
        title: isPt ? 'Fluxo de Dados & Componentes' : isEs ? 'Flujo de Datos y Componentes' : 'Data Flow & Components',
        summary: isPt
          ? 'Ciclo de vida dos dados, pipeline de AST Markdown e servidor Model Context Protocol (MCP).'
          : isEs
          ? 'Ciclo de vida de datos, pipeline de renderizado y servidor MCP para IA.'
          : 'Data ingestion lifecycle, AST rendering pipeline, and Model Context Protocol (MCP) server.',
        content: (
          <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
            <div>
              <h4 className="text-base font-semibold text-foreground mb-2">
                {isPt ? '1. Entrada de Dados' : isEs ? '1. Entrada de Datos' : '1. Ingestion Channels'}
              </h4>
              <p>
                {isPt
                  ? 'Os dados entram no sistema através do editor de blocos Markdown (digitação manual do pentester), importação de vulnerabilidades da biblioteca (+100 modelos CWE/OWASP), seleção de templates estruturais (ex: padrão CPTS / HTB) ou via conexões programáticas de agentes de IA usando o protocolo MCP.'
                  : isEs
                  ? 'Los datos ingresan mediante el editor Markdown por bloques, la importación de vulnerabilidades (+100 templates), templates de reporte (formato CPTS / HTB) o mediante agentes de IA por el protocolo MCP.'
                  : 'Data enters via the sectional block Markdown editor (manual auditor input), vulnerability library templates (+100 CWE/OWASP records), project blueprints (such as the CPTS / HTB certification template), or programmatically through AI assistants over MCP.'}
              </p>
            </div>

            <div>
              <h4 className="text-base font-semibold text-foreground mb-2">
                {isPt ? '2. Processamento Interno (Pipeline de Renderização)' : isEs ? '2. Procesamiento Interno (Pipeline)' : '2. Internal Processing & AST Pipeline'}
              </h4>
              <p>
                {isPt
                  ? 'O conteúdo Markdown é transformado em uma Árvore de Sintaxe Abstrata (AST) através de remark e rehype. Os marcadores especiais {{findings.table}} e {{findings.details}} são substituídos dinamicamente pela tabela de vulnerabilidades e pelas seções detalhadas com badges de severidade. As variáveis como {{client.name}} e {{project.startDate}} são interpoladas em tempo real.'
                  : isEs
                  ? 'El Markdown se transforma en un AST mediante remark y rehype. Los marcadores {{findings.table}} y {{findings.details}} se sustituyen dinámicamente por la tabla de vulnerabilidades y detalles con badges. Variables como {{client.name}} se interpolan al vuelo.'
                  : 'Markdown text is parsed into an Abstract Syntax Tree (AST) via remark and rehype. Dynamic markers like {{findings.table}} and {{findings.details}} are interpolated at render time, injecting styled finding cards, severity badges, and CVSS scores.'}
              </p>
            </div>

            {/* Visual Pipeline AST & Templates */}
            <div className="rounded-xl border border-border/70 bg-card/40 p-4 space-y-3 font-sans">
              <div className="flex items-center gap-2 border-b border-border/50 pb-2.5">
                <span className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-xs font-mono font-semibold tracking-wider uppercase text-foreground">
                  {isPt ? 'Pipeline Visual // Ciclo de Vida da Redação ao Dossiê Final' : 'Visual Pipeline // Authoring to Export Lifecycle'}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs text-center">
                <div className="p-3 rounded-lg bg-card border border-border/60 space-y-1">
                  <div className="font-mono text-primary text-[10px] font-bold">ETAPA 01</div>
                  <div className="font-medium text-foreground">Entrada de Blocos</div>
                  <div className="text-[10px] text-muted-foreground">Markdown puro + [TODO: ...] + tokens {'{{var}}'}</div>
                </div>
                <div className="p-3 rounded-lg bg-card border border-border/60 space-y-1">
                  <div className="font-mono text-primary text-[10px] font-bold">ETAPA 02</div>
                  <div className="font-medium text-foreground">Parsing AST</div>
                  <div className="text-[10px] text-muted-foreground">Remark constrói árvore sintática abstrata</div>
                </div>
                <div className="p-3 rounded-lg bg-card border border-border/60 space-y-1">
                  <div className="font-mono text-primary text-[10px] font-bold">ETAPA 03</div>
                  <div className="font-medium text-foreground">Interpolação Dinâmica</div>
                  <div className="text-[10px] text-muted-foreground">Injeta dados de cliente, CVSS e evidências</div>
                </div>
                <div className="p-3 rounded-lg bg-card border border-border/60 space-y-1">
                  <div className="font-mono text-primary text-[10px] font-bold">ETAPA 04</div>
                  <div className="font-medium text-foreground">Compilador Multi-Alvo</div>
                  <div className="text-[10px] text-muted-foreground">Word (.docx), PDF executivo A4 ou HTML</div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border/70 bg-card/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-foreground/90">
                  MCP SERVER INTEGRATION // POST /api/mcp
                </span>
                <Badge variant="outline" className="text-[10px] border-border text-muted-foreground">
                  Streamable HTTP
                </Badge>
              </div>
              <p className="text-xs">
                {isPt
                  ? 'O assistente de IA conecta-se diretamente ao endpoint /api/mcp. Utiliza 5 skills modulares sob demanda (rovex-reports, rovex-report-structure, rovex-findings-workflow, rovex-cvss-scoring, rovex-import) para redigir relatórios inteiros, criar achados estruturados e pontuar vulnerabilidades com o menor gasto de tokens possível.'
                  : isEs
                  ? 'Los clientes de IA se conectan a /api/mcp con 5 skills bajo demanda (rovex-reports, rovex-report-structure, rovex-findings-workflow, rovex-cvss-scoring, rovex-import) para redactar reportes y vulnerabilidades gastando el mínimo de tokens.'
                  : 'AI assistants connect to /api/mcp using 5 on-demand modular skills (rovex-reports, rovex-report-structure, rovex-findings-workflow, rovex-cvss-scoring, rovex-import) to draft reports, manage findings, and score risks while conserving LLM context tokens.'}
              </p>
              <div className="relative rounded-lg bg-muted/60 border border-border/60 p-3 font-mono text-xs text-foreground/90">
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute right-2 top-2 h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground"
                  onClick={() =>
                    copyToClipboard(
                      'claude mcp add --transport http rovex http://127.0.0.1:1400/api/mcp',
                      'mcp-cli'
                    )
                  }
                >
                  {copiedCode === 'mcp-cli' ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
                <code>claude mcp add --transport http rovex http://127.0.0.1:1400/api/mcp</code>
              </div>
            </div>
          </div>
        ),
      },
      {
        id: 'security',
        category: 'security',
        number: '4',
        title: isPt ? 'Pilares de Segurança (Security by Design)' : isEs ? 'Pilares de Seguridad (Security by Design)' : 'Security by Design Pillars',
        summary: isPt
          ? 'Controle de acesso PBKDF2/SHA-256, proteção contra vazamento de dados e isolamento em container.'
          : isEs
          ? 'Control de acceso PBKDF2/SHA-256, protección de datos y aislamiento en contenedor.'
          : 'Access control PBKDF2/SHA-256, zero-telemetry data protection, and container isolation.',
        content: (
          <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-border/60 bg-card/50 space-y-2">
                <div className="flex items-center gap-2 text-foreground font-semibold">
                  <Lock className="h-4 w-4 text-foreground/80" />
                  <span>Controle de Acesso</span>
                </div>
                <p className="text-xs">
                  {isPt
                    ? 'Senhas protegidas com derivação criptográfica PBKDF2-SHA256 (150.000 iterações com salt aleatório exclusivo). Sessões isoladas via sessionStorage e guardas de rota nos endpoints administrativos.'
                    : isEs
                    ? 'Contraseñas cifradas con PBKDF2-SHA256 (150.000 iteraciones y salt único). Sesiones controladas en sessionStorage y protección en todas las rutas.'
                    : 'Credentials hashed using PBKDF2-SHA256 (150,000 iterations and unique random salt). Sessions scoped to sessionStorage with strict client route guards.'}
                </p>
              </div>

              <div className="p-4 rounded-xl border border-border/60 bg-card/50 space-y-2">
                <div className="flex items-center gap-2 text-foreground font-semibold">
                  <ShieldCheck className="h-4 w-4 text-foreground/80" />
                  <span>Proteção de Dados</span>
                </div>
                <p className="text-xs">
                  {isPt
                    ? 'Zero telemetria de fábrica (NEXT_TELEMETRY_DISABLED=1). Gravação atômica em disco com cópia .bak rotacionada para evitar corrupção. Sanitização de saída Markdown contra XSS armazenado.'
                    : isEs
                    ? 'Cero telemetría (NEXT_TELEMETRY_DISABLED=1). Escritura atómica en disco con archivo .bak automático. Sanitización Markdown completa contra XSS.'
                    : 'Zero telemetry (NEXT_TELEMETRY_DISABLED=1). Atomic disk writes with automatic .bak backup. Robust Markdown sanitization preventing Stored XSS.'}
                </p>
              </div>

              <div className="p-4 rounded-xl border border-border/60 bg-card/50 space-y-2">
                <div className="flex items-center gap-2 text-foreground font-semibold">
                  <Layers className="h-4 w-4 text-foreground/80" />
                  <span>Isolamento & Runtime</span>
                </div>
                <p className="text-xs">
                  {isPt
                    ? 'Container Docker sob usuário sem privilégios (nextjs:1001). Vinculação em 0.0.0.0:1400 acessível localmente e via IP da rede (HOST_BIND configurável). Previews em iframes isolados.'
                    : isEs
                    ? 'Contenedor Docker ejecutado con usuario no-root (nextjs:1001). Conexión en 0.0.0.0:1400 accesible en local y vía IP de red (HOST_BIND configurable). Previews en iframes aislados.'
                    : 'Unprivileged non-root Docker execution (nextjs:1001). 0.0.0.0:1400 network bind accessible locally and across host LAN (HOST_BIND configurable). Theme visualizer isolated in sandboxed iframes.'}
                </p>
              </div>
            </div>
          </div>
        ),
      },
      {
        id: 'operations',
        category: 'operations',
        number: '5',
        title: isPt ? 'Operação e Manutenção' : isEs ? 'Operación y Mantenimiento' : 'Operation & Maintenance',
        summary: isPt
          ? 'Monitoramento com healthcheck HTTP, atualizações com deploy.sh e resiliência com backup JSON integral.'
          : isEs
          ? 'Monitorización con healthcheck HTTP, actualizaciones con deploy.sh y backups JSON integrales.'
          : 'HTTP healthcheck monitoring, zero-downtime updates with deploy.sh, and resilient JSON backups.',
        content: (
          <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
            <div>
              <h4 className="text-base font-semibold text-foreground mb-2">
                {isPt ? '1. Monitoramento & Observabilidade' : isEs ? '1. Monitorización & Logs' : '1. Health & Observability'}
              </h4>
              <p>
                {isPt
                  ? 'A aplicação expõe verificação de saúde nativa no endpoint / através de HEALTHCHECK no Dockerfile. Assegura recuperação automática caso ocorra estouro de memória ou bloqueio de processo. Logs estruturados do Next.js são espelhados na pasta ./logs do host.'
                  : isEs
                  ? 'Verificación de estado nativa en el endpoint / vía HEALTHCHECK en Dockerfile. Recuperación automática en caso de error. Los logs se guardan en la carpeta ./logs del host.'
                  : 'Native health checks run against the root HTTP endpoint / via Dockerfile HEALTHCHECK directives. Automated restarts handle deadlocks, and structured logs mirror to ./logs on the host.'}
              </p>
            </div>

            <div>
              <h4 className="text-base font-semibold text-foreground mb-2">
                {isPt ? '2. Atualizações com Docker Compose & deploy.sh' : isEs ? '2. Actualizaciones con Docker Compose & deploy.sh' : '2. Updates & Deployment'}
              </h4>
              <p>
                {isPt
                  ? 'A plataforma suporta dois modelos de atualização: Imagens pré-compiladas via GitHub Container Registry (ghcr.io/0xdun0/rovex:latest com docker compose pull) ou compilação local pelo script deploy.sh com Docker BuildKit. Em ambos os casos, a substituição é atômica e os dados persistidos no host (./data, ./uploads e ./logs) permanecem 100% preservados.'
                  : isEs
                  ? 'La plataforma admite dos modelos de actualización: Imágenes precompiladas vía GitHub Container Registry (ghcr.io/0xdun0/rovex:latest con docker compose pull) o compilación local con deploy.sh. En ambos casos, los volúmenes ./data, ./uploads y ./logs permanecen intactos.'
                  : 'The platform supports two deployment models: Pre-compiled container images via GitHub Container Registry (ghcr.io/0xdun0/rovex:latest with docker compose pull) or local source compilation via deploy.sh. In both models, state files in ./data, ./uploads, and ./logs remain completely preserved on the host.'}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-border/60 bg-card/50 space-y-2">
              <h4 className="text-base font-semibold text-foreground">
                {isPt ? '3. Resiliência, Persistência & Recuperação de Desastres' : isEs ? '3. Resiliencia, Persistencia & Recuperación' : '3. Disaster Recovery & Persistence'}
              </h4>
              <p className="text-xs">
                {isPt
                  ? 'Persistência absoluta: com o volume ./data:/app/data, o container pode ser parado, recriado ou removido sem perda de projetos ou achados. Além disso, o arquivo ./data/rovex-state.json conta com rotação atômica .bak automática a cada escrita, e backups integrais em arquivo único (.json) podem ser exportados a qualquer momento pelo menu de usuário (/report/4f8b2c1e9a7d3e6a).'
                  : isEs
                  ? 'Persistencia absoluta: con el volumen ./data:/app/data, el contenedor puede detenerse o recrearse sin perder datos. El archivo ./data/rovex-state.json cuenta con copia .bak automática y backups integrales exportables desde el menú de usuario.'
                  : 'Absolute persistence: with the host volume ./data:/app/data, containers can be stopped, upgraded, or deleted with zero data loss. Furthermore, ./data/rovex-state.json features atomic .bak rotation on every save, and full single-file JSON archives export instantly from the user panel.'}
              </p>
            </div>
          </div>
        ),
      },
      {
        id: 'get-started-guide',
        category: 'guide',
        number: 'GS',
        title: isPt ? 'Get Started — Instalação & Primeiro Relatório' : isEs ? 'Primeros Pasos — Instalación' : 'Get Started — Quickstart',
        summary: isPt
          ? 'Guia passo a passo para clonar, subir a instância com Docker Compose ou Imagem GHCR e gerar seu primeiro relatório.'
          : isEs
          ? 'Guía paso a paso para clonar, iniciar con Docker Compose o imagen GHCR y generar tu primer reporte.'
          : 'Step-by-step walkthrough to clone, launch via Docker Compose or GHCR image, and export your first pentest report.',
        content: (
          <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              {isPt
                ? 'Siga as etapas abaixo para ter o Rovex operando em menos de 5 minutos com dados persistentes:'
                : isEs
                ? 'Sigue estos pasos para tener Rovex listo en menos de 5 minutos con datos persistentes:'
                : 'Follow the steps below to have Rovex running in under 5 minutes with persistent data:'}
            </p>
            <div className="rounded-lg bg-black/60 p-4 font-mono text-xs text-foreground space-y-2">
              <div className="text-muted-foreground">// Opção A: Docker Compose (Recomendado — Imagem GHCR pronta)</div>
              <div>docker compose up -d</div>
              <div className="text-muted-foreground pt-2">// Opção B: Docker Run direto com volume de dados</div>
              <div>docker run -d -p 1400:3000 -v $(pwd)/data:/app/data --name rovex ghcr.io/0xdun0/rovex:latest</div>
              <div className="text-muted-foreground pt-2">// Opção C: Compilação local via Node.js</div>
              <div>pnpm install &amp;&amp; pnpm dev</div>
            </div>
            <p className="text-xs">
              {isPt
                ? 'Acesse http://127.0.0.1:1400 e defina sua senha no primeiro acesso. Seus dados ficam salvos em ./data.'
                : isEs
                ? 'Accede a http://127.0.0.1:1400 y configura tu contraseña. Los datos se guardan en ./data.'
                : 'Access http://127.0.0.1:1400 and set your password. Your data is stored safely in ./data.'}
            </p>
          </div>
        ),
      },
      {
        id: 'user-guide-doc',
        category: 'guide',
        number: 'UG',
        title: isPt ? 'User Guide — Manual do Usuário' : isEs ? 'Guía de Usuario' : 'User Guide',
        summary: isPt
          ? 'Manual operacional de alvos, projetos, evidências, edição por blocos e exportações.'
          : isEs
          ? 'Manual operativo de objetivos, proyectos, evidencias, edición por bloques y exportaciones.'
          : 'Operational manual covering targets, projects, evidence, block editing, and document export.',
        content: (
          <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              {isPt
                ? 'O fluxo de trabalho diário de auditoria no Rovex divide-se em 5 etapas principais:'
                : isEs
                ? 'El flujo de trabajo habitual de auditoría en Rovex consta de 5 pasos clave:'
                : 'The core assessment lifecycle in Rovex follows 5 structured stages:'}
            </p>
            <ol className="list-decimal list-inside space-y-2 text-xs">
              <li><strong className="text-foreground">Cadastrar Alvo (Target):</strong> Insira o nome do cliente, e-mail de contato e faça upload do logo horizontal de capa.</li>
              <li><strong className="text-foreground">Criar Projeto:</strong> Vincule o alvo, defina o período de teste e selecione o modelo de certificação (ex: padrão CPTS / HTB).</li>
              <li><strong className="text-foreground">Redigir Conteúdo:</strong> Utilize a visão Split para redigir o sumário executivo e escopo, inserindo <code>[TODO: ...]</code> onde faltarem dados.</li>
              <li><strong className="text-foreground">Inserir Evidências (Findings):</strong> Adicione vulnerabilidades com score CVSS v3.1 automático e capturas de tela inline.</li>
              <li><strong className="text-foreground">Exportar:</strong> Gere o documento Word (<code>.docx</code>), PDF com quebra A4 ou HTML estático na barra de ações.</li>
            </ol>
          </div>
        ),
      },
      {
        id: 'resources-doc',
        category: 'resources',
        number: 'RES',
        title: isPt
          ? 'Resources — Variáveis de Modelo & Referência Técnica'
          : isEs
          ? 'Recursos — Variables de Template y Referencia Técnica'
          : 'Resources — Template Variables & Technical Reference',
        summary: isPt
          ? 'Quais variáveis de modelo são compatíveis no Rovex, sintaxe dinâmica {{ variavel }}, campos de tarefas, compilação AST e faixas CVSS v3.1.'
          : isEs
          ? 'Variables de template compatibles en Rovex, sintaxis dinámica {{ variable }}, campos de tareas, compilación AST y CVSS v3.1.'
          : 'Supported template variables in Rovex, dynamic {{ variable }} syntax, task fields, AST compilation, and CVSS v3.1 scoring.',
        content: (
          <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
            {/* Bloco 1: Como funcionam as variáveis de modelo no Rovex */}
            <div className="space-y-3">
              <h4 className="text-base font-semibold text-foreground">
                {isPt
                  ? 'Variáveis de Modelo (Template Variables) no Rovex'
                  : isEs
                  ? 'Variables de Template en Rovex'
                  : 'Template Variables in Rovex'}
              </h4>
              <p>
                {isPt
                  ? 'No Rovex, as variáveis de modelo (template) são utilizadas para a renderização dinâmica de conteúdo dentro dos relatórios. Quando você utiliza o editor de relatórios, esses campos são tratados como variáveis que extraem valores inseridos em outras partes do projeto, metadados do alvo cadastrado ou dados de escopo.'
                  : isEs
                  ? 'En Rovex, las variables de template se utilizan en la renderización dinámica de contenido dentro de los reportes. En el editor, estos campos extraen automáticamente valores de los metadatos del proyecto y objetivos.'
                  : 'In Rovex, template variables enable dynamic content rendering throughout technical and executive assessment reports. These fields automatically resolve values from target metadata, assessment scopes, and project properties.'}
              </p>
            </div>

            {/* Bloco 2: Sintaxe e Regras de Edição */}
            <div className="rounded-lg border border-border/70 bg-card/50 p-4 space-y-3">
              <h5 className="text-xs font-mono font-semibold uppercase tracking-wider text-primary">
                {isPt ? 'Como Funcionam: Sintaxe & Regras' : isEs ? 'Cómo Funcionan: Sintaxis y Reglas' : 'How They Work: Syntax & Rules'}
              </h5>
              <div className="space-y-2 text-xs">
                <p>
                  <strong className="text-foreground">Sintaxe:</strong> {isPt
                    ? 'No template, elas geralmente aparecem entre colchetes ou chaves duplas, como '
                    : isEs
                    ? 'En la template aparecen entre llaves dobles, como '
                    : 'Within templates, they appear enclosed in double curly braces, such as '}
                  <code className="px-1.5 py-0.5 rounded bg-muted font-mono text-foreground font-semibold">{'{{ variavel }}'}</code>.
                </p>
                <p>
                  <strong className="text-foreground">Preenchimento Automático:</strong> {isPt
                    ? 'Esses campos não devem ser alterados manualmente no relatório final, pois o Rovex os preenche automaticamente com base nas informações fornecidas no projeto e no alvo cadastrado.'
                    : isEs
                    ? 'Estos campos no deben modificarse manualmente, ya que Rovex los completa automáticamente según los datos ingresados en el proyecto.'
                    : 'These fields should not be altered manually in final text, as Rovex populates them automatically based on the project information.'}
                </p>
                <p>
                  <strong className="text-foreground">Foco na Redação:</strong> {isPt
                    ? 'Ao preencher seu relatório, o foco deve ser nas áreas destacadas para edição (como vulnerabilidades e análises), enquanto o Rovex gerencia as alterações dessas variáveis pelos dados corretos para garantir um formato profissional e estruturado.'
                    : isEs
                    ? 'Al completar el reporte, el foco debe estar en los vulnerabilidades técnicos. Rovex gestiona la interpolación de variables para asegurar un formato profesional.'
                    : 'When filling out your report, focus on the highlighted editable areas while Rovex manages variable replacements with accurate data for a structured output.'}
                </p>
              </div>
            </div>

            {/* Bloco 3: Tabela de Variáveis Compatíveis no Rovex */}
            <div id="variaveis-compatíveis-rovex" className="space-y-4 pt-2">
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-lg border border-border/70 bg-card/60">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    <h5 className="text-sm font-semibold text-foreground font-sans">
                      {isPt ? 'Variáveis Compatíveis no Rovex' : isEs ? 'Variables Compatibles en Rovex' : 'Supported Variables in Rovex'}
                    </h5>
                    <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary">
                      {ROVEX_TEMPLATE_VARIABLES.length} {isPt ? 'VARIÁVEIS' : 'VARIABLES'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isPt
                      ? 'Referência completa de interpolação no Rovex: projeto, cliente, achados, CVSS v3.1, contadores e campos dinâmicos.'
                      : isEs
                      ? 'Referencia completa de interpolación en Rovex: proyecto, cliente, vulnerabilidades, CVSS v3.1, contadores y campos dinámicos.'
                      : 'Complete interpolation reference in Rovex: project, client, findings, CVSS v3.1, counters, and custom fields.'}
                  </p>
                </div>

                {/* Botão de Toggle da Paleta (⌘ Quick search...) */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCommandPaletteOpen(true)}
                  className="h-8 gap-2.5 px-3 border-border/80 bg-muted/40 hover:bg-muted/70 text-muted-foreground hover:text-foreground text-xs shadow-xs rounded-md transition-all font-normal"
                  title={isPt ? 'Pesquisar variáveis (⌘ ou Alt+V)' : isEs ? 'Buscar variables (⌘ o Alt+V)' : 'Quick search variables (⌘ or Alt+V)'}
                >
                  <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="font-normal text-muted-foreground">Quick search...</span>
                  <span className="inline-flex items-center pl-1.5 font-mono text-muted-foreground/90">
                    <span className="text-base font-bold leading-none select-none">⌘</span>
                  </span>
                </Button>
              </div>

              {/* Categorias Tabs das Variáveis com botões reativos */}
              <div className="w-full space-y-3">
                <div className="overflow-x-auto pb-1 no-scrollbar">
                  <div className="bg-muted/50 p-1 border border-border/60 rounded-md h-auto flex flex-nowrap w-max gap-1">
                    {[
                      { id: 'project', label: isPt ? 'Projeto' : isEs ? 'Proyecto' : 'Project' },
                      { id: 'client', label: isPt ? 'Cliente' : isEs ? 'Cliente' : 'Client' },
                      { id: 'pentester', label: isPt ? 'Consultor' : isEs ? 'Consultor' : 'Consultant' },
                      { id: 'report', label: isPt ? 'Relatório' : isEs ? 'Reporte' : 'Report' },
                      { id: 'finding', label: isPt ? 'Achados' : isEs ? 'Vulnerabilidades' : 'Findings' },
                      { id: 'cvss', label: 'CVSS v3.1' },
                      { id: 'counts', label: isPt ? 'Contadores' : isEs ? 'Contadores' : 'Counters' },
                      { id: 'custom', label: isPt ? 'Campos Dinâmicos' : isEs ? 'Campos Personalizados' : 'Custom Fields' },
                      { id: 'functions', label: isPt ? 'Funções' : isEs ? 'Funciones' : 'Functions' },
                      { id: 'syntax', label: isPt ? 'Sintaxe & Loops' : isEs ? 'Sintaxis y Bucles' : 'Loops & Syntax' },
                    ].map((tabItem) => (
                      <button
                        key={tabItem.id}
                        type="button"
                        onClick={() => setActiveVariableTab(tabItem.id as any)}
                        className={`text-xs py-1 px-2.5 rounded font-medium transition-all ${
                          activeVariableTab === tabItem.id
                            ? 'bg-background text-foreground shadow-xs font-semibold'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                        }`}
                      >
                        {tabItem.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-border/60 bg-card/40">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/50 border-b border-border/60 text-muted-foreground font-sans">
                      <tr>
                        <th className="py-2.5 px-3 font-semibold w-1/4">
                          {isPt ? 'Variável / Sintaxe' : isEs ? 'Variable / Sintaxis' : 'Variable / Syntax'}
                        </th>
                        <th className="py-2.5 px-3 font-semibold w-1/5">
                          {isPt ? 'Origem do Dado' : isEs ? 'Origen del Dato' : 'Data Source'}
                        </th>
                        <th className="py-2.5 px-3 font-semibold">
                          {isPt ? 'O que ela faz no Rovex' : isEs ? 'Qué hace en Rovex' : 'What it does in Rovex'}
                        </th>
                        <th className="py-2.5 px-3 font-semibold w-20 text-right">
                          {isPt ? 'Ação' : isEs ? 'Acción' : 'Action'}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 font-mono text-[11px]">
                      {ROVEX_TEMPLATE_VARIABLES.filter((v) => v.category === activeVariableTab).map((v, idx) => {
                        const currentLang: 'pt' | 'es' | 'en' = isPt ? 'pt' : isEs ? 'es' : 'en';
                        const ex = getExampleText(v.example, currentLang);
                        return (
                          <tr key={idx} className="hover:bg-muted/20 transition-colors">
                            <td className="py-2.5 px-3 text-primary font-bold select-all align-top">
                              {v.token}
                            </td>
                            <td className="py-2.5 px-3 font-sans text-foreground align-top">
                              <span className="inline-block px-1.5 py-0.5 rounded bg-muted/60 text-[10px] border border-border/40">
                                {v.source[currentLang]}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-sans text-muted-foreground align-top leading-relaxed">
                              <div className="text-foreground/90 font-medium mb-0.5">{v.description[currentLang]}</div>
                              {ex && (
                                <div className="text-[11px] font-mono text-muted-foreground/80">
                                  <span className="text-primary/70">{isPt ? 'Exemplo:' : isEs ? 'Ejemplo:' : 'Example:'}</span> {ex}
                                </div>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-right align-top">
                              <button
                                type="button"
                                onClick={() => copyToClipboard(v.token, v.token)}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded border border-border/60 bg-muted/40 hover:bg-muted hover:border-primary/40 text-[10px] font-mono text-foreground transition-colors"
                                title={isPt ? 'Copiar variável' : isEs ? 'Copiar variable' : 'Copy variable'}
                              >
                                {copiedCode === v.token ? (
                                  <>
                                    <Check className="h-3 w-3 text-emerald-500" />
                                    <span className="text-emerald-500 font-semibold">{isPt ? 'Copiado' : isEs ? 'Copiado' : 'Copied'}</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-3 w-3 text-muted-foreground" />
                                    <span>{isPt ? 'Copiar' : isEs ? 'Copiar' : 'Copy'}</span>
                                  </>
                                )}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Bloco 4: Campos de Tarefas & Renderização */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-lg border border-border/60 bg-card/60 space-y-2">
                <div className="text-xs font-mono font-semibold text-primary">
                  {isPt ? 'CAMPOS DE TAREFAS' : isEs ? 'CAMPOS DE TAREAS' : 'TASK FIELDS'}
                </div>
                <div className="text-xs text-foreground font-medium">
                  {isPt ? 'Áreas Destacadas para Edição' : isEs ? 'Áreas Destacadas para Edición' : 'Highlighted Areas for Editing'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {isPt
                    ? 'O editor destaca áreas onde o usuário deve inserir dados específicos (como marcações '
                    : isEs
                    ? 'El editor resalta áreas donde el usuario debe ingresar datos específicos (como marcas '
                    : 'The editor highlights areas where the user must enter specific data (such as '}
                  <code className="px-1 py-0.5 rounded bg-muted text-foreground">[TODO: ...]</code>
                  {isPt
                    ? ' ou seções de escopo pendentes), que o Rovex então processa como variáveis para compor o documento final.'
                    : isEs
                    ? ' o secciones de alcance pendientes), que Rovex luego procesa como variables para componer el documento final.'
                    : ' or pending scope sections), which Rovex then processes as variables to compose the final document.'}
                </p>
              </div>

              <div className="p-3.5 rounded-lg border border-border/60 bg-card/60 space-y-2">
                <div className="text-xs font-mono font-semibold text-foreground/80">
                  {isPt ? 'RENDERIZAÇÃO & PIPELINE' : isEs ? 'RENDERIZACIÓN & PIPELINE' : 'RENDERING & PIPELINE'}
                </div>
                <div className="text-xs text-foreground font-medium">
                  {isPt ? 'Compilação AST Unificada' : isEs ? 'Compilación AST Unificada' : 'Unified AST Compilation'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {isPt
                    ? 'O Rovex utiliza um motor AST estruturado para renderizar esses templates, permitindo que os valores dos campos do formulário sejam configurados de forma consistente em todo o relatório gerado (Word .docx, PDF executivo e HTML).'
                    : isEs
                    ? 'Rovex utiliza un motor AST estructurado para renderizar estas templates, permitiendo que los valores de los campos del formulario se configuren de manera consistente en todo el reporte generado (Word .docx, PDF ejecutivo y HTML).'
                    : 'Rovex utilizes a structured AST engine to render these templates, allowing form field values to be consistently configured throughout the generated report (Word .docx, executive PDF, and HTML).'}
                </p>
              </div>
            </div>

            {/* Bloco 5: Faixas de Severidade CVSS v3.1 */}
            <div className="space-y-2 pt-2">
              <h4 className="text-sm font-semibold text-foreground">
                {isPt ? 'Faixas de Severidade CVSS v3.1' : isEs ? 'Rangos de Severidad CVSS v3.1' : 'CVSS v3.1 Severity Ranges'}
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                <div className="p-2 rounded bg-red-950/30 border border-red-500/40 text-red-300">
                  {isPt ? 'Crítico: 9.0 - 10.0' : isEs ? 'Crítico: 9.0 - 10.0' : 'Critical: 9.0 - 10.0'}
                </div>
                <div className="p-2 rounded bg-orange-950/30 border border-orange-500/40 text-orange-300">
                  {isPt ? 'Alto: 7.0 - 8.9' : isEs ? 'Alto: 7.0 - 8.9' : 'High: 7.0 - 8.9'}
                </div>
                <div className="p-2 rounded bg-amber-950/30 border border-amber-500/40 text-amber-300">
                  {isPt ? 'Médio: 4.0 - 6.9' : isEs ? 'Medio: 4.0 - 6.9' : 'Medium: 4.0 - 6.9'}
                </div>
                <div className="p-2 rounded bg-emerald-950/30 border border-emerald-500/40 text-emerald-300">
                  {isPt ? 'Baixo: 0.1 - 3.9' : isEs ? 'Bajo: 0.1 - 3.9' : 'Low: 0.1 - 3.9'}
                </div>
                <div className="p-2 rounded bg-blue-950/30 border border-blue-500/40 text-blue-300">
                  {isPt ? 'Informativo: 0.0' : isEs ? 'Informativo: 0.0' : 'Info: 0.0'}
                </div>
              </div>
            </div>
          </div>
        ),
      },
    ],
    [isPt, isEs, copiedCode, activeVariableTab]
  );

  // Mapa semântico exaustivo de palavras-chave para o robô inteligente
  const sectionKeywords: Record<string, string[]> = {
    overview: [
      'visao', 'geral', 'monolito', 'modular', 'missao', 'objetivo', '0xdun0', 'autor',
      'dione', 'dionelima', 'criador', 'contato', 'email', 'dionelima@gmail.com',
      'gratuito', 'gratis', 'free', 'open', 'source', 'licenca', 'mit', 'local-first',
      'soberania', 'arquitetura', 'camada', 'ingestion', 'core', 'export', 'design',
      'filosofia', 'seguranca', 'independencia', 'sem nuvem', 'privacidade'
    ],
    'tech-stack': [
      'stack', 'tecnologia', 'tecnologias', 'next.js', 'nextjs', 'react', 'react 19',
      'typescript', 'tailwind', 'css', 'hsl', 'tokens', 'radix', 'radix ui', 'icons',
      'node', 'nodejs', 'node 22', 'route handlers', 'ooxml', 'docx', 'cvss', 'first.org',
      'python', 'app.py', 'cli', 'localstorage', 'indexeddb', 'rovex-db', 'json atomico',
      'rovex-state.json', 'bak', 'backup', 'docker', 'dockerfile', 'multi-stage', 'runner',
      'non-root', 'nextjs:nodejs', 'uid 1001', 'porta', '1400', '3000', 'host_bind',
      'deploy.sh', 'buildkit', 'ghcr', 'ghcr.io', 'registry', 'packages', 'compose',
      'container', 'containers', 'volume', 'volumes'
    ],
    'data-flow': [
      'fluxo', 'dados', 'data flow', 'ast', 'markdown', 'remark', 'rehype', 'pipeline',
      'renderizacao', 'parsing', 'interpolação', 'mcp', 'model context protocol', 'ia',
      'ai', 'agente', 'agentes', 'claude', 'cursor', 'opencode', 'tools', 'skills',
      'playbooks', 'rovex-reports', 'rovex-report-structure', 'rovex-findings-workflow',
      'rovex-cvss-scoring', 'rovex-import', 'tokens', 'llm', 'streamable', 'http', 'api/mcp'
    ],
    security: [
      'seguranca', 'security', 'privacidade', 'privacy', 'pbkdf2', 'sha-256', 'sha256',
      'salt', 'criptografia', 'hash', 'senha', 'password', 'sessao', 'sessionstorage',
      'zero telemetria', 'telemetria', 'next_telemetry_disabled', 'sanitizacao', 'xss',
      'stored xss', 'non-root', 'isolamento', 'iframe', 'sandboxed', 'host_bind', 'protecao'
    ],
    operations: [
      'operacao', 'manutencao', 'observabilidade', 'health', 'healthcheck', 'probes',
      'liveness', 'readiness', 'logs', 'docker logs', 'rebuild', 'deploy', 'deploy.sh',
      'atualizacao', 'atualizar', 'upgrade', 'update', 'docker compose', 'compose',
      'docker-compose.yml', 'compose pull', 'compose up', 'ghcr', 'ghcr.io', 'packages',
      'volume', 'volumes', 'persistência', 'persistencia', 'persistente', 'data', './data',
      'perder dados', 'perda de dados', 'preservar dados', 'nao perde', 'sem perder',
      'apagar container', 'deletar container', 'remover container', 'parar container',
      'apagar', 'remover', 'deletar', 'parar', 'restart', 'reboot', 'desastre',
      'disaster recovery', 'recuperacao', 'restaurar', 'backup', 'bak', 'snapshot',
      'json backup', 'rovex-state.json', 'state.json', 'docker rm', 'docker stop', 'docker run'
    ],
    'get-started-guide': [
      'comecar', 'iniciar', 'instalacao', 'instalar', 'clone', 'git clone', 'primeiro',
      'passos', 'quickstart', 'start', 'docker run', 'docker compose up', 'pnpm dev',
      'pnpm install', 'deploy.sh', 'primeiro acesso', 'criar senha', 'http://127.0.0.1:1400',
      'localhost', 'porta 1400', 'targets', 'alvos', 'projetos', 'exportar',
      'container', 'apagar container', 'recriar container', 'docker'
    ],
    'user-guide-doc': [
      'manual', 'guia', 'usuario', 'user guide', 'alvo', 'alvos', 'target', 'targets',
      'cliente', 'criar projeto', 'cpts', 'htb', 'template de projeto', 'split',
      'editor', 'todo', '[todo', 'achados', 'findings', 'vulnerabilidades', 'poc',
      'evidencias', 'screenshots', 'fotos', 'imagens', 'word', 'docx', 'pdf', 'html',
      'exportar relatorio', 'gerar relatorio',
      'email', 'e-mail', 'contato', 'perfil', 'consultor', 'pentester', 'auditor', 'credenciais',
      'dione', 'dionelima', 'setup', 'gmail', 'dionelima@gmail.com'
    ],
    'resources-doc': [
      'recursos', 'resources', 'variaveis', 'variavel', 'template variables', 'modelo',
      'sintaxe', 'tags', 'chaves', '{{', '}}', '{%', '%}', 'loops', 'for', 'if',
      'cvss v3.1', 'cvss', 'vetor', 'score', 'calculadora', 'severidade', 'critico',
      'alto', 'medio', 'baixo', 'informativo', 'ranges', 'ast', 'docx', 'tabela de variaveis',
      'palette', 'paleta', 'atalho', 'cmd', 'command', '⌘',
      'email', 'e-mail', 'contactemail', 'pentester.email', 'client.contactemail',
      'report.field_user.email', 'contato', 'gmail', 'dione', 'dionelima'
    ]
  };

  const normalizeStr = (str: string) =>
    str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  // Filtragem dinâmica inteligente com pontuação de relevância (ranking semântico)
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) {
      return docSections.filter((section) => {
        return activeCategory === 'all' || section.category === activeCategory;
      });
    }

    const rawQ = searchQuery.toLowerCase().trim();
    const q = normalizeStr(rawQ);

    const isEmail = q.includes('@') || /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(q);
    const hasEmailIntent =
      isEmail ||
      q.includes('email') ||
      q.includes('e-mail') ||
      q.includes('contato') ||
      q.includes('dione') ||
      q.includes('dionelima') ||
      q.includes('gmail') ||
      (user?.email && q.includes(normalizeStr(user.email))) ||
      (user?.name && q.includes(normalizeStr(user.name)));

    const stopWords = new Set([
      'como', 'o', 'a', 'os', 'as', 'de', 'do', 'da', 'dos', 'das',
      'em', 'no', 'na', 'para', 'por', 'que', 'qual', 'quais', 'sao', 'funciona',
      'e', 'ou', 'se', 'um', 'uma', 'uns', 'umas', 'meu', 'minha',
      'how', 'do', 'i', 'can', 'what', 'is', 'the', 'and', 'to', 'about', 'where'
    ]);

    // Tokenização resiliente a emails, pontuação e termos compostos
    const rawTerms = q
      .split(/[\s,?.!\-_/:@]+/)
      .map((t) => t.trim())
      .filter((w) => w.length >= 2 && !stopWords.has(w));

    // Se a busca envolver email/contato/auditor, injetar termos semânticos auxiliares
    const terms = Array.from(
      new Set([
        ...rawTerms,
        ...(hasEmailIntent ? ['email', 'auditor', 'pentester', 'perfil', 'contato'] : [])
      ])
    );

    const scored = docSections.map((section) => {
      let score = 0;
      const titleNorm = normalizeStr(section.title);
      const summaryNorm = normalizeStr(section.summary);
      const idNorm = normalizeStr(section.id);
      const catNorm = normalizeStr(section.category);
      const keywords = (sectionKeywords[section.id] || []).map(normalizeStr);

      // Correspondência direta com intenção de e-mail / perfil do auditor
      if (hasEmailIntent) {
        if (section.id === 'user-guide-doc') score += 210;
        if (section.id === 'resources-doc') score += 190;
        if (section.id === 'overview') score += 150;
      }

      // Correspondência exata da query com palavras-chave, id ou título
      if (keywords.some((kw) => kw === q || kw.includes(q) || q.includes(kw))) {
        score += 160;
      }
      if (titleNorm.includes(q)) score += 130;
      if (summaryNorm.includes(q)) score += 90;
      if (idNorm.includes(q)) score += 110;
      if (catNorm.includes(q)) score += 60;

      // Pílulas de sugestão do robô
      const matchingPill = t.quickPills.find((p) => {
        const pNorm = normalizeStr(p.text);
        return pNorm.includes(q) || q.includes(normalizeStr(p.id)) || q.includes(pNorm);
      });
      if (matchingPill) {
        if (matchingPill.targetSectionId === section.id) score += 120;
        if (matchingPill.relatedIds?.includes(section.id)) score += 60;
      }

      // Decomposição e correspondência de termos múltiplos
      for (const term of terms) {
        if (keywords.some((kw) => kw === term || kw.includes(term))) score += 45;
        if (titleNorm.includes(term)) score += 40;
        if (summaryNorm.includes(term)) score += 30;
        if (idNorm.includes(term)) score += 35;
        if (catNorm.includes(term)) score += 20;
      }

      return { section, score };
    });

    return scored
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.section);
  }, [docSections, activeCategory, searchQuery, t.quickPills, user?.email, user?.name]);

  // Variáveis de Modelo correspondentes à busca atual para sugestão imediata
  const matchingVariables = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) return [];
    const q = normalizeStr(searchQuery.trim());
    const isEmailIntent =
      q.includes('@') ||
      q.includes('email') ||
      q.includes('e-mail') ||
      q.includes('contato') ||
      q.includes('dione') ||
      q.includes('dionelima') ||
      q.includes('gmail');

    if (isEmailIntent) {
      const emailVars = ROVEX_TEMPLATE_VARIABLES.filter(
        (v) =>
          v.token.includes('email') ||
          v.token.includes('pentester') ||
          v.token.includes('contact')
      );
      if (emailVars.length > 0) return emailVars.slice(0, 4);
    }

    return ROVEX_TEMPLATE_VARIABLES.filter((v) => {
      const tokenNorm = normalizeStr(v.token);
      const descNorm = normalizeStr(v.description[isPt ? 'pt' : isEs ? 'es' : 'en'] || '');
      const catNorm = normalizeStr(v.category);
      return tokenNorm.includes(q) || descNorm.includes(q) || catNorm.includes(q);
    }).slice(0, 3);
  }, [searchQuery, isPt, isEs]);

  // Categorias para a Paleta de Variáveis (⌘)
  const paletteCategories = useMemo(
    () => [
      { id: 'all', label: isPt ? 'Todas' : isEs ? 'Todas' : 'All' },
      { id: 'project', label: isPt ? 'Projeto' : isEs ? 'Proyecto' : 'Project' },
      { id: 'client', label: isPt ? 'Cliente' : isEs ? 'Cliente' : 'Client' },
      { id: 'pentester', label: isPt ? 'Consultor' : isEs ? 'Consultor' : 'Consultant' },
      { id: 'report', label: isPt ? 'Relatório' : isEs ? 'Reporte' : 'Report' },
      { id: 'finding', label: isPt ? 'Achados' : isEs ? 'Vulnerabilidades' : 'Findings' },
      { id: 'cvss', label: 'CVSS v3.1' },
      { id: 'counts', label: isPt ? 'Contadores' : isEs ? 'Contadores' : 'Counters' },
      { id: 'custom', label: isPt ? 'Campos Dinâmicos' : isEs ? 'Personalizados' : 'Custom' },
      { id: 'functions', label: isPt ? 'Funções' : isEs ? 'Funciones' : 'Functions' },
      { id: 'syntax', label: isPt ? 'Sintaxe & Loops' : isEs ? 'Sintaxis' : 'Syntax' },
    ],
    [isPt, isEs]
  );

  // Filtragem dinâmica na Paleta de Variáveis
  const filteredPaletteVariables = useMemo(() => {
    const langKey: 'pt' | 'es' | 'en' = isPt ? 'pt' : isEs ? 'es' : 'en';
    return ROVEX_TEMPLATE_VARIABLES.filter((item) => {
      const matchesCategory =
        selectedPaletteCat === 'all' || item.category === selectedPaletteCat;
      if (!matchesCategory) return false;

      if (!paletteQuery.trim()) return true;

      const q = paletteQuery.toLowerCase().trim();
      const exStr = getExampleText(item.example, langKey);
      return (
        item.token.toLowerCase().includes(q) ||
        item.categoryLabel[langKey].toLowerCase().includes(q) ||
        item.source[langKey].toLowerCase().includes(q) ||
        item.description[langKey].toLowerCase().includes(q) ||
        (exStr ? exStr.toLowerCase().includes(q) : false)
      );
    });
  }, [paletteQuery, selectedPaletteCat, isPt, isEs]);


  // Timeline "What's new" inspirada na referência do Docker Docs
  const newsItems = [
    {
      date: 'Sep 27',
      category: 'Documentation & Architecture',
      title: 'Complete Rovex Architecture Hub & Technical Specifications',
      summary:
        'Launched the full technical documentation suite covering modular monolith engineering, PBKDF2/SHA-256 security pillars, and on-demand MCP skills.',
    },
    {
      date: 'Sep 27',
      category: 'Branding & Author',
      title: 'Consolidated Rovex Identity by 0xdun0',
      summary:
        'Completed full codebase alignment under 0xdun0, with human-style Brazilian Portuguese code comments and unified rovex namespaces.',
    },
    {
      date: 'May 16',
      category: 'Report Engine',
      title: 'Sectional Markdown Block Editor with Split/MD/Preview Modes',
      summary:
        'Introduced resizable split-pane editing, uppercase [TODO] task detection with anchor hyperlinks, and native Word .docx AST exports.',
    },
    {
      date: 'May 16',
      category: 'AI Integration',
      title: 'Native Model Context Protocol (MCP) Server at /api/mcp',
      summary:
        'Exposed streamable HTTP tools and token-efficient playbooks for Claude Code, Cursor, and OpenCode pentest automation.',
    },
  ];

  const visibleNews = showAllNews ? newsItems : newsItems.slice(0, 3);

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Botão flutuante estilo Give feedback */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-30 hidden lg:block">
        <a
          href="https://github.com/0xdun0/rovex"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 bg-primary/90 hover:bg-primary text-primary-foreground text-xs font-semibold px-3 py-2 rounded-l-md shadow-lg transition-transform hover:-translate-x-1"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          <span>{t.feedbackBtn}</span>
        </a>
      </div>

      {/* Hero Section com Grid de Pontos */}
      <section className="relative pt-12 pb-14 px-4 sm:px-6 lg:px-8 border-b border-border/60 bg-gradient-to-b from-card/80 via-background to-background">
        {/* Padrão decorativo de grid sutil de pontos */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }}
        />

        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          <Badge
            variant="outline"
            className="px-3 py-1 text-xs border-primary/30 bg-primary/10 text-primary font-mono"
          >
            ROVEX // DOCUMENTATION &amp; PLATFORM MANUAL
          </Badge>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground font-headline">
            {t.heroTitle}
          </h1>

          {/* Barra de Busca Proeminente com Robozinho Interativo */}
          <div ref={searchContainerRef} className="relative max-w-2xl mx-auto">
            <div className="group relative flex items-center w-full h-14 pl-4 pr-2.5 rounded-2xl bg-card/90 dark:bg-[#12161f]/95 border border-border/80 hover:border-primary/40 focus-within:border-primary/80 focus-within:ring-2 focus-within:ring-primary/20 shadow-xl transition-all">
              <div
                className="shrink-0 mr-3.5 text-[#29bc86] dark:text-[#29bc86] flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
                title={isPt ? "Robô Rovex: clique para ir ao melhor resultado" : "Rovex AI Assistant"}
                onClick={() => {
                  if (filteredSections.length > 0) {
                    handleJumpToSection(filteredSections[0].id);
                  }
                }}
              >
                <RobotIcon size={24} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchFocused(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (filteredSections.length > 0) {
                      handleJumpToSection(filteredSections[0].id);
                    } else {
                      document.getElementById('documentacao-resultados')?.scrollIntoView({ behavior: 'smooth' });
                    }
                    setIsSearchFocused(false);
                  } else if (e.key === 'Escape') {
                    setIsSearchFocused(false);
                  }
                }}
                placeholder={t.searchPlaceholder}
                className="w-full bg-transparent border-0 ring-0 outline-none text-foreground placeholder:text-muted-foreground/75 text-sm sm:text-base font-sans focus:outline-none focus:ring-0"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setIsSearchFocused(false);
                  }}
                  className="mr-2 text-xs text-muted-foreground hover:text-foreground px-1.5 py-0.5 rounded transition-colors"
                  title="Limpar busca"
                >
                  ✕
                </button>
              )}
              <button
                type="button"
                className="h-9 w-9 rounded-xl bg-primary/20 hover:bg-primary/30 text-primary flex items-center justify-center transition-colors shrink-0 border border-primary/30 shadow-sm"
                onClick={() => {
                  if (filteredSections.length > 0) {
                    handleJumpToSection(filteredSections[0].id);
                  } else {
                    document.getElementById('documentacao-resultados')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                title="Search"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Quick Query Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 max-w-3xl mx-auto">
            {t.quickPills.map((pill) => (
              <button
                key={pill.id}
                type="button"
                onClick={() => {
                  setSearchQuery(pill.text);
                  setActiveCategory('all');
                }}
                className="px-3.5 py-1.5 rounded-full text-xs font-medium border border-border/70 bg-card/40 hover:bg-card hover:border-primary/50 text-muted-foreground hover:text-foreground transition-all duration-150"
              >
                {pill.text}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Cards Principais ou Resultados Dinâmicos da Busca do Robô (Layout 100% Inline sem Sobreposição) */}
      <section className={cn(
        "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-300 relative z-10",
        !searchQuery.trim() ? "-mt-6" : "mt-8"
      )}>
        {!searchQuery.trim() ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {t.cards.map((card) => {
              const Icon = card.icon;
              return (
                <Card
                  key={card.id}
                  onClick={() => {
                    setSearchQuery('');
                    if (card.id === 'get-started') setActiveCategory('guide');
                    else if (card.id === 'overview') setActiveCategory('architecture');
                    else if (card.id === 'user-guide') setActiveCategory('guide');
                    else if (card.id === 'resources') setActiveCategory('resources');
                  }}
                  className="relative overflow-hidden cursor-pointer group hover:border-primary/50 transition-all duration-200 bg-card/90 shadow-md hover:shadow-xl hover:-translate-y-1"
                >
                  <CardHeader className="p-5 pb-3">
                    <div className="flex items-center justify-between mb-3">
                      <div className="h-10 w-10 rounded-xl bg-muted/80 border border-border/70 text-foreground/80 flex items-center justify-center transition-all group-hover:text-primary group-hover:border-primary/40 group-hover:bg-primary/10 shadow-sm">
                        <Icon className="h-5 w-5" />
                      </div>
                      <Badge variant="secondary" className="text-[10px] uppercase font-mono tracking-wider">
                        {card.badge}
                      </Badge>
                    </div>
                    <CardTitle className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                      {card.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 pt-0">
                    <CardDescription className="text-xs leading-relaxed text-muted-foreground">
                      {card.desc}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Header de Resultados Integrados do Robô */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 px-5 rounded-2xl bg-card/90 border border-primary/30 shadow-md">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-[#29bc86]">
                  <RobotIcon size={20} />
                </span>
                <span className="text-sm font-semibold text-foreground font-headline">
                  {isPt ? 'Assistente Rovex encontrou:' : isEs ? 'Asistente Rovex encontró:' : 'Rovex AI found:'}
                </span>
                <Badge variant="outline" className="text-xs font-mono border-primary/40 text-primary bg-primary/10">
                  {filteredSections.length} {filteredSections.length === 1 ? (isPt ? 'tópico' : 'topic') : (isPt ? 'tópicos' : 'topics')}
                </Badge>
                <code className="text-xs font-mono text-primary font-semibold bg-muted px-2 py-0.5 rounded">
                  "{searchQuery}"
                </code>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    document.getElementById('documentacao-resultados')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-xs text-primary hover:underline font-medium inline-flex items-center gap-1"
                >
                  <span>{isPt ? 'Ver texto completo abaixo' : 'View full text below'}</span>
                  <span>↓</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded bg-muted/60 hover:bg-muted transition-colors"
                >
                  {isPt ? 'Limpar busca ✕' : 'Clear search ✕'}
                </button>
              </div>
            </div>

            {/* Banner Inteligente de Perfil & Contato do Auditor */}
            {(searchQuery.includes('@') ||
              normalizeStr(searchQuery).includes('dione') ||
              normalizeStr(searchQuery).includes('email') ||
              normalizeStr(searchQuery).includes('contato')) && (
              <div className="p-4 rounded-xl border border-primary/40 bg-primary/5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm animate-in fade-in duration-150">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-primary/15 text-primary border border-primary/30 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-primary font-mono">
                        {isPt ? 'Perfil & Credenciais do Auditor' : 'Auditor Profile & Credentials'}
                      </span>
                      <Badge variant="outline" className="text-[10px] font-mono border-primary/40 text-primary">
                        Setup & Template Tags
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {isPt
                        ? `Detectamos busca por perfil/e-mail (${searchQuery}). As credenciais do auditor são salvas nas Configurações da plataforma e injetadas automaticamente no relatório pelas tags {{ pentester.email }} e {{ client.contactEmail }}.`
                        : `Auditor profile or email detected (${searchQuery}). Auditor credentials are saved in Platform Setup and injected into reports via {{ pentester.email }} and {{ client.contactEmail }}.`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href="/setup"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
                  >
                    <span>{isPt ? 'Configurar Perfil' : 'Configure Profile'}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            )}

            {/* Grid dos Tópicos Encontrados */}
            {filteredSections.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border border-dashed border-border bg-card/50 space-y-1">
                <p className="text-sm font-medium text-foreground">
                  {isPt ? 'Nenhuma seção encontrada diretamente para este termo.' : 'No direct section found for this query.'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isPt ? 'Sugestões: apagar container, docker, persistencia, volumes, mcp, variaveis...' : 'Suggestions: docker, container, persistence, volumes, mcp, variables...'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSections.map((sec, idx) => (
                  <Card
                    key={sec.id}
                    onClick={() => handleJumpToSection(sec.id)}
                    className={cn(
                      "cursor-pointer group hover:border-primary/60 transition-all duration-200 bg-card/90 shadow-md hover:shadow-xl hover:-translate-y-1 relative overflow-hidden",
                      idx === 0 && "border-primary/40 ring-1 ring-primary/20"
                    )}
                  >
                    <CardHeader className="p-5 pb-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/15 text-primary font-mono text-xs font-bold border border-primary/25">
                          {sec.number}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {idx === 0 && (
                            <Badge className="text-[10px] font-mono bg-primary text-primary-foreground">
                              ★ {isPt ? 'Melhor' : 'Best'}
                            </Badge>
                          )}
                          <Badge variant="secondary" className="text-[10px] uppercase font-mono tracking-wider">
                            {sec.category}
                          </Badge>
                        </div>
                      </div>
                      <CardTitle className="text-base font-semibold text-foreground group-hover:text-primary transition-colors flex items-center justify-between">
                        <span className="truncate">{sec.title}</span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground/60 group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5 pt-0">
                      <CardDescription className="text-xs leading-relaxed text-muted-foreground line-clamp-2">
                        {sec.summary}
                      </CardDescription>
                      <div className="mt-3 text-[11px] font-medium text-primary flex items-center gap-1 group-hover:underline">
                        <span>{isPt ? 'Ir para este tópico' : 'Jump to this section'}</span>
                        <span>→</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Variáveis de Modelo Correspondentes no fluxo inline */}
            {matchingVariables.length > 0 && (
              <div className="p-3.5 px-4 rounded-xl bg-muted/40 border border-border/60 flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono font-semibold text-muted-foreground uppercase">
                  {isPt ? 'Variáveis Detectadas:' : 'Matching Variables:'}
                </span>
                {matchingVariables.map((v) => (
                  <button
                    key={v.token}
                    type="button"
                    onClick={() => copyToClipboard(v.token, v.token)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-card border border-border/80 hover:border-primary/50 text-xs font-mono text-primary transition-colors shadow-sm"
                    title={isPt ? 'Clique para copiar' : 'Click to copy'}
                  >
                    <span>{v.token}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {copiedCode === v.token ? '✓' : '⎘'}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Conteúdo Detalhado da Documentação */}
      <section id="documentacao-resultados" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 scroll-mt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/60">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground font-headline">
              {isPt ? 'Documentação da Plataforma' : isEs ? 'Documentación de la Plataforma' : 'Platform Documentation'}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isPt
                ? 'Especificações completas, arquitetura e manuais operacionais do Rovex.'
                : isEs
                ? 'Especificaciones técnicas, arquitectura y manuales operativos de Rovex.'
                : 'Complete engineering specs, architecture, and operational manuals.'}
            </p>
          </div>

          {/* Filtros de Categoria */}
          <div className="flex items-center gap-1.5 p-1 rounded-lg bg-card border border-border/60 text-xs">
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1 rounded-md transition-colors ${
                activeCategory === 'all' ? 'bg-primary text-primary-foreground font-medium' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {isPt ? 'Todas' : isEs ? 'Todas' : 'All'}
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('architecture')}
              className={`px-3 py-1 rounded-md transition-colors ${
                activeCategory === 'architecture' ? 'bg-primary text-primary-foreground font-medium' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {isPt ? 'Arquitetura' : isEs ? 'Arquitectura' : 'Architecture'}
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('workflow')}
              className={`px-3 py-1 rounded-md transition-colors ${
                activeCategory === 'workflow' ? 'bg-primary text-primary-foreground font-medium' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {isPt ? 'Fluxo & MCP' : isEs ? 'Flujo & MCP' : 'Workflow & MCP'}
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('security')}
              className={`px-3 py-1 rounded-md transition-colors ${
                activeCategory === 'security' ? 'bg-primary text-primary-foreground font-medium' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {isPt ? 'Segurança' : isEs ? 'Seguridad' : 'Security'}
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('guide')}
              className={`px-3 py-1 rounded-md transition-colors ${
                activeCategory === 'guide' ? 'bg-primary text-primary-foreground font-medium' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {isPt ? 'Guias' : isEs ? 'Guías' : 'Guides'}
            </button>
          </div>
        </div>

        {/* Status da Busca Ativa com Contador Inteligente */}
        {searchQuery.trim() && (
          <div className="flex items-center justify-between gap-3 pt-4 pb-1">
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center justify-center h-5 w-5 rounded-full bg-primary/20 text-primary">
                <RobotIcon size={14} />
              </span>
              <span className="text-foreground font-medium">
                {isPt
                  ? `Robô Rovex encontrou ${filteredSections.length} ${filteredSections.length === 1 ? 'seção' : 'seções'} para:`
                  : isEs
                  ? `El robot Rovex encontró ${filteredSections.length} ${filteredSections.length === 1 ? 'sección' : 'secciones'} para:`
                  : `Rovex AI found ${filteredSections.length} ${filteredSections.length === 1 ? 'section' : 'sections'} for:`}
              </span>
              <code className="px-2 py-0.5 rounded bg-muted font-mono text-primary font-semibold">
                "{searchQuery}"
              </code>
            </div>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
              }}
              className="text-xs text-muted-foreground hover:text-foreground hover:underline"
            >
              {isPt ? 'Limpar filtro' : isEs ? 'Limpiar filtro' : 'Clear filter'}
            </button>
          </div>
        )}

        {/* Lista de Tópicos Expandidos */}
        <div className="mt-6 space-y-6">
          {filteredSections.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-border/80 rounded-2xl space-y-2">
              <Search className="h-8 w-8 text-muted-foreground mx-auto" />
              <h3 className="text-base font-semibold text-foreground">
                {isPt ? 'Nenhum resultado encontrado' : isEs ? 'No se encontraron resultados' : 'No documentation found'}
              </h3>
              <p className="text-xs text-muted-foreground">
                {isPt ? 'Tente buscar por outro termo ou selecione a categoria Todas.' : 'Try adjusting your search query or reset category filter.'}
              </p>
            </div>
          ) : (
            filteredSections.map((sec) => (
              <Card
                key={sec.id}
                id={`section-${sec.id}`}
                className={cn(
                  'border-border/70 bg-card/70 backdrop-blur-sm overflow-hidden scroll-mt-24 transition-all duration-300',
                  highlightedSectionId === sec.id &&
                    'ring-2 ring-primary ring-offset-2 ring-offset-background shadow-xl shadow-primary/25 border-primary'
                )}
              >
                <CardHeader className="p-6 pb-4 border-b border-border/40 bg-card/40">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center h-7 w-7 rounded-md bg-primary/15 text-primary font-mono text-xs font-bold border border-primary/25">
                      {sec.number}
                    </span>
                    <div className="flex-1">
                      <CardTitle className="text-lg font-bold text-foreground">
                        {sec.title}
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground mt-0.5">
                        {sec.summary}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-5">{sec.content}</CardContent>
              </Card>
            ))
          )}
        </div>
      </section>

      {/* Seção "What's new" Estilo Docker Docs */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="border-t border-border/60 pt-10">
          <h2 className="text-2xl font-bold tracking-tight text-foreground font-headline mb-8">
            {t.whatsNewTitle}
          </h2>

          <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-border/60">
            {visibleNews.map((item, idx) => (
              <div key={idx} className="relative group">
                {/* Marcador circular da timeline */}
                <div className="absolute -left-[30px] sm:-left-[38px] top-1.5 h-3.5 w-3.5 rounded-full bg-primary/20 border-2 border-primary group-hover:scale-125 transition-transform" />

                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-medium text-muted-foreground">
                      {item.date}
                    </span>
                    <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary">
                      {item.category}
                    </Badge>
                  </div>

                  <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                    <span>{item.title}</span>
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>

                  <p className="text-xs text-muted-foreground leading-relaxed max-w-3xl">
                    {item.summary}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-6 pl-6 sm:pl-8">
            <button
              type="button"
              onClick={() => setShowAllNews(!showAllNews)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
            >
              <span>{showAllNews ? (isPt ? 'Mostrar menos' : 'Show less') : (isPt ? 'Mostrar mais' : 'Show more')}</span>
              {showAllNews ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </section>

      {/* Command Palette Modal (⌘) */}
      {isCommandPaletteOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-4 bg-background/80 backdrop-blur-md animate-in fade-in-0 duration-150"
          onClick={() => setIsCommandPaletteOpen(false)}
        >
          <div
            className="relative w-full max-w-2xl rounded-xl border border-border/80 bg-card shadow-2xl overflow-hidden flex flex-col max-h-[82vh] animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header com Search */}
            <div className="p-4 border-b border-border/60 bg-card/95 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center h-6 w-6 rounded-md bg-primary/15 text-primary border border-primary/25">
                    <CommandPaletteIcon className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-xs font-mono font-bold tracking-wider uppercase text-foreground">
                    {isPt ? 'Paleta de Variáveis de Modelo Rovex' : isEs ? 'Paleta de Variables Rovex' : 'Rovex Template Variables Palette'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline-flex items-center text-muted-foreground px-2 py-0.5 rounded bg-muted/60 border border-border/60">
                    <span className="text-base leading-none font-bold select-none">⌘</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsCommandPaletteOpen(false)}
                    className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Input com Busca Rápida */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  autoFocus
                  value={paletteQuery}
                  onChange={(e) => setPaletteQuery(e.target.value)}
                  placeholder={
                    isPt
                      ? 'Pesquisar variável, função ou o que ela faz (ex: cvss, data, cliente)...'
                      : isEs
                      ? 'Buscar variable, función o descripción (ej: cvss, fecha, cliente)...'
                      : 'Search variable, function, or description (e.g. cvss, date, client)...'
                  }
                  className="pl-9 pr-9 h-10 text-sm bg-background border-border/70 focus-visible:ring-primary/40 font-mono"
                />
                {paletteQuery && (
                  <button
                    type="button"
                    onClick={() => setPaletteQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Categorias Pills na Paleta */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
                {paletteCategories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedPaletteCat(cat.id)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors shrink-0 ${
                      selectedPaletteCat === cat.id
                        ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                        : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Lista com Scroll */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 divide-y divide-border/30">
              {filteredPaletteVariables.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <Search className="h-6 w-6 text-muted-foreground mx-auto" />
                  <p className="text-xs text-muted-foreground">
                    {isPt ? 'Nenhuma variável encontrada para esta busca.' : isEs ? 'No se encontraron variables para esta búsqueda.' : 'No variables matched your query.'}
                  </p>
                </div>
              ) : (
                filteredPaletteVariables.map((item, idx) => {
                  const langKey: 'pt' | 'es' | 'en' = isPt ? 'pt' : isEs ? 'es' : 'en';
                  return (
                    <div
                      key={idx}
                      className="pt-2 first:pt-0 flex items-start justify-between gap-3 p-2.5 rounded-lg hover:bg-muted/40 transition-colors group"
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <code className="text-xs font-mono font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded select-all">
                            {item.token}
                          </code>
                          <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border/50">
                            {item.categoryLabel[langKey]}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            · {item.source[langKey]}
                          </span>
                        </div>
                        <p className="text-xs text-foreground/90 leading-snug">
                          {item.description[langKey]}
                        </p>
                        {getExampleText(item.example, langKey) && (
                          <p className="text-[11px] font-mono text-muted-foreground bg-card/80 p-1.5 rounded border border-border/40">
                            <span className="text-primary font-semibold">{isPt ? 'Ex: ' : isEs ? 'Ej: ' : 'Ex: '}</span>
                            {getExampleText(item.example, langKey)}
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(item.token, item.token)}
                        className="h-7 px-2.5 text-xs font-mono shrink-0 gap-1 border-border/70 group-hover:border-primary/50"
                        title={isPt ? 'Copiar para a área de transferência' : isEs ? 'Copiar al portapapeles' : 'Copy to clipboard'}
                      >
                        {copiedCode === item.token ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-500" />
                            <span className="text-[11px] text-emerald-500 font-semibold">{isPt ? 'Copiado' : isEs ? 'Copiado' : 'Copied'}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span className="text-[11px]">{isPt ? 'Copiar' : isEs ? 'Copiar' : 'Copy'}</span>
                          </>
                        )}
                      </Button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer com Dicas */}
            <div className="p-2.5 px-4 border-t border-border/60 bg-muted/20 flex flex-wrap items-center justify-between text-[11px] text-muted-foreground">
              <div className="flex items-center gap-3">
                <span>
                  {filteredPaletteVariables.length}{' '}
                  {isPt ? 'variáveis disponíveis' : isEs ? 'variables disponibles' : 'variables available'}
                </span>
                <span className="hidden sm:inline">·</span>
                <span className="hidden sm:inline">
                  {isPt
                    ? 'Clique em Copiar para colar no template'
                    : isEs
                    ? 'Haz clic en Copiar para pegar en la template'
                    : 'Click Copy to paste into template'}
                </span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[10px]">
                <kbd className="px-1.5 py-0.5 rounded bg-background border border-border">Esc</kbd>
                <span>{isPt ? 'para fechar' : isEs ? 'para cerrar' : 'to close'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

