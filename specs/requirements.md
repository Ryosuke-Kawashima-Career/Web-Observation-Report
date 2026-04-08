# Requirements

## 1. Functional Requirements

### 1.1 Target Management

- FR-01: The user should be able to register a target OTA by providing a company name and a URL.
- FR-02: The user should be able to add, edit, and delete registered targets.
- FR-03: The system should persist registered targets across sessions.

### 1.2 Website Monitoring

- FR-04: The system should periodically fetch the registered URLs and detect UI and pricing changes.
- FR-05: The system should compare the current state of a page against its previously recorded baseline (**DOM structure**).
- FR-06: The system should gather information about the changes in target websites using **Google Search**.
- FR-07: The system should record a new baseline when a change is first detected or when the user explicitly resets the baseline.
- FR-08: The system should take screenshots of the target website before and after the change so that the user can see the visual changes.

### 1.3 Change Detection & Reporting

- FR-09: When a change is detected, the system should automatically generate an observation report.
- FR-10: The report should include: target company name, URL, timestamp of detection, a before/after screenshots, and a plain-language summary of what changed.
- FR-11: The user should be able to export the report in the following formats:
  - Plain text (`.txt` or `.md`)
  - Chart/graph visualizations (e.g., PNG or embedded in report)
  - PowerPoint slides (`.pptx`)

---

## 2. Non-Functional Requirements

### 2.1 Maintainability (Developer Story)

- NFR-01: The codebase should follow a single, consistent style guide and include inline comments for non-obvious logic.
- NFR-02: Each module should have a clearly defined responsibility (separation of concerns) to facilitate future extension.
- NFR-03: External dependencies should be minimal and well-justified to reduce long-term maintenance burden.

---

## 3. Constraints

- CON-01: Target websites are external and may change their structure or apply bot-detection measures; the system must handle such cases gracefully.

---

## 4. Out of Scope

- Monitoring of non-OTA websites.
- Authentication-required pages of target OTAs.
