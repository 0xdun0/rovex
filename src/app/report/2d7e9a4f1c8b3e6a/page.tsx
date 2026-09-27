'use client'; // componente client side interativo

import React, { useEffect, useMemo, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { useLanguage } from '@/context/language-context';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { PlugsConnected, Copy, CheckCircle, AlertCircle, Check } from '@/components/icons';
import { MCP_TOOLS, MCP_SKILLS, MCP_TOOL_I18N, MCP_SKILL_I18N } from '@/lib/mcp/tool-defs';
import { syntaxTheme } from '@/components/code-block';
import { cn } from '@/lib/utils';

const T = {
  en: {
    title: 'Model Context Protocol (MCP)',
    subtitle:
      'Native bidirectional bridge allowing local AI agents (Claude Code, Cursor, Codex, OpenCode) to inspect and edit security reports.',
    endpoint: 'Active Endpoint',
    test: 'Test Ping',
    testing: 'Pinging…',
    online: 'Online // Ready',
    offline: 'Offline',
    onlineDesc: (v: string, n: number) => `Protocol ${v} · ${n} tools available`,
    offlineDesc: 'No response from the MCP endpoint. Ensure Rovex dev server is running.',
    copy: 'Copy',
    copied: 'Copied',
    connectTitle: 'Agent Connection Profiles',
    connectDesc: 'Select your preferred AI client to view the exact setup snippet.',
    clientCursor: 'Cursor / VS Code',
    clientClaudeDesktop: 'Claude Desktop',
    clientClaudeCli: 'Claude Code CLI',
    clientCodex: 'Codex CLI',
    clientOpenCode: 'OpenCode',
    toolsTitle: 'Registered Report Tools',
    toolsDesc: 'High-precision tools callable by connected AI models on active reports.',
    skillsTitle: 'Playbook Prompts',
    skillsDesc: 'Specialized system instructions fetched by agents for professional report writing.',
    usageTitle: 'Operational Workflow',
    steps: [
      'Keep Rovex running — the local endpoint processes live RPC calls.',
      'Copy the endpoint URL or client snippet above.',
      'Paste into your agent configuration file and start the session.',
      'Prompt the AI directly (e.g. "audit targets in scope" or "generate executive summary").',
    ],
    note: 'Security Note: Connected agents write directly to the local project store. All actions are logged locally.',
  },
  'pt-br': {
    title: 'Model Context Protocol (MCP)',
    subtitle:
      'Ponte bidirecional nativa permitindo que agentes de IA locais (Claude Code, Cursor, Codex, OpenCode) inspecionem e editem relatórios.',
    endpoint: 'Endpoint Ativo',
    test: 'Testar Ping',
    testing: 'Testando…',
    online: 'Online // Pronto',
    offline: 'Sem resposta',
    onlineDesc: (v: string, n: number) => `Protocolo ${v} · ${n} ferramentas ativas`,
    offlineDesc: 'O endpoint MCP não respondeu. Certifique-se de que o Rovex está em execução.',
    copy: 'Copiar',
    copied: 'Copiado',
    connectTitle: 'Perfis de Conexão de Agentes',
    connectDesc: 'Selecione seu cliente de IA para visualizar as configurações de conexão.',
    clientCursor: 'Cursor / VS Code',
    clientClaudeDesktop: 'Claude Desktop',
    clientClaudeCli: 'Claude Code CLI',
    clientCodex: 'Codex CLI',
    clientOpenCode: 'OpenCode',
    toolsTitle: 'Ferramentas de Relatório Registradas',
    toolsDesc: 'Ferramentas de alta precisão invocáveis pelos modelos de IA conectados.',
    skillsTitle: 'Playbooks de Instrução',
    skillsDesc: 'Instruções especializadas baixadas por agentes para redação executiva de relatórios.',
    usageTitle: 'Fluxo Operacional',
    steps: [
      'Mantenha o Rovex em execução — o nó local atende chamadas RPC em tempo real.',
      'Copie o endereço do endpoint ou snippet correspondente acima.',
      'Adicione ao arquivo de configuração do seu agente e inicie a sessão.',
      'Comande a IA diretamente (ex: "audite os alvos do escopo" ou "gere o sumário executivo").',
    ],
    note: 'Nota de Segurança: Os agentes conectados interagem diretamente com o armazenamento local. Todas as operações são mantidas na sua máquina.',
  },
  es: {
    title: 'Model Context Protocol (MCP)',
    subtitle:
      'Puente bidireccional que permite a agentes de IA (Claude Code, Cursor, Codex, OpenCode) inspeccionar y redactar informes.',
    endpoint: 'Endpoint Activo',
    test: 'Probar Ping',
    testing: 'Probando…',
    online: 'En línea // Listo',
    offline: 'Sin respuesta',
    onlineDesc: (v: string, n: number) => `Protocolo ${v} · ${n} herramientas activas`,
    offlineDesc: 'El endpoint MCP no responde. Asegúrate de que Rovex está en marcha.',
    copy: 'Copiar',
    copied: 'Copiado',
    connectTitle: 'Perfiles de Conexión',
    connectDesc: 'Selecciona tu cliente de IA para ver el snippet de configuración.',
    clientCursor: 'Cursor / VS Code',
    clientClaudeDesktop: 'Claude Desktop',
    clientClaudeCli: 'Claude Code CLI',
    clientCodex: 'Codex CLI',
    clientOpenCode: 'OpenCode',
    toolsTitle: 'Herramientas de Informe Registradas',
    toolsDesc: 'Herramientas de precisión invocables por modelos de IA sobre informes activos.',
    skillsTitle: 'Playbooks de Instrucción',
    skillsDesc: 'Instrucciones especializadas descargadas por agentes para redacción técnica.',
    usageTitle: 'Flujo Operativo',
    steps: [
      'Mantén Rovex en marcha: el nodo local atiende llamadas RPC en tiempo real.',
      'Copia la URL del endpoint o el snippet correspondiente.',
      'Añádelo a la configuración de tu agente e inicia la sesión.',
      'Pídele a la IA directamente (ej: "audita los objetivos en alcance" o "redacta el resumen ejecutivo").',
    ],
    note: 'Nota de Seguridad: Los agentes conectados interactúan directamente con el almacenamiento local.',
  },
};

type Status = 'idle' | 'testing' | 'online' | 'error';
type ClientTab = 'cursor' | 'claudeDesktop' | 'claudeCli' | 'codex' | 'opencode';

function CodeBlock({ code, copyLabel, copiedLabel, language }: { code: string; copyLabel: string; copiedLabel: string; language?: string }) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };
  return (
    <div className="relative group">
      <div className="overflow-x-auto rounded-lg border border-border/60 bg-background/80 pr-20 text-xs leading-relaxed">
        {language ? (
          <SyntaxHighlighter
            language={language}
            style={syntaxTheme}
            customStyle={{
              margin: 0,
              padding: '0.875rem',
              backgroundColor: 'transparent',
              fontSize: '0.75rem',
              lineHeight: '1.625',
            }}
          >
            {code}
          </SyntaxHighlighter>
        ) : (
          <pre className="p-3.5 font-code"><code>{code}</code></pre>
        )}
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={onCopy}
        className="absolute right-2.5 top-2.5 h-7 gap-1 px-2.5 text-[11px] font-mono border-border/70 bg-card/80 hover:bg-muted"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
        <span>{copied ? copiedLabel : copyLabel}</span>
      </Button>
    </div>
  );
}

