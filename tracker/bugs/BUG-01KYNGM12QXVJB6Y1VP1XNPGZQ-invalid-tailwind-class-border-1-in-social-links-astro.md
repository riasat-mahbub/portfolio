---
SCHEMA: 3
FORMAT: project-tracker
ID: BUG-01KYNGM12QXVJB6Y1VP1XNPGZQ
TYPE: bug
STATUS: DONE
PRIORITY: Medium
SEVERITY: Low
EFFORT: null
OWNER: null
CONFIDENCE: Medium
TAGS:
  - css
  - tailwind
  - bug
RELATIONS:
  depends_on:
    - ADR-01KYNGQPRAXSD3CAMY0DN40P28
AFFECTS:
  files:
    - src/components/social-links.astro
LINKS: null
CREATED_BY: null
UPDATED_BY: null
CREATED_AT: "2026-07-28T23:23:08.247563+00:00"
UPDATED_AT: "2026-07-28T23:23:08.247563+00:00"
---

# Invalid Tailwind class border-1 in social-links.astro

## Background

All three social link anchor tags in social-links.astro had border border-1 in their class attribute. The Tailwind border-1 utility does not exist — border already sets a 1px width. The border-1 class was a no-op and a code smell.

## Investigation

## Decision

## Investigation

## Decision

## Implementation

- 19234ca (2026-07-27): replaced `border border-1` with `border` on all 3 social link anchor tags

## Verification

Social link buttons render with correct 1px borders. No invalid class references in the component.

## Follow-up
