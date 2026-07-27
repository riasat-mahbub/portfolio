---
title: "From Script to Package: Architecture & Design Decisions"
description: "Deep-dive into Schema 2, graph.json, the 4-layer package architecture, computed backlinks, and the five architectural decisions documented as ADRs in the tracker itself."
tags: ["AI", "Coding Agents", "Python", "Architecture", "Open Source"]
publishDate: 2026-07-27
---

This is Part 3 of a four-part series. [Part 1](/blog/project-tracker-v1) covered the v1 script. [Part 2](/blog/project-tracker-v2-tutorial) was a tutorial on using the v2 tool. Here we go deep on the architecture and the design decisions that shaped it.

---

## Schema 2: Structured Entries

v1 had a flat format: `001`, `TYPE`, `NAME`, `STATUS`, `TAGS`, and a string `LINKS`. v2 introduced a proper schema with versioning, structured relations, and full validation.

### Six entry types

| Type | Folder | Prefix | Purpose |
|------|--------|--------|---------|
| `bug` | `bugs/` | BUG | Defects and issues |
| `feature` | `features/` | FEAT | Capabilities and enhancements |
| `adr` | `decisions/` | ADR | Architectural Decision Records |
| `task` | `tasks/` | TASK | Chores and operational work |
| `epic` | `epics/` | EPIC | Group of related entries |
| `doc` | `docs/` | DOC | Documentation references |

### The frontmatter fields

Every entry has required and optional fields, all defined as constants in `schema.py`:

```python
REQUIRED_FIELDS = {"SCHEMA", "ID", "TYPE", "STATUS"}
OPTIONAL_FIELDS = {
    "FORMAT", "PRIORITY", "SEVERITY", "EFFORT", "OWNER",
    "CONFIDENCE", "TAGS", "RELATIONS", "AFFECTS", "LINKS",
    "CREATED_BY", "UPDATED_BY", "COMPUTED",
}
```

Real example from the tool's own tracker:

```yaml
---
SCHEMA: 2
ID: ADR-001
TYPE: adr
STATUS: DONE
PRIORITY: High
CONFIDENCE: Medium
TAGS:
  - architecture
RELATIONS: null
AFFECTS: null
LINKS: null
---
```

### Typed relations

The key innovation over v1 is structured `RELATIONS` — a dict of typed edges:

```yaml
RELATIONS:
  depends_on: ["FEAT-002"]
  blocks: ["BUG-003"]
  implements: ["FEAT-005"]
  epic: ["EPIC-001"]
  duplicate_of: ["BUG-001"]
  related: ["DOC-002"]
  supersedes: ["ADR-003"]
  contains: ["TASK-001"]
  parent: ["EPIC-001"]
```

Each type has a defined inverse. The `INVERSE_MAP` in `schema.py`:

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

When you declare `depends_on: ["FEAT-002"]` on BUG-001, the backlink `depended_by: ["BUG-001"]` is automatically computed and written into FEAT-002's `COMPUTED` field on the next `rebuild`.

### AFFECTS and LINKS

`AFFECTS` tracks which source files and modules an entry touches:

```yaml
AFFECTS:
  files: ["src/tracker/services/graph_builder.py"]
  modules: ["services"]
```

`LINKS` separates commit references from other links:

```yaml
LINKS:
  commits: ["abc123"]
  raw: {"pr": "https://github.com/.../pull/42"}
```

### Full enum validation

The `validate` command checks every field against defined enums:

```python
VALID_STATUSES = {"PROPOSED", "PLANNED", "IN_PROGRESS", "BLOCKED",
                  "TESTING", "DONE", "CANCELLED", "DUPLICATE"}
VALID_PRIORITIES = {"Critical", "High", "Medium", "Low"}
VALID_SEVERITIES = {"Critical", "High", "Medium", "Low"}
VALID_EFFORTS = {"XS", "S", "M", "L", "XL"}
VALID_CONFIDENCES = {"High", "Medium", "Low"}
```

A typo in `STATUS: DONE` (missing the E) is caught immediately.

## graph.json: The Adjacency File for AI Agents

The single most important feature for AI agent integration is `tracker/graph.json`. This file is written by `tracker rebuild` and contains every entry as a node with its relations, affected files, and computed backlinks.

```json
{
  "BUG-001": {
    "type": "bug",
    "status": "IN_PROGRESS",
    "priority": "High",
    "relations": {
      "depends_on": ["FEAT-018"],
      "epic": ["EPIC-001"]
    },
    "affects": {
      "files": ["src/auth.py"]
    },
    "referenced_by": ["BUG-003"]
  },
  "FEAT-001": {
    "type": "feature",
    "status": "DONE",
    "priority": "High",
    "relations": {},
    "affects": {},
    "referenced_by": ["ADR-001"]
  }
}
```

An agent can read this one file and get the full project graph in a single `read` call and one `json.parse()`. No scanning, no directory walking, no parsing 57 individual files.

The `GraphBuilder` service constructs this by:

1. Scanning all entry files via `scan_entries()`
2. Building a node for each entry with its type, status, and priority
3. Copying `RELATIONS` and `AFFECTS` into the node
4. Walking every entry's relations to compute inverse backlinks
5. Writing the combined result to `graph.json`

## Four-Layer Architecture

