---
SCHEMA: 3
FORMAT: project-tracker
ID: FEAT-01KYNGQ94FHWM0Q89YVJRRW4DH
TYPE: feature
STATUS: DONE
PRIORITY: null
SEVERITY: null
EFFORT: M
OWNER: null
CONFIDENCE: Medium
TAGS:
  - projects
  - ui
  - portfolio
RELATIONS:
  depends_on:
    - ADR-01KYNGQPRAXSD3CAMY0DN40P28
AFFECTS: null
LINKS: null
CREATED_BY: null
UPDATED_BY: null
CREATED_AT: "2026-07-28T23:24:54.799480+00:00"
UPDATED_AT: "2026-07-28T23:24:54.799480+00:00"
---

# Projects section with GitHub-linked cards

## Background

Projects were scattered across the site. Needed a unified card layout with live GitHub links, tags, and a research subsection.

## Investigation

## Decision

## Investigation

## Decision

## Implementation

- b2ea1a3 (2026-07-27): merged into unified card layout, 5 projects with descriptions and tags, research subsection with 4 papers, external link arrows, "More projects on GitHub" CTA
- ca73fde (2026-07-27): cleanup — wrap paper description in conditional rendering

## Verification

Projects render as a responsive 2-column grid. Each card links to its GitHub repo with `rel="noopener noreferrer"`. Research papers link to academic sources.

## Follow-up
