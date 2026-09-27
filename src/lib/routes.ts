// mapa central de rotas exclusivas com identificadores ofuscados em hash para a plataforma rovex
export const DASHBOARD_ROUTES = {
  metrics: '/report', // painel geral de metricas e auditorias ativas
  projects: '/report/9a4f2c1b8e7d3a6e', // gestao central de projetos e auditorias
  evidences: '/report/5e1d8c2a9b4f7e3d', // catalogo e repositorio de evidencias de invasao
  targets: '/report/7f3a9c2e81d44b6a', // base de alvos, escopos e organizacoes
  risks: '/report/3b8e4f1a9c2d7e6f', // base de conhecimento de riscos e matrizes de ameacas
  layouts: '/report/6c2a9e4f1d8b7e3a', // modelos e blueprints de relatorios
  vault: '/report/4f8b2c1e9a7d3e6a', // cofre de seguranca e pontos de restauracao local
  doc: '/report/e3b8a1c9f4d27e5a', // documentacao tecnica e arquitetura da plataforma
  profile: '/report/1e9a7c3b8f2d4e6a', // perfil do operador e consultor de seguranca
  themes: '/report/8a3f1c9e4b7d2e6a', // estudio visual de customizacao e temas
  mcp: '/report/2d7e9a4f1c8b3e6a', // integracao e gateway de agentes de ia via mcp
  settings: '/report/0f4a8b1c2e6d3a9e', // configuracoes de seguranca e autenticacao
  setup: '/setup', // guia de configuracao inicial e onboarding
} as const;

// helpers de rotas exclusivas do rovex
export const ROVEX_ROUTES = {
  ...DASHBOARD_ROUTES,
  projectDetails: (id: string) => `/report/9a4f2c1b8e7d3a6e/${id}`,
  projectReport: (id: string) => `/report/9a4f2c1b8e7d3a6e/${id}/report`,
  projectReportView: (id: string) => `/report/9a4f2c1b8e7d3a6e/${id}/view`,
  projectEvidence: (projectId: string, evidenceId: string) => `/report/9a4f2c1b8e7d3a6e/${projectId}/findings/${evidenceId}`,
  projectNewEvidence: (projectId: string) => `/report/9a4f2c1b8e7d3a6e/${projectId}/findings/new`,
} as const;
