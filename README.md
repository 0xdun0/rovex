<div align="center">

# ROVEX

### Segurança Ofensiva. Local. Privada. Sob Seu Controle.
### Offensive Security. Local. Private. Under Your Control.
### Seguridad Ofensiva. Local. Privada. Bajo Tu Control.

[![Version](https://img.shields.io/badge/version-2.5.0-10b981.svg?style=flat-square)](CHANGELOG.md)
[![License](https://img.shields.io/badge/license-MIT-3b82f6.svg?style=flat-square)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg?style=flat-square)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg?style=flat-square)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D22.13-339933.svg?style=flat-square)](https://nodejs.org/)
[![MCP](https://img.shields.io/badge/MCP-Native%20Server-purple.svg?style=flat-square)](https://modelcontextprotocol.io/)
[![Zero Telemetry](https://img.shields.io/badge/Privacy-100%25%20Local--First-emerald.svg?style=flat-square)](#)

<br />

<img src="public/screenshots/banner.png" alt="Rovex Platform Overview" width="100%" />

<br /><br />

<table border="0" width="100%" cellspacing="0" cellpadding="6">
  <tr>
    <td width="50%" align="center" valign="top">
      <img src="public/screenshots/project-explorer.png" alt="Project Explorer Master-Detail" width="100%" />
      <br />
      <sub><b>Project Explorer</b> — Navegação Master-Detail minimalista, painel contextual de métricas e filtros por tipo.</sub>
    </td>
    <td width="50%" align="center" valign="top">
      <img src="public/screenshots/evidence-vault.png" alt="Evidence Vault & CVSS Telemetry" width="100%" />
      <br />
      <sub><b>Evidence Vault</b> — Catálogo de vulnerabilidades com trilho lateral de telemetria CVSS v3.1 e preview Markdown.</sub>
    </td>
  </tr>
  <tr>
    <td width="50%" align="center" valign="top">
      <img src="public/screenshots/mcp.png" alt="Model Context Protocol (MCP) Server" width="100%" />
      <br />
      <sub><b>AI Native (MCP Server)</b> — Conexão direta com agentes autônomos (Claude Code, Cursor, OpenCode) para relatórios em streaming.</sub>
    </td>
    <td width="50%" align="center" valign="top">
      <img src="public/screenshots/doc.png" alt="Interactive Documentation Hub" width="100%" />
      <br />
      <sub><b>Documentation Hub</b> — Central técnica integrada na interface com busca rápida Command ⌘ e blueprints.</sub>
    </td>
  </tr>
</table>

<br />

**[Documentação Técnica Completa / Full Technical Documentation](doc/README.md)**  
**Hub Interativo no App (Doc):** `http://127.0.0.1:1400/report/e3b8a1c9f4d27e5a`

</div>

---

## Índice / Table of Contents / Índice General

1. [:brazil: Português (Brasil)](#-português-brasil)
   - [Visão Geral](#visão-geral)
   - [Principais Recursos](#principais-recursos)
   - [Requisitos Mínimos](#requisitos-mínimos)
   - [Instalação & Execução Rápida](#instalação--execução-rápida)
   - [Execução via Docker](#execução-via-docker)
2. [:us: English](#-english)
   - [System Overview](#system-overview)
   - [Key Highlights](#key-highlights)
   - [Minimum Requirements](#minimum-requirements)
   - [Quick Start & Deployment](#quick-start--deployment)
   - [Docker Deployment](#docker-deployment)
3. [:es: Español](#-español)
   - [Visión General](#visión-general)
   - [Capacidades Principales](#capacidades-principales)
   - [Requisitos Mínimos](#requisitos-mínimos-1)
   - [Instalación & Inicio Rápido](#instalación--inicio-rápido)
   - [Despliegue con Docker](#despliegue-con-docker)

---

## :brazil: Português (Brasil)

### Visão Geral

O **Rovex** é uma plataforma gratuita, soberana e local para criação de relatórios de pentest e writeups técnicos, com gerenciamento integrado de vulnerabilidades.

Voltada para consultorias de segurança ofensiva, equipes de Red Team e pesquisadores independentes, a plataforma adota uma arquitetura **100% Local-First e zero telemetria**, mantendo dados, evidências, provas de conceito e escopos de clientes no ambiente do usuário, sem envio ou processamento por serviços externos.

O Rovex combina criação de documentação técnica, gerenciamento de vulnerabilidades, cálculo de severidade, exportação profissional e integração nativa com agentes de IA através do **Model Context Protocol (MCP)**.

### Principais Recursos

- **Pentests & Writeups**: suporte nativo aos dois fluxos de trabalho, com templates dedicados e identificadores semânticos padronizados.
- **Privacidade Soberana & Zero Telemetria**: execução local em Node.js ou container Docker, sem dependência de serviços externos para armazenamento dos dados da plataforma.
- **Editor Markdown por Seções**: modos `Split`, `MD` e `Preview`, com redimensionamento dinâmico e rastreador ativo de tarefas no formato `[TODO: ...]`.
- **Calculadora Automatizada CVSS v3.1**: cálculo vetorial de pontuação base, impacto e exploitabilidade, com representação visual de severidade.
- **Gerenciamento de Vulnerabilidades**: organização de findings, evidências e informações técnicas dentro dos projetos.
- **Exportação Multi-Formato Profissional**:
  - **Word Corporativo (`.docx`)**: compilação AST OOXML nativa com capa executiva, sumário dinâmico e tabelas nativas.
  - **PDF Executivo**: regras CSS `@page` em tamanho A4 com controle rigoroso de quebras de página.
  - **HTML Autocontido & Markdown**: arquivos independentes com estilos incorporados, prontos para apresentação e compartilhamento.
- **IA Nativa (MCP Server)**: servidor HTTP integrado com 14 ferramentas operacionais e 5 playbooks sob demanda (`rovex-reports`, `structure`, `findings`, `cvss`, `import`) para integração com Claude Code, Cursor e OpenCode.
- **Central Técnica de Documentação (`Doc`)**: hub interativo integrado à interface, com busca rápida pelo atalho Command `⌘`, dicionário de variáveis e blueprints de arquitetura.
- **Execução Local e Self-Hosted**: o ambiente pode ser executado diretamente com Node.js/pnpm ou através de Docker.

### Requisitos Mínimos

- **Sistema Operacional:** Linux (Ubuntu 22.04 LTS ou superior recomendado), macOS ou Windows via WSL2.
- **Ambiente Local:** Node.js `>= 22.13` e pnpm `>= 9.0`.
- **Ambiente em Container:** Docker `>= 24.0` ou Docker Desktop.
- **Hardware:** mínimo de 2 GB de memória RAM livre e 500 MB de espaço em disco.

### Instalação & Execução Rápida

#### 1. Clonar o repositório

```bash
git clone https://github.com/0xdun0/rovex.git
cd rovex
```

#### 2. Instalar as dependências

```bash
pnpm install
```

#### 3. Iniciar o ambiente de desenvolvimento

```bash
pnpm dev
```

Acesse no navegador:

```text
http://127.0.0.1:1400
```

Para acessar a partir de outro dispositivo na mesma rede:

```text
http://<seu-ip-local>:1400
```

Exemplo:

```text
http://192.168.15.103:1400
```

#### Execução alternativa

O projeto também pode ser iniciado através do script orquestrador:

```bash
python3 app.py
```

### Execução via Docker

O Rovex também pode ser executado em container:

```bash
docker run -d \
  -p 1400:3000 \
  --name rovex \
  ghcr.io/0xdun0/rovex:latest
```

Após iniciar o container, acesse:

```text
http://127.0.0.1:1400
```

O mapeamento `1400:3000` mantém a porta externa `1400` utilizada pelo ambiente local, enquanto a aplicação é executada internamente na porta `3000` do container.

---

## :us: English

### System Overview

**Rovex** is a free, sovereign, self-hosted platform for generating pentest reports and technical writeups, with integrated vulnerability management.

Designed for offensive security consultancies, Red Teams, and independent researchers, the platform follows a **100% Local-First and zero-telemetry** architecture, keeping findings, evidence, proof-of-concepts, and client scopes within the user's environment without sending or processing them through external services.

Rovex combines technical documentation, vulnerability management, severity calculation, professional document export, and native AI-agent integration through the **Model Context Protocol (MCP)**.

### Key Highlights

- **Pentests & Writeups**: dedicated workflows for commercial security engagements and CTF/lab writeups, with standardized semantic IDs.
- **Strict Data Sovereignty & Zero Telemetry**: local execution through Node.js or Docker, without relying on external cloud services for platform data.
- **Sectional Markdown Block Editor**: `Split`, `MD`, and `Preview` modes with adjustable dividers and active `[TODO: ...]` task tracking.
- **Automated CVSS v3.1 Engine**: vector-based calculation of base, impact, and exploitability scores with visual severity representation.
- **Vulnerability Management**: organization of findings, evidence, and technical information within projects.
- **Multi-Format Publication Exporters**:
  - **Native Word (`.docx`)**: custom AST/OOXML compilation with executive cover, dynamic table of contents, and native tables.
  - **Printable PDF**: high-precision CSS `@page` A4 styling with controlled page breaks.
  - **Standalone HTML & Markdown**: self-contained files with embedded styles, ready for presentation and sharing.
- **Native AI (MCP Server)**: integrated HTTP server exposing 14 operational tools and 5 on-demand playbooks (`rovex-reports`, `structure`, `findings`, `cvss`, `import`) for Claude Code, Cursor, and OpenCode.
- **Interactive Documentation Hub (`Doc`)**: built-in technical reference portal with Command `⌘` search, variable schemas, and architectural blueprints.
- **Local & Self-Hosted Execution**: run the platform directly with Node.js/pnpm or through Docker.

### Minimum Requirements

- **OS:** Linux (Ubuntu 22.04 LTS+ recommended), macOS, or Windows via WSL2.
- **Local Environment:** Node.js `>= 22.13` and pnpm `>= 9.0`.
- **Container Environment:** Docker `>= 24.0` or Docker Desktop.
- **Hardware:** at least 2 GB of available RAM and 500 MB of disk space.

### Quick Start & Deployment

#### 1. Clone the repository

```bash
git clone https://github.com/0xdun0/rovex.git
cd rovex
```

#### 2. Install dependencies

```bash
pnpm install
```

#### 3. Launch the development environment

```bash
pnpm dev
```

Open in your browser:

```text
http://127.0.0.1:1400
```

To access the application from another device on the same network:

```text
http://<your-local-ip>:1400
```

Example:

```text
http://192.168.15.103:1400
```

### Docker Deployment

Rovex can also be launched as a Docker container:

```bash
docker run -d \
  -p 1400:3000 \
  --name rovex \
  ghcr.io/0xdun0/rovex:latest
```

Then open:

```text
http://127.0.0.1:1400
```

The `1400:3000` mapping exposes the application on port `1400` on the host while the application runs internally on port `3000` inside the container.

---

## :es: Español

### Visión General

**Rovex** es una plataforma gratuita, soberana y local para la creación de informes de pentest y writeups técnicos, con gestión integrada de vulnerabilidades.

Diseñada para consultoras de ciberseguridad ofensiva, equipos de Red Team e investigadores independientes, la plataforma utiliza una arquitectura **100% Local-First y cero telemetría**, manteniendo los hallazgos, evidencias, pruebas de concepto y alcances de clientes dentro del entorno del usuario, sin enviarlos ni procesarlos mediante servicios externos.

Rovex combina documentación técnica, gestión de vulnerabilidades, cálculo de severidad, exportación profesional e integración nativa con agentes de IA mediante el **Model Context Protocol (MCP)**.

### Capacidades Principales

- **Pentests & Writeups**: flujos de trabajo dedicados para auditorías comerciales de seguridad y writeups de laboratorios/CTF, con identificadores semánticos estandarizados.
- **Privacidad Soberana y Cero Telemetría**: ejecución local mediante Node.js o Docker, sin depender de servicios externos para los datos de la plataforma.
- **Editor Markdown por Secciones**: modos `Split`, `MD` y `Preview`, con divisores ajustables y seguimiento activo de tareas `[TODO: ...]`.
- **Motor Automatizado CVSS v3.1**: cálculo vectorial de puntuaciones base, impacto y explotabilidad con representación visual de severidad.
- **Gestión de Vulnerabilidades**: organización de hallazgos, evidencias e información técnica dentro de los proyectos.
- **Exportación Multi-Formato Profesional**:
  - **Microsoft Word (`.docx`)**: compilación AST/OOXML con portada ejecutiva, índice dinámico y tablas nativas.
  - **PDF Ejecutivo**: estilos CSS `@page` en tamaño A4 con control de saltos de página.
  - **HTML Autocontenido y Markdown**: archivos independientes con estilos integrados, listos para presentación y distribución.
- **Servidor MCP Nativo**: servidor HTTP integrado con 14 herramientas operativas y 5 playbooks bajo demanda (`rovex-reports`, `structure`, `findings`, `cvss`, `import`) para Claude Code, Cursor y OpenCode.
- **Centro Técnico de Documentación (`Doc`)**: portal técnico integrado con búsqueda rápida mediante Command `⌘`, referencia de variables y blueprints de arquitectura.
- **Ejecución Local y Self-Hosted**: ejecución directa mediante Node.js/pnpm o mediante Docker.

### Requisitos Mínimos

- **S.O.:** Linux (Ubuntu 22.04 LTS+ recomendado), macOS o Windows mediante WSL2.
- **Entorno Local:** Node.js `>= 22.13` y pnpm `>= 9.0`.
- **Entorno de Contenedores:** Docker `>= 24.0` o Docker Desktop.
- **Hardware:** mínimo 2 GB de RAM disponible y 500 MB de espacio en disco.

### Instalación & Inicio Rápido

#### 1. Clonar el repositorio

```bash
git clone https://github.com/0xdun0/rovex.git
cd rovex
```

#### 2. Instalar dependencias

```bash
pnpm install
```

#### 3. Iniciar el entorno de desarrollo

```bash
pnpm dev
```

Abrir en el navegador:

```text
http://127.0.0.1:1400
```

Para acceder desde otro dispositivo de la misma red:

```text
http://<tu-ip-local>:1400
```

Ejemplo:

```text
http://192.168.15.103:1400
```

### Despliegue con Docker

Rovex también puede ejecutarse como un contenedor Docker:

```bash
docker run -d \
  -p 1400:3000 \
  --name rovex \
  ghcr.io/0xdun0/rovex:latest
```

Después, abrir:

```text
http://127.0.0.1:1400
```

El mapeo `1400:3000` expone la aplicación en el puerto `1400` del equipo mientras la aplicación se ejecuta internamente en el puerto `3000` del contenedor.

---

<div align="center">

<sub>Desenvolvido com excelência por <b>0xdun0</b> • Rovex Offensive Security Suite</sub>

</div>
