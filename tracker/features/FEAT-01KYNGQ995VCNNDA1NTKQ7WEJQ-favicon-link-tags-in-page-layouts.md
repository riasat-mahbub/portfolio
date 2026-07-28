---
SCHEMA: 3
FORMAT: project-tracker
ID: FEAT-01KYNGQ995VCNNDA1NTKQ7WEJQ
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
    - ADR-01KYNGQPRAXSD3CAMY0DN40P28
  related:
    - FEAT-01KYNGQ8ZTNHTM57TEJ87RQF88
AFFECTS:
  files:
    - src/layouts/Layout.astro
    - src/layouts/BlogLayout.astro
LINKS: null
CREATED_BY: null
UPDATED_BY: null
CREATED_AT: "2026-07-28T23:24:54.949648+00:00"
UPDATED_AT: "2026-07-28T23:24:54.949648+00:00"
---

# Favicon link tags in page layouts

## Background

The site lacked a favicon — browsers showed the default empty-page icon in tabs, bookmarks, and address bars. A favicon improves brand recognition and professionalism.

## Investigation

## Decision

## Investigation

## Decision

## Implementation

- 9197e0c (2026-07-27): added dual favicon links to both Layout.astro and BlogLayout.astro:
  - `<link rel="icon" href="/favicon.ico" sizes="32x32" />` (legacy .ico support)
  - `<link rel="icon" href="/riasat.png" type="image/png" />` (high-resolution PNG)

## Verification

`astro build` includes both favicon references in the generated HTML head. Browser devtools show the favicon loads in tabs and bookmarks.

## Follow-up
