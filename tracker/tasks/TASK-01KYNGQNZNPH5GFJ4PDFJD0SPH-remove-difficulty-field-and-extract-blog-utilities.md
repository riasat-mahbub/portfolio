---
SCHEMA: 3
FORMAT: project-tracker
ID: TASK-01KYNGQNZNPH5GFJ4PDFJD0SPH
TYPE: task
STATUS: DONE
PRIORITY: null
SEVERITY: null
EFFORT: null
OWNER: null
CONFIDENCE: Medium
TAGS:
  - blog
  - refactor
RELATIONS: null
AFFECTS: null
LINKS: null
CREATED_BY: null
UPDATED_BY: null
CREATED_AT: "2026-07-28T23:25:07.957199+00:00"
UPDATED_AT: "2026-07-28T23:25:07.957199+00:00"
---

# Remove difficulty field and extract blog utilities

## Background

Remove difficulty field and extract blog utilities

## Investigation

## Decision

## Investigation

## Decision

## Implementation

## Verification

## Follow-up

Removed difficulty from schema + all components. Created src/lib/utils.ts with slugify, readingTime, formatDate. Replaced all 3 copies of slugify and 3 copies of readingTime across pages/components. Fixed tag page to pass readingTime. Generalized empty state text. Standardized date formatting.
