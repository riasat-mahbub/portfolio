---
SCHEMA: 2
FORMAT: project-tracker
ID: FEAT-005
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
  - ADR-001
AFFECTS: null
LINKS: null
CREATED_BY: null
UPDATED_BY: null
COMPUTED:
  depended_by:
  - ADR-001
---

# Projects section with GitHub-linked cards

## Background

Projects were scattered across the site. Needed a unified card layout with live GitHub links, tags, and a research subsection.

## Implementation

- b2ea1a3 (2026-07-27): merged into unified card layout, 5 projects with descriptions and tags, research subsection with 4 papers, external link arrows, "More projects on GitHub" CTA

## Verification

Projects render as a responsive 2-column grid. Each card links to its GitHub repo with `rel="noopener noreferrer"`. Research papers link to academic sources.
