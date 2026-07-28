---
SCHEMA: 3
FORMAT: project-tracker
ID: BUG-01KYNGM6WAHEAJNSTH01JGBGFB
TYPE: bug
STATUS: DONE
PRIORITY: Medium
SEVERITY: Low
EFFORT: S
OWNER: opencode
CONFIDENCE: Medium
TAGS:
  - blog
RELATIONS: null
AFFECTS:
  files:
    - src/lib/blog.ts
LINKS: null
CREATED_BY: null
UPDATED_BY: null
CREATED_AT: "2026-07-28T23:23:14.186290+00:00"
UPDATED_AT: "2026-07-28T23:23:14.186290+00:00"
---

# Tag display names lost capitalization after blog.ts refactor

## Background

getAllTags() used tag.toLowerCase() as the map key, which caused tag names like AI to display as ai on tag filter pages.

## Investigation

## Decision

## Investigation

The function stored and returned lowercased keys. Both `tags/index.astro` and `tags/[tag].astro` used the map key directly for display, so the lowercase version was shown.

## Decision

Preserve original case for display. Use a separate `tagDisplay` map to track the first-occurrence casing for each lowercase key.

## Implementation

Added `tagDisplay` map to track lowercase→original mapping. The returned `tagMap` now uses the original-case display name as the key while still deduplicating case-insensitively.

## Resolution

Fixed — getAllTags now preserves original-case display names via separate tagDisplay map

## Verification

Built output shows `"AI"` instead of `"ai"` in the tag page heading. `npm run build` passes with 0 errors.

## Follow-up

None.
