---
title: "The Overhaul: Fixing the Cracks We Found"
description: "Dogfooding surfaced five cracks in the tracker. We went through them one at a time: search became ranking, the graph got a single home, and affected files started coming from git."
tags: ["AI", "Coding Agents", "Python", "Architecture", "Open Source"]
publishDate: 2026-07-29
---

This is a continuation of the project tracker series. You can read the previous entry on dogfooding [here](/blog/project-tracker-v2-dogfooding).

## The cracks became the plan

Dogfooding gave us a list of five cracks. Each one had a fix attached. Some were small. Some changed how the tool worked at its core. We went through them one at a time.

## Search stopped matching and started ranking

The search problem was the most dangerous, because it failed silently. We replaced the literal substring check with a ranking model. The approach is called BM25F, and we hand-rolled it so we did not add a dependency.

The idea behind it is straightforward. A query gets split into terms, and each entry gets a score based on how many of those terms it contains. Frontmatter counts more than body text, three times more. So an entry that mentions both `login` and `race condition` in its metadata outranks an entry that only mentions them in the body. Reordered queries stop being a problem. `login race condition` and `race condition on login` now match the same set of entries, and the ranking picks the best one.

Why does this matter? A matcher tells you yes or no, and no was the default for anything phrased slightly differently. A ranker gives you the best answer instead of an empty result. The tool stopped telling agents "there is nothing here" every time they phrased a query differently.

## The graph got a single home

The rebuild problem came from writing the computed backlinks back into every entry file. Every rebuild touched every file. The fix was to stop doing that.

The graph now computes both directions in one pass and stores them on each node:

```json
"FEAT-005": {
  "type": "feature",
  "status": "DONE",
  "relations": { "implements": ["ADR-002"], "epic": ["EPIC-001"] },
  "reverse": { "referenced_by": ["ADR-002", "BUG-003"] }
}
```

Backlinks became a property of the graph instead of a property of each entry file. `graph.json` is the single source of truth for the graph. Rebuild writes zero Markdown files, and running it twice produces identical output. No more churn. No more diff noise.

Why does this matter? The tool existed to reduce noise, and it was generating noise every time you ran it. A derived artifact should write its own file and leave the sources alone.

## The affected files list came from git

The `AFFECTS` field drifted because we asked agents to maintain by hand what git already tracks. The fix was to stop maintaining it.

During rebuild, the tool reads the commits in `LINKS.commits`, runs `git diff-tree` on each one, and caches which files each commit touched. A new command, `tracker affects <path>`, answers "which entries touch this file?" using that cache. Hand-written `AFFECTS.files` stays around as a fallback, and the validator warns when it lists a file that is not in the linked commits.

Why does this matter? Duplicated truth always drifts. If git already knows which files a commit changed, asking an agent to keep a second copy of that list is asking for trouble.

## Time became visible

Entries gained `CREATED_AT` and `UPDATED_AT`. Set automatically at creation, bumped on close. ISO 8601 with UTC, no ambiguity.

Why does this matter? "How stale is this?" is a question agents ask on every read. Before, the answer meant leaving the tracker and reading git. Now it is in the entry.

## Tests became a safety net

The missing test suite was the most preventable crack. We added one, and it caught the migration bugs immediately.

The suite covered frontmatter round-trips, migration scenarios, and search ranking. 22 tests. They are now part of the workflow, so a change that breaks the migration or the search fails loudly instead of shipping silently.

Why does this matter? The tool tells agents to trust its process. A process without tests is not trustworthy.

## The tradeoff we accepted

Not every problem got solved. One decision we made was explicit about what we would not build.

The tool assumed a single writer. `tracker new` and `tracker close` read, modified, and wrote files with no locking. Two agents running `tracker new` at the same moment could compute the same next ID and collide. Two agents editing the same entry would silently overwrite each other. Proper concurrency, with file locks and conflict detection, would have added significant complexity for a scenario that had not arrived. One user, one project, usually one agent at a time.

So we documented it. The tool assumes at most one writer. Concurrent readers are safe. Writers must not overlap. It was a deliberate tradeoff, written down where an agent could find it.

## What the tool looked like when it was done

The overhaul reshaped the tool in ways the design phase never anticipated:

- Search became a relevance model instead of a matcher.
- The graph became truly derived. One file, zero Markdown churn, idempotent rebuild.
- The affected files list became git-derived, and the tool gained a tenth command, `tracker affects`.
- Time became visible through timestamps.
- Trust became testable with a 22-test suite.

And the whole thing had been shaped by using it, not by imagining it.

The single-writer assumption was the one decision we made that we were not sure about. It held for one user. The question of what happens when the single user becomes many was already sitting on the table.

## What we planned next

The single-writer assumption was fine for one human and one agent. The thought experiment was what happens with many agents, many machines, many concurrent sessions. That question pointed in a specific direction. An append-only tracker, where entries are never mutated, where IDs do not depend on a shared counter, and where git itself becomes the concurrency layer. We planned to explore that next.
