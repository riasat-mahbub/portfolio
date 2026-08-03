---
title: "Making the Tracker Queryable: Relations, graph.json, and the CLI"
description: "How the project tracker grew from a schema into a queryable graph, a single agent-readable file, and a package with a real CLI."
tags: ["AI", "Coding Agents", "Python", "Architecture", "Open Source"]
publishDate: 2026-07-27T18:00:00Z
---

This is a continuation of the project tracker series. You can read the previous entry on the schema redesign [here](/blog/project-tracker-v2-redesign). With the schema settled, the next question was how to make all of it actually useful.

## The graph: relations that point both ways

The next step was to make relations explicit. The original `LINKS` field was a string that you could read, but you couldn't ask it questions. Two entries could both mention `FEAT-002` and you'd never know unless you grepped for it. The whole point of moving to a schema was to make these things queryable, and a string of `key=value` pairs couldn't answer any of the questions we actually wanted to ask.

So we made relations explicit. The current schema swapped the string for a dict of typed edges:

```yaml
RELATIONS:
  depends_on: ["FEAT-002"]
  blocks: ["BUG-003"]
  implements: ["FEAT-005"]
  epic: ["EPIC-001"]
```

We grouped the relation types by what they actually express about work, and why each one had to be its own thing:

**Dependencies and blockers** — `depends_on`, `blocks`, `fixes`, `implements`. These describe how work relates to other work. A bug depends on a feature. A feature is implemented by an ADR. A bug blocks a task. The previous implementation had no way to express these. Two entries could be related, but the tool couldn't tell you _how_ without you reading both files. Without a typed relation, an agent looking at BUG-001 couldn't tell whether the link to FEAT-002 meant "this bug depends on it" or "this bug is a duplicate of it" or "this bug fixes it." The string could say "related" five different ways and mean five different things.

**Identity and equivalents** — `duplicate_of`, `supersedes`, `related`. Two entries that point to the same thing in different ways. A bug is a duplicate of another. An ADR supersedes a previous one. Two features are related. The reason these are separate types: `duplicate_of` needs different handling than `related`. A duplicate means "close this one, point to the other." A related entry means "look at this when working on that." They look similar in the original string, but they have different consequences.

**Grouping** — `epic`, `contains`, `parent`. How entries roll up into larger structures. A feature belongs to an epic. A task is contained in another. Without these, an agent had no way to navigate "what's in this epic?" without reading the epic entry and hoping it listed its children somewhere. The inverse map makes the answer computable from the schema.

Each one is a real category. They came from what we actually wanted to say about entries. The list grew out of specific use cases. A generic "tags" field would have given us something else entirely.

The clever part is the inverse map. For every relation, the schema defines its opposite:

```python
INVERSE_MAP = {
    "depends_on": "depended_by",
    "blocks": "blocked_by",
    "fixes": "fixed_by",
    "implements": "implemented_by",
    "duplicate_of": "has_duplicate",
    "related": "related",
    "supersedes": "superseded_by",
    "contains": "part_of",
    "epic": "contains",
    "parent": "children",
}
```

Why does this matter? Because when BUG-001 declares `depends_on: FEAT-002`, you get the forward edge for free. But the reverse question, "what depends on FEAT-002?", is the one an agent actually asks. Without the inverse map, that question means walking every other file in the project. With it, the answer is computable from the schema alone.

While we were at it, we added two more fields. `AFFECTS` for the source files and modules an entry touches. A structured `LINKS` that separates commit hashes from arbitrary URLs. Two more questions became answerable: "what does this touch?" and "what did this ship in?".

## graph.json: the read model for agents

The schema defines how knowledge is stored. Reading format is a separate problem. An agent that needs to understand a project with fifty entries should not have to open fifty files. The previous implementation made agents scan the Markdown files themselves whenever they wanted to find related work, and that got slow and bloated as the entry count grew.

So `tracker rebuild` generates a single file, `tracker/graph.json`, that holds the entire project as a graph:

```json
{
  "BUG-001": {
    "type": "bug",
    "status": "IN_PROGRESS",
    "priority": "High",
    "relations": { "depends_on": ["FEAT-018"], "epic": ["EPIC-001"] },
    "affects": { "files": ["src/auth.py"] },
    "referenced_by": ["BUG-003"]
  }
}
```

One file. One read. One `json.parse()`. The agent gets the whole picture, every entry, its type and status, its relations, its backlinks, and the files it touches. This single artifact is the reason the tool works for agents at all. Everything else is for humans.

## The package's architecture

Turning a script into a package invited a little discipline. The previous implementation was a single file you ran with the Python interpreter, which meant every project either carried its own copy or the agent left the project sandbox just to run it. A package changes that, and it also forced us to think about how the code was organized.

The architecture settled into four layers, each with one job:

- **Commands** are thin CLI handlers. Each one parses arguments, finds the tracker directory, calls a service, and prints the result. A command file is five to fifteen lines and contains almost no logic.
- **Services** hold the business logic. `GraphBuilder` builds the graph. `DashboardBuilder` regenerates the indexes and the dashboard README. `TrackerValidator` checks the schema. `TrackerMigrator` handles old entries. `Searcher` handles full-text search. `Doctor` bundles validation with auto-fixing.
- **Models** define the schema itself. The valid types, statuses, prefixes, folder mappings, and the inverse map. All plain Python sets and dicts, so they are easy to inspect.
- **Parsers** handle all YAML frontmatter I/O. Keeping the file format inside one layer means we can change it later without touching the graph builder.

Why go to this trouble for what started as a script? Because each layer is independently testable and independently replaceable. You can test the searcher without a CLI. You can swap the storage format without touching the graph builder. A public `Tracker` class wraps the whole thing, so the CLI, the tests, and programmatic harnesses all share one code path.

## A CLI you can hand to an agent

The package ships nine commands, and each one was designed to be the kind of thing an agent can run without a manual:

| Command            | What it does                                          |
| ------------------ | ----------------------------------------------------- |
| `tracker init`     | Scaffold the `tracker/` directory                     |
| `tracker new`      | Create an entry with an auto-incrementing prefixed ID |
| `tracker close`    | Mark an entry `DONE` with an optional resolution      |
| `tracker validate` | Check every entry against the schema                  |
| `tracker rebuild`  | Regenerate `graph.json`, indexes, and backlinks       |
| `tracker migrate`  | Upgrade old entries to the current schema             |
| `tracker doctor`   | Validate, rebuild, and auto-fix in one shot           |
| `tracker search`   | Full-text search across frontmatter and body          |
| `tracker stats`    | Aggregate counts by type and status                   |

The workflow for an agent became a tight loop: search for context, read the matching entries, do the work, create or close an entry, rebuild, validate, commit. Everything synchronizes itself. No hand-maintained indexes. No database. No API.

## What we got

Looking back, the redesign delivered on the list we set out with: more entry types, typed relations, robust search, and backlinks. An agent could now orient itself in a project with a single file read.

But there was a problem we could not see from the design table. We had never actually used the tool. A knowledge tool for agents only proves itself when it is operated under real conditions, across hundreds of edits, with mistakes and drift and decisions made at odd hours. The only honest way to test that was to use the tool to track its own development.

That was the plan going forward.

## What we planned next

We planned to dogfood the tracker on the tracker. Build the tool the same way we would build anything else, by filing bugs, features, ADRs, and epics through the tool itself. Use it on real problems and see what broke.

We expected the search to hold up. We expected the graph to be reliable. We expected the schema to be solid.

We expected wrong.
