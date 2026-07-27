---
SCHEMA: 2
FORMAT: project-tracker
ID: FEAT-007
TYPE: feature
STATUS: DONE
PRIORITY: null
SEVERITY: null
EFFORT: S
OWNER: null
CONFIDENCE: Medium
TAGS:
- favicon
- seo
- layout
RELATIONS:
  depends_on:
  - ADR-001
  related:
  - FEAT-003
AFFECTS:
  files:
  - src/layouts/Layout.astro
  - src/layouts/BlogLayout.astro
LINKS: null
CREATED_BY: null
UPDATED_BY: null
COMPUTED:
  depended_by:
  - ADR-001
  related:
  - FEAT-003
---

# Favicon link tags in page layouts

## Background

The site lacked a favicon — browsers showed the default empty-page icon in tabs, bookmarks, and address bars. A favicon improves brand recognition and professionalism.

## Implementation

- 9197e0c (2026-07-27): added dual favicon links to both Layout.astro and BlogLayout.astro:
  - `<link rel="icon" href="/favicon.ico" sizes="32x32" />` (legacy .ico support)
  - `<link rel="icon" href="/riasat.png" type="image/png" />` (high-resolution PNG)

## Verification

`astro build` includes both favicon references in the generated HTML head. Browser devtools show the favicon loads in tabs and bookmarks.
