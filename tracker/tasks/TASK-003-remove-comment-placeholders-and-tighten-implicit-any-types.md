---
SCHEMA: 2
FORMAT: project-tracker
ID: TASK-003
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
  - ADR-001
AFFECTS:
  files:
  - src/components/experience.astro
  - src/components/education.astro
  - src/pages/rss.xml.ts
  - src/components/projects.astro
LINKS: null
CREATED_BY: null
UPDATED_BY: null
COMPUTED:
  depended_by:
  - ADR-001
---

# Remove comment placeholders and tighten implicit any types

## Background

Several files had minor quality issues: HTML comment placeholders (`<!-- Add your education description here -->`), implicit `any` types (`context: any`, `paginate: any`), and unconditional rendering of possibly-empty data (`paper.description`).

## Implementation

- Removed comment placeholders from experience.astro and education.astro
- Typed `context: any` → `context: { site: URL }` in rss.xml.ts
- Wrapped `paper.description` in a conditional (`paper.description && (...)`) in projects.astro
- ca73fde (2026-07-27)
