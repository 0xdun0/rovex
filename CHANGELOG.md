# Changelog

All notable changes to the **Rovex** platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.5.0] — 2026-09-27

### Added
- **Project Classification & Semantic IDs**:
  - Support for `type: "writeup" | "pentest"` with automatic fallback migration for legacy projects.
  - Standardized identifier schemas: `proj-writeup-<name>-<year>` (Labs/CTFs) and `proj-pentest-<client>-<year>` (Client engagements).
  - Reverse alias mapping and HTTP 308 permanent redirect engine (`PROJECT_ID_ALIASES`), migrating `proj-htb-haze` to `proj-writeup-haze-2026` with complete referential integrity.
- **Elite Matte Master-Detail Interfaces (Zero Neon)**:
  - **Project Explorer** (`/report/9a4f2c1b8e7d3a6e`): Vertical navigation list with contextual right-hand metadata inspector, quick metric tiles, type filter pills (`All`, `Writeups`, `Pentests`), and lifecycle tracking.
  - **Evidence Vault** (`/report/5e1d8c2a9b4f7e3d`): High-efficiency Master-Detail catalog with dedicated CVSS telemetry rail, matte severity chips, and instant Markdown preview.
  - **Target Recon & Scope Explorer** (`/report/7f3a9c2e81d44b6a`): Scopes and client management with live audit history and status indicators.
- **Deep Tri-Lingual Internationalization (i18n)**:
  - Comprehensive English, Brazilian Portuguese, and Spanish coverage across all project templates (`ptpl-1` to `ptpl-5`).
  - Strict language fallback `t[language] ?? t["en"]` eliminating crashes on non-standard locales.
  - Purged hardcoded strings and language leaks in modal dialogs, template pickers, and finding editors.

### Fixed
- Fixed critical `TypeError: reading 'title'` in `VulnerabilityTemplatePicker` caused by locale shorthand mismatches.
- Resolved referential integrity across findings and screenshot assets during project identifier migrations.

---

## [2.4.0] — 2026-09-27

### Added
- Complete Rovex architecture and developer documentation suite under `doc/` and integrated within the application interface.
- New interactive **Documentation Hub** (`Doc`) added to the main navigation sidebar, inspired by modern developer documentation portals with live topic search, quick-filter pills, section guides, and timeline updates.
- Native Model Context Protocol (MCP) server support with updated `rovex` tool and skill namespace (`rovex-reports`, `rovex-report-structure`, `rovex-findings-workflow`, `rovex-cvss-scoring`, `rovex-import`).
- Direct fallback and backward compatibility for local state and database stores.

### Changed
- Complete platform branding consolidated under **Rovex**, created and maintained by **0xdun0**.
- Positioned as a sovereign, modern, free open-source offensive reporting platform for cybersecurity teams.
- All internal code comments standardized to concise, human-style Brazilian Portuguese.
- Cleaned all legacy references and aligned configuration across `package.json`, `app.py`, `deploy.sh`, and Dockerfiles.

---

## [2.0.0] — 2026-05-16

### Added
- Section-based report editor with full-width editable markdown blocks.
- `Split`, `MD`, and `Preview` view modes for each report block.
- Resizable split-pane editing with dynamic drag dividers.
- Markdown formatting toolbar for bold, italic, inline/block code, and lists.
- Full tracking for uppercase `[TODO: ...]` items:
  - Highlighted with red accent styling inside the Markdown editor.
  - Highlighted in live report previews.
  - Direct hyperlinks from preview back to the corresponding editable section.
- Shared detection and rendering utilities in `src/lib/todo-utils.ts`.
- Reusable sectional Markdown editor shared across reports, finding details, project templates, and vulnerability templates.
- Complete iconography migration to Phosphor Icons.
- Icon previews in project and template selectors.
- Live Docker build progress indicator in `deploy.sh`, showing elapsed time, cached steps, and active BuildKit steps.

### Changed
- Template and vulnerability imports now parse as editable sections based on first- and second-level Markdown headings (`#` and `##`).
- Markdown parser preserves logical sections rather than splitting content into micro-paragraphs.
- Report HTML preview and standalone HTML export enhanced with improved light and dark readability.
- Report layout features wider reading areas, robust table and code styles, cleaner blockquotes, and red TODO anchors.
- Modernized dropdown and select components with custom focus and hover states.
- Docker persistence mapped to local `./data`, `./uploads`, and `./logs` directories.

### Fixed
- Fixed project editor build issue caused by incomplete JSX ternary syntax.
- Fixed Markdown rendering inside the project editor `Preview` tab.
- Fixed TODO navigation to route directly to active content panels.
