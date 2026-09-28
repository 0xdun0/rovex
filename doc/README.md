# Rovex Platform Documentation

Welcome to the official technical documentation for **Rovex**, a modern, free, and self-hosted offensive security reporting platform designed for ethical hackers, penetration testers, and cybersecurity consulting teams.

---

## Documentation Structure

This documentation suite is organized into core architectural blueprints and operational guides:

### Core Architecture & Engineering Blueprints

1. **[01. System Overview](01-system-overview.md)**
   - Mission and core problem statement.
   - Architectural paradigm: Modular Monolith vs. Microservices vs. Serverless.
   - Core capabilities and comparison with proprietary reporting solutions.

2. **[02. Technology Stack](02-technology-stack.md)**
   - Frontend: Next.js 15 App Router, React 19, TypeScript, Tailwind CSS, Radix UI.
   - Backend: Route Handlers, Node.js 22 runtime, native DOCX AST compilation.
   - Storage Architecture: Local-First hybrid (IndexedDB, LocalStorage, Atomic Server JSON with `.bak` rotation).
   - Infrastructure & Packaging: Docker multi-stage builds, non-root execution, runner orchestration.

3. **[03. Data Flow & Components](03-data-flow-components.md)**
   - Data Ingestion: Manual input, template inheritance, Markdown parsers.
   - Internal Processing: AST transformation pipeline, dynamic HSL token compilation, CVSS v3.1 scoring.
   - Virtual Assistant & AI Integration: Model Context Protocol (MCP) server architecture, streamable HTTP transport, and token-efficient on-demand skills.

4. **[04. Security Pillars (Security by Design)](04-security-pillars.md)**
   - Access Control: PBKDF2/SHA-256 local credential hashing, session barriers, role management.
   - Data Protection: Zero-telemetry posture, payload isolation, at-rest persistence hygiene.
   - Server & Runtime Isolation: Containerization boundaries, sandboxed preview iframes, unprivileged user permissions.

5. **[05. Operation & Maintenance](05-operation-maintenance.md)**
   - Observability & Monitoring: HTTP healthcheck probes, structured Docker logging, memory profile tracking.
   - Release & Deployment Lifecycle: BuildKit zero-downtime swaps, validation checklists.
   - Disaster Recovery & Resilience: Atomic write guarantees, complete JSON backup and restoration.

---

### Operational & User Manuals

- **[Get Started](get-started.md)**: First-time setup, environment prerequisites, Docker deployment, and generating your first report in under 5 minutes.
- **[User Guide](user-guide.md)**: Managing audit targets, initializing projects, tracking `[TODO]` items, curating technical findings, and theme personalization.
- **[Resources](resources.md)**: MCP endpoints reference, CVSS v3.1 vector calculation tables, Word DOCX formatting schemas, and API integration examples.
