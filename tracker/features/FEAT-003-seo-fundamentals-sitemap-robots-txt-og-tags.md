---
SCHEMA: 2
FORMAT: project-tracker
ID: FEAT-003
TYPE: feature
STATUS: DONE
PRIORITY: null
SEVERITY: null
EFFORT: S
OWNER: null
CONFIDENCE: Medium
TAGS:
- seo
- meta
RELATIONS:
  depends_on:
  - ADR-001
  related:
  - FEAT-001
AFFECTS: null
LINKS: null
CREATED_BY: null
UPDATED_BY: null
COMPUTED:
  depended_by:
  - ADR-001
  related:
  - FEAT-001
  referenced_by:
  - FEAT-007
---

# SEO fundamentals: sitemap, robots.txt, og tags

## Background

Portfolio lacked basic SEO — no sitemap, no robots.txt, incomplete Open Graph tags. Social previews (Twitter/LinkedIn/Discord) showed no image.

## Implementation

- 17f8831 (2026-07-27): @astrojs/sitemap integration, robots.txt, og:image meta tag using profile photo
- b2313c3 (2026-07-27): og:url meta tag added to Layout.astro

## Verification

`astro build` → dist/ contains sitemap-index.xml, sitemap-0.xml, robots.txt. Open Graph debugger shows title, description, image, and URL.
