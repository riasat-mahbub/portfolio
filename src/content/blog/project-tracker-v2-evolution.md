---
title: "From Script to Package: Integration & Evolution"
description: "Deep-dive into the 9 CLI commands, v1→v2 migration, the Reasonix/OpenCode skill layer, dogfooding the tracker on itself, and the AGENTS.md auto-injection pattern."
tags: ["AI", "Coding Agents", "Python", "Architecture", "Open Source"]
publishDate: 2026-07-27
---

This is Part 4 of a four-part series. [Part 1](/blog/project-tracker-v1) covered the v1 script. [Part 2](/blog/project-tracker-v2-tutorial) was a tutorial. [Part 3](/blog/project-tracker-v2-architecture) covered the architecture and design decisions. Here we cover the remaining pieces: the CLI commands, the v1→v2 migration, the skill layer, dogfooding, and the AGENTS.md injection pattern.

---

## The 9 CLI Commands

### `tracker init`

Scaffolds the `tracker/` directory with all subfolders, a `_template.md` for new entries, and an initial `graph.json`. Also writes tracker-loading instructions into `AGENTS.md` (see the AGENTS.md injection section below).

### `tracker new <type> <name>`

Creates a new entry with auto-incrementing, zero-padded, prefixed ID:

```bash
tracker new bug "Race condition in auth" --priority High --effort M
# Creates: tracker/bugs/BUG-001-race-condition-in-auth.md
```

The `_next_id` function scans existing files for the type, finds the max numeric suffix, and increments by 1.

### `tracker close <id>`

Marks an entry as DONE with optional resolution:

```bash
tracker close BUG-001 --resolution "Added write lock"
```

### `tracker validate`

The schema validator checks:

- Required fields (`SCHEMA`, `ID`, `TYPE`, `STATUS`)
- Enum values (status, priority, severity, effort, confidence)
- Relation structure — target IDs must exist
- Duplicate IDs across files
- File location matches its type's folder

### `tracker rebuild`

The core command. Runs the `GraphBuilder`, `DashboardBuilder`, and backlink injection:

1. **Scans** all entry files
2. **Builds** the graph from RELATIONS declarations
3. **Computes** backlinks via the INVERSE_MAP
4. **Writes** `graph.json`
5. **Injects** COMPUTED backlinks into every entry file
6. **Generates** `index.md` per folder with entry tables
7. **Writes** the top-level `README.md` dashboard

### `tracker migrate`

Upgrades v1 entries to Schema 2:

```bash
tracker migrate
```

This is a one-time operation per project. The details are below in the migration section.

### `tracker doctor`

A Swiss-army knife — runs `validate`, then `rebuild`, then fills empty bodies:

```bash
tracker doctor
```

It collects warnings from validate, regenerates all indexes, and writes placeholder bodies for entries that have none.

### `tracker search <query>`

Full-text search across frontmatter fields (3x weight) and body text (1x):

```bash
tracker search "postgres migration"
```

Returns ranked results with snippets, entry IDs, and status.

### `tracker stats`

Quick project overview:

```bash
tracker stats
```

Output:

```
Total entries: 13

By type:
  adr          5
  bug          1
  feature      7

By status:
  DONE           13
```

## v1→v2 Migration

The migrator handles upgrading an existing v1 tracker to Schema 2. Here's what it does per entry:

### 1. ID normalization

v1 IDs were plain numbers with no prefix: `001`, `002`. v2 uses prefixed IDs: `BUG-001`, `FEAT-002`. The migrator prepends the type prefix and zero-pads:

```
001 (issue)  →  TASK-001
002 (feature) →  FEAT-002
```

### 2. LINKS string parsing

v1 stored links as a flat comma-separated string:

```
LINKS: fix-commit=abc123,related-feature=006,related-feature=007,epic=EPIC-001
```

The migrator parses this with a regex pattern:

```python
V1_LINK_PATTERN = r"(?P<key>[\w-]+)=(?P<value>[\w-]+)"
```

A `LINK_MAP` classifies each key:

| v1 key            | v2 destination                       |
| ----------------- | ------------------------------------ |
| `fix-commit`      | `LINKS.commits`                      |
| `related-feature` | `RELATIONS.related` (prefix → FEAT-) |
| `related-issue`   | `RELATIONS.related` (prefix → TASK-) |
| `related-adr`     | `RELATIONS.related` (prefix → ADR-)  |
| `parent`          | `RELATIONS.parent`                   |
| `depends-on`      | `RELATIONS.depends_on`               |
| `blocks`          | `RELATIONS.blocks`                   |
| `epic`            | `RELATIONS.epic`                     |
| (unknown)         | `LINKS.raw`                          |

### 3. File relocation

Entries are moved from their v1 folder to the correct v2 folder. A v1 `issue` in `issues/` becomes a `task` in `tasks/`. A v1 `bug` in `bugs/` stays in `bugs/`. Files are renamed from `001-slug.md` to `TASK-001-slug.md`.

### 4. SCHEMA field addition

