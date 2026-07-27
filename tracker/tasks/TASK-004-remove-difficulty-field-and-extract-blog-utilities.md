---
SCHEMA: 2
FORMAT: project-tracker
ID: TASK-004
TYPE: task
STATUS: DONE
PRIORITY: null
SEVERITY: null
EFFORT: null
OWNER: null
CONFIDENCE: Medium
TAGS:
- blog
- refactor
RELATIONS: null
AFFECTS: null
LINKS: null
CREATED_BY: null
UPDATED_BY: tracker close
---

# Remove difficulty field and extract blog utilities

## Background


## Investigation


## Decision


## Implementation


## Resolution

Removed difficulty from schema + all components. Created src/lib/utils.ts with slugify, readingTime, formatDate. Replaced all 3 copies of slugify and 3 copies of readingTime across pages/components. Fixed tag page to pass readingTime. Generalized empty state text. Standardized date formatting.

## Verification


## Follow-up