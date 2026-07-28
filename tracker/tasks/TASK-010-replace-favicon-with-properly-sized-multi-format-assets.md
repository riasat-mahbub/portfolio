---
SCHEMA: 2
FORMAT: project-tracker
ID: TASK-010
TYPE: task
STATUS: DONE
PRIORITY: High
SEVERITY: null
EFFORT: S
OWNER: opencode
CONFIDENCE: High
TAGS: seo, meta
RELATIONS:
  depends_on: []
  epic: []
AFFECTS:
  files:
  - public/apple-touch-icon.png
  - public/favicon-96x96.png
  - public/favicon.ico
  - public/favicon.svg
  - public/site.webmanifest
  - public/web-app-manifest-192x192.png
  - public/web-app-manifest-512x512.png
  - src/layouts/Layout.astro
  - src/layouts/BlogLayout.astro
LINKS: null
CREATED_BY: opencode
UPDATED_BY: tracker close
---

# Replace favicon with properly sized multi-format assets

## Background

The site used a single 256KB PNG (`/riasat.png`) as the favicon. No SVG favicon, no apple-touch-icon, no webmanifest for PWA support.

## Investigation

User provided a favicon.zip containing properly structured assets: SVG favicon, .ico fallback, PNG at 96x96, apple-touch-icon, web app manifest icons, and a site.webmanifest.

## Decision

Replace the single PNG with the full multi-format set. Update site.webmanifest with proper name/short_name and dark theme colors.

## Implementation

Copied 7 files from the zip to `public/`. Updated `site.webmanifest` with name="Riasat Mahbub", short_name="RM", theme/background color="#101010". Replaced the old `<link rel="icon" href="/riasat.png">` in both `Layout.astro` and `BlogLayout.astro` with proper links for ico, svg, apple-touch-icon, and manifest.

## Resolution

Done — 7 favicon assets deployed, layouts updated

## Verification

All 7 assets present in `dist/`. Built HTML shows all 4 links. No reference to old `riasat.png`. `npm run build` passes with 0 errors.

## Follow-up

Old `public/riasat.png` remains (no longer referenced) — can be removed in a future cleanup pass.