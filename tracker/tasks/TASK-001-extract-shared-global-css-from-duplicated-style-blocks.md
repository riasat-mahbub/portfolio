---
SCHEMA: 2
FORMAT: project-tracker
ID: TASK-001
TYPE: task
STATUS: DONE
PRIORITY: null
SEVERITY: null
EFFORT: null
OWNER: null
CONFIDENCE: Medium
TAGS:
- css
- refactor
- dedup
RELATIONS:
  depends_on:
  - ADR-001
  related:
  - FEAT-004
AFFECTS:
  files:
  - src/styles/global.css
  - src/layouts/Layout.astro
  - src/layouts/BlogLayout.astro
LINKS: null
CREATED_BY: null
UPDATED_BY: null
COMPUTED:
  depended_by:
  - ADR-001
  related:
  - FEAT-004
---

# Extract shared global.css from duplicated style blocks

## Background

Layout.astro and BlogLayout.astro each contained an identical 76-line `<style is:global>` block with CSS custom properties, light mode overrides, reset styles, and scrollbar styling. Any change required updating both files.

## Implementation

- Created src/styles/global.css with all shared styles (CSS variables, light mode overrides, reset, scrollbar)
- Replaced both <style is:global> blocks with `@import '../styles/global.css'` in both layouts
- a53bfd7 (2026-07-27)
