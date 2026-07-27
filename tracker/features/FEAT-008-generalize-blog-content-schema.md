---
SCHEMA: 2
FORMAT: project-tracker
ID: FEAT-008
TYPE: feature
STATUS: DONE
PRIORITY: null
SEVERITY: null
EFFORT: null
OWNER: null
CONFIDENCE: Medium
TAGS:
- blog
- schema
RELATIONS: null
AFFECTS: null
LINKS: null
CREATED_BY: null
UPDATED_BY: tracker close
---

# Generalize blog content schema

## Background


## Investigation


## Decision


## Implementation


## Resolution

Added draft (boolean, default false), updatedDate (optional date), coverImage (optional string) to blog schema. Filtered drafts from all 6 getCollection call sites. BlogPost now shows updatedDate when present and passes coverImage to BlogLayout for OG image.

## Verification


## Follow-up