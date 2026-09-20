// utilitario central de mensagens contextuais de carregamento por rota e idioma
export function getRouteLoadingInfo(path: string, locale: string = 'pt-br'): { title: string; subtitle: string } {
  const isPt = locale === 'pt-br';
  const isEs = locale === 'es';

  // rota de alvos / clientes
  if (path.includes('7f3a9c2e81d44b6a')) {
    return {
      title: isPt ? 'Carregando alvos e organizações...' : isEs ? 'Cargando objetivos y organizaciones...' : 'Loading targets and organizations...',
      subtitle: isPt ? 'Recuperando contratos, períodos e dados cadastrais...' : isEs ? 'Recuperando contratos, períodos y datos de clientes...' : 'Retrieving contracts, periods and targets database...',
    };
  }

  // rota de riscos / vulnerabilidades
  if (path.includes('3b8e4f1a9c2d7e6f')) {
    return {
      title: isPt ? 'Carregando catálogo de riscos...' : isEs ? 'Cargando catálogo de riesgos...' : 'Loading risks knowledge base...',
      subtitle: isPt ? 'Compilando vetores de ameaça, referências CWE e scores CVSS...' : isEs ? 'Compilando vectores de amenaza, referencias CWE y scores CVSS...' : 'Compiling threat vectors, CWE references and CVSS scores...',
    };
  }

  // rota de evidencias / findings
  if (path.includes('5e1d8c2a9b4f7e3d')) {
    return {
      title: isPt ? 'Sincronizando evidências de teste...' : isEs ? 'Sincronizando evidencias de prueba...' : 'Synchronizing test evidences...',
      subtitle: isPt ? 'Mapeando findings ativos, severidades e projetos vinculados...' : isEs ? 'Mapeando hallazgos activos y proyectos vinculados...' : 'Mapping active findings, severities and linked projects...',
    };
  }

  // rota de criacao de novo projeto
  if (path.includes('9a4f2c1b8e7d3a6e/new')) {
    return {
      title: isPt ? 'Inicializando assistente de projeto...' : isEs ? 'Iniciando asistente de proyecto...' : 'Initializing project wizard...',
      subtitle: isPt ? 'Carregando layouts, seletores de cliente e calendários...' : isEs ? 'Cargando plantillas, selectores de cliente y calendarios...' : 'Loading presets, target pickers and assessment calendar...',
    };
  }

  // rota de projetos geral
  if (path.includes('9a4f2c1b8e7d3a6e')) {
    if (path.includes('/report')) {
      return {
        title: isPt ? 'Compilando relatório executivo...' : isEs ? 'Compilando informe ejecutivo...' : 'Compiling executive report...',
        subtitle: isPt ? 'Renderizando seções, gráficos de vulnerabilidade e evidências...' : isEs ? 'Renderizando secciones, gráficos y evidencias...' : 'Rendering report sections, vulnerability charts and evidences...',
      };
    }
    return {
      title: isPt ? 'Carregando projetos de auditoria...' : isEs ? 'Cargando proyectos de auditoría...' : 'Loading assessment projects...',
      subtitle: isPt ? 'Verificando status de execução, prazos e relatórios...' : isEs ? 'Comprobando estado de ejecución, plazos e informes...' : 'Checking assessment statuses, deadlines and reports...',
    };
  }

  // rota de layouts / templates
  if (path.includes('6c2a9e4f1d8b7e3a')) {
    return {
      title: isPt ? 'Carregando biblioteca de layouts...' : isEs ? 'Cargando biblioteca de diseños...' : 'Loading report layout library...',
      subtitle: isPt ? 'Preparando modelos de auditoria e blocos estruturais...' : isEs ? 'Preparando plantillas de auditoría y bloques...' : 'Preparing assessment templates and structural blocks...',
    };
  }

  // rota de backup
  if (path.includes('4f8b2c1e9a7d3e6a')) {
    return {
      title: isPt ? 'Acessando cofre de backup...' : isEs ? 'Accediendo a la bóveda de backup...' : 'Accessing secure backup vault...',
      subtitle: isPt ? 'Verificando integridade e pontos de restauração...' : isEs ? 'Verificando integridad y puntos de restauración...' : 'Verifying local state integrity and restore points...',
    };
  }

  // rota de perfil
  if (path.includes('1e9a7c3b8f2d4e6a')) {
    return {
      title: isPt ? 'Carregando perfil do operador...' : isEs ? 'Cargando perfil del operador...' : 'Loading auditor profile...',
      subtitle: isPt ? 'Recuperando credenciais, contatos e logotipo...' : isEs ? 'Recuperando credenciales, contactos y logo...' : 'Loading credentials, contact information and logo...',
    };
  }

  // rota de temas visuais
  if (path.includes('8a3f1c9e4b7d2e6a')) {
    return {
      title: isPt ? 'Carregando temas visuais...' : isEs ? 'Cargando temas visuales...' : 'Loading visual theme studio...',
      subtitle: isPt ? 'Inicializando tokens de cor, tipografia e modo escuro...' : isEs ? 'Inicializando paletas de color, tipografía y modo oscuro...' : 'Initializing color palettes, typography tokens and dark mode...',
    };
  }

  // rota de mcp
  if (path.includes('2d7e9a4f1c8b3e6a')) {
    return {
      title: isPt ? 'Conectando ao gateway MCP...' : isEs ? 'Conectando a la pasarela MCP...' : 'Connecting to MCP gateway...',
      subtitle: isPt ? 'Verificando ferramentas ativas e endpoints de agentes de IA...' : isEs ? 'Comprobando herramientas activas y endpoints de IA...' : 'Checking available tools and AI agent communication endpoints...',
    };
  }

  // rota de configuracoes
  if (path.includes('0f4a8b1c2e6d3a9e')) {
    return {
      title: isPt ? 'Carregando configurações de segurança...' : isEs ? 'Cargando configuración de seguridad...' : 'Loading security settings...',
      subtitle: isPt ? 'Acessando matriz de autenticação e preferências...' : isEs ? 'Accediendo a la matriz de autenticación y preferencias...' : 'Accessing authentication matrix and security preferences...',
    };
  }

  // rota de documentacao
  if (path.includes('e3b8a1c9f4d27e5a')) {
    return {
      title: isPt ? 'Carregando documentação da plataforma...' : isEs ? 'Cargando documentación de la plataforma...' : 'Loading platform documentation...',
      subtitle: isPt ? 'Consultando arquitetura do sistema, manuais e guias de referência...' : isEs ? 'Consultando arquitectura del sistema, manuales y guías de referencia...' : 'Retrieving system architecture, manuals and reference guides...',
    };
  }

  // painel central metrics (/report)
  if (path === '/report' || path === '/report/') {
    return {
      title: isPt ? 'Compilando métricas do sistema...' : isEs ? 'Compilando métricas del sistema...' : 'Compiling system metrics...',
      subtitle: isPt ? 'Sincronizando estatísticas gerais e atividades em tempo real...' : isEs ? 'Sincronizando estadísticas generales y actividad...' : 'Synchronizing overview stats and real-time activity feed...',
    };
  }

  // fallback padrao
  return {
    title: isPt ? 'Carregando dados da plataforma...' : isEs ? 'Cargando datos de la plataforma...' : 'Loading platform workspace...',
    subtitle: isPt ? 'Sincronizando workspace seguro...' : isEs ? 'Sincronizando espacio de trabajo seguro...' : 'Synchronizing secure workspace...',
  };
}
