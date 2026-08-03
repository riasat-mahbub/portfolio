---
title: "The Tracker, Day to Day"
description: "What the append-only tool feels like to use day to day: the new loop, the OpenCode plugin's three hooks, the walkable audit trail, and the sharp edges that still need attention."
tags: ["AI", "Coding Agents", "Python", "Open Source"]
publishDate: 2026-08-01
---

This is a continuation of the project tracker series. You can read the previous entry on the architecture [here](/blog/project-tracker-v3-append-only). The previous entry described the architecture. This one is what it feels like to use.

## The daily loop, under append-only

The basic shape of the loop is the same. Search for context. Read the matching entries. Make the edit. Update the tracker. Rebuild. Validate. Commit. But the update step feels different now, because every change is a new entry file.

Before, the workflow closed a bug by rewriting the bug's status field to done and appending a resolution note. The file you cared about was the file that changed. After, the workflow closes a bug by appending a done entry that supersedes the parent. The file you care about is no longer the file that changes. The parent file stays as it was. The new file is the closing entry. Both stay in the repo, and `tracker history <id>` walks from one to the other.

`tracker history` is the new bread-and-butter move. When you find a relevant entry, you don't read it in isolation any more. You walk its chain. A bug that was in progress three months ago and is done now is no longer a single file with a status field. It is three or four files on a chain, each with its own timestamp and body. The history command prints them root-to-head in chronological order. You see how it became what it is.

The git history of the tracker directory is now the project history. `git log .tracker/features/` is now showing the actual lifetime of each feature, with every status change as its own commit. The older tool's history was whatever the last commit happened to record. The current tool's history is the chain itself.

## The OpenCode plugin's three hooks

The tool ships an OpenCode plugin. `tracker init` deploys it into `.opencode/plugins/project-tracker.js` per project. The plugin has three hooks, and each one runs the right thing at the right time.

On session start, the plugin runs `tracker rebuild && tracker validate` in the worktree. The graph is fresh every session. The previous session's work is already in the graph by the time the agent starts typing. There is no stale-graph hazard.

Before any write-class tool fires (`write`, `edit`, `apply_patch`), the plugin runs `tracker affects <path>`. The `affects` command looks up the path in the cached `commit_files` and `files_index` maps inside `graph.json` and returns the entries that touch it. If anything matches, the plugin injects a `## Tracker entries affecting <path>` block into the current session. The agent sees the affected entries and can update them after the edit. The prompt is informational, not blocking. The agent still has to read it.

When the session goes idle, the plugin runs `rebuild && validate` again. Then it checks `git status --porcelain .tracker/`. If the tracker directory has dirty changes, the plugin runs `git add .tracker/ && git commit -m "tracker: auto-sync [skip ci]"`. Every session boundary auto-commits the tracker's own state.

The diff from the older setup: the skill layer used to be a manual symlink into `~/.reasonix/skills/` or `~/.opencode/skills/`. The current setup deploys the plugin into the project itself. The tool now ships its own agent integration. The integration lives where the project lives.

## The numbers, on the project's own tracker

The tool's own `.tracker/` directory holds the entries that describe its own development. As of the current rebuild, that is 37 entries across 4 bugs, 13 ADRs, 2 epics, and 18 features. The `tracker stats` command prints the totals:

```
Total entries: 37

By type:
  adr           13
  bug           4
  epic          2
  feature       18

By status:
  DONE          35
  PROPOSED      2
```

The `active_total` and `active.by_type` numbers are also computed, but the CLI does not print them yet. The dedup is real, but it is invisible unless someone reads `Tracker.stats()` directly. The active counts collapse every chain to its head, so a feature that went from proposed to in progress to done shows up as one active entry, not three.

`tracker history` on any of the project's own entries walks a chain. Take the asset-path bug from the previous entry. Its chain is two entries long: the proposal and the fix. The two entries together tell the story of how the bug was found, how it was fixed, and how the fix shipped. No `git log` archaeology needed.

