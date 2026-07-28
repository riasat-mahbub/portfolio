---
SCHEMA: 3
FORMAT: project-tracker
ID: TASK-01KYNGQPJBWA65ZND2N8W2TZDW
TYPE: task
STATUS: DONE
PRIORITY: Medium
SEVERITY: null
EFFORT: S
OWNER: opencode
CONFIDENCE: Medium
TAGS:
  - types
  - blog
RELATIONS:
  depends_on:
    - BUG-01KYNGM6WAHEAJNSTH01JGBGFB
AFFECTS:
  files:
    - src/pages/blog/[...page].astro
    - src/lib/blog.ts
LINKS: null
CREATED_BY: null
UPDATED_BY: null
CREATED_AT: "2026-07-28T23:25:08.555670+00:00"
UPDATED_AT: "2026-07-28T23:25:08.555670+00:00"
---

# Type pagination page properly and add defensive draft filter to getRelatedPosts

## Background

[...page].astro used any types for both paginate and Astro.props, and referenced non-existent page.current/page.last properties. getRelatedPosts() lacked a draft filter, which could leak unpublished posts.

## Investigation

## Decision

## Investigation

The Astro 5 `Page` interface uses `currentPage`/`lastPage` but the template used `current`/`last` — meaning pagination controls were silently non-functional (undefined > 1 = false). The `getRelatedPosts` function only filtered on slug mismatch, not on draft status.

## Decision

Properly type both `getStaticPaths` parameters and `Astro.props`. Fix the pagination property names. Add defensive draft filter to `getRelatedPosts`.

## Implementation

- Defined local `Page<T>` and `PaginateFn` types matching Astro's actual runtime shape
- Changed `page.current` → `page.currentPage`, `page.last` → `page.lastPage` throughout template
- Added `&& !p.data.draft` to the filter chain in `getRelatedPosts()`

## Resolution

Done — proper types, pagination prop names fixed, draft filter added

## Verification

`npm run build` passes with 0 errors, 0 warnings. Pagination controls now correctly reference `currentPage`/`lastPage`.

## Follow-up

None.
