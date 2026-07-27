---
SCHEMA: 2
FORMAT: project-tracker
ID: BUG-002
TYPE: bug
STATUS: DONE
PRIORITY: null
SEVERITY: Low
EFFORT: null
OWNER: null
CONFIDENCE: Medium
TAGS:
- css
- bug
- scrollbar
RELATIONS:
  depends_on:
  - ADR-001
  related:
  - FEAT-004
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
  - FEAT-004
---

# Undefined CSS variables --container, --pink, --line in webkit scrollbar

## Background

The webkit scrollbar styles in both layouts referenced CSS variables that were never defined: `--container` (track background), `--pink` (thumb hover), `--line` and `--container` (Firefox scrollbar). This silently degraded to browser defaults instead of the intended themed scrollbar.

## Investigation

CSS variable references in scrollbar pseudo-elements:
- `::-webkit-scrollbar-track` used `var(--container)` — no such variable defined
- `::-webkit-scrollbar-thumb` used `var(--background)` — existed but wrong semantic (thumb should use --white-icon)
- `::-webkit-scrollbar-thumb:hover` used `var(--pink)` — no such variable
- Firefox `scrollbar-color` used `var(--line) var(--container)` — neither variable defined

## Implementation

- a53bfd7 (2026-07-27): replaced undefined variables with correct ones:
  - Track: `var(--container)` → `var(--white-icon-tr)`
  - Thumb: `var(--background)` → `var(--white-icon)`
  - Thumb hover: `var(--pink)` → `var(--sec)`
  - Firefox: `var(--line) var(--container)` → `var(--white-icon-tr) transparent`

## Verification

Scrollbar renders as themed in both light and dark modes. No undefined variable references remain. `astro build` produces valid output.
