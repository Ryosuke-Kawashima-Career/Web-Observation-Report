# Implementation Plan: Gemini Web Observation Report System

## Overview

A robust, AI-powered web monitoring system designed to track UI and pricing changes across various Online Travel Agency (OTA) websites. The system uses Playwright for high-fidelity captures, and the Google Gemini API to generate human-readable change summaries.

---

## 1. Architecture & Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Runtime** | Node.js (TypeScript) | Strong ecosystem for web automation and type safety. |
| **Automation** | Playwright | Industry-leading browser automation with excellent screenshot/DOM support. |
| **DOM Diff** | `jsdom` + `diff` | Accurate structural comparison of page source. |
| **AI Engine** | **Google Gemini API** | Generates plain-language summaries (FR-09) from raw diff data. |
| **Database** | SQLite (`better-sqlite3`) | Self-contained, zero-configuration persistent storage (FR-03, NFR-06). |
| **Reports** | `pptxgenjs` | Client/Server-side PPTX generation without heavy Office dependencies. |
| **Frontend** | Next.js (App Router) | Provides a polished, responsive UI for non-technical users (NFR-01). |
| **Styling** | Tailwind CSS + Shadcn UI | Modern, accessible components for a professional look and feel. |

---

## 2. Implementation Phases

### Phase 1: Core Engine & Persistence (Foundation)

**Goal**: Establish the ability to register targets and capture baselines.

- [ ] **Target Management (FR-01, FR-02)**:
  - Implement SQLite schema for `targets` and `snapshots`.
  - Create CRUD services for managing OTA targets (Company Name, URL).
- [ ] **Capture Engine**:
  - Configure Playwright with realistic User-Agents and viewports (1920x1080).
  - Implement a `CaptureService` that saves:
    - Full-page PNG screenshot.
    - Sanitized DOM snapshot (HTML).
- [ ] **Baseline Recording (FR-06)**:
  - Logic to designate the first successful capture as the "Baseline".
  - Mechanism to manually reset baseline via UI.

### Phase 2: Change Detection & AI Summaries

**Goal**: Detect differences and explain them using Gemini.

- [ ] **Visual Comparator (FR-05, FR-07)**:
  - Generate a "Difference Heatmap" PNG.
- [ ] **Structural Comparator (FR-07)**:
  - Diff the DOM snapshots using a text-based diffing algorithm.
  - Extract specific changes (e.g., text content, CSS class changes).
- [ ] **Gemini Integration (FR-09)**:
  - Feed the structural diff and (optionally) vision-based analysis to Gemini.
  - **Prompt Engineering**: Instruct Gemini to provide a "plain-language summary for a business executive."

### Phase 3: Reporting & Exports

**Goal**: Transform detected changes into actionable reports.

- [ ] **Report Generation (FR-08)**:
  - Automatic trigger after monitoring job completes.
  - Aggregate: Target name, URL, Timestamp, Before/After images, and Gemini summary.
- [ ] **Export Formats (FR-10)**:
  - **Markdown/Text**: Structured summary with embedded image links.
  - **Visual Diff**: Combined "Side-by-Side" view with heatmap overlay.
  - **PowerPoint**: Multi-slide deck (Title, Context, Visual Diff, AI Summary).

### Phase 4: Automation & Reliability

**Goal**: Ensure the system runs autonomously and handles errors.

- [ ] **Monitoring Scheduler (FR-04)**:
  - Use `node-cron` or `agenda` for periodic URL fetching.
- [ ] **Retry Logic (NFR-02)**:
  - Implement exponential backoff for failed fetches (up to 3 retries).
- [ ] **Bot Detection Handling (CON-01)**:
  - Implement `playwright-stealth` and random delays to mimic human behavior.

### Phase 5: User Interface (Usability)

**Goal**: Provide a "Secretary-Friendly" dashboard.

- [ ] **Dashboard**:
  - List of monitored OTAs with "Status" badges (Stable / Changed / Error).
  - "Run Now" button for manual checks.
- [ ] **Observation Feed**:
  - Chronological list of generated reports.
  - Modal view for inspecting visual diffs and summaries.
- [ ] **Export Center**:
  - One-click download buttons for MD, PNG, and PPTX.

---

## 3. Directory Structure

```text
web-observation-report/
├── src/
│   ├── app/                # Next.js Frontend (React)
│   ├── lib/
│   │   ├── engine/         # Playwright & Capture Logic
│   │   ├── analysis/       # Diffing & Gemini Integration
│   │   ├── reporting/      # MD & PPTX Generators
│   │   └── db/             # SQLite / Prisma Schema
│   ├── components/         # UI Components (Shadcn)
│   └── jobs/               # Scheduler & Background Tasks
├── public/
│   └── storage/            # Screenshots & Diff Heatmaps
├── specs/                  # Requirements & Plans
└── package.json
```

---

## 4. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| **Aggressive Bot Detection** | Use residential proxies or `playwright-stealth`. |
| **False Positives (Dynamic Content)** | Implement "Ignore Regions" (e.g., ad banners) in the visual diff config. |
| **Large Storage Growth** | Implement a retention policy (e.g., delete snapshots older than 30 days). |
| **API Costs (Gemini)** | Only call Gemini when a structural change exceeds a specific threshold. |

---

## 5. Success Criteria

1. A user can add a URL and receive a PPTX report within 2 minutes.
2. Changes as small as a button color or a $1 price shift are detected.
3. The system recovers automatically from a lost internet connection.
