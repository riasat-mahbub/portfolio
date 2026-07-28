---
SCHEMA: 3
FORMAT: project-tracker
ID: BUG-01KYNGM2B4S04YBFEQNX5XNPFC
TYPE: bug
STATUS: DONE
PRIORITY: Medium
SEVERITY: Low
EFFORT: null
OWNER: null
CONFIDENCE: Medium
TAGS:
  - typescript
  - config
  - bug
RELATIONS:
  depends_on:
    - ADR-01KYNGQPRAXSD3CAMY0DN40P28
AFFECTS:
  files:
    - tsconfig.json
LINKS: null
CREATED_BY: null
UPDATED_BY: null
CREATED_AT: "2026-07-28T23:23:09.541027+00:00"
UPDATED_AT: "2026-07-28T23:23:09.541027+00:00"
---

# tsconfig includes astro.config.ts instead of astro.config.mjs

## Background

The tsconfig.json include array referenced astro.config.ts, but the actual config file in the project is astro.config.mjs. TypeScript would silently skip this file. Additionally, moduleResolution was set to node, which prevented @astrojs/rss from being resolved in astro check.

## Investigation

## Decision

## Investigation

## Decision

## Implementation

- 19234ca (2026-07-27): changed `include` from `"astro.config.ts"` to `"astro.config.mjs"` and `moduleResolution` from `"node"` to `"bundler"`

## Verification

`astro check` no longer reports the `@astrojs/rss` module resolution error. `astro build` produces valid dist/.

## Follow-up