## The audit trail is walkable

The older tool's in-place mutation meant the history was reconstructible only from `git log` and memory. The current tool's append-only model means the history is the chain. Walking it is a literal command.

This changes how you read the tracker. Before, an entry was a snapshot. After, an entry is a node in a chain, and the chain tells you how it got there. A bug that went from proposed to in progress to blocked to done has four entries, and `tracker history` prints all four in order. The reason for each transition is in the corresponding entry's body. The transition from "blocked" to "done" might be the entry that says "the blocker was a missing migration step; we added it and re-ran." The transition from "in progress" to "blocked" might be the entry that says "we hit a fork in the chain and resolved it." You read the chain to find the reason.

The graph still shows the full project as a single JSON file. `graph.json` is the agent's one read. The chain heads are computed during rebuild and stored in the `chain_heads` map. The agent can ask "what's the current state of this chain?" by looking at the head, and ask "how did we get here?" by walking back through `supersedes`.

## The sharp edges the current tool keeps

The current tool also opened or kept a few sharp edges. They are not bugs in the same sense as the two incidents from the previous entry. They are gaps where the current tool does not yet do what its wire format supports.

**The CLI can only declare `RELATIONS.supersedes`.** The update, close, and reopen commands write a `supersedes` edge to the new entry. The rest of the graph, including `depends_on`, `contains`, `fixed_by`, `related`, `epic`, `parent`, and `duplicate_of`, has to be hand-edited in the entry file or set through the API. The cross-reference-loss incident in the previous entry is the proof of how fragile this gap is. The CLI exposes one relation type out of ten. The other nine are silent.

**The stats CLI does not print the active totals.** `Tracker.stats()` computes `active_total` and `active.by_type` and `active.by_status`. `src/tracker/commands/stats.py` prints `total` and the un-deduped `by_type` and `by_status`. The chain-head dedup is real but invisible. A project that has been around long enough to have a few done features and a few in-progress ones sees only the cumulative counts.

**The README still documents the older examples.** `tracker migrate` is gone, but the README still mentions it. `BUG-001` is not a valid identifier any more, but the README still uses it. The directory layout still shows `BUG-001-*.md` filenames. An agent reading the README gets a model of the tool that does not match the current tool. The doc and the code have drifted.

**The OpenCode plugin's pre-edit prompt is informational.** It injects the affected entries into the session and trusts the agent to read them. An agent that does not read the prompt will still touch the file. The prompt is a soft affordance. The hard affordance would be to require the agent to acknowledge the affected entries before writing, but that would be a different plugin.

**The entries have empty `## Follow-up` sections.** Every ADR, feature, bug, and epic in the project's own tracker has a `## Follow-up` heading with nothing under it. The convention is stubs with only the `## Background` filled in. Whether the next version fills them in or accepts the stubs is a question for the next version.

## What's next

The current tool is shipped. The architecture, the commands, the plugin, the hooks, the migration, the incidents, the recoveries. All of it is real and in the repo.

What the next version should land on, vaguely: close the gap between what the wire format supports and what the CLI exposes. The CLI can declare one relation type. The wire format supports ten. The next version should let the CLI declare the rest, so the cross-reference-loss incident from the previous entry cannot happen again.

Surface the active totals in the stats output. The dedup is computed. The CLI should print it. A project should not have to read `Tracker.stats()` directly to see chain-head counts.

Make the follow-ups real. Every entry has a `## Follow-up` heading. The next version should decide whether to fill them in or accept them as stubs. The current convention is stubs. Either the stubs become real follow-ups, or the stubs become the explicit answer ("we planned nothing further"). Both are honest. The current half-state is neither.

Make the silent things visible. The CLI exposes part of the schema. The stats CLI hides the dedup. The README shows the older examples. The plugin prompts without blocking. The follow-ups are half-filled. Each of these is a place where the tool knows more than it says. The next version's job is to close the gap between what the tool knows and what the tool says.
