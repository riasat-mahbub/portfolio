---
SCHEMA: 2
FORMAT: project-tracker
ID: TASK-002
TYPE: task
STATUS: DONE
PRIORITY: null
SEVERITY: null
EFFORT: null
OWNER: null
CONFIDENCE: Medium
TAGS:
- css
- cleanup
- dead-code
RELATIONS:
  depends_on:
  - ADR-001
AFFECTS:
  files:
  - src/components/blog-section.astro
  - src/components/connect.astro
  - src/components/projects.astro
  - src/components/skills.astro
  - src/pages/blog/[...page].astro
LINKS: null
CREATED_BY: null
UPDATED_BY: null
COMPUTED:
  depended_by:
  - ADR-001
---

# Remove unused shiny-sec CSS class from 5 components

## Background

Five components included the class `shiny-sec` but no CSS rule defined it. It was likely a planned visual effect that was never implemented or was removed. The class was a no-op but added noise to the markup.

## Implementation

- Removed `shiny-sec` from all 5 references: blog-section.astro, connect.astro, projects.astro, skills.astro, and [...page].astro
- a53bfd7 (2026-07-27)
