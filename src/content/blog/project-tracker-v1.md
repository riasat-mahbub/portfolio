---
title: "A File-Based Project Knowledge Graph for AI-Assisted Development"
description: "How a 286-line Python script turned a folder of Markdown files into a project knowledge graph that AI coding agents can walk — no database, no API, just git."
tags: ["AI", "Coding Agents", "Project Management", "Python", "Open Source"]
publishDate: 2026-07-27
---

## The Problem

AI coding agents operate with severe context limitations. In a session, they see perhaps 1-4 files at a time. They don't have access to your Jira board, your Linear tickets, or your Notion docs. They can't read your team's Slack discussions about why a particular architectural decision was made. They start each session fresh — whatever happened in a previous session is gone unless it was committed to a file they can read.

The result is predictable: agents repeat mistakes, miss critical context, generate solutions that conflict with established decisions, and waste time rediscovering things the team already figured out.

Project teams typically solve this with a PLAN.md — a hand-maintained document at the root of the repo. But PLAN.md rots. It gets updated once and forgotten. It's a single file that becomes a dumping ground. There's no structure, no search, no way to answer "what depends on this feature?"

We needed something better: a persistent, structured, file-based project knowledge graph that lives in the repo itself, that agents can walk without a database or API, and that doesn't rot because it's part of the development workflow.

## The v1 Insight

The insight was simple: every bug, feature, and cross-cutting issue should live as a single Markdown file with YAML frontmatter, stored in a `tracker/` directory at the project root. A small Python script discovers these files, parses their frontmatter, and generates index pages and a dashboard README.

The entire v1 system was 286 lines of Python — stdlib only, no dependencies.

Four commands:
- `init` — scaffold the `tracker/` directory with subfolders
- `new` — create a new entry with auto-incrementing ID
- `close` — mark an entry closed with optional resolution and links
- `rebuild` — regenerate all index pages and the dashboard README

Three entry types: `bug`, `feature`, and `issue`.

## Entry Format

Every entry is a single `.md` file. The frontmatter is the source of truth — all structured metadata lives there. The body is free-form Markdown for investigation notes, decisions, and descriptions.

Here is a real entry from the MBuddy project, which tracked a multi-source anime/manga data pipeline:

```yaml
---
ID:             001
TYPE:           issue
NAME:           Phase 0: Discovery (Expanded)
SUMMARY:        Phase 0: Discovery — original seed data + expanded source investigation
STATUS:         CLOSED
TAGS:           phase-0,foundation
LINKS:          related-feature=006,related-feature=007,related-feature=010,related-feature=014,related-feature=016,related-feature=021,related-feature=022, fix-commit=6298a46,fix-commit=399ea93,fix-commit=81dc2b1,fix-commit=4771e40,fix-commit=2b29fce,fix-commit=9208997
---
```

The body below the frontmatter was a full Markdown document with Description, Key Findings, Entity Resolution Strategy, Schema Design, and Actions sections — 124 lines of detailed investigation notes.

The `LINKS` field was a flat comma-separated string of `key=value` pairs. It worked, but it was the seed of an idea that would grow into structured relations.

## The Script

The `tracker.py` script had three key functions that made it work:

### Finding the tracker root

```python
def find_tracker_root(start: Path) -> Path:
    cur = start.resolve()
    for candidate in [cur] + list(cur.parents):
        maybe = candidate / "tracker"
        if maybe.is_dir():
            return maybe
    return start / "tracker"
```

This walks up from the current directory looking for a `tracker/` folder. You can run `tracker.py rebuild` from any subdirectory — it finds the tracker automatically. This pattern carried forward into v2 unchanged.

### Auto-incrementing IDs

```python
def next_id(folder: Path) -> str:
    max_id = 0
    for p in entry_files(folder):
        try:
            fields = parse_entry(p)
            max_id = max(max_id, int(fields.get("ID", "0")))
        except (ValueError, TypeError):
            continue
    return f"{max_id + 1:03d}"
```

Scan all existing files, find the highest ID, increment by one, zero-pad to three digits.

### Rebuilding indexes

```python
def rebuild_indexes(root: Path):
    for label, folder_name in TYPE_TO_FOLDER.items():
        folder = root / folder_name
        table = build_index_table(folder)
        (folder / "index.md").write_text(header + table)
    # Generate README.md dashboard
    readme = "# Project Tracker\n\n..."
    (root / "README.md").write_text(readme)
```

Generate `index.md` in each folder with a Markdown table of entries, and a top-level `README.md` dashboard with counts per folder.

The full script is 286 lines. It's still in use today at `~/Projects/MBuddy/scripts/tracker.py`.

## Real Usage at Scale

The MBuddy project ran this v1 tracker for over 10 months. At the time of writing, it has **57 entries**:

```
| Folder    | OPEN | CLOSED | Total |
|-----------|------|--------|-------|
| bugs/     | 1    | 6      | 7     |
| features/ | 25   | 13     | 38    |
| issues/   | 6    | 6      | 12    |
| Total     | 32   | 25     | 57    |
```

Entries ranged from 13-line ADRs ("Legacy isolation") to 124-line detailed investigation documents ("Phase 0: Discovery"). The tracker survived multiple agents working on the project across dozens of sessions over nearly a year.

The workflow was simple:
1. Search entries with `grep` (there was no `search` command yet)
2. Read relevant entries for context
3. Make code changes
4. Update entry status and add links
5. Run `python scripts/tracker.py rebuild`

## Limitations That Drove v2

v1 worked, but it had growing pains:

**Only 3 types.** Bug, feature, and issue. No ADRs, no tasks, no epics. Architectural decisions had to be filed as `issue` with a `TAGS: adr` convention.

**No typed relations.** The `LINKS` field was an unparsed string. You couldn't query "what depends on this feature?" or "what bugs does this fix?" without parsing it yourself.

**No graph.json.** Agents had to scan all `.md` files to understand the project. With 57 entries, that's 57 file reads — slow and wasteful.

**No search.** `grep` was the search command. It works, but it doesn't know about frontmatter — you can't search by status, priority, or tags.

**No validation.** Typos in `STATUS`, broken cross-references, missing required fields — all silent failures.

**No schema versioning.** The format was whatever you wrote. No way to evolve it.

**No backlinks.** You couldn't answer "what references this entry?" without reading every file.

These limitations weren't fatal — v1 ran for 10 months — but they were the clear motivation for v2.

## What's Next

v2 turned the 286-line script into a pip-installable Python package with 9 CLI commands, a structured Schema 2 format, computed backlinks, full-text search, schema validation, and a Reasonix skill layer for AI coding agents. It also tracks itself — 13 entries in its own `tracker/` directory documenting its own architecture decisions.

[Part 2: Using the Project Tracker →](/blog/project-tracker-v2-tutorial)
[Part 3: Architecture & Design Decisions →](/blog/project-tracker-v2-architecture)
[Part 4: Integration & Evolution →](/blog/project-tracker-v2-evolution)
