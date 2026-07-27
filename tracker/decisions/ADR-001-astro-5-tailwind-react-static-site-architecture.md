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
RELATIONS: null
AFFECTS: null
LINKS: null
CREATED_BY: null
UPDATED_BY: null
COMPUTED:
  referenced_by:
  - FEAT-001
  - FEAT-002
  - FEAT-003
  - FEAT-004
  - FEAT-005
  - FEAT-006
---

# Astro 5 + Tailwind + React + static site architecture

## Background

Personal portfolio needed a modern, performant static site. Requirements: content collections for blog, MDX support, good DX, deployable to GitHub Pages.

## Investigation

- Astro 5: zero-JS by default, content collections, island architecture, excellent DX
- Tailwind CSS: utility-first, easy dark mode theming via class strategy
- React 19: for interactive islands (theme toggle, future use)
- Static output: deployable to GitHub Pages with no server

## Decision

Astro 5 (static output) + Tailwind CSS + React 19 + MDX for blog content. All integrations via @astrojs/* packages.

## Implementation

- c6febe1 (2025-08-26): initial scaffold via `npx create-astro`
- Added @astrojs/tailwind, @astrojs/react, @astrojs/mdx, @astrojs/sitemap, @astrojs/rss over subsequent commits
- Path aliases @/ → src/, @components/ → src/components/
- Tailwind dark mode via `[data-theme="dark"]` class
- Sharp for image optimization
- GitHub Actions deploys to GitHub Pages on push to master

## Verification

`astro check` passes. `astro build` produces static dist/ (~0 JS by default). GitHub Pages serves the site live.
