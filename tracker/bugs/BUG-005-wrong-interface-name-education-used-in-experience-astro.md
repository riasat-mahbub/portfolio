---
SCHEMA: 2
FORMAT: project-tracker
ID: BUG-005
TYPE: bug
STATUS: DONE
PRIORITY: null
SEVERITY: Low
EFFORT: null
OWNER: null
CONFIDENCE: Medium
TAGS:
- typescript
- naming
- bug
RELATIONS:
  depends_on:
  - ADR-001
AFFECTS:
  files:
  - src/components/experience.astro
LINKS: null
CREATED_BY: null
UPDATED_BY: null
COMPUTED:
  depended_by:
  - ADR-001
---

# Wrong interface name Education used in experience.astro

## Background

The experience.astro component (which displays work experience) used `interface Education` and named its array `educations` — naming from the education component that was likely copy-pasted. This made the code confusing, as both experience.astro and education.astro had separate `interface Education` and `educations` arrays.

## Implementation

- ca73fde (2026-07-27): renamed `interface Education` → `interface Experience` and `educations` → `experiences` throughout the component

## Verification

`astro check` passes. Component renders work experience entries correctly with the renamed interface.
