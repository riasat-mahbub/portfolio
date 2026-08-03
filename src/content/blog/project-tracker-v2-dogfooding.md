---
title: "Dogfooding the Tracker: What Using It Revealed"
description: "We used the tracker to track its own development. The search silently missed things, rebuild rewrote every file, and the missing tests hid real bugs."
tags: ["AI", "Coding Agents", "Python", "Architecture", "Open Source"]
publishDate: 2026-07-28
---

This is a continuation of the project tracker series. You can read the previous entry on the queryable graph [here](/blog/project-tracker-v2-graph).

## We turned the tracker on itself

We had a tool that organized project knowledge for agents, and we had never actually used it. The schema looked good on paper. The graph was queryable. The CLI was clean. But a knowledge tool only proves itself when it is operated, and the only honest way to test that was to use the tool to track its own development.

So we did. The work became an epic in the tool's own tracker. Every bug, feature, ADR, and task got filed through the tool itself.

And then the tool started telling us where it was wrong.

## The search that silently lied

The first crack appeared in `tracker search`.

The search used literal substring matching. It checked whether your query appeared verbatim in an entry. That works for an exact phrase, but people do not search with exact phrases. A query like `login race condition` only matched if that exact sequence appeared somewhere in a file. Ask for `login race condition` and an entry that honestly said "race condition on login", which was exactly the entry you wanted, returned nothing.

This was filed as a bug, and it mattered more than the bug itself. The tool was designed for AI agents, and agents treat an empty result as information. Zero results told an agent "there is no related work here" when the truth was just "your query was phrased differently." The search was quietly telling agents the wrong thing. A silent miss on a tool whose whole job is context is worse than a loud failure, because nobody notices it until the agent builds on the wrong assumption.

## A rebuild that rewrote the whole world

The second crack was about how the graph was written out.

`tracker rebuild` wrote `graph.json`, and it also injected the computed backlinks back into every entry file. Each entry gained a `COMPUTED` block in its frontmatter showing who referenced it. The intent was reasonable. Open a single entry and the backlinks are right there.

The result was that every rebuild touched every Markdown file in the project. Every file got a new mtime. Every rebuild produced a wall of git diff noise. The tool whose job was to keep project knowledge clean was generating churn on every single cycle. The generated output was polluting the very files it was meant to describe.

## Affected files that drifted from reality

The third crack was about `AFFECTS`, the field where an entry lists which source files it touches.

We asked agents to maintain `AFFECTS.files` by hand, the same way they maintained the entry itself. At the same time, agents were already maintaining `LINKS.commits`, the commit hashes an entry shipped in. And git already knows exactly which files a commit touched. So we were asking agents to maintain two descriptions of the same thing, one of which they had to keep in sync with reality on their own.

It drifted. `AFFECTS.files` slowly diverged from what was actually true until it was a second source of truth that nobody trusted.

## The missing sense of time

This one was small, but it mattered more than we expected. Entries had no timestamps. When we looked at an entry, there was no way to know how fresh the information was. Was this decision made yesterday or a year ago? Was this `IN_PROGRESS` bug touched recently or abandoned? The only way to find out was to go read the git history and figure out when the entry was last changed.

For an agent, that is a surprising amount of work for a question that should have a one-line answer.

## The tests that found our migrator's bugs

The final crack was the most embarrassing, because it was the most preventable. We shipped with no tests. The tool that organized the development process had no safety net for its own development.

Then we added a test suite. The moment we ran it, it found real bugs in the migration code.

- One bug was in how the migrator handled nested relation lists. A generator expression was supposed to produce a single element, and instead it yielded the whole list as one element.
- Another bug double-prefixed IDs that already had a type prefix. An entry that already read `BUG-001` came out of migration as `BUG-BUG-001`.

Neither bug would have been found by reading the code. Both were found by asking the tool to prove itself. For a tool whose value proposition is "trust this process," shipping without tests was a contradiction we only noticed once we started using the tool for real.

## What we planned next

We had a list of five cracks, and each one pointed at a fix. Search needed to rank instead of match. The graph needed a single home. The affected files list needed to come from git instead of from memory. Entries needed timestamps. And the whole thing needed a test suite that stayed.

We planned to fix them one at a time, starting with the ones that hurt the most.
