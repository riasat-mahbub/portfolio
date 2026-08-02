---
title: "A File-Based Project Knowledge Database for AI-Assisted Development"
description: "Creating a new way to store project knowledge for AI agents without resorting to full blown vector databases"
tags: ["AI", "Coding Agents", "Project Management", "Python", "Open Source"]
publishDate: 2026-07-27
---

## The Problem

AI coding agents operate with severe context limitations. In a session, they see perhaps 1-4 files at a time. They don't have access to your Jira board, your Linear tickets, or your Notion docs. They can't read your team's Slack discussions about why a particular architectural decision was made. They start each session fresh. Whatever happened in a previous session is gone unless it was committed to a file they can read.

The result is predictable: agents repeat mistakes, miss critical context, generate solutions that conflict with established decisions, and waste time rediscovering things the team already figured out.

Project teams typically solve this with a PLAN.md a hand-maintained document at the root of the repo. But PLAN.md rots. It gets updated once and forgotten. It's a single file that becomes a dumping ground. There's no structure, no search, no way to answer "what depends on this feature?".  There is also a lot of long term memory solutions that leverage vector databases to store and query project information. But these solutions are often overload the context with unnecessary search results and sometimes suffer from memory pollution when too many changes are made at once.

This solution needs to be specific enough to give necessary context about any query while also avoiding unnecessary information that might overload the context. We needed something better: a persistent, structured, file-based project knowledge that lives in the repo itself, that agents can walk without a database or API, and that doesn't rot because it's part of the development workflow.

## Starting from scratch

The insight was simple: every bug, feature, and cross-cutting issue should live as a single Markdown file with YAML front matter, stored in a `tracker/` directory at the project root. These markdown files should be able to give appropriate information on the project without invoking grep commands everytime. We can even divide the type of markdown files based on the type of issue they are referencing and put them in separate folders. We can start with the following issue types


- `bug` — Contains information relating to bug reports and unintended behavior.
- `feature` — Contains new feature requests and archives implemented features
- `issues` — Contains reports that aren't a new feature or a bug. Acts more like a miscellaneous issue folder.

This categorization is partially based on existing github issues framework that allows users to report bugs, features or other issues. This seems granular enough for agents to find related issues, while not being too overly specific to confuse any search parameters. WIth the categorization sorted me move onto the structure of the issue entries themselves. 

## Entry Format

Every entry is a single `.md` file. The frontmatter is the source of truth as all structured metadata lives there. The body is free-form Markdown for investigation notes, decisions, and descriptions. We can divide our entry into two separate parts the **head** and the **body**. The head contains quick metadata information about the project, while the body contains more descriptive information.  They are separated from each other with the `---` string acting as a separator.


### The Head: Structured YAML metadata
We start with the head, since it will be providing most of the metadata information that AI agents will query at a glance. We are going to be using an YAML based structure for this section, as it helps us to store and parse our required data with existing YAML libraries. To see this in action, We can use the example of a feature request provided below to show the uses of each entry.

```yaml
---
ID:             001
TYPE:           feature
NAME:           Discovery
SUMMARY:        Discovery: Seed data retrieval
STATUS:         CLOSED
TAGS:           phase-0,discovery,scripts
LINKS:          fix-commit=86974fa
---
```

Here `ID` acts as the ID field of the issue. For now, we are going to be using a regular incrementing number for the ID for each issue. In this example we chose an ID of 001.

The `TYPE` signifies the type of issue. As discussed before, we have three types: **bug**, **feature** and **issues**. In this example, we chose the feature type as this is a feature request.

The `NAME` field shows the name of the issue. Should be self-explanatory.

Similarly, the `SUMMARY` field gives a short description on the task. Here, we see that the summary expands the name Discovery by stating that its part of the seed data retrieval.

We move onto the `STATUS` field, which contains the status of the issue. For now, we use a simple binary of `OPEN` and `CLOSED` values to denote the status of the issues at hand. When an issue is created, we set it to **OPEN**. And when we are done dealing with the issue, we set it to **CLOSED**. This system allows us to go right to remaining work with **OPEN** issues. And if we ever need to revisit existing work, we can just look through **CLOSED** issues.

