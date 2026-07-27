---
SCHEMA: 2
FORMAT: project-tracker
ID: FEAT-004
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
  - ADR-001
AFFECTS: null
LINKS: null
CREATED_BY: null
UPDATED_BY: null
COMPUTED:
  depended_by:
  - ADR-001
---

# Dark mode with theme toggle

## Background

Initial portfolio only had dark theme. Needed light mode toggle for accessibility and user preference.

## Implementation

- ecab478 (2025-10-17): theme-toggle.astro component, CSS custom properties (--background, --sec, --white, --white-icon, --white-icon-tr), Tailwind `[data-theme="dark"]` class strategy, light mode overrides for card backgrounds, borders, and hover states

## Verification

Toggle button switches between light and dark themes. All sections (home, projects, skills, experience, education, blog, connect) render correctly in both modes.
