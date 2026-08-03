---
title: "The Tracker Becomes Append-Only"
description: "We had been working around four problems at once with the single-writer assumption. The current tool drops the assumption, the counter, the in-place mutation, and the committed graph in a single architectural shift."
tags: ["AI", "Coding Agents", "Python", "Architecture", "Open Source"]
publishDate: 2026-07-31
---

This is a continuation of the project tracker series. You can read the previous entry on adoption [here](/blog/project-tracker-v2-adoption). The previous entry ended with a plan. We planned to make the tracker append-only. We did it.

## One shift, four limits

The older rebuild was held together by one tradeoff: the single-writer assumption. We documented it as an explicit ADR. One writer at a time, concurrent readers safe, writers must not overlap. It worked. The same tradeoff was also paying for four problems at once:

- Sequential IDs needed a shared counter to avoid collision. Two agents running `tracker new` at the same moment could compute the same next ID.
- In-place mutation meant every state change rewrote the parent file. The old state was gone.
- The audit trail was whatever the last commit happened to record. The history of how an entry went from proposed to in progress to blocked to done was reconstructible only from `git log`.
- `graph.json` was a derived artifact that we still committed. Every clone started without it until someone ran `tracker rebuild`. Stale versions could linger in the repo.

The interesting thing was that all four had the same root cause. The tool assumed an in-place mutation model. Mutation needed a lock. Locks needed a single writer. Single writers needed a shared counter to be safe.

The current tool drops the assumption. Old entries are never mutated. Every state change is a new file. The chain is the audit trail. The counter is no longer shared. Git becomes the distribution layer. One architectural shift fixes all four limits at once.

## Identifiers that don't need a shared counter

The previous tool generated IDs by scanning every entry file and incrementing the highest number. That read-modify-write was the root of the sequential-ID race condition. Two agents running `tracker new` at the same moment could compute the same next ID and collide. We had been working around it with the single-writer assumption. The new IDs do not need a counter at all.

They are ULIDs. 48 bits of UTC millisecond timestamp, 80 bits of randomness, Crockford-base32 encoded into 26 characters. The timestamp makes them sortable as strings, and the randomness makes collisions effectively impossible. The single dependency is `python-ulid`, with no transitive deps.

```python
def generate_id(type_: str) -> str:
    prefix = TYPE_PREFIXES[type_]
    uid = str(ulid.ULID())
    return f"{prefix}-{uid}"
```

Why does this matter? An ID can be generated without any shared state, and the filesystem is never scanned. The wire format ends up looking like `BUG-01KYN3VHW7AYR626TSHQ98793V`. The prefix tells you the type, the ULID tells you when, and because lexicographic order equals chronological order, every piece of the tool that walks chains in time order works without any extra bookkeeping. `tracker history`. `chain_heads` in the graph. The validator.

The short-ref pattern falls out for free. The tool accepts a prefix and resolves it to the unique matching entry:

```python
def resolve_id_prefix(tracker_dir: Path, prefix_query: str) -> str:
    matches = []
    for entry in scan_entries(tracker_dir):
        eid = entry["metadata"].get("ID", "")
        if eid and eid.startswith(prefix_query):
            matches.append(eid)
    if len(matches) == 0:
        raise ValueError(f"No entry matches prefix '{prefix_query}'")
    if len(matches) > 1:
        ids = ", ".join(sorted(matches))
        raise ValueError(f"Ambiguous prefix '{prefix_query}' matches: {ids}")
    return matches[0]
```

Zero matches raises a hard error. Multiple matches is also an error. Exactly one match, and the tool returns the resolved full ID. So `tracker close BUG-01KYN9B` finds the unique entry starting with that prefix, and the human or agent typing the command never has to copy a 30-character string.

## Entries that never get rewritten

The other half of the shift is the entry files themselves. The current tool never mutates an old entry. Every state change is a new file linked to the previous one through a `RELATIONS.supersedes` edge. The new file inherits the parent entry's metadata and adds the next status. The parent file is never touched.

The code path is uniform. `tracker update`, `tracker close`, `tracker reopen` all do the same thing. They resolve the parent ID, copy the parent's metadata into a new entry, set the new status, and write a new file with `RELATIONS.supersedes: [<parent_id>]`. There is one place where the new entry file is created, and it always sets `RELATIONS.supersedes`. There is no code path that rewrites an existing entry. The append-only invariant is enforced by the code, not by convention.