`TAGS` on the other hand, are user/agent defined labels given to each issue. This allows us to query similar issues through simple search algorithms that would not show up otherwise.

The `LINKS` field is a flat comma-separated string of `key=value` pairs. For now, we are only keeping related commits into it for cross-referencing purposes using git commits. 

### The Body: Additional free form context
Unlike the **head**, the **body** is more free form and descriptive. Since the head already contains most of the metadata information, the body is free to expand on it with small descriptions to give any agent/user browsing the issue additional context. We can use the example below to see what to expect from a typical issue entry:

```
## Description

Create fetch_seed_data.py to retrieve 10 seed entries (Frieren, Vinland Saga, Berserk, One Piece, Solo Leveling, Monster, FMAB, AoT, Made in Abyss, Death Note) from AniList, Jikan, MangaUpdates, manami-project, and Kometa. Save raw JSON to data/discovery/{source}/{entry}.json. Handle rate limiting, pagination, and API errors.

## Resolution

Fetched 30 AniList entries (20 anime + manga), 5 Jikan entries, 10 MangaUpdates entries, and 41k-entry manami-project database. Seed data saved to data/discovery/.
```

As we see, the body is far more descriptive. This expands on our earlier feature request to give us a description on our previous task summary. Since our issue was closed, we also get a resolution entry that tells the user what happened when this feature request was closed. Moreover, since this is a full Markdown document, the body can support additional details such as Key Findings, Entity Resolution Strategy, Schema Design, and Actions sections depending on the issue. 

The strict structure YAML of **head** ensures that there is a consistent schema to make searching and querying easier. The **body** on the other hand is free to add additional context that that might not be possible through a consistent schema, as all issue types can be wildly different depending on the work being done. 


To make searching easier, each folder will also have an index.md, that serves as a search index for the whole project. This file allows an agent/user to see which issues are `OPEN` or `CLOSED` at a glance 


## The Script


While we are done describing the schema and structure of our issue tracker, its another matter to actually use this in day to day life. We could for example, push our whole schema description on every agent session to maintain consistency on issues. But this approach can get very tedious and overload our agent context for little gain. Moreover, creating/updating all the trackers manually can waste a lot of tokens unnecessarily for little gain. 

What we could do instead is to offload most of the work to a CLI tool that performs the common operations, so that the agent can focus on actually thinking about the whole project. To this end, we can create a simple python script that performs the following common operations:


`init` - scaffold the tracker/ directory with subfolders.

`new` — create a new entry with auto-incrementing ID

`close` — mark an entry closed with optional resolution and links

`rebuild` — regenerate all index pages and the dashboard README


We can package all these commands in a simple python script that takes these commands as input and can easily be leveraged by any agent for tracker creation and maintenance.


### Setup and Configuration

We start with standard Python imports and global constants. `FIELD_ORDER` defines the standard key layout to ensure predictable frontmatter formatting across every file.

```
#!/usr/bin/env python3
import argparse
import re
import sys
from pathlib import Path

FIELD_ORDER = ["ID", "TYPE", "NAME", "SUMMARY", "STATUS", "TAGS", "LINKS"]
TYPE_TO_FOLDER = {"bug": "bugs", "feature": "features", "issue": "issues"}
KEY_COL_WIDTH = 16  # Key column alignment width

TEMPLATE_BODY = """## Description

Full details. For bugs: what happened, root cause.
For features: what it does, why it matters.
For issues: context, impact, resolution if applicable.
"""
```
### Parsing and Formatting Frontmatter
To keep dependencies at zero, we handle text parsing using native string operations and standard library utilities rather than external YAML libraries.

`slugify`: Converts human titles into safe, filesystem-friendly filenames (e.g., "Autosave race condition!" $\rightarrow$ "autosave-race-condition")

`format_frontmatter`: Uses .ljust() to line up the colon delimiters vertically for clean plain-text reading.

