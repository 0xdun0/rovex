# 02. Technology Stack — Rovex

Rovex is built with modern, battle-tested web and systems engineering technologies selected for maximum speed, strict type safety, visual elegance, and seamless self-hosting.

---

## 1. Interface (Frontend)

The presentation layer is engineered for rapid interaction, smooth typography, and executive visual appeal.

| Technology | Role & Architecture Details |
|---|---|
| **Next.js 15 (App Router)** | Full-stack React framework providing hybrid Server Components and Client Components, optimized static routing, and sub-second asset hydration. |
| **React 19 & TypeScript 5** | Core declarative UI library coupled with strict compile-time type verification, eliminating runtime property errors across complex report trees. |
| **Tailwind CSS & CSS Custom Properties** | Utility-first styling engine coupled with semantic HSL channel variables (`hsl(var(--token))`). Enables instantaneous theme swapping without CSS recalculation. |
| **Radix UI Primitives** | Unstyled, fully accessible interactive components (Dialogs, Dropdowns, Accordions, Tabs, Tooltips) providing solid keyboard navigation and focus management. |
| **Phosphor Icons & Lucide** | Cohesive, crisp icon system covering both tactical offensive workflows and executive corporate metaphors. |
| **`react-markdown` & Remark/Rehype** | High-performance Markdown compilation pipeline with GitHub-Flavored Markdown (GFM) tables, autolinks, code highlighting, and sanitized HTML output. |
| **`react-easy-crop`** | Client-side visual image cropper for precision squaring and aspect-ratio alignment of client corporate logos. |

---

## 2. Processing (Backend)

The server and logic layers operate without heavyweight external runtime servers.

| Technology | Role & Architecture Details |
|---|---|
| **Node.js 22 LTS Runtime** | High-throughput JavaScript runtime providing modern ECMAScript support, fast async I/O, and native file system promises. |
| **Next.js Route Handlers** | Modular HTTP endpoint handlers (`/api/mcp`, `/api/state`, `/api/variables`) handling data synchronization and AI assistant commands. |
| **Native Word Engine (`docx`)** | Programmatic OOXML builder that converts Markdown Abstract Syntax Trees (AST) directly into styled `.docx` tables, callouts, headings, and covers without requiring Microsoft Office or LibreOffice binaries. |
| **CVSS Calculator Engine** | Custom deterministic scoring calculator adhering strictly to FIRST.org CVSS v3.1 mathematical vector formulas with sub-millisecond evaluation. |
| **Python 3 Auxiliary Runner (`app.py`)** | Dedicated CLI manager script handling port discovery, local directory bootstrapping, dependency checking, and graceful process lifecycle control. |

---

## 3. Storage (Persistence & Databases)

Rovex employs a **hybrid local-first storage architecture** that combines browser-level zero-latency state with atomic server-side persistence.

```
                      +---------------------------------------+
                      |         Rovex Storage Layers          |
                      +---------------------------------------+
                                    |
            +-----------------------+-----------------------+
            |                                               |
  [Browser Local-First]                          [Server Host Persistence]
  - LocalStorage:                                - ./data/rovex-state.json
    * Clients, Projects, Findings                  (Atomic write + .bak backup)
    * Templates, Themes, Credentials             - ./data/rovex.db
  - IndexedDB (rovex-db):                        - ./uploads/
    * High-res screenshot blobs                    (Branded logos & media)
    * Client branding assets                     - ./logs/
                                                   (Audit & service logs)
```

1. **Browser LocalStorage**:
   - Stores fast metadata: active project list, client targets, findings catalogue, vulnerability library, and UI preferences (theme, language, layout state).
   - Instantaneous read/write with zero network latency.
2. **Browser IndexedDB (`rovex-db`)**:
   - Dedicated key-value object store for evidence screenshots and client branding images.
   - Bypasses the 5MB browser LocalStorage quota, supporting dozens of megabytes of high-resolution evidence per assessment.
3. **Server-Side Atomic JSON (`./data/rovex-state.json`)**:
   - The server maintains a synchronized state file written atomically using a temporary file rename pattern (`temp-write -> fs.rename`).
   - Before overwriting, it automatically preserves the previous version as `./data/rovex-state.json.bak` to prevent data corruption during unexpected power cuts or container halts.
4. **Local Host Volumes (`./uploads`, `./logs`, `./data`)**:
   - Mapped directly into the runtime container, ensuring reports and user databases survive container upgrades and redeployments.

---

## 4. Infrastructure & Packaging

| Component | Implementation |
|---|---|
| **Container Engine** | Docker & Docker Compose compatible. Runs a 3-stage multi-stage build (`deps`, `builder`, `runner`). |
| **Base Image** | Lightweight `node:22-alpine` minimal image (~180MB total final size). |
| **Execution Security** | Executes exclusively as unprivileged user `nextjs` (UID 1001) and group `nodejs` (GID 1001). |
| **Networking** | Default HTTP bind to `0.0.0.0:1400` (accessible via `127.0.0.1` and host LAN IP). Configurable via `HOST_BIND` and `PORT` environment variables. |
| **Automation** | `deploy.sh` script providing automated dependency resolution, live BuildKit progress monitoring, and container health polling. |
