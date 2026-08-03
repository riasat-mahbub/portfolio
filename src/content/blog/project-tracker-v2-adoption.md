---
title: "Adopting the Tracker: Migration and Daily Life"
description: "How a project moved onto the tracker, what daily life with it looked like, and how agents picked it up on their own."
tags: ["AI", "Coding Agents", "Python", "Open Source"]
publishDate: 2026-07-30
---

This is a continuation of the project tracker series. You can read the previous entry on the overhaul [here](/blog/project-tracker-v2-overhaul).

## Bringing a project over

The first question anyone with an existing tracker asks is whether they have to start over. No. The tool shipped a migrator, because a tool that cannot carry history forward is a tool that never gets adopted.

The migration had to do four things to every entry. IDs were bare numbers in the old format, so the migrator prepended the type prefix and renamed the file to match. A feature became `FEAT-002`. An old `issue` became `TASK-001`. The flat `LINKS` string was the interesting part. It stored relationships as comma-separated `key=value` pairs, and the migrator parsed each one and classified it. A `fix-commit` became a commit reference. A `related-feature` became a typed relation with the prefix added. `parent`, `depends-on`, and `blocks` all became their typed equivalents. A flat string that could not be queried became a graph that could. Entries also moved to the folders that matched their type, and every migrated entry got a schema version stamp so the format stayed uniform going forward.

One command, `tracker migrate`, and a project's knowledge carried over intact.

## The daily loop

Once a project is on the tracker, work settles into a rhythm. Search for context before touching anything, which is what prevents duplicate entries and surfaces decisions you forgot existed. Read the matching entries to understand the state. Do the work. Update the tracker, either closing an entry with a resolution or creating a fresh one. Rebuild, which regenerates the graph and the indexes. Validate, to confirm nothing drifted out of schema. Commit the code and the tracker together.

`rebuild` is the heartbeat of the loop. It rescans every entry, rebuilds the graph from the declared relations, recomputes the backlinks, and regenerates `graph.json`. Because it is idempotent, running it is always safe. Because it is part of the edit cycle, the knowledge graph does not rot the way a hand-maintained document does. It is maintained by the same workflow that maintains the code.

## Giving agents the instructions

The tool exists for agents, so the final piece of adoption was making sure agents actually knew to use it, without a human reminding them every session.

That is the job of the skill repo. It ships a `SKILL.md` with the workflow instructions an agent loads at session start, and a `manifest.yaml` that tells the agent which commands are safe to run without confirmation and which modify the tracker. Install it once with a symlink into the agent's skills directory, and every session gets the instructions automatically.

The clever part is how the instructions become sticky. When you run `tracker init`, the tool writes a short block into the project's `AGENTS.md`:

```markdown
## Required skill: project-tracker

This project uses a file-based project knowledge graph in tracker/.

- Before editing: search for related entries (`tracker search <topic>`)
- After editing: rebuild and validate (`tracker rebuild && tracker validate`)
```

Agents that read `AGENTS.md` inject it into the session prompt. So from session one, the agent sees that the project uses a tracker and that it should search before editing. No manual prompting. The instruction is part of the repository, which means it travels with the repository.

And when an agent needs the whole picture, it reads one file. `tracker/graph.json`. One read, one parse, the entire project as a graph. That single artifact is what makes the tool economical for agents with tight context windows. They do not scan fifty files. They read one.

## The tool on itself

Dogfooding was the running thread. The tool tracked its own development, and the numbers were the point.

Its own tracker held 13 entries after the redesign. Five ADRs documenting real architectural decisions. Seven features that each shipped. One bug that was a genuine find, the package directory being misdetected by setuptools and breaking the editable install. Then the overhaul added an epic on top, with more ADRs, features, and bugs, all discovered by using the tool rather than designing it.

Running `tracker stats` inside the tool's own repo is a recursive joke. The tool reporting on itself. It is also the strongest proof of the concept. A knowledge graph that is genuinely part of the workflow, maintained by the workflow, and honest enough to admit its own bugs in its own tracker.

## Where the overhauled design still fell short

The overhaul fixed a lot. But dogfooding, and the thought experiment of what comes next, surfaced three limitations the design could not escape. All three trace back to one root. The tool assumed a single writer.

Sequential IDs are a race condition waiting to happen. The tool generated IDs by scanning existing entries and incrementing the highest number. That read-modify-write is not atomic. Two agents calling `tracker new` at the same moment could compute the same ID and create a collision. Fine for one writer. Unworkable for many.

In-place mutation destroys the audit trail. Updating an entry rewrites the file. When you change a status, the old state is gone. You cannot see that an entry went from proposed to in progress to blocked to done. You can only see where it is now. And when two writers edit the same entry, the last write wins silently, with no record and no conflict signal. For humans reading the tracker, that is a loss of history. For a system meant to preserve why decisions were made, it is a serious gap.

`graph.json` was derived but not protected. It is generated, not authored. Every clone, every new machine, every worktree starts without it until someone runs `tracker rebuild`. And because it was committed, rebuilds produced commit noise and stale versions could linger. The tool knew how to generate the graph. It had no story for distributing it.

The single-writer assumption had bought us simplicity, and now we were paying for it with all three of these at once.

## What we planned next

The three limitations pointed in one direction. We planned to make the tracker append-only. Every state change would create a new entry file linked to the old one through a `supersedes` relation, so old entries stay as immutable snapshots and the full history of an issue stays walkable. IDs would stop depending on a shared counter. They would be generated without scanning anything, safe for concurrent creation. And git itself would become the concurrency layer. Two agents editing the same issue would create two new files, a detectable fork instead of a silent overwrite. The graph would become a truly derived artifact, ignored by git and rebuilt automatically on checkout.

That was the direction we planned to take.