`parse_entry`: Splits a Markdown file on --- delimiters, extracts the YAML key-value pairs into a dictionary, and attaches raw internal keys (_body and _path).

```python
def slugify(name: str) -> str:
    slug = name.strip().lower()
    slug = re.sub(r"[^a-z0-9]+", "-", slug)
    return slug.strip("-")


def format_frontmatter(fields: dict) -> str:
    lines = ["---"]
    for key in FIELD_ORDER:
        value = fields.get(key, "")
        lines.append(f"{(key + ':').ljust(KEY_COL_WIDTH)}{value}")
    lines.append("---")
    return "\n".join(lines)


def parse_entry(path: Path) -> dict:
    """Parse frontmatter + body from an entry file."""
    text = path.read_text(encoding="utf-8")
    parts = text.split("---", 2)
    if len(parts) < 3:
        raise ValueError(f"{path} is missing '---' frontmatter delimiters")
    front, body = parts[1], parts[2]
    fields = {}
    for line in front.strip("\n").splitlines():
        if ":" not in line:
            continue
        key, value = line.split(":", 1)
        fields[key.strip().upper()] = value.strip()
    fields["_body"] = body.lstrip("\n")
    fields["_path"] = path
    return fields
```

### Managing File Paths and Auto-IDs

These utilities simplify finding files and determining incremental IDs without needing a centralized database index.

`entry_files`: Finds all valid entry files inside a target category while ignoring the generated index.md.

`next_id`: Inspects existing entries, extracts their ID integers, and auto-increments to the next available 3-digit zero-padded number (001, 002, 003).

`find_tracker_root`: Traverses upward through parent directories to locate the root tracker/ folder automatically.

```python
def entry_files(folder: Path):
    """All entry files in a tracker subfolder, excluding index.md."""
    if not folder.exists():
        return []
    return sorted(
        p for p in folder.glob("*.md")
        if p.name.lower() != "index.md"
    )


def next_id(folder: Path) -> str:
    max_id = 0
    for p in entry_files(folder):
        try:
            fields = parse_entry(p)
            max_id = max(max_id, int(fields.get("ID", "0")))
        except (ValueError, TypeError):
            continue
    return f"{max_id + 1:03d}"


def find_tracker_root(start: Path) -> Path:
    """Walk upward from `start` looking for a tracker/ directory."""
    cur = start.resolve()
    for candidate in [cur] + list(cur.parents):
        maybe = candidate / "tracker"
        if maybe.is_dir():
            return maybe
    return start / "tracker"

```


### Scaffold (`init`) and Create (`new`)

The CLI handles the initial folder scaffolding and entry creation using simple flags.

`cmd_init`: Scaffolds the tracker/ directory along with bugs/, features/, and issues/ subdirectories.

`cmd_new`: Generates a new Markdown entry file with pre-populated frontmatter and description templates, then automatically updates the search indexes.

```python
def cmd_init(args):
    root = Path(args.path) / "tracker" if args.path else Path("tracker")
    root.mkdir(parents=True, exist_ok=True)
    for folder in TYPE_TO_FOLDER.values():
        (root / folder).mkdir(exist_ok=True)

    template_path = root / "_template.md"
    if not template_path.exists():
        bundled_template = Path(__file__).parent.parent / "assets" / "_template.md"
        template_path.write_text(bundled_template.read_text(encoding="utf-8"), encoding="utf-8")

    rebuild_indexes(root)
    print(f"Initialized tracker at {root}/")


def cmd_new(args):
    root = find_tracker_root(Path.cwd())
    folder = root / TYPE_TO_FOLDER[args.type]
    folder.mkdir(parents=True, exist_ok=True)

    entry_id = next_id(folder)
    slug = slugify(args.name)
    filename = f"{entry_id}-{slug}.md"
    path = folder / filename

    fields = {
        "ID": entry_id,
        "TYPE": args.type,
        "NAME": args.name,
        "SUMMARY": args.summary or args.name,
        "STATUS": args.status,
        "TAGS": args.tags or "",
        "LINKS": args.links or "",
    }
    body = TEMPLATE_BODY
    if args.description:
        body = f"## Description\n\n{args.description}\n"

    path.write_text(format_frontmatter(fields) + "\n\n" + body, encoding="utf-8")
    rebuild_indexes(root)
    print(f"Created {path}")
```