The new entry IDs are unrelated to the parent's ID. `BUG-01KYN3VHW7AYR626TSHQ98793V` does not become `BUG-002`. It becomes a fresh `BUG-01KYN9B71X5MZ5ABNVM9RQN2Q3` that points at the older one through `supersedes`. The chain is a directed graph in the filesystem, and you read it by following `supersedes` from the latest entry backward to the root.

## The chain is the audit trail

Because old entries are never mutated, the full history of any issue lives in the chain. `tracker history <id>` walks `RELATIONS.supersedes[0]` recursively from the latest entry back to the root, then prints the chain root-to-head in chronological order. A bug that went from proposed to in progress to blocked to done has four entries on its chain. The reason each transition happened is in the corresponding entry's body.

```python
def _walk_chain(entries_map, entry_id):
    chain = [entries_map[entry_id]]
    cursor = entry_id
    while True:
        relations = entries_map[cursor]["metadata"].get("RELATIONS", {}) or {}
        supersedes = relations.get("supersedes", [])
        if supersedes:
            parent_id = supersedes[0]
            if parent_id in entries_map:
                chain.append(entries_map[parent_id])
                cursor = parent_id
            else:
                break
        else:
            break
    return chain
```

Why does this matter? The older tool's "the old state is gone" problem is solved. Every transition is a file. `tracker history BUG-01KYN9B71X5MZ5ABNVM9RQN2Q3` prints the table. You see what status the bug had on each date and why. The audit trail is not reconstructed from `git log` or reconstructed from memory. It is the chain.

## Forks are walkable, not silent

Two agents appending to the same chain at the same moment used to collide on the counter. The current tool handles the same scenario differently. Each agent creates a new entry that `supersedes` the same parent. The graph now has two entries on the same parent, which is a fork. The validator catches forks and surfaces them as warnings, not errors. The reasoning: a fork is recoverable. Pick the branch you want to keep, close the other.

```python
for eid in self.all_ids:
    sources = []
    for entry in self.entries:
        supersedes = (entry["metadata"].get("RELATIONS") or {}).get("supersedes", [])
        if isinstance(supersedes, list) and eid in supersedes:
            sources.append(entry["metadata"].get("ID", "?"))
    if len(sources) > 1:
        self.warnings.append({
            "field": "RELATIONS.supersedes",
            "issue": f"entry '{eid}' is superseded by multiple entries: {sources} (fork detected)",
        })
```

The validator also catches the other failure mode: a `supersedes` edge that points at an entry that does not exist. Dangling references get the same warning treatment. The tool does not pretend the graph is consistent when it is not.

The reason forks are warnings and not errors: the workflow handles them. Forks are a fact of life in a multi-agent setup, and the right answer is to surface them and let the workflow resolve them. The validator's job is to make them visible, not to block them.

## Git becomes the distribution layer

The older rebuild committed `graph.json` to the repo. Every clone started without it. Every rebuild produced a diff. The current tool drops `graph.json` from git entirely. It is a derived artifact, and the `.gitignore` inside the tracker directory contains exactly one line:

```
# Generated by tracker init — do not edit
graph.json
```

`tracker init` also installs two git hooks. A `post-merge` hook and a `post-checkout` hook. Both do the same thing: `cd` to the repo root and run `tracker rebuild`. Every clone regenerates the graph on checkout. Every merge regenerates it after the merge completes.

```sh
#!/bin/sh
# Auto-rebuild tracker graph after git merge
cd "$(git rev-parse --show-toplevel)" && tracker rebuild
```

```sh
#!/bin/sh
# Auto-rebuild tracker graph after git checkout
cd "$(git rev-parse --show-toplevel)" && tracker rebuild
```

Why does this matter? The graph is no longer a thing you can forget to regenerate. The hooks do it. Stale graphs become impossible, because the graph is never committed in the first place. And because the entries themselves are YAML frontmatter over Markdown, two agents appending to the same chain in different worktrees produce a clean git merge. The merge resolves the entries into a single chain. The hooks rebuild the graph. The tool now has cross-machine consistency without any cross-machine coordination.

## The new commands

The current tool exposes `tracker update`, `tracker reopen`, and `tracker history`. None of them rewrite an existing entry.

- `tracker update <id> --status IN_PROGRESS --note "still investigating"` reads the parent entry, copies its metadata into a new entry with the new status, and writes the new file with `supersedes` pointing at the parent.
- `tracker reopen <id> --reason "..."` does the same but forces `status="IN_PROGRESS"` and routes the reason into the description.
- `tracker history <id>` walks the chain and prints a table of every entry on it: ID, status, timestamp, summary.

