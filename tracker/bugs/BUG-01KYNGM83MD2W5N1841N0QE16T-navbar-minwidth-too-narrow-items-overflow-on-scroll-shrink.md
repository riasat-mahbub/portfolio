---
SCHEMA: 3
FORMAT: project-tracker
ID: BUG-01KYNGM83MD2W5N1841N0QE16T
TYPE: bug
STATUS: DONE
PRIORITY: Low
SEVERITY: Low
EFFORT: S
OWNER: opencode
CONFIDENCE: Medium
TAGS:
  - nav
  - ui
RELATIONS: null
AFFECTS:
  files:
    - src/components/nav.astro
LINKS: null
CREATED_BY: null
UPDATED_BY: null
CREATED_AT: "2026-07-28T23:23:15.444886+00:00"
UPDATED_AT: "2026-07-28T23:23:15.444886+00:00"
---

# Navbar minWidth too narrow — items overflow on scroll shrink

## Background

The navbar shrink effect compresses the nav width as the user scrolls. With 7 items (Home, Projects, Blog, Skills, Experience, Education, Connect) and gap-12 (48px gaps), the minimum shrink width of 680px was too tight, causing items to overflow.

## Investigation

## Decision

## Investigation

At 680px: 7 items × ~60px avg + 6 gaps × 48px = ~708px needed. The 680px minimum was 28px short.

## Decision

Increase `minWidth` from 680 to 850 to give adequate breathing room for all 7 items.

## Implementation

Changed `const minWidth = 680` to `const minWidth = 850` in the scroll shrink `requestAnimationFrame` callback.

## Resolution

Fixed — minWidth increased from 680 to 850

## Verification

Visual inspection confirms no overflow. `npm run build` passes with 0 errors.

## Follow-up

None.
