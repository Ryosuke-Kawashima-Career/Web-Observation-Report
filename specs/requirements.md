# Requirements

## 1. Functional Requirements

### 1.1 Target Management

- FR-01: The user should be able to register a target OTA by providing a company name and a URL.
- FR-02: The user should be able to add, edit, and delete registered targets.
- FR-03: The system should persist registered targets across sessions.

### 1.2 Website Monitoring

- FR-04: The system should periodically fetch the registered URLs and detect UI and pricing changes.
- FR-05: The system should compare the current state of a page against its previously recorded baseline (screenshot, DOM snapshot, or both).
- FR-06: The system should record a new baseline when a change is first detected or when the user explicitly resets the baseline.
- FR-07: Detection should cover visual layout changes, text content changes, and structural (DOM) changes.

### 1.3 Change Detection & Reporting

- FR-08: When a change is detected, the system should automatically generate an observation report.
- FR-09: The report should include: target company name, URL, timestamp of detection, a before/after visual diff, and a plain-language summary of what changed.
- FR-10: The user should be able to export the report in the following formats:
  - Plain text (`.txt` or `.md`)
  - Chart/graph visualizations (e.g., PNG or embedded in report)
  - PowerPoint slides (`.pptx`)

---

## 2. Non-Functional Requirements

### 2.1 Usability

- NFR-01: The user interface should allow a non-technical secretary to complete all core tasks (register target, view report, export) without developer assistance.

### 2.2 Reliability & Availability

- NFR-02: The monitoring scheduler should retry a failed fetch up to 3 times before marking the check as failed and alerting the user.
- NFR-03: The system should handle target sites that are temporarily unavailable without losing the stored baseline.

### 2.3 Maintainability (Developer Story)

- NFR-04: The codebase should follow a single, consistent style guide and include inline comments for non-obvious logic.
- NFR-05: Each module should have a clearly defined responsibility (separation of concerns) to facilitate future extension (e.g., adding new OTA targets or new export formats).
- NFR-06: External dependencies should be minimal and well-justified to reduce long-term maintenance burden.

---

## 3. Constraints

- CON-01: Target websites are external and may change their structure or apply bot-detection measures; the system must handle such cases gracefully.

---

## 4. Out of Scope

- Monitoring of non-OTA websites.
- Authentication-required pages of target OTAs.
