# User Guide — Rovex Security Platform

A comprehensive operational manual covering all platform features for security auditors, red teamers, and report reviewers.

---

## 1. Metrics & Operational Dashboard (`Metrics`)

The home screen provides real-time situational awareness across all active and archived assessments:
- **Project Pipeline**: Overview of projects categorized by status (`Draft`, `In Review`, `Delivered`, `Archived`).
- **Severity Distribution**: Live aggregate pie and bar charts reflecting the distribution of Critical, High, Medium, Low, and Informational vulnerabilities across your client engagements.
- **Top Vulnerability Trends**: Identifies repeated weaknesses (e.g. Broken Object Level Authorization, Weak Kerberos Encryption) observed across targets.

---

## 2. Managing Audit Targets (`Targets` / Recon & Scope Explorer)

Targets represent client organizations, scopes, or subsidiaries undergoing assessment.
- **Master-Detail Navigation**: Vertical scope list on the left with instant status/audit telemetry on the right-hand Inspector pane.
- **Brand Lockup Customization**:
  - **Square Avatar**: Used within internal dashboard cards and table rows.
  - **Horizontal Header Logo**: Used as the primary banner on exported Word (`.docx`) and PDF report covers.
- **Client Metadata**: Record legal names, primary points of contact, assessment boundaries, emergency notification channels, and directly linked audit history.

---

## 3. Projects & Sectional Block Editor (`Projects` / Project Explorer)

Rovex provides an elite **Master-Detail Project Explorer** coupled with a **Sectional Markdown Block Editor** for rapid authoring without layout glitches.

### Project Classification & Semantic IDs
- **Engagement Types**:
  - `writeup`: Dedicated to CTFs, HackTheBox/TryHackMe challenges, labs, and research writeups.
  - `pentest`: Structured for client assessments, regulatory engagements, and commercial red team operations.
- **Standardized Semantic IDs**:
  - Writeups: `proj-writeup-<name>-<year>` (e.g. `proj-writeup-haze-2026`).
  - Pentests: `proj-pentest-<client>-<year>` (e.g. `proj-pentest-acme-2026`).
  - **Backward-Compatible Alias Engine**: Legacy routes (such as `proj-htb-haze`) automatically redirect via server HTTP 308 to their canonical identifier without breaking bookmarks or findings.

### Master-Detail Explorer
- **Left Panel**: Ultra-minimalist vertical operational list displaying project title, client, type badge (`Writeup` / `Pentest`), date, and language tag. Includes filter pills (`All`, `Writeups`, `Pentests`).
- **Right Contextual Inspector**: Deep metadata inspector displaying operational quick tiles, active findings count, word count, audit lifecycle tracker, and one-click actions (Open Editor, View Report, Export, Delete).

### Editing Modes
Each section block offers three view states selectable via the top toolbar:
- **`Split` Mode**: Left-hand raw Markdown editor with a right-hand synchronized live preview. A draggable dividing bar allows you to allocate space as needed.
- **`MD` Mode**: Full-width Markdown editing for focused writing.
- **`Preview` Mode**: Rendered view simulating the exact layout and typography of the final report.

### Heading Hierarchy
The editor strictly parses headings to establish block boundaries:
- `#` (H1) and `##` (H2): Create top-level editable cards in the interface.
- `###` (H3) and `####` (H4): Remain nested within the parent block, suitable for sub-topics and technical step-by-step notes.

---

## 4. `[TODO: ...]` Task Tracking

Never miss an incomplete section or placeholder prior to client delivery:
- Place uppercase `[TODO: Insert Wireshark pcap here]` markers anywhere in your Markdown body.
- The platform automatically detects and styles these tags with an attention-grabbing red accent.
- In report preview mode, TODO tags become **clickable hyperlinks** that navigate straight to the exact section requiring operator attention.

---

## 5. Technical Findings & Evidence (`Evidences` / Evidence Vault)

Findings are stored as discrete, queryable records attached to specific projects:
- **Master-Detail Evidence Vault**: Left-side list with search by title, CWE, or target, coupled with an interactive right-hand preview panel for rapid review.
- **Dedicated CVSS Telemetry Rail**: Direct breakdown of Base Score, Exploitability, and Impact metrics without modal disruptions.
- **Title & Overview**: Concise, executive-friendly description of the weakness.
- **CVSS v3.1 Vector Calculator**: Interactive metric sliders (Attack Vector, Complexity, Privileges Required, User Interaction, Scope, Confidentiality, Integrity, Availability) that compute base scores in real-time.
- **Evidence Formatting**: Dedicated fields for technical steps to reproduce, terminal session logs, and proof-of-concept screenshots.
- **Remediation Plan**: Prescribed fixes categorized by short-term mitigations and long-term strategic architectural changes.

---

## 6. Vulnerability Database (+100 Templates)

Rovex includes a built-in library of over 100 bilingual vulnerability templates based on industry standards (OWASP Top 10, CWE, WSTG):
- Pre-populated technical descriptions, standard CVSS scores, remediation recommendations, and authoritative references (NIST, MITRE).
- Searchable by keywords, tags, or vulnerability IDs.
- Importing an advisory copies the text into your project finding, allowing you to tailor the specific evidence while retaining standard advisory wording.

---

## 7. Report Theme Customization (`Themes`)

Tailor the presentation of your reports to match corporate style guidelines:
- **Built-In Themes**:
  - *Emerald Executive* (Default Rovex aesthetic: deep obsidian background with tactical emerald accents).
  - *Dark Slate* (Professional navy and slate blue tones).
  - *Carbon* (Monochromatic high-contrast dark theme).
  - *Sunrise* (Clean executive light palette for corporate board presentations).
  - *Forensic Mono* (Terminal-inspired monospace typography for technical teardowns).
- **Custom Typography**: Select from 30+ curated Google Fonts with automated fallback stacks.
- **Theme JSON Import/Export**: Share branded themes across your security team via standard JSON configuration files.

---

## 8. Export Formats

When your assessment is complete, generate deliverables from the top action bar:
1. **Word (`.docx`)**: Generates native Microsoft Word documents with full formatting fidelity, client covers, tables of contents, and colored severity badges. Completely editable by non-technical stakeholders.
2. **Printable PDF**: High-resolution paged layout formatted for standard A4 paper with automated page numbers and clean headers/footers.
3. **Standalone HTML**: Single self-contained HTML file with embedded styling, ideal for secure digital delivery or client web portals.
4. **Markdown Export**: Plain GitHub-Flavored Markdown for storing inside Git repositories or ticketing systems.
