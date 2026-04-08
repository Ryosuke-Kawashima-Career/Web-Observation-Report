# Implementation Plan: Gemini Web Observation Report System

## Overview

A robust, AI-powered web monitoring system designed to track UI and pricing changes across various Online Travel Agency (OTA) websites. The system uses Playwright for high-fidelity captures, and the Google Gemini API to generate human-readable change summaries.

---

## 1. Architecture & Tech Stack

| Layer | Technology | Rationale |
| --- | --- | --- |
| **Runtime** | Node.js (TypeScript) | Strong ecosystem for web automation and type safety. |
| **Automation** | Playwright | Browser automation for DOM extraction and reference screenshots (FR-08). |
| **DOM Diff** | `jsdom` + `diff` | Accurate structural comparison of page source (FR-05). |
| **Information Gathering** | **Google Search API** | Fetches the latest news/changes about the target website (FR-06). |
| **AI Engine** | **Google Gemini API** | Generates plain-language summaries from DOM diffs and Search context (FR-09). |
| **Database** | SQLite (`better-sqlite3`) | Self-contained, zero-configuration persistent storage (FR-03, NFR-06). |
| **Reports** | `pptxgenjs` | Client/Server-side PPTX generation without heavy Office dependencies. |

---

## 2. Implementation Phases

### Phase 1: Core Engine & Persistence (Foundation)

**Goal**: Establish the ability to register targets and capture baselines.

- [x] **Target Management (FR-01, FR-02)**:
  - Implement SQLite schema for `targets` and `snapshots`.
  - Create CRUD services for managing OTA targets (Company Name, URL).
- [x] **Capture Engine (FR-08)**:
  - Configure Playwright with realistic User-Agents.
  - Implement a `CaptureService` that saves:
    - Full-page PNG screenshot (for user visual reference only).
    - Sanitized DOM snapshot (HTML) for programmatic diffing.
- [x] **Baseline Recording (FR-07)**:
  - Logic to designate the first successful DOM capture as the "Baseline".
  - Mechanism to manually reset baseline.

### Phase 2: Change Detection & AI Summaries

**Goal**: Detect differences and explain them using Gemini.

- [ ] **Google Search Integration (FR-06)**:
  - Query search engines (e.g., using Serper API) for recent news or announcements regarding the target domain.
- [x] **Structural Comparator (FR-05)**:
  - Diff the DOM snapshots using a text-based diffing algorithm.
  - Extract specific changes (e.g., text content, CSS class changes).
- [x] **Gemini Integration (FR-09)**:
  - Feed the structural diff AND the Google Search results to Gemini.
  - **Prompt Engineering**: Instruct Gemini to provide a "plain-language summary for a business executive," correlating structural edits with real-world context gathered from search.

#### Phase 2.5: Testing

- [x] **Test Plan**:
  - Create a test plan for the change detection and AI summaries.
  - Note that Gemini API is available as the environment variable `GEMINI_API_KEY`.
  - The target Service should be **[Expedia](https://www.expedia.com)**.

### Phase 3: Reporting & Exports

**Goal**: Transform detected changes into actionable reports.

- [ ] **Report Generation (FR-08)**:
  - Automatic trigger after monitoring job completes.
  - Aggregate: Target name, URL, Timestamp, Before/After images, and Gemini summary.
- [ ] **Export Formats (FR-11)**:
  - **Markdown/Text**: Structured summary with embedded image links.
  - **Visual Reference**: High-resolution "Before/After" screenshot pairs (FR-08) without computed heatmaps.
  - **PowerPoint**: Multi-slide deck (Title, Context, Before/After Images, AI Summary).

### Phase 4: Automation & Reliability

**Goal**: Ensure the system runs autonomously and handles errors.

- [ ] **Monitoring Scheduler (FR-04)**:
  - Use `node-cron` or `agenda` for periodic URL fetching.

#### Phase 4.5: Testing

- [ ] **Test Plan**:
  - Create a test plan for the monitoring scheduler.
  - Note that `node-cron` is available as the environment variable `NODE_CRON`.

## 3. Directory Structure

```text
web-observation-report/
├── src/
│   ├── app/                # Next.js Frontend (React)
│   ├── lib/
│   │   ├── engine/         # Playwright & Capture Logic
│   │   ├── analysis/       # Structural Diffing, Custom Search, & Gemini Integration
│   │   ├── reporting/      # MD & PPTX Generators
│   │   └── db/             # SQLite / Prisma Schema
│   └── jobs/               # Scheduler & Background Tasks
├── public/
│   └── storage/            # Screenshots & Diff Heatmaps
├── specs/                  # Requirements & Plans
└── package.json
```

---

## 4. Risks & Mitigations

| Risk | Mitigation |
| --- | --- |
| **Aggressive Bot Detection** | Use residential proxies or `playwright-stealth`. |
| **Large Storage Growth** | Implement a retention policy (e.g., delete snapshots older than 30 days). |
| **API Costs (Gemini/Search)** | Only call external APIs when a structural change exceeds a specific threshold. |

---

## 5. Success Criteria

1. A user can run the system and receive a PPTX report highlighting structured changes and search facts.
2. Changes as small as a $1 price shift are detected via the DOM without being thrown off by rendering pixels.
3. The user can clearly see what changed visually via before/after screenshot attachments.