export default function McpPage() {
  const { currentLocale } = useLanguage();
  const { toast } = useToast();
  const t = T[currentLocale] || T.en;

  const [endpoint, setEndpoint] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [info, setInfo] = useState<{ version: string; tools: number } | null>(null);
  const [copiedEndpoint, setCopiedEndpoint] = useState(false);
  const [activeTab, setActiveTab] = useState<ClientTab>('cursor');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      setEndpoint(`${origin}/api/mcp`);
    }
  }, []);

  const testConnection = async () => {
    if (!endpoint) return;
    setStatus('testing');
    try {
      const res = await fetch('/api/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { clientInfo: { name: 'ui', version: '1' } } }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const version = data.result?.protocolVersion || '2024-11-05';
      const toolsRes = await fetch('/api/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} }),
      });
      const toolsData = toolsRes.ok ? await toolsRes.json() : null;
      const count = Array.isArray(toolsData?.result?.tools) ? toolsData.result.tools.length : MCP_TOOLS.length;
      setInfo({ version, tools: count });
      setStatus('online');
    } catch {
      setStatus('error');
    }
  };

  useEffect(() => {
    if (endpoint) testConnection();
  }, [endpoint]);

  const copyEndpointUrl = async () => {
    if (!endpoint) return;
    try {
      await navigator.clipboard.writeText(endpoint);
      setCopiedEndpoint(true);
      setTimeout(() => setCopiedEndpoint(false), 1500);
      toast({ title: t.copied });
    } catch {
      // ignore
    }
  };

  const snippetHttp = useMemo(
    () => `{
  "mcpServers": {
    "rovex": {
      "url": "${endpoint}"
    }
  }
}`,
    [endpoint]
  );

  const snippetStdio = useMemo(
    () => `{
  "mcpServers": {
    "rovex": {
      "command": "npx",
      "args": ["mcp-remote", "${endpoint}"]
    }
  }
}`,
    [endpoint]
  );

  const snippetCli = useMemo(() => `claude mcp add --transport http rovex ${endpoint}`, [endpoint]);

  const snippetCodex = useMemo(
    () => `codex mcp add rovex --url ${endpoint} && codex mcp list`,
    [endpoint]
  );

  const snippetOpenCode = useMemo(
    () => `{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "rovex": {
      "type": "remote",
      "url": "${endpoint}"
    }
  }
}`,
    [endpoint]
  );

  const toolDesc = (name: string, fallback: string) => MCP_TOOL_I18N[name]?.[currentLocale] ?? MCP_TOOL_I18N[name]?.en ?? fallback;
  const skillDesc = (id: string, fallback: string) => MCP_SKILL_I18N[id]?.[currentLocale] ?? MCP_SKILL_I18N[id]?.en ?? fallback;

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-[1400px] mx-auto">
      {/* cabecalho executivo */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="font-headline text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {t.title}
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-primary/10 text-primary border border-primary/20">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              RPC 2.0 PROTOCOL
            </span>
          </div>
          <p className="text-xs text-muted-foreground max-w-3xl">{t.subtitle}</p>
        </div>
      </div>

      {/* card de status do endpoint */}
      <Card className="rounded-xl border border-border/60 bg-card/50 backdrop-blur-sm p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase text-muted-foreground font-semibold">{t.endpoint}</span>
            <div className="flex items-center gap-2">
              <code className="rounded-lg border border-border/70 bg-background px-3 py-1.5 font-mono text-xs text-foreground select-all break-all">
                {endpoint || 'http://127.0.0.1:1400/api/mcp'}
              </code>
              <Button size="sm" variant="outline" onClick={copyEndpointUrl} className="h-8 px-2.5 text-xs font-mono border-border/70 shrink-0">
                {copiedEndpoint ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {status === 'online' && info && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-primary/10 text-primary border border-primary/25">
                <CheckCircle className="h-3.5 w-3.5" />
                {t.online} ({info.tools} tools)
              </span>
            )}
            {status === 'error' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-destructive/10 text-destructive border border-destructive/25">
                <AlertCircle className="h-3.5 w-3.5" />
                {t.offline}
              </span>
            )}
            <Button size="sm" variant="outline" onClick={testConnection} disabled={status === 'testing'} className="h-8 text-xs font-mono border-border/70">
              {status === 'testing' ? t.testing : t.test}
            </Button>
          </div>
        </div>
      </Card>

      {/* perfil de conexao com abas interativas */}
      <Card className="rounded-xl border border-border/60 bg-card/50 backdrop-blur-sm p-5 sm:p-6">
        <div className="mb-4">
          <h2 className="font-semibold text-base text-foreground">{t.connectTitle}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{t.connectDesc}</p>
        </div>

        {/* seletor de abas de cliente */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-lg bg-background/80 border border-border/60 w-fit mb-4">
          {[
            { id: 'cursor', label: t.clientCursor },
            { id: 'claudeDesktop', label: t.clientClaudeDesktop },
            { id: 'claudeCli', label: t.clientClaudeCli },
            { id: 'codex', label: t.clientCodex },
            { id: 'opencode', label: t.clientOpenCode },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ClientTab)}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                activeTab === tab.id
                  ? 'bg-primary/15 text-primary font-semibold shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* snippet de codigo correspondente */}
        <div>
          {activeTab === 'cursor' && (
            <CodeBlock code={snippetHttp} copyLabel={t.copy} copiedLabel={t.copied} language="json" />
          )}
          {activeTab === 'claudeDesktop' && (
            <CodeBlock code={snippetStdio} copyLabel={t.copy} copiedLabel={t.copied} language="json" />
          )}
          {activeTab === 'claudeCli' && (
            <CodeBlock code={snippetCli} copyLabel={t.copy} copiedLabel={t.copied} language="bash" />
          )}
          {activeTab === 'codex' && (
            <CodeBlock code={snippetCodex} copyLabel={t.copy} copiedLabel={t.copied} language="bash" />
          )}
          {activeTab === 'opencode' && (
            <CodeBlock code={snippetOpenCode} copyLabel={t.copy} copiedLabel={t.copied} language="json" />
          )}
        </div>
      </Card>

      {/* grid bento: ferramentas e instrucoes */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* catalogo de ferramentas */}
        <Card className="rounded-xl border border-border/60 bg-card/50 backdrop-blur-sm p-5 sm:p-6">
          <div className="mb-3.5 pb-2 border-b border-border/40">
            <h3 className="font-semibold text-sm text-foreground">{t.toolsTitle}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{t.toolsDesc}</p>
          </div>
          <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
            {MCP_TOOLS.map((tool) => (
              <div key={tool.name} className="p-2.5 rounded-lg bg-background/50 border border-border/40">
                <code className="font-mono text-xs font-semibold text-primary block">{tool.name}</code>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {toolDesc(tool.name, tool.description)}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* playbooks e fluxo */}
        <Card className="rounded-xl border border-border/60 bg-card/50 backdrop-blur-sm p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="mb-3.5 pb-2 border-b border-border/40">
              <h3 className="font-semibold text-sm text-foreground">{t.skillsTitle}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{t.skillsDesc}</p>
            </div>
            <div className="space-y-2.5 mb-5">
              {MCP_SKILLS.map((skill) => (
                <div key={skill.id} className="p-2.5 rounded-lg bg-background/50 border border-border/40">
                  <code className="font-mono text-xs font-semibold text-foreground block">{skill.id}</code>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {skillDesc(skill.id, skill.description)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-muted/20 border border-border/50 text-[11px] text-muted-foreground leading-relaxed">
            {t.note}
          </div>
        </Card>
      </div>
    </div>
  );
}
