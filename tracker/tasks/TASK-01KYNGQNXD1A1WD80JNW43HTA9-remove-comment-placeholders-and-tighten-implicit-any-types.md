---
SCHEMA: 3
FORMAT: project-tracker
ID: TASK-01KYNGQNXD1A1WD80JNW43HTA9
TYPE: task
STATUS: DONE
PRIORITY: null
SEVERITY: null
EFFORT: null
OWNER: null
CONFIDENCE: Medium
TAGS:
  - typescript
  - cleanup
RELATIONS:
  depends_on:
    - ADR-01KYNGQPRAXSD3CAMY0DN40P28
AFFECTS:
  files:
    - src/components/experience.astro
    - src/components/education.astro
    - src/pages/rss.xml.ts
    - src/components/projects.astro
LINKS: null
CREATED_BY: null
UPDATED_BY: null
CREATED_AT: "2026-07-28T23:25:07.885341+00:00"
UPDATED_AT: "2026-07-28T23:25:07.885341+00:00"
---

# Remove comment placeholders and tighten implicit any types

## Background

Several files had minor quality issues: HTML comment placeholders, implicit any types (context: any, paginate: any), and unconditional rendering of possibly-empty data.

## Investigation

## Decision

## Investigation

## Decision

## Implementation

- Removed comment placeholders from experience.astro and education.astro
- Typed `context: any` → `context: { site: URL }` in rss.xml.ts
- Wrapped `paper.description` in a conditional (`paper.description && (...)`) in projects.astro
- ca73fde (2026-07-27)

## Verification

## Follow-up
