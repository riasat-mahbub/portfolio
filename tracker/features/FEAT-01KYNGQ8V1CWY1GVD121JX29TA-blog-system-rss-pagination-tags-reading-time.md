---
SCHEMA: 3
FORMAT: project-tracker
ID: FEAT-01KYNGQ8V1CWY1GVD121JX29TA
TYPE: feature
STATUS: DONE
PRIORITY: null
SEVERITY: null
EFFORT: L
OWNER: null
CONFIDENCE: Medium
TAGS:
  - blog
  - rss
  - pagination
RELATIONS:
  depends_on:
    - ADR-01KYNGQPRAXSD3CAMY0DN40P28
AFFECTS: null
LINKS: null
CREATED_BY: null
UPDATED_BY: null
CREATED_AT: "2026-07-28T23:24:54.497610+00:00"
UPDATED_AT: "2026-07-28T23:24:54.497610+00:00"
---

# Blog system: RSS, pagination, tags, reading time

## Background

Original blog was a single page listing. Needed RSS for syndication, tag-based filtering, pagination for scale, and a dedicated reading experience.

## Investigation

## Decision

## Investigation

Astro content collections (MDX), @astrojs/rss for feed generation, dynamic route params for tag pages and pagination.

## Decision

## Implementation

- ad30a7b (2026-02-04): initial blog page with MDX content collection
- ad14791 (2026-02-04): first blog post (best-time-to-buy-and-sell-stock)
- dc2340e (2026-07-27): full overhaul — paginated listing at /blog (6 posts/page), tag pages at /blog/tags/ and /blog/tags/:slug, RSS at /rss.xml via @astrojs/rss, reading time estimates, prev/next post nav, BlogCard component, BlogNav, BlogLayout

## Verification

`astro build` generates index.html at /blog, RSS XML at /rss.xml, tag pages, paginated pages. Blog card renders on home page, listing, and tag filters.

## Follow-up

- Only 1 blog post — add more content
- Extract shared slugify() utility
