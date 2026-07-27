---
SCHEMA: 2
FORMAT: project-tracker
ID: BUG-001
TYPE: bug
STATUS: DONE
PRIORITY: null
SEVERITY: Medium
EFFORT: null
OWNER: null
CONFIDENCE: Medium
TAGS:
- security
- html
- component
RELATIONS:
  depends_on:
  - ADR-001
  related:
  - FEAT-005
AFFECTS:
  files:
  - src/components/social-links.astro
  - src/components/blog-nav.astro
  - src/layouts/BlogLayout.astro
  - src/components/connect.astro
LINKS: null
CREATED_BY: null
UPDATED_BY: null
COMPUTED:
  depended_by:
  - ADR-001
  related:
  - FEAT-005
---

# Missing rel=noopener noreferrer on target=_blank links

## Background

Six external links across four components used `target="_blank"` without `rel="noopener noreferrer"`, creating a tab-napping vulnerability. The opened page can access `window.opener` and redirect the original tab.

## Implementation

- 19234ca (2026-07-27): added `rel="noopener noreferrer"` to all 6 links — GitHub, LinkedIn, and Email in social-links.astro, RSS in blog-nav.astro and BlogLayout.astro footer, and social links in connect.astro

## Verification

All `<a target="_blank">` elements in the codebase now include `rel="noopener noreferrer"`. `astro build` produces valid output with no warnings.
