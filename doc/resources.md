# Resources & Developer Reference — Rovex

Technical reference, API endpoint documentation, MCP specifications, and calculation schemas.

---

## 1. Model Context Protocol (MCP) Reference

The Rovex MCP server is exposed at `POST /api/mcp` using Streamable HTTP transport.

### Server Info
- **Server Name**: `rovex`
- **Supported Protocol Versions**: `2025-06-18`, `2025-03-26`, `2024-11-05`
- **Default Protocol**: `2025-06-18`

### Tools Manifest

| Tool Name | Parameters | Description |
|---|---|---|
| `list_skills` | None | Returns list of available on-demand playbooks with metadata. |
| `get_skill` | `id` (string) | Fetches the full Markdown content of a skill (e.g., `rovex-reports`). |
| `list_projects` | None | Enumerates all projects with metadata (ID, title, target, status, language). |
| `get_report` | `projectId` (string) | Retrieves the complete Markdown report body for a project. |
| `create_report` | `name`, `clientId`, `templateId`, `reportBody` | Creates a new assessment project with initial content. |
| `update_report` | `projectId`, `reportBody` | Replaces the entire Markdown report body of a project. |
| `append_to_report` | `projectId`, `markdown` | Appends a section to the end of an existing report body. |
| `list_clients` | None | Lists all registered audit targets. |
| `list_findings` | `projectId` (optional) | Queries findings filtered by assessment project. |
| `get_finding` | `id` (string) | Retrieves full vulnerability finding details and evidence body. |
| `create_finding` | `projectId`, `title`, `severity`, `cvss`, `markdown` | Creates a new structured finding linked to a project. |
| `update_finding` | `id`, fields... | Updates specific fields of a vulnerability finding. |
| `delete_finding` | `id` (string) | Permanently deletes a finding. |
| `list_vulnerabilities` | None | Lists reusable vulnerability advisories from the library. |
| `get_vulnerability` | `id` (string) | Retrieves full bilingual vulnerability entry. |

---

## 2. Template Variables Reference

Place these variables in any report section; Rovex resolves them dynamically during preview and document compilation:

| Variable | Output / Evaluation |
|---|---|
| `{{client.name}}` | Name of the assigned audit target organization. |
| `{{client.contact}}` | Primary contact person or team at target. |
| `{{project.name}}` | Name of the assessment project. |
| `{{project.startDate}}` | Testing start date formatted to locale. |
| `{{project.endDate}}` | Testing completion date formatted to locale. |
| `{{pentester.name}}` | Lead penetration tester / consultant name. |
| `{{vulnerabilities.count}}` | Total count of confirmed findings. |
| `{{vulnerabilities.critical}}` | Count of findings with Critical severity. |
| `{{vulnerabilities.high}}` | Count of findings with High severity. |
| `{{vulnerabilities.medium}}` | Count of findings with Medium severity. |
| `{{vulnerabilities.low}}` | Count of findings with Low severity. |
| `{{vulnerabilities.informational}}` | Count of findings with Informational severity. |
| `{{findings.table}}` | Injects the interactive/printed findings summary table. |
| `{{findings.details}}` | Injects all detailed technical findings in place. |

---

## 3. CVSS v3.1 Scoring & Severity Reference

Rovex adheres to FIRST.org Common Vulnerability Scoring System (CVSS) v3.1 specifications:

| Severity Band | Base Score Range | Typical Exploitation Characteristics |
|---|---|---|
| **Critical** | `9.0 - 10.0` | Remotely exploitable without authentication, leading to complete compromise of confidentiality, integrity, or availability (e.g. unauthenticated RCE, zero-day deserialization). |
| **High** | `7.0 - 8.9` | Remotely or locally exploitable with low privileges, allowing full system access or severe data exfiltration (e.g. SQL injection, domain privilege escalation). |
| **Medium** | `4.0 - 6.9` | Requires specific user interaction or prerequisites; impacts are scoped to sensitive resources (e.g. Stored XSS, CSRF, IDOR). |
| **Low** | `0.1 - 3.9` | Minimal impact or high operational complexity required to exploit (e.g. verbose error logs, missing security headers). |
| **Informational** | `0.0` | Architectural observations, hardening opportunities, or compliance notes without immediate exploitability. |

### Vector String Notation
```
CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H
```
- **AV (Attack Vector)**: Network (`N`), Adjacent (`A`), Local (`L`), Physical (`P`).
- **AC (Attack Complexity)**: Low (`L`), High (`H`).
- **PR (Privileges Required)**: None (`N`), Low (`L`), High (`H`).
- **UI (User Interaction)**: None (`N`), Required (`R`).
- **S (Scope)**: Unchanged (`U`), Changed (`C`).
- **C/I/A (Impact Metrics)**: None (`N`), Low (`L`), High (`H`).