Every migrated entry gets `SCHEMA: 2` in its frontmatter. Empty bodies are replaced with the standard template (Background, Investigation, Decision, Implementation, Verification, Follow-up).

## The Skill Layer

The project-tracker-skill repo provides the bridge between the CLI tool and AI coding agents. It consists of three files.

### SKILL.md

The main skill definition with Reasonix-compatible frontmatter:

```yaml
---
name: project-tracker
description: File-based project knowledge graph. Before editing, search related bugs, features, ADRs. After changes, rebuild and validate.
runAs: inline
---
```

The `runAs: inline` directive means the skill's content is returned directly to the calling agent, not dispatched to a subagent. The body contains:

- **Prerequisites:** checks that `tracker --help` works
- **Init workflow:** `tracker init` → AGENTS.md injection → commit
- **Before editing workflow:** search → read matches → validate
- **After editing workflow:** update entry → rebuild → validate → commit
- **Creating entries workflow:** `tracker new` → fill RELATIONS/AFFECTS/body → rebuild → commit
- **Reading the graph workflow:** read `tracker/graph.json` for the full project state
- **Closing entries workflow:** `tracker close` → verify → commit
- **Quick command reference table**

### manifest.yaml

Machine-readable command metadata:

```yaml
schema: 1
name: project-tracker
commands:
  init:
    read_only: false
    generates: [tracker/ directory structure]
  search:
    read_only: true
  rebuild:
    read_only: false
    generates:
      [tracker/README.md, index.md files, graph.json, COMPUTED backlinks]
  validate:
    read_only: true
```

This tells the agent which commands are safe to run without user confirmation (read-only) and which modify the tracker.

### Installation

The skill is installed as a symlink:

```bash
ln -sfn ~/Projects/project-tracker-skill ~/.reasonix/skills/project-tracker
ln -sfn ~/Projects/project-tracker-skill ~/.opencode/skills/project-tracker
```

At session start, Reasonix discovers all skills in `~/.reasonix/skills/`, injects a skills index into the system prompt, and the agent can load any skill with `run_skill()`.

### AGENTS.md auto-injection

This is the pattern that makes the skill sticky. The init workflow writes tracker-loading instructions into the project's `AGENTS.md`:

```markdown
## Required skill: project-tracker

This project uses a file-based project knowledge graph in tracker/.

- Before editing: search for related entries (`tracker search <topic>`)
- After editing: rebuild and validate (`tracker rebuild && tracker validate`)
```

Reasonix auto-injects `AGENTS.md` into every session's system prompt under a `# Memory` section. The agent sees these instructions from the first message of every session. No manual "please use the tracker" prompts needed.

## Dogfooding

The tool tracks itself. Its `tracker/` directory contains 13 entries:

| Type | Count | Examples                                                                                          |
| ---- | ----- | ------------------------------------------------------------------------------------------------- |
| ADR  | 5     | Package structure, YAML+Markdown, graph as dicts, pure Python validation, pip install             |
| FEAT | 7     | 9 CLI commands, graph.json, dashboard builder, v1→v2 migration, search, doctor, Tracker class API |
| BUG  | 1     | Package discovery on editable install                                                             |

Every ADR documents a real architectural decision made during development. Every FEAT corresponds to a shipped capability. The BUG records a real issue (the `assets/` directory was detected as a top-level package by setuptools, breaking `pip install -e`).

Running `tracker stats` in the tool repo is a meta-command — the tool reporting on itself.

The dogfooding even uncovered a design issue: the Python package was named `tracker/`, which conflicted with the tracker data directory also named `tracker/`. The fix was to move the package into a `src/` layout (`src/tracker/`) so that `tracker init` could create a clean `tracker/` data directory at the repo root. This was captured as part of the development workflow — search, edit, rebuild, validate, commit — using the tool to track itself.

## The Full Evolution

|                   | v1                          | v2                                           |
| ----------------- | --------------------------- | -------------------------------------------- |
| Lines of code     | 286                         | ~1,500                                       |
| Language          | stdlib Python               | Python + pyyaml                              |
| Installation      | `python scripts/tracker.py` | `pip install -e .` + `tracker` CLI           |
| Entry types       | 3 (bug, feature, issue)     | 6 (+ adr, task, epic, doc)                   |
| Relations         | Flat `LINKS` string         | Structured `RELATIONS` dict with typed edges |
| Backlinks         | None                        | Computed via INVERSE_MAP                     |
| graph.json        | None                        | Full adjacency file                          |
| Search            | `grep`                      | Full-text with frontmatter weighting         |
| Validation        | None                        | Schema, enum, cross-ref, duplicate checks    |
| Schema versioning | None                        | SCHEMA field, migrator                       |
| Agent integration | Manual                      | Skill layer + AGENTS.md auto-injection       |
| Self-tracking     | No                          | 13 entries in its own tracker/               |

The project is MIT-licensed at [github.com/riasat-mahbub/project-tracker-graph](https://github.com/riasat-mahbub/project-tracker-graph). The skill layer is at [github.com/riasat-mahbub/project-tracker-skill](https://github.com/riasat-mahbub/project-tracker-skill).
