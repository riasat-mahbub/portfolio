---
SCHEMA: 3
FORMAT: project-tracker
ID: BUG-01KYNGM3FMN3B32YCQ79BG8KG6
TYPE: bug
STATUS: DONE
PRIORITY: Medium
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
    - ADR-01KYNGQPRAXSD3CAMY0DN40P28
AFFECTS:
  files:
    - src/components/experience.astro
LINKS: null
CREATED_BY: null
UPDATED_BY: null
CREATED_AT: "2026-07-28T23:23:10.708111+00:00"
UPDATED_AT: "2026-07-28T23:23:10.708111+00:00"
---

# Wrong interface name Education used in experience.astro

## Background

The experience.astro component (which displays work experience) used interface Education and named its array educations — naming from the education component that was likely copy-pasted. This made the code confusing, as both experience.astro and education.astro had separate interface Education and educations arrays.

## Investigation

## Decision

## Investigation

## Decision

## Implementation

- ca73fde (2026-07-27): renamed `interface Education` → `interface Experience` and `educations` → `experiences` throughout the component

## Verification

`astro check` passes. Component renders work experience entries correctly with the renamed interface.

## Follow-up
