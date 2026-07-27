---
SCHEMA: 2
FORMAT: project-tracker
ID: BUG-004
TYPE: bug
STATUS: DONE
PRIORITY: null
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
  - ADR-001
AFFECTS:
  files:
  - tsconfig.json
LINKS: null
CREATED_BY: null
UPDATED_BY: null
COMPUTED:
  depended_by:
  - ADR-001
---

# tsconfig includes astro.config.ts instead of astro.config.mjs

## Background

The tsconfig.json `include` array referenced `"astro.config.ts"`, but the actual config file in the project is `astro.config.mjs`. TypeScript would silently skip this file. Additionally, `moduleResolution` was set to `"node"`, which prevented `@astrojs/rss` from being resolved in `astro check`.

## Implementation

- 19234ca (2026-07-27): changed `include` from `"astro.config.ts"` to `"astro.config.mjs"` and `moduleResolution` from `"node"` to `"bundler"`

## Verification

`astro check` no longer reports the `@astrojs/rss` module resolution error. `astro build` produces valid dist/.
