# Implementation Plan -- UI Observation Report (Target: Expedia)

## Overview

Automated UI observation system that monitors Expedia publicly accessible pages, detects visual and structural changes, and generates observation reports exportable as text, charts, and PowerPoint slides.

---

## 1. Target Analysis: Expedia

### Key Pages to Monitor

| Page | URL Pattern | What to Watch |
|---|---|---|
| Homepage | expedia.com/ | Hero banner, search widget layout, promotions |
| Hotel Search Results | expedia.com/Hotel-Search?... | Sort/filter UI, card layout, pricing display |
| Flight Search Results | expedia.com/Flights-Search?... | Filter panel, result card structure |
| Hotel Detail Page | expedia.com/...Hotel-Info | Photo gallery, price block, CTA button placement |
| Deals / Promotions | expedia.com/deals | Banner content, offer structure |

### Technical Characteristics

- **Rendering**: Server-side + client-side hydration (React). A plain HTTP fetch misses
  most UI -- a headless browser is required.
- **Bot Detection**: Expedia uses Akamai Bot Manager. Requests must mimic real browser
  behaviour (realistic User-Agent, viewport, timing, cookies).
- **Localisation**: Fix locale to en-US and currency to USD via URL parameters and
  Accept-Language headers to ensure consistent baselines across runs.

---

## 2. Architecture

    +-----------------------------------------------------+
    |                    Scheduler                        |
    |  (APScheduler / cron) -- triggers periodic checks  |
    +----------------+------------------------------------+
                     |
             +-------v--------+
             |  Crawler        |   Playwright (headless Chromium)
             |  - fetch page   |   + playwright-stealth
             |  - screenshot   |   + fixed locale / viewport
             +-------+---------+
                     |
             +-------v--------+
             |  Comparator     |   pixelmatch (visual diff)
             |  - image diff   |   + difflib (DOM diff)
             |  - DOM diff     |
             +-------+---------+
                     |
                     | change detected? yes
                     |
             +-------v--------+
             |  Report Builder |   Jinja2 / Matplotlib / python-pptx
             +-------+---------+
                     |
             +-------v--------+
             |  Storage        |   SQLite + local filesystem
             +----------------+

---

## 3. Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Language | Python 3.12 | Rich ecosystem for scraping, image processing, Office file generation |
| Headless browser | Playwright + playwright-stealth | Handles JS rendering; stealth plugin reduces bot-detection false positives |
| Visual diff | pixelmatch-python | Fast pixel-level comparison; outputs diff PNG |
| DOM diff | difflib (stdlib) | Structural change summary in plain text, zero extra dependency |
| Scheduling | APScheduler | In-process cron; easy to configure per-target intervals |
| Report -- text | Jinja2 | Templated Markdown/text output |
| Report -- charts | Matplotlib | Diff heatmaps and change-over-time graphs |
| Report -- PPTX | python-pptx | Direct .pptx generation, compatible with PowerPoint 2016+ |
| Storage | SQLite + local filesystem | Zero-dependency persistence; sufficient for single-user use |
| UI | Streamlit | Secretary-friendly web UI with minimal code |

---

## 4. Implementation Phases

### Phase 1 -- Crawler & Baseline (Week 1-2)

**Goal**: Reliably capture a full-page screenshot and DOM snapshot of each Expedia page.

- [ ] Set up Playwright with playwright-stealth.
- [ ] Implement Crawler class:
  - Accepts (name, url, locale=en-US).
  - Launches headless Chromium with a fixed 1920x1080 viewport.
  - Waits for network idle before capturing.
  - Saves full-page screenshot as PNG and raw HTML to filesystem.
- [ ] Implement BaselineStore:
  - SQLite table: targets (id, name, url, created_at).
  - SQLite table: baselines (id, target_id, screenshot_path, html_path, captured_at).
- [ ] Smoke test against expedia.com/ -- verify screenshot is complete and consistent.

**Deliverable**: crawler.py, baseline_store.py, passing smoke test.

---

### Phase 2 -- Change Detection (Week 3)

**Goal**: Compare a new capture against the stored baseline and flag differences.

- [ ] Implement VisualComparator:
  - Uses pixelmatch to produce a diff image and a numeric change score (0-100%).
  - Configurable threshold (default: 2%) to avoid noise from ads/animations.
- [ ] Implement DOMComparator:
  - Strips dynamic attributes (timestamps, session tokens) before diffing.
  - Returns a list of added/removed/changed elements with XPath locations.
- [ ] Combine into ChangeDetector:
  - Returns ChangeResult(changed, visual_score, dom_diff, diff_image_path).
- [ ] Unit tests with synthetic before/after HTML and images.

**Deliverable**: comparator.py, change_detector.py, unit tests.

---

### Phase 3 -- Report Generation (Week 4-5)

**Goal**: Turn a ChangeResult into text, chart, and PPTX outputs.

- [ ] Implement TextReporter: Jinja2 template -> Markdown report.
- [ ] Implement ChartReporter: before/after screenshots + diff heatmap as PNG.
- [ ] Implement PptxReporter:
  - Slide 1: Title (company name + date).
  - Slide 2: Before screenshot.
  - Slide 3: After screenshot.
  - Slide 4: Diff heatmap + visual change score.
  - Slide 5: DOM change summary (bullet list).
- [ ] Store report metadata in SQLite table reports.

**Deliverable**: reporters/text.py, reporters/chart.py, reporters/pptx.py.

---

### Phase 4 -- Scheduler & Automation (Week 6)

**Goal**: Run checks automatically without user intervention (FR-04, CON-02).

- [ ] Implement MonitorJob(target, interval_minutes) using APScheduler.
- [ ] On each run:
  1. Crawl the target URL.
  2. Compare against latest baseline.
  3. If changed: generate reports, update baseline, log to DB.
  4. If crawl fails: retry up to 3 times (NFR-02), then log failure.
- [ ] Persist scheduler state across restarts.

**Deliverable**: scheduler.py, integration test with a mock server.

---

### Phase 5 -- User Interface (Week 7-8)

**Goal**: Secretary-friendly UI (NFR-01) to manage targets and access reports.

- [ ] Streamlit app with pages:
  - **Targets**: add / edit / delete targets; show last-check status.
  - **Reports**: browse report history by target and date; preview screenshots.
  - **Export**: download text, PNG chart, or PPTX for any report.
- [ ] Input validation: URL must be reachable before saving.

**Deliverable**: app.py (Streamlit), end-to-end test with Expedia URLs.

---

## 5. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Expedia bot detection blocks crawler | High | High | Use playwright-stealth; add random delays; rotate User-Agent |
| Page loads slowly / incompletely | Medium | Medium | Increase networkidle timeout; wait for specific CSS selector |
| Dynamic ads cause false positives | High | Medium | Mask known ad containers via CSS selector exclusion list |
| Expedia changes URL structure | Medium | Low | Parameterise URLs; alert on 404/redirect |

---

## 6. Directory Structure

    web-observation-report/
    +-- crawler.py
    +-- baseline_store.py
    +-- comparator.py
    +-- change_detector.py
    +-- scheduler.py
    +-- reporters/
    |   +-- text.py
    |   +-- chart.py
    |   +-- pptx.py
    +-- app.py
    +-- data/
    |   +-- baselines/
    |   +-- reports/
    +-- db/
    |   +-- observations.db
    +-- tests/
        +-- test_comparator.py
        +-- test_reporters.py

---

## 7. Out of Scope

- Monitoring authentication-required Expedia pages (e.g., logged-in booking flow).
- Price scraping or competitive pricing analysis.
- Monitoring non-OTA websites in this phase.
