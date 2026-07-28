---
SCHEMA: 3
FORMAT: project-tracker
ID: TASK-01KYNGQNV41CPEX08XFNDSG00J
TYPE: task
STATUS: DONE
PRIORITY: null
SEVERITY: null
EFFORT: null
OWNER: null
CONFIDENCE: Medium
TAGS:
  - css
  - cleanup
  - dead-code
RELATIONS:
  depends_on:
    - ADR-01KYNGQPRAXSD3CAMY0DN40P28
AFFECTS:
  files:
    - src/components/blog-section.astro
    - src/components/connect.astro
    - src/components/projects.astro
    - src/components/skills.astro
    - src/pages/blog/[...page].astro
LINKS: null
CREATED_BY: null
UPDATED_BY: null
CREATED_AT: "2026-07-28T23:25:07.812393+00:00"
UPDATED_AT: "2026-07-28T23:25:07.812393+00:00"
---

# Remove unused shiny-sec CSS class from 5 components

## Background

Five components included the class shiny-sec but no CSS rule defined it. It was likely a planned visual effect that was never implemented or was removed. The class was a no-op but added noise to the markup.

## Investigation

## Decision

## Investigation

## Decision

## Implementation

- Removed `shiny-sec` from all 5 references: blog-section.astro, connect.astro, projects.astro, skills.astro, and [...page].astro
- a53bfd7 (2026-07-27)

## Verification

## Follow-up
