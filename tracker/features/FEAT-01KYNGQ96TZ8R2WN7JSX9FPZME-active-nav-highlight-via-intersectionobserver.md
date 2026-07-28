---
SCHEMA: 3
FORMAT: project-tracker
ID: FEAT-01KYNGQ96TZ8R2WN7JSX9FPZME
TYPE: feature
STATUS: DONE
PRIORITY: null
SEVERITY: null
EFFORT: S
OWNER: null
CONFIDENCE: Medium
TAGS:
  - nav
  - ux
  - scroll
RELATIONS:
  depends_on:
    - ADR-01KYNGQPRAXSD3CAMY0DN40P28
AFFECTS: null
LINKS: null
CREATED_BY: null
UPDATED_BY: null
CREATED_AT: "2026-07-28T23:24:54.874896+00:00"
UPDATED_AT: "2026-07-28T23:24:54.874896+00:00"
---

# Active nav highlight via IntersectionObserver

## Background

Single-page site with 7 sections needed smooth navigation and scroll-aware UI.

## Investigation

## Decision

## Investigation

## Decision

## Implementation

- fd74051 (2025-10-10): rebuilt navbar with IntersectionObserver for active section highlighting, smooth scroll on nav click, scroll-shrink effect (nav collapses from full-width to 680px minimum), passive scroll listener for performance
- 9197e0c (2026-07-27): cleanup — guard nav width with Math.max to prevent negative values

## Verification

Clicking nav links smooth-scrolls to sections. Active section is highlighted with a green dot indicator. Nav shrinks on scroll and returns to full width at top.

## Follow-up
