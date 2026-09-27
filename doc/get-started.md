# Get Started with Rovex

Get your Rovex instance running and generate your first professional penetration testing report in under five minutes.

---

## Prerequisites

Before starting, ensure your system has:
- **Option A (Docker - Recommended)**: Docker Engine 24+ and Bash.
- **Option B (Node.js Local)**: Node.js 22.13+ and pnpm 11+.

---

## Step 1: Clone the Repository

```bash
git clone https://github.com/0xdun0/rovex.git
cd rovex
```

---

## Step 2: Launch Rovex

### Method A: Docker Deployment (Production & Isolated)

Deploy using the automated installer:
```bash
sudo bash deploy.sh
```

By default, the server binds to `http://127.0.0.1:47474`.

To customize the port or host:
```bash
PORT=8080 HOST_BIND=0.0.0.0 bash deploy.sh
```

### Method B: Local Development / Testing

```bash
# Install dependencies
pnpm install

# Start development server (port 1400)
pnpm dev

# Or launch via the Python runner
python3 app.py
```

Access the application in your browser at `http://127.0.0.1:1400`.

---

## Step 3: First-Time Setup & Account Initialization

1. Open your browser and navigate to the application URL.
2. Because this is a fresh instance, you will be prompted to set an administrative username and password.
3. The password strength meter evaluates your password in real-time. Choose a secure credential.
4. Click **Save Password** and log into the platform.

---

## Step 4: Create Your First Assessment in 4 Steps

```
+--------------------------------------------------------------------------+
|                     4-Step Quickstart Workflow                           |
+--------------------------------------------------------------------------+
   [1. Create Target] --> [2. Create Project] --> [3. Add Findings] --> [4. Export]
```

1. **Create an Audit Target (Client)**:
   - Click **Targets** in the sidebar.
   - Click **+ New Target**. Enter the client name (e.g., *Acme Financial Corporation*), contact email, and upload their horizontal logo.
2. **Initialize a Project**:
   - Navigate to **Projects** -> **+ New Project**.
   - Select the target you just created, assign the project name (e.g., *External Infrastructure Assessment 2026*), select the language, and pick the **HTB CPTS Certification Template**.
3. **Review & Add Findings**:
   - The editor loads with the full structured skeleton.
   - Under the findings section, click **+ Add Finding**.
   - Select a pre-built vulnerability from the database (e.g. *MS17-010 EternalBlue* or *SQL Injection*) or write a custom advisory. The CVSS score automatically calculates and updates the summary table.
4. **Export the Report**:
   - Click the **Export** button in the top action bar.
   - Select **Word (.docx)** or **Print PDF**.
   - Your publication-grade deliverable is downloaded instantly.
