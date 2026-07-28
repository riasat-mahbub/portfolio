---
SCHEMA: 3
FORMAT: project-tracker
ID: FEAT-01KYNGQ9BBFA84QJNSPGD3K9Z0
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
UPDATED_BY: null
CREATED_AT: "2026-07-28T23:24:55.019547+00:00"
UPDATED_AT: "2026-07-28T23:24:55.019547+00:00"
---

# Generalize blog content schema

## Background

Generalize blog content schema

## Investigation

## Decision

## Investigation

## Decision

## Implementation

## Verification

## Follow-up

Added draft (boolean, default false), updatedDate (optional date), coverImage (optional string) to blog schema. Filtered drafts from all 6 getCollection call sites. BlogPost now shows updatedDate when present and passes coverImage to BlogLayout for OG image.