The user-facing shape changed. The older tool had `tracker close <id> --resolution "..."`. The current tool still has `tracker close`, but the operation is "append a done entry that supersedes the parent" rather than "rewrite the parent's status to done." The CLI verbs are the same, but the on-disk effect is different. The file you care about is no longer the file that changes.

## The tool decoupled from the skill

The tool now ships an OpenCode plugin. `tracker init` deploys it into `.opencode/plugins/project-tracker.js` per project. The plugin has three hooks:

- `session.created` runs `tracker rebuild && tracker validate` in the worktree. The graph is fresh every session.
- `tool.execute.before` fires before any write tool (`write`, `edit`, `apply_patch`). It runs `tracker affects <path>` and, if anything matches, injects a `## Tracker entries affecting <path>` block into the current session. The agent knows it is about to touch a file with implications. The prompt is informational, not blocking.
- `session.idle` rebuilds and validates again, then if the tracker directory has dirty changes, `git add .tracker/ && git commit -m "tracker: auto-sync [skip ci]"`. Every session boundary auto-commits the tracker's own state.

The tool is now a deterministic graph primitive. Agent workflows, like type selection and when to write a BUG versus a FEAT, live in the `project-tracker-skill` repo. The tool handles the wire format, the graph, validation, and the agent integration. The skill handles the playbook.

## Two incidents worth naming

The current rebuild had two rough patches that are worth knowing about if you adopt the tool.

**The cross-reference loss.** The migration that moved the project's own self-tracker into the new format lost every `RELATIONS` cross-reference. The cause was small: `create_entry` sets `RELATIONS=None` unless it is given a `supersedes` argument, and the migration step that was supposed to backfill `contains` and `implements` and `depends_on` went through a code path that skipped falsy values. So every new entry shipped with `RELATIONS: null`, and the graph came back empty. The recovery was manual. We read the pre-migration state from git history and restored the relations by hand. The data is correct now. The code path is still there. The next migration needs to be more careful.

**The asset-path bug.** For a string of commits, `tracker init` was silently deploying the hardcoded fallback template instead of the bundled one. The plugin was not getting installed at all. The cause was small: `init.py` walked three `.parent` hops to find `assets/`, when the directory is four hops away from the script. Every `tracker init` between the two affected commits quietly used the wrong template. The fix was a one-character change. The fallout was visible in the recovery work above, which happened while the broken init was the only way to set up new projects. If you adopted the tool between those two commits, your setup is missing things.

## The single-writer assumption is retired

The previous ADR that documented the single-writer assumption is superseded by a new ADR. The append-only + ULID combination removes the lock-contention rationale that single-writer was guarding against. Multi-agent concurrency is now a first-class design assumption, not a documented tradeoff. The tool no longer assumes at most one writer. It assumes at most one writer _per chain_, and the chain is the unit of work.

## What we planned next

The current rebuild is done. The tool handles the four limits. The new commands work. The plugin deploys. The hooks regenerate. But the current rebuild also opened or kept a few sharp edges that are worth knowing about.

The CLI can only declare `RELATIONS.supersedes` through the update, close, and reopen flow. The rest of the graph (`depends_on`, `contains`, `fixed_by`, `related`, `epic`, `parent`, `duplicate_of`) still has to be hand-edited in the entry file or set through the API. The cross-reference-loss incident above is the most concrete proof of how fragile this gap is. The CLI exposes part of the schema and leaves the rest to whoever happens to be writing the entry.

The stats command computes chain-head dedup. The `active_total` and `active.by_type` and `active.by_status` numbers are real. The CLI does not print them. The dedup is invisible unless someone reads `Tracker.stats()` directly.

The README still documents the older examples. `tracker migrate` is gone, but the README has not been refreshed. `BUG-001` is not a valid identifier any more, but the README still uses it. An agent reading the README gets a model of the tool that does not match the current tool.

The OpenCode plugin's `tool.execute.before` prompt is informational. It injects the affected entries into the session and lets the agent decide what to do. An agent that does not read the prompt will still touch the file. The prompt is a soft affordance, not a hard one.

The ADR and feature and bug entries have empty `## Follow-up` sections. The convention is stubs with only the `## Background` filled. Whether to fill them in or accept the stubs is a question for the next version.

The next version, vaguely, should close the gap between what the wire format supports and what the CLI exposes. Make the dedup visible in the stats output. Tighten the README to match the current code. Make the follow-ups real. Make the silent things visible.