The codebase is split into four layers, each with a distinct responsibility. This was a deliberate decision (recorded as ADR-001 in the tool's own tracker).

### Commands layer (thin CLI handlers)

The `commands/` directory contains 9 files, each 5-15 lines. They parse CLI arguments, find the tracker root, instantiate a service, and print results. They have almost no business logic.

```python
# src/tracker/commands/validate.py
import sys
from pathlib import Path
from tracker.services.validator import TrackerValidator

def cmd_validate(args):
    root = _find_tracker_root(Path.cwd())
    validator = TrackerValidator(root / "tracker")
    report = validator.validate()
    if not report["valid"]:
        for err in report.get("errors", []):
            print(f"ERROR: {err}")
        sys.exit(1)
    print(f"Validated {report['total']} entries — 0 errors, 0 warnings")
```

Commands are lazy-imported at call time — only the needed module is loaded.

### Services layer (business logic)

Six services, each independently testable:

| Service | Responsibility |
|---------|---------------|
| `GraphBuilder` | Builds `graph.json` with computed backlinks |
| `DashboardBuilder` | Writes `README.md`, `index.md` files, injects COMPUTED backlinks |
| `TrackerValidator` | Checks schema, enums, duplicate IDs, broken cross-refs |
| `TrackerMigrator` | Upgrades v1 entries to Schema 2 |
| `Searcher` | Full-text search with frontmatter-weighted scoring |
| `Doctor` | Validate + rebuild + auto-fix in one command |

### Models layer (schema constants)

The `models/` directory holds the schema definition — valid values, type mappings, folder mappings, and the inverse relation map. These are plain Python sets and dicts, not typed classes.

```python
TYPE_PREFIXES = {
    "bug": "BUG", "feature": "FEAT", "adr": "ADR",
    "task": "TASK", "epic": "EPIC", "doc": "DOC",
}

TYPE_TO_FOLDER = {
    "bug": "bugs", "feature": "features", "adr": "decisions",
    "task": "tasks", "epic": "epics", "doc": "docs",
}
```

### Parsers layer (I/O)

The `parsers/` directory handles YAML frontmatter reading, writing, and entry scanning. The frontmatter parser splits authored metadata from `COMPUTED` (auto-generated) metadata to prevent accidental overwrites.

### The Tracker class

A single public API facade wraps all services:

```python
class Tracker:
    def validate(self) -> dict: ...
    def rebuild(self) -> dict: ...
    def migrate(self, target: int = 2) -> dict: ...
    def doctor(self) -> dict: ...
    def search(self, query: str) -> list: ...
    def stats(self) -> dict: ...
    def new_entry(self, type_: str, name: str, **kw) -> str: ...
    def close_entry(self, entry_id: str, resolution: str = "") -> bool: ...
```

The CLI, tests, and programmatic harnesses all use this same class.

## Computed Backlinks

Backlinks are the graph's inverse edges — given entry A, which other entries reference it?

The `GraphBuilder` computes these during `rebuild`:

1. Iterate every entry's `RELATIONS`
2. For each relation type, look up the inverse type in `INVERSE_MAP`
3. Add the current entry's ID to the referenced entry's backlinks
4. Write the result into each entry's `COMPUTED` field

The `COMPUTED` field is written directly into every entry file during `rebuild`. This is an intentional design choice: it makes backlinks visible and grep-able when reading individual entries. The tradeoff is that every entry file is touched on every rebuild.

## The Five ADRs

The tool tracks itself. Its own architectural decisions are recorded as ADR entries in its `tracker/decisions/` directory. Here they are:

### ADR-001: Commands/Services/Models separation

**Decision:** Split into four layers — commands (thin wrappers), services (business logic), models (schema constants), parsers (I/O).

Each command file is 5-15 lines. Services are independently testable. Models are plain dicts and sets, easily inspected. Parsers handle all YAML I/O, keeping the format flexible.

### ADR-002: YAML frontmatter + Markdown body over pure YAML

**Decision:** Use YAML frontmatter for metadata and structured fields. Use free-form Markdown for the body.

Pure YAML would require escaping long-form narrative text (investigation notes, decisions). Splitting frontmatter from body matches the GitHub Issues model and is more ergonomic for humans writing long-form content.

### ADR-003: Graph as dicts, not typed classes

**Decision:** Represent graph nodes and entries as plain Python dicts, not dataclasses or Pydantic models.

Dicts serialize to JSON trivially — no custom encoders needed. The `models/entry.py` and `models/graph.py` files exist as stubs for a future typed layer if justified by complexity.

### ADR-004: Pure Python validation over JSON Schema

**Decision:** Use plain Python `if`/`elif` checks for validation instead of a JSON Schema library.

Keeps the dependency footprint minimal — only `pyyaml`. The validator checks required fields, enum values, relation structure, duplicate IDs, and broken cross-references with simple Python logic.

### ADR-005: Editable pip install over standalone script

**Decision:** Package as a proper Python package with `pyproject.toml` and a `console_scripts` entry point.

Enables `pip install -e .` for development and `from tracker import Tracker` for programmatic use. Replaced the old `python tracker.py ...` invocation pattern.

## What's Next

[Part 4: Integration & Evolution →](/blog/project-tracker-v2-evolution) covers the v1→v2 migration, the 9 CLI commands in detail, the skill layer for AI agents, dogfooding, and the AGENTS.md injection pattern.