### Closing Issues (`close`)

When a feature or bug fix is finished, cmd_close updates the metadata and adds resolution notes without stripping out previous investigation research. This command automatically updates STATUS to CLOSED, Merges any fix commit hashes or pull requests into LINKS and Injects a ## Resolution heading directly into the document body.


```python
def cmd_close(args):
    path = Path(args.entry)
    if not path.exists():
        sys.exit(f"No such entry: {path}")
    fields = parse_entry(path)
    fields["STATUS"] = "CLOSED"

    if args.links:
        existing = fields.get("LINKS", "")
        combined = ", ".join(x for x in [existing, args.links] if x)
        fields["LINKS"] = combined

    body = fields["_body"]
    if args.resolution:
        if "## Resolution" not in body:
            body = body.rstrip() + f"\n\n## Resolution\n\n{args.resolution}\n"
        else:
            body = body.rstrip() + f"\n\n{args.resolution}\n"

    out_fields = {k: fields.get(k, "") for k in FIELD_ORDER}
    path.write_text(format_frontmatter(out_fields) + "\n\n" + body.lstrip("\n"), encoding="utf-8")

    root = find_tracker_root(path.parent)
    rebuild_indexes(root)
    print(f"Closed {path}")
```

### Rebuilding Search Indexes & Dashboard

This is where the index acts as our single source of truth. Running rebuild scans all entries and automatically updates our Markdown index tables.

`build_index_table`: Compiles an individual folder's entries into an index.md Markdown table with links, tags, and status counts.

`rebuild_indexes`: Iterates through all category directories and regenerates a central dashboard at tracker/README.md.


```python
def build_index_table(folder: Path):
    rows = []
    open_count = closed_count = 0
    for p in entry_files(folder):
        f = parse_entry(p)
        status = f.get("STATUS", "").upper()
        if status == "OPEN":
            open_count += 1
        elif status == "CLOSED":
            closed_count += 1
        rows.append(
            f"| {f.get('ID', '?')} | [{f.get('NAME', p.stem)}]({p.name}) "
            f"| {status} | {f.get('TAGS', '')} |"
        )
    lines = ["| ID | Name | Status | Tags |", "|----|------|--------|------|"]
    lines.extend(rows if rows else ["| — | *(no entries yet)* | | |"])
    lines.append("")
    lines.append(f"**OPEN:** {open_count}  **CLOSED:** {closed_count}  **Total:** {open_count + closed_count}")
    return "\n".join(lines) + "\n", open_count, closed_count


def rebuild_indexes(root: Path):
    root.mkdir(parents=True, exist_ok=True)
    counts = {}
    for label, folder_name in TYPE_TO_FOLDER.items():
        folder = root / folder_name
        folder.mkdir(exist_ok=True)
        table, open_count, closed_count = build_index_table(folder)
        header = f"# {folder_name}/ index\n\n"
        (folder / "index.md").write_text(header + table, encoding="utf-8")
        counts[folder_name] = (open_count, closed_count)

    dash_rows = []
    tot_open = tot_closed = 0
    for folder_name in TYPE_TO_FOLDER.values():
        o, c = counts[folder_name]
        tot_open += o
        tot_closed += c
        dash_rows.append(f"| [{folder_name}/]({folder_name}/index.md) | {o} | {c} | {o + c} |")
    dash_rows.append(f"| **Total** | **{tot_open}** | **{tot_closed}** | **{tot_open + tot_closed}** |")

    readme = (
        "# Project Tracker\n\n"
        "Single source of truth for project state — bugs, features, and "
        "cross-cutting issues. Replaces git log archaeology and a hand-maintained "
        "PLAN.md. Every entry lives in its own file under `bugs/`, `features/`, or "
        "`issues/`; the tables below and in each `index.md` are generated from "
        "those files' frontmatter by `scripts/tracker.py rebuild` — don't hand-edit them.\n\n"
        "| Folder | OPEN | CLOSED | Total |\n"
        "|--------|------|--------|-------|\n"
        + "\n".join(dash_rows) + "\n"
    )
    (root / "README.md").write_text(readme, encoding="utf-8")


def cmd_rebuild(args):
    root = find_tracker_root(Path.cwd())
    if not root.exists():
        sys.exit(f"No tracker/ found at or above {Path.cwd()} — run `init` first.")
    rebuild_indexes(root)
    print(f"Rebuilt indexes and README under {root}/")
```

