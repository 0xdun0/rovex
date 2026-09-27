# 01. System Overview — Rovex

## Objective & Mission

### The Problem It Solves
Traditional penetration testing reporting is often fragmented, tedious, and error-prone. Security teams frequently struggle with:
1. **Inefficient Tooling**: Cobbling together Microsoft Word templates, LaTeX scripts, or clunky spreadsheet matrices that break formatting upon every copy-paste.
2. **Proprietary Lock-in & High Licensing Costs**: Tools like commercial reporting platforms or paid SaaS tiers impose recurring per-user fees that burden independent consultants and boutique offensive teams.
3. **Data Privacy Concerns**: Cloud-hosted reporting systems introduce third-party risk and compliance violations by transmitting unencrypted vulnerability proof-of-concepts, confidential network diagrams, and client credentials to external infrastructure.
4. **Disjointed Finding Tracking**: Lack of synchronization between high-level executive summaries and technical proof-of-concept evidence, leading to inconsistent CVSS scores and missed remediation guidance.

### The Rovex Solution
**Rovex** was created by **0xdun0** as a **free, modern, sovereign open-source reporting platform**. It gives offensive security firms, internal red teams, and bug bounty hunters a sovereign, self-hosted reporting environment where:
- Reports are composed through a **block-based Markdown editor** with split-screen real-time rendering.
- Findings are treated as **first-class structured records** with automatic CVSS v3.1 calculations and live summary tables.
- Visual presentation matches executive corporate quality through a **customizable HSL theme engine**.
- Single-click export produces pixel-faithful deliverables in **HTML, print-ready PDF, clean Markdown, and fully editable Word (`.docx`)** format with zero layout breakage.
- An embedded **Model Context Protocol (MCP)** server allows modern AI coding agents (Claude Code, Cursor, OpenCode) to assist in report authoring while keeping sensitive data strictly on-premises.

---

## Architectural Approach

Rovex adopts a **Modern Modular Monolith** architecture, strategically chosen over microservices or serverless models to guarantee zero-latency execution, simplified deployment, and maximum operational privacy.

```mermaid
graph TD
    Client["Browser Client (React 19 / Next.js Client Layer)"] -->|HTTP / React SSR| NextServer["Next.js 15 Monolithic Server"]
    NextServer -->|Internal Route Handlers| API["API Layer (/api/mcp, /api/state, /api/variables)"]
    API -->|Atomic Disk I/O| LocalStorageFiles["Data Store (JSON State + Atomic .bak Backup)"]
    Client -->|Local First| BrowserDB["Browser Persistence (LocalStorage + IndexedDB Images)"]
    AI["AI Agents (Claude / Cursor / OpenCode)"] -->|MCP Streamable HTTP (POST /api/mcp)| API
```

### Why a Modular Monolith?
- **Zero Network Overhead**: Pentest reports contain dozens of megabytes of evidence screenshots, terminal dumps, and network graphs. Distributing this data across multiple microservices introduces unnecessary RPC latency, serialization overhead, and network partition risks.
- **Trivial Self-Hosting**: A security tool must be deployable in air-gapped environments, on local laptops during on-site assessments, or within a private company VPS in seconds. A single container (`docker run`) or simple process (`pnpm dev` / `python3 app.py`) provides the entire platform.
- **Predictable Local-First State**: By coupling client-side hydration with server-side atomic persistence, the user experiences instantaneous typing and split-screen rendering without waiting for round-trip database queries.
- **No Third-Party Cloud Dependability**: Serverless architectures introduce cold starts, vendor lock-in (AWS Lambda, Vercel Functions), and data exfiltration vectors. Rovex runs anywhere Linux and Docker run.

---

## High-Level Capabilities Matrix

| Dimension | Proprietary Security Tools | Rovex Platform |
|---|---|---|
| **Cost** | Commercial license / per-seat recurring fee | **100% Free & Open Source** |
| **Hosting Model** | Often cloud SaaS or complex multi-container setup | **Self-hosted, single Docker container or lightweight Node process** |
| **Editor** | Web editor with limited formatting flexibility | **Block Markdown with Split/MD/Preview and drag-resize** |
| **Task Tracking** | External ticketing or separate modules | **Native `[TODO: ...]` tracking with direct UI anchor links** |
| **Docx Exporter** | Basic or template-restricted | **Custom AST-driven OOXML engine with real cover and brand lockup** |
| **AI Integration** | Closed proprietary AI or none | **Native Model Context Protocol (MCP) server with 5 modular skills** |
| **Data Privacy** | Subject to third-party terms | **Absolute zero-telemetry, local-first storage** |
| **Author** | Corporate entity | **0xdun0** |

---

## Estrutura de Rotas e Identificadores de Projeto

### Convenção de URL `/report/[template]/[id]`
A URL canônica de acesso e edição de relatórios segue a arquitetura:
```
/report/[template]/[id]
```
- **`[template]`**: define o **estilo e motor de apresentação visual** do relatório (ex: estilo Writeup vs Relatório Executivo Profissional de Pentest).
- **`[id]`**: é a **chave interna única** do projeto persistido no banco de dados local. Trata-se de um identificador técnico de integridade referencial que não requer estética visual na barra de endereços.

### Padrão de Nomenclatura de IDs
Novos projetos criados no Rovex recebem identificadores padronizados:
- **Laboratórios e Writeups (`writeup`)**: `proj-writeup-<nome>-<ano>` (ex: `proj-writeup-haze-2026`).
- **Auditorias e Pentests (`pentest`)**: `proj-pentest-<cliente>-<ano>` (ex: `proj-pentest-acme-2026`).
- Projetos de writeup seguem o padrão `proj-writeup-<nome>-<ano>` (ex: `proj-writeup-haze-2026`, com redirect transparente do identificador legado `proj-htb-haze`).
- Projetos legados corporativos mantêm seus identificadores existentes (ex: `proj-htb-cpts`), assegurando compatibilidade retroativa total.
