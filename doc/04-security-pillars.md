# 04. Security Pillars (Security by Design) — Rovex

Because Rovex processes sensitive vulnerability reports, proof-of-concept exploits, and confidential infrastructure data, security was engineered into the foundation rather than bolted on as an afterthought.

---

## 1. Access Control & Authentication

Rovex enforces a strict, defense-in-depth authentication boundary to verify users and protect operational sessions.

```
                          [User Login Attempt]
                                    |
                                    v
                     +------------------------------+
                     |  Username & Password Input   |
                     +------------------------------+
                                    |
                                    v
                     +------------------------------+
                     |  PBKDF2-SHA256 Key Derivation|
                     |  (100,000 iterations + Salt) |
                     +------------------------------+
                                    |
                    +---------------+---------------+
                    |                               |
              [Hash Matches]                 [Hash Mismatches]
                    |                               |
                    v                               v
         [Set Session Token]               [Reject Request]
         [Allow Dashboard Access]          [Increment Delay Timer]
```

### Key Mechanisms:
- **Cryptographic Credential Storage**: Passwords are never stored in plaintext. Rovex uses modern cryptographic key derivation (**PBKDF2 with SHA-256**, 100,000 rounds and unique random salt per user) implemented in `src/lib/password-hash.ts`.
- **First-Run Provisioning Gate**: On first boot, the platform prompts the operator to create an initial administrative user and enforces password complexity evaluation (entropy, character variety, and minimum length).
- **Session Boundary**: Authentication tokens are scoped strictly to the session lifecycle (`sessionStorage`), preventing cross-tab token leaks on shared workstations.
- **Client Route Guards**: Protected dashboard routes under `/report/*` evaluate authentication status prior to rendering sensitive views, immediately redirecting unauthorized requests to the login gateway (`/`).

---

## 2. Data Protection & Cryptographic Hygiene

Offensive security reports contain some of the highest-value data within an enterprise. Rovex protects this data both in transit and at rest.

### Principles:
- **Zero-Telemetry Guarantee**: `NEXT_TELEMETRY_DISABLED=1` is enforced across development, build, and Docker execution environments. No analytics, tracking beacons, or external pings are ever transmitted from Rovex servers to third parties.
- **In-Transit Protection (TLS/HTTPS)**:
  - While Rovex binds internally to `127.0.0.1:47474`, production deployments should terminate TLS via a hardened reverse proxy (e.g. Nginx, Caddy, or Traefik) utilizing TLS 1.3, Strict-Transport-Security (HSTS), and modern cipher suites.
- **At-Rest Protection & Atomic Transactions**:
  - State files on disk (`./data/rovex-state.json`) are written via atomic file operations (`fs.writeFile` to a temporary file followed by an atomic `fs.rename`). This eliminates partially written or corrupted files during unexpected shutdowns.
  - Automatic rotation retains `./data/rovex-state.json.bak` prior to any state modification.
- **Client-Side Sanitization**:
  - Markdown rendering pipelines sanitize HTML input, preventing Stored Cross-Site Scripting (XSS) when rendering untrusted evidence text or vulnerability payloads.

---

## 3. Server & Runtime Isolation

Rovex employs multiple layers of isolation to prevent attackers from compromising the host server, even in the event of an application-level vulnerability.

```
+--------------------------------------------------------------------------+
|                        HOST OPERATING SYSTEM                             |
|  +--------------------------------------------------------------------+  |
|  |                       DOCKER RUNTIME                               |  |
|  |  +--------------------------------------------------------------+  |  |
|  |  |                 ROVEX CONTAINER (node:22-alpine)             |  |  |
|  |  |                                                              |  |  |
|  |  |   - User: nextjs (UID 1001, GID 1001) - NO ROOT PRIVILEGES    |  |  |
|  |  |   - Read-only code layers                                    |  |  |
|  |  |   - Mapped host volumes: ./data, ./uploads, ./logs           |  |  |
|  |  |                                                              |  |  |
|  |  |   +------------------------------------------------------+   |  |  |
|  |  |   |           SANDBOXED IFRAME PREVIEW                   |   |  |  |
|  |  |   |   - Theme preview runs in isolated browser context   |   |  |  |
|  |  |   |   - Zero access to parent window or cookies          |   |  |  |
|  |  |   +------------------------------------------------------+   |  |  |
|  |  +--------------------------------------------------------------+  |  |
|  +--------------------------------------------------------------------+  |
+--------------------------------------------------------------------------+
```

### Isolation Controls:
1. **Unprivileged Execution (Non-Root User)**:
   - The production container creates a dedicated system group `nodejs` (GID 1001) and unprivileged user `nextjs` (UID 1001). The application binary (`node server.js`) runs with zero root privileges, restricting any hypothetical container escape.
2. **Theme Preview Iframe Sandboxing**:
   - The interactive theme visualizer (`theme-preview-doc.ts`) renders preview documents inside an `<iframe>` with strict sandbox flags. This isolates custom CSS and document scripts from accessing application session tokens, LocalStorage, or parent window contexts.
3. **Network Interface Binding & Isolation**:
   - By default, `package.json`, `app.py`, and `deploy.sh` bind to `0.0.0.0:1400`, enabling seamless multi-device testing and team access across the local host LAN IP (e.g. `http://192.168.x.x:1400`) as well as loopback (`http://127.0.0.1:1400`). When operating on untrusted public Wi-Fi networks, operators can lock binding down strictly to loopback by setting `HOST_BIND=127.0.0.1`.
4. **Standalone Binary Minimization**:
   - Production Docker builds compile via Next.js standalone mode (`NEXT_STANDALONE=true`), bundling only the strictly necessary production files. The development source code (`src/`), build scripts, and package managers are discarded from the final container layer.
