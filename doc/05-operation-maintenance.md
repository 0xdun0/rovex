# 05. Operation & Maintenance — Rovex

This document describes the operational procedures, health monitoring, release deployment pipelines, and disaster recovery strategies for maintaining high-availability Rovex instances.

---

## 1. Monitoring & Observability

To ensure the platform remains responsive and operational during critical reporting deadlines, Rovex provides multiple observability hooks.

### Health Probes
- **HTTP Readiness & Liveness Probe**:
  - The root endpoint (`/`) responds to HTTP GET requests.
  - The Docker container specifies a native `HEALTHCHECK`:
    ```dockerfile
    HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
      CMD wget -qO- "http://127.0.0.1:${PORT}/" >/dev/null || exit 1
    ```
  - This allows container orchestrators (Docker Swarm, Kubernetes, Nomad) to automatically detect deadlocks or out-of-memory events and restart failed instances.

### Logging Architecture
- **Application & Service Logs**:
  - Next.js access and error logs are directed to stdout and mirrored to `./logs/` on the host filesystem.
  - Docker container output can be streamed in real time:
    ```bash
    docker logs -f rovex --tail=100
    ```
- **CLI Startup Diagnostics**:
  - Both `deploy.sh` and `app.py` execute pre-flight socket verifications, checking whether the designated port is already occupied before launching processes.

---

## 2. Release & Upgrade Lifecycle

Deploying new versions of Rovex is engineered to be deterministic and safe.

```
                    +------------------------------------+
                    |       Release Upgrade Sequence     |
                    +------------------------------------+
                                      |
                                      v
                    +------------------------------------+
                    | 1. Pull Latest Code: git pull      |
                    +------------------------------------+
                                      |
                                      v
                    +------------------------------------+
                    | 2. Automated Validation Suite      |
                    |    pnpm typecheck && pnpm test     |
                    +------------------------------------+
                                      |
                                      v
                    +------------------------------------+
                    | 3. Execute deploy.sh               |
                    |    - BuildKit caches unchanged deps|
                    |    - Preserves ./data, ./uploads   |
                    +------------------------------------+
                                      |
                                      v
                    +------------------------------------+
                    | 4. Healthcheck Polling (30s)       |
                    |    - Swaps container atomically    |
                    +------------------------------------+
```

### Pre-Deployment Verification
Before pushing updates to production, execute the automated validation suite:
```bash
# 1. Typecheck: Verify strict TypeScript compilation
pnpm typecheck

# 2. Unit & Integration Tests: Verify CVSS, Markdown AST, and Word DOCX generation
pnpm test

# 3. Linter: Verify syntax conventions
pnpm lint
```

### Zero-Data-Loss Container Swap
The `deploy.sh` deployment script executes an idempotent container rebuild:
1. Rebuilds the image tagging with `rovex:latest` using Docker BuildKit.
2. Stops the previous container instance.
3. Automatically mounts existing host directories (`./data`, `./uploads`, `./logs`).
4. Polls the HTTP service until status 200 OK is confirmed before terminating the script.

---

## 3. Resilience & Disaster Recovery

Rovex implements a robust disaster recovery model ensuring that pentest data can always be recovered in the event of hardware failure, disk corruption, or accidental deletion.

### Backup Strategy

| Backup Type | Mechanism | File Destination | Scope |
|---|---|---|---|
| **Server State Snapshot** | Automatic before every state write | `./data/rovex-state.json.bak` | Projects, clients, findings, templates, custom themes. |
| **Manual Full Archive** | One-click JSON export from UI (`/report/backup`) | `rovex-backup-YYYY-MM-DD.json` | Complete system state: targets, findings, themes, and base64 images. |
| **Host Directory Backup** | Cron or rsync script | `/opt/backups/rovex/` | Tar archive of `./data`, `./uploads`, and `./logs`. |

### Full System Restoration Procedure

1. **Restoring from Server Snapshot**:
   ```bash
   # If rovex-state.json is damaged, restore the atomic .bak file:
   cp ./data/rovex-state.json.bak ./data/rovex-state.json
   docker restart rovex
   ```

2. **Restoring from UI Backup**:
   - Navigate to the **Backup** panel in the user navigation menu (`/report/4f8b2c1e9a7d3e6a`).
   - Drag and drop your exported `rovex-backup-*.json` file.
   - Click **Restore Backup**. The platform parses the archive, verifies schema integrity, rebuilds all project collections, and restores custom themes immediately.

3. **Cold-Metal Disaster Recovery**:
   ```bash
   # On a fresh server:
   git clone https://github.com/0xdun0/rovex.git
   cd rovex
   # Restore backed-up directories
   tar -xzf rovex-data-backup.tar.gz -C ./
   # Deploy
   sudo bash deploy.sh
   ```
