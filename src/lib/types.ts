

export type Severity = 'Critical' | 'High' | 'Medium' | 'Low' | 'Informational';

export interface Client {
  id: string; // identificador unico do cliente
  name: string; // nome da empresa cliente
  contact: string; // nome do responsavel ou contato principal
  phone?: string; // telefone de contato
  logoUrl: string; // logotipo quadrado para avatares
  logoWide?: string; // logotipo horizontal para relatorios
  serviceDate?: string; // data de prestacao do servico ou auditoria
  period?: 'Weekly' | 'Monthly' | 'Yearly'; // frequencia de atendimento ou contrato
  status?: 'active' | 'billed' | 'paid'; // status financeiro ou operacional
}


export interface PentesterProfile {
  name?: string;
  role?: string;
  company?: string;
  email?: string;
  phone?: string;
  website?: string;
  location?: string;
  avatar?: string;
}

export type ProjectType = 'writeup' | 'pentest';
export type ProjectLanguage = 'en' | 'pt-br' | 'es';

export interface Project {
  id: string;
  clientId: string;
  name: string;
  type?: ProjectType; // 'writeup' | 'pentest' (default: 'pentest')
  icon: string;
  reportBody: string;
  startDate: string;
  endDate: string;
  status: 'In Progress' | 'Completed' | 'On Hold';
  language: ProjectLanguage;
  includePentesterData?: boolean;
  pentesterSnapshot?: PentesterProfile;
  /**
   * Tema de relatorio aplicado ao projeto; se undefined usa o tema global
   * definido nas configuracoes do operador.
   */
  themeId?: string;
  createdAt: string;
  updatedAt: string;
}

export type ContentBlockTag =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'p'
  | 'ul'
  | 'ol'
  | 'hr'
  | 'blockquote'
  | 'pre'
  | 'table';

export interface ContentBlock {
  id: string;
  tag: ContentBlockTag;
  content: string;
  meta?: {
    viewMode?: 'split' | 'markdown' | 'preview';
  };
}

export interface Finding {
  id:string;
  projectId: string;
  vulnerabilityId?: string;
  title: string;
  severity: Severity;
  cvss: number;
  markdown: string;
  createdAt: string;
  updatedAt: string;
}

export interface ImageAsset {
  id: string;
  dataUrl: string;
}

export interface CVSS {
  score: number;
  vectorString: string;
  attackVector: string;
  attackComplexity: string;
  privilegesRequired: string;
  userInteraction: string;
  scope: string;
  confidentiality: string;
  integrity: string;
  availability: string;
}

export interface Vulnerability {
  id: string;
  title_en: string;
  title_es: string;
  title_pt?: string;
  overview_en: string;
  overview_es: string;
  technicalDescription_en: string;
  technicalDescription_es: string;
  affectedComponents_en: string;
  affectedComponents_es: string;
  impact_en: string;
  impact_es: string;
  immediateActions_en: string;
  immediateActions_es: string;
  details_en: string;
  details_es: string;
  recommendations_en: string;
  recommendations_es: string;
  cwe: string;
  cvss: CVSS;
  severity: Severity;
  references: string[];
  tags: string[];
}

export interface Report {
  id: string;
  projectId: string;
  generatedHtml: string;
  pdfUrl?: string;
  options: Record<string, any>;
  createdAt: string;
}

export interface ProjectTemplate {
  id: string;
  name_en: string;
  name_es: string;
  name_pt?: string; // titulo do layout em portugues
  description_en: string;
  description_es: string;
  description_pt?: string; // resumo do escopo em portugues
  scope_en: string;
  scope_es: string;
  scope_pt?: string; // corpo do escopo em portugues
  appendix_en: string;
  appendix_es: string;
  appendix_pt?: string; // apendice metodologico em portugues
  icon: string;
}
