---
SCHEMA: 3
FORMAT: project-tracker
ID: FEAT-01KYNGQ8ZTNHTM57TEJ87RQF88
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
    - ADR-01KYNGQPRAXSD3CAMY0DN40P28
  related:
    - FEAT-01KYNGQ8V1CWY1GVD121JX29TA
AFFECTS: null
LINKS: null
CREATED_BY: null
UPDATED_BY: null
CREATED_AT: "2026-07-28T23:24:54.650833+00:00"
UPDATED_AT: "2026-07-28T23:24:54.650833+00:00"
---

# SEO fundamentals: sitemap, robots.txt, og tags

## Background

Portfolio lacked basic SEO — no sitemap, no robots.txt, incomplete Open Graph tags. Social previews (Twitter/LinkedIn/Discord) showed no image.

## Investigation

## Decision

## Investigation

## Decision

## Implementation

- 17f8831 (2026-07-27): @astrojs/sitemap integration, robots.txt, og:image meta tag using profile photo
- b2313c3 (2026-07-27): og:url meta tag added to Layout.astro

## Verification

`astro build` → dist/ contains sitemap-index.xml, sitemap-0.xml, robots.txt. Open Graph debugger shows title, description, image, and URL.

## Follow-up
