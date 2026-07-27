---
SCHEMA: 2
FORMAT: project-tracker
ID: ADR-001
TYPE: adr
STATUS: DONE
PRIORITY: null
SEVERITY: null
EFFORT: null
OWNER: null
CONFIDENCE: Medium
TAGS:
  - architecture
  - frontend
  - static-site
RELATIONS:
  enables: [FEAT-001, FEAT-003, FEAT-005]
  relates_to: [FEAT-002, FEAT-004, FEAT-006]
AFFECTS:
  files:
    - astro.config.mjs
    - package.json
    - tsconfig.json
    - tailwind.config.mjs
LINKS: null
CREATED_BY: null
UPDATED_BY: null
---

# Astro 5 + Tailwind + React + static site architecture

## Background

Initial portfolio site rebuild. Needed a modern, performant static-site framework with built-in content collections, MDX support, and a rich ecosystem.

## Investigation

- **Astro 5**: zero-JS by default, content collections, island architecture, excellent DX
- **Tailwind CSS**: utility-first, easy theming for dark mode
- **React 19**: for interactive islands (future use)
- **Static output**: deployable to GitHub Pages with no server

## Decision

Adopt Astro 5 (static output) + Tailwind CSS + React 19 for interactive components. MDX for blog content. All integrations via @astrojs/* packages.

## Implementation

- `npx create-astro` scaffold
- Added @astrojs/tailwind, @astrojs/react, @astrojs/mdx, @astrojs/sitemap
- Path aliases `@/` → `src/`, `@components/` → `src/components/`
- Tailwind dark mode via `[data-theme="dark"]` class strategy
- Sharp for image optimization

## Verification

- `astro check` passes
- `astro build` produces static dist/ with no JS runtime required
- Deployed via GitHub Actions to GitHub Pages