### CLI Entrypoint

Finally, we wire the `subcommands` up using Python's standard `argparse` module.

```python

def main():
    parser = argparse.ArgumentParser(description="Manage a file-based tracker/ directory.")
    sub = parser.add_subparsers(dest="command", required=True)

    p_init = sub.add_parser("init", help="Scaffold a new tracker/ directory")
    p_init.add_argument("path", nargs="?", default=None, help="Repo root (default: cwd)")
    p_init.set_defaults(func=cmd_init)

    p_new = sub.add_parser("new", help="Create a new entry")
    p_new.add_argument("type", choices=TYPE_TO_FOLDER.keys())
    p_new.add_argument("name")
    p_new.add_argument("--summary", default=None)
    p_new.add_argument("--status", default="OPEN", choices=["OPEN", "CLOSED"])
    p_new.add_argument("--tags", default="")
    p_new.add_argument("--links", default="")
    p_new.add_argument("--description", default=None)
    p_new.set_defaults(func=cmd_new)

    p_close = sub.add_parser("close", help="Mark an entry CLOSED")
    p_close.add_argument("entry", help="Path to the entry .md file")
    p_close.add_argument("--resolution", default=None)
    p_close.add_argument("--links", default="", help="Extra LINKS to append, e.g. fix-commit=abc123")
    p_close.set_defaults(func=cmd_close)

    p_rebuild = sub.add_parser("rebuild", help="Regenerate all index.md files and README.md")
    p_rebuild.set_defaults(func=cmd_rebuild)

    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()

```

## The AI Agent Workflow in Practice

By adding tracker.py to your repository, your prompt or instructions to an AI coding agent (like Claude Code, Cursor, or Aider) become vastly simpler:

**Orientation**: At the start of a session, tell the agent: "Read tracker/README.md and check open features in tracker/features/index.md."

**Task Execution**: The agent reads only the specific file (e.g., tracker/features/001-seed-data.md) to get context without bloating its prompt memory with unrelated project files.

**Closing the Loop**: Once finished with a task, the agent runs:

```bash
python tracker.py close tracker/features/001-seed-data.md \
  --resolution "Implemented fetch script and validated against schemas." \
  --links fix-commit=86974fa
```

Because index regeneration happens automatically upon running new or close, the repository state remains perfectly synchronized without relying on complex database infra or manual file maintenance.

## Limitations 
Although this is a solid system with a simple execution pattern, it has a very obvious limitations that bear mentioning:

**Only 3 types.** Bug, feature, and issue. No ADRs, no tasks, no epics. Architectural decisions had to be filed as `issues` which makes it useless for any large scale changes.

**No typed relations.** The `LINKS` field was an unparsed string. You couldn't query "what depends on this feature?" or "what bugs does this fix?" without parsing it yourself.

**index.md is not enough** Even with an `index.md` file acting as a search index, Agents had to scan the `.md` files themselves if they wanted to find related issues. For projects with hundreds of entries, this can get really slow and bloated.

**No search.** `grep` was the search command. It works, but it doesn't know about the **head** structure. This means that you can't search by status, priority, or tags.

**No backlinks.** You couldn't answer "what references this entry?" without reading every file.

While these limitations are not fatal, they present real problems we need to solve.

## What's Next
Although a good first draft, this project leaves a lot to be desired. For version 2 of this project we can start with addressing the obvious limitations such as: more project types, typed relations, robust search and support for issue relations.