---
title: "From Script to Package: Using the Project Tracker"
description: "A step-by-step walkthrough of installing, initializing, and using the project tracker CLI — from first entry to agent-integrated workflow."
tags: ["AI", "Coding Agents", "Python", "Tutorial", "Open Source"]
publishDate: 2026-07-27
---

This is Part 2 of a four-part series. [Part 1 covered the v1 system](/blog/project-tracker-v1) — the 286-line script that started it all. Here we walk through installing and using the v2 tool.

---

## Install in One Minute

The tracker CLI is a pip-installable Python package with a single dependency (`pyyaml`):

```bash
git clone git@github.com:riasat-mahbub/project-tracker-graph.git ~/Projects/project-tracker-graph
pip install -e ~/Projects/project-tracker-graph
```

Verify:

```bash
tracker --help
```

Output:

```
usage: tracker [-h]
               {init,new,close,validate,rebuild,migrate,doctor,search,stats}
               ...

Project knowledge graph tool
```

Nine commands. Let's use them.

## Initialize a New Tracker

```bash
cd my-project
tracker init
```

This creates a `tracker/` directory structure:

```
tracker/
├── bugs/
├── features/
├── decisions/
├── tasks/
├── epics/
├── docs/
├── _template.md
├── README.md        # generated dashboard
└── graph.json       # generated adjacency graph
```

Six entry types, each in its own folder. Commit this immediately:

```bash
git add tracker/
git commit -m "Initialize project tracker"
```

## Create Your First Entries

```bash
tracker new bug "Login race condition" --priority High --effort M
tracker new feature "Bulk export" --effort L
tracker new adr "Choose Postgres over MySQL" --status DONE
```

Each command creates a file with a zero-padded, prefixed ID and a slugified filename:

```
tracker/bugs/BUG-001-login-race-condition.md
tracker/features/FEAT-001-bulk-export.md
tracker/decisions/ADR-001-choose-postgres-over-mysql.md
```

The ID is auto-incremented per type. The next bug you create will be `BUG-002`.

Open the ADR file. The frontmatter looks like this:

```yaml
---
SCHEMA: 2
ID: ADR-001
TYPE: adr
STATUS: DONE
PRIORITY: High
CONFIDENCE: Medium
---
```

The body has sections waiting to be filled: Background, Investigation, Decision, Implementation, Verification, Follow-up.

Add `RELATIONS` to link entries together:

```yaml
RELATIONS:
  depends_on: ["FEAT-001"]
  epic: ["EPIC-001"]
AFFECTS:
  files: ["backend/database.py"]
```

## The Edit Cycle

Every code change follows a consistent loop:

1. **Search** for context before editing
2. **Read** the relevant entries
3. **Edit** code
4. **Update** the tracker entry (status, relations, affected files)
5. **Rebuild** indexes and graph.json
6. **Validate** consistency
7. **Commit** everything together

```bash
tracker search "login"
tracker rebuild
tracker validate
git add tracker/ && git commit -m "tracker: update BUG-001 after fix"
```

The `rebuild` command is the heart of the system. It:

1. Scans every entry file
2. Builds a graph from all `RELATIONS` declarations
3. Computes **backlinks** — for every entry, who references it?
4. Writes `tracker/graph.json` — the full adjacency graph
5. Generates `index.md` per folder with entry tables
6. Writes the top-level `README.md` dashboard
7. Injects `COMPUTED` backlinks into every entry file's frontmatter

After rebuild, an entry's frontmatter includes:

```yaml
COMPUTED:
  referenced_by:
    - BUG-003
  epic: EPIC-001
```

## Search Before You Edit

The `search` command ranks entries by matching your query against frontmatter fields (3x weight) and body text (1x weight):

```bash
tracker search "postgres"
```

Output:

```
ADR-001  HIGH  DONE    Choose Postgres over MySQL
FEAT-004  MED  PLANNED Database migration tooling
```

Search first, read the matches, then edit. This prevents duplicate entries and surfaces relevant context.

## The Agent Workflow

The tool becomes most powerful when paired with a Reasonix or OpenCode coding agent.

### Install the skill

The project-tracker skill lives in a separate repo:

```bash
git clone git@github.com:riasat-mahbub/project-tracker-skill.git ~/Projects/project-tracker-skill
ln -sfn ~/Projects/project-tracker-skill ~/.reasonix/skills/project-tracker
```

The skill's `SKILL.md` contains workflow instructions that the agent loads at session start. The `manifest.yaml` tells the agent which commands are read-only vs modifying.

### Auto-inject into AGENTS.md

When you run `tracker init`, the skill now also writes tracker-loading instructions into the project's `AGENTS.md`:

```markdown
## Required skill: project-tracker

This project uses a file-based project knowledge graph in tracker/.

- Before editing: search for related entries (`tracker search <topic>`)
- After editing: rebuild and validate (`tracker rebuild && tracker validate`)
```

Reasonix auto-injects `AGENTS.md` into every session's system prompt. The agent sees these instructions from session 1 onward — no manual "remember to use the tracker" prompts needed.

### The agent's view

At session start, the agent's system prompt includes:

```
Memory
/AGENTS.md (project)
...
Required skill: project-tracker
...
```

The skills index lists `project-tracker` with its description. The agent can load it with:

```
run_skill({ name: "project-tracker", arguments: "understand current project state" })
```

The skill's `SKILL.md` content is returned, and the agent follows its workflow instructions.

### The agent reads graph.json

Instead of scanning 57+ individual entry files, the agent reads one file:

```json
{
  "BUG-001": {
    "type": "bug",
    "status": "IN_PROGRESS",
    "priority": "High",
    "relations": { "depends_on": ["FEAT-018"], "epic": ["EPIC-001"] },
    "affects": { "files": ["backend/api/auth.py"] },
    "referenced_by": ["BUG-003"]
  }
}
```

One read, one JSON parse, and the agent has the full project graph — every entry, its relations, its backlinks, and which source files it touches.

## Summary

The v2 tool is a drop-in upgrade from v1. If you have a v1 tracker, run `tracker migrate` to convert it. The workflow is the same loop — search, edit, rebuild, validate, commit — but now with structured relations, full-text search, schema validation, and a graph.json that agents can read in one shot.

[Part 3: Architecture & Design Decisions →](/blog/project-tracker-v2-architecture)
[Part 4: Integration & Evolution →](/blog/project-tracker-v2-evolution)
