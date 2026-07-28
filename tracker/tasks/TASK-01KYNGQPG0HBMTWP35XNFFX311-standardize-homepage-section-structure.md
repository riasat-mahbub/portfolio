---
SCHEMA: 3
FORMAT: project-tracker
ID: TASK-01KYNGQPG0HBMTWP35XNFFX311
TYPE: task
STATUS: DONE
PRIORITY: Medium
SEVERITY: null
EFFORT: S
OWNER: opencode
CONFIDENCE: Medium
TAGS:
  - structure
  - a11y
RELATIONS: null
AFFECTS:
  files:
    - src/components/home.astro
    - src/components/experience.astro
    - src/components/education.astro
    - src/components/projects.astro
    - src/components/blog-section.astro
    - src/components/connect.astro
LINKS: null
CREATED_BY: null
UPDATED_BY: null
CREATED_AT: "2026-07-28T23:25:08.480201+00:00"
UPDATED_AT: "2026-07-28T23:25:08.480201+00:00"
---

# Standardize homepage section structure

## Background

The homepage had 9 structural inconsistencies across its 7 sections: missing h1, non-standard heading patterns, empty p tags, inconsistent border thickness, uneven vertical padding, and redundant max-w wrappers.

## Investigation

## Decision

## Investigation

Audit found these specific issues:

1. `home.astro`: No semantic `<h1>` (greeting was a `<p>`)
2. `experience.astro`/`education.astro`: Single-tier headings, missing subtitle, empty `<p>` tags
3. `projects.astro`: `py-12` vs `py-16` elsewhere
4. `blog-section.astro`: `py-12`, doubled `max-w-5xl mx-auto`, `border-t` instead of `border-t-2`, stray `my-10`
5. `connect.astro`: `border-t` vs `border-t-2` elsewhere

## Decision

Standardize all non-hero sections to `py-16`, `border-t-2`, two-tier heading pattern (h2 subtitle + h3 title), and full-width section with inner max-w container.

## Implementation

- `home.astro`: greeting `<p>` → `<h1>`
- `experience.astro`/`education.astro`: added h2 subtitle + h3 title, removed empty `<p>`
- `projects.astro`: `py-12` → `py-16`
- `blog-section.astro`: `py-12` → `py-16`, `border-t` → `border-t-2`, removed redundant max-w from section, removed `my-10`
- `connect.astro`: `border-t` → `border-t-2`

## Resolution

Done — standardized h1, headings, padding, borders, max-w across 6 sections

## Verification

`npm run build` passes with 0 errors. All sections now have consistent padding, borders, and heading hierarchy.

## Follow-up

Remaining structural improvements for future: section reordering (Blog between Projects and Skills), Research extraction into own section, border-[#ffffff10] class ordering cleanup.
