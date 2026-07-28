---
SCHEMA: 3
FORMAT: project-tracker
ID: FEAT-01KYNGQ923VJADMA3RW46NTB7Z
TYPE: feature
STATUS: DONE
PRIORITY: null
SEVERITY: null
EFFORT: M
OWNER: null
CONFIDENCE: Medium
TAGS:
  - theme
  - dark-mode
  - css
RELATIONS:
  depends_on:
    - ADR-01KYNGQPRAXSD3CAMY0DN40P28
AFFECTS: null
LINKS: null
CREATED_BY: null
UPDATED_BY: null
CREATED_AT: "2026-07-28T23:24:54.723914+00:00"
UPDATED_AT: "2026-07-28T23:24:54.723914+00:00"
---

# Dark mode with theme toggle

## Background

Initial portfolio only had dark theme. Needed light mode toggle for accessibility and user preference.

## Investigation

## Decision

## Investigation

## Decision

## Implementation

- ecab478 (2025-10-17): theme-toggle.astro component, CSS custom properties (--background, --sec, --white, --white-icon, --white-icon-tr), Tailwind `[data-theme="dark"]` class strategy, light mode overrides for card backgrounds, borders, and hover states
- a53bfd7 (2026-07-27): cleanup — extract CSS variables and light mode overrides into shared global.css

## Verification

Toggle button switches between light and dark themes. All sections (home, projects, skills, experience, education, blog, connect) render correctly in both modes.

## Follow-up
