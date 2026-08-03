---
title: "From Script to Package: The Project Tracker Redesign"
description: "Addressing complaints and turning a simple script to a full blown python package"
tags: ["AI", "Coding Agents", "Python", "Architecture", "Open Source"]
publishDate: 2026-07-27T12:00:00Z
---

This is a continuation of the project tracker series. You can read [Part 1](/blog/project-tracker-v1) here.



## The script hit its ceiling
Previously, we covered a proof of concept that stored project knowledge in Markdown files so AI coding agents could stay oriented without a database or an API. That implementation was a simple python script that was still solving a genuine problem with project tracking. It ensured that every bug, feature, and cross-cutting issue lived in a single Markdown file letting agents  read them easily. The accompanying CLI also served to cut down on boilerplate through the `init`, `new`, `close`, and `rebuild` commands, which lets the agents update project context easily without the  whole thing from rotting the way a simple `PLAN.md` always does. But as discussed before, it had limits that were impossible to ignore once you actually tried to lean on it:

- **Limited Issue Types** Bug, feature, and issue. There was nowhere to put an architectural decision or any other large changes without just putting them in a generic `issue` record. This resulted in decisions getting filed with other concerns and were effectively lost in the shuffle.

- **Relations were a string.** The `LINKS` field was a flat `key=value` list. You could _see_ simple relations like BUG-001 being related to a commit 0x3453f easily. But if wanted to ask questions like "what depends on this BUG 001?" or "what existing functionality does BUG 001 affect?", you would have to have the agent read through the bug report or the git history itself. 

- **Search was only using grep.** While string based search was powerful and simple, it did leave significant holes. You had to use grep to search for issues manually. While simple, this approach means that the search would not account for metadata such as status, priority or tags. Moreover, there was no ranking, no understanding of the metadata structure.

- **No backlinks.** You could never answer the question "what references this bug?" or "how did this feature effect other issues?" without reading every file.

- **Separate script file per project.** Since it was a simple script, the only way to use it was to load it to run it with the python interpreter in the shell. This means that to run this program, you had to either put a copy in the project itself, or have the agent go out of its project sandbox just for issue tracking. 


While these weren't fatal flaws by any means, they did make using it that much harder. After all, they were the natural ceiling of a script that was built to prove an idea and thus The idea was proven. The question now was whether it deserved to grow into something real.

## From script to package

The first limitation was the easiest to resolve. The tracker should stop being a simple script that you could call with just `python tracker.py` every time you needed to run the project tracker. The time was nigh for it to become a proper Python package. 

Although this would make maintaining the tracker more complicated, making it into a full blown package comes with its own advantages:

**Installation:**. A package means `pip install -e .` and suddenly you have a `tracker` command on your `PATH`. The agent's instructions don't need to explain where the script lives to start to just use the tracker. After installing, you can just install and have access to the tool immediately.  

**External API**. The script only has arguments to adapt its behavior during runtime. By making it into a package, we can have an API a `Tracker` class that exposes methods such as `validate()`, `rebuild()`, `search()`, and the rest instead of always calling them with arguments. That meant external programs such as tests, tooling etc. could drive the tracker programmatically with much more granular control.

**Developed Schema**. The problem with the script that it doesn't come with the schema definitions. This means that any agent using this tool needs a new set of instructions defining the schema to just interpret the data. A package ships with its own schema. This gives a definition of what a valid entry looks like.  This gives a single target to validate against, migrate toward, and evolve over time. Since this is the next version of the tracker, we will be calling it **Schema 2**.

## Structural overhaul
Now we tackle the other issues with our previous script, namely the limited issue types and limited support for cross issue relationships. We will start by overhauling the currently limited issue types.


### Issue Type Overhaul
As mentioned before, the three issue types `bug` and `feature` and `issue` are limited in scope and fail to address larger architectural concerns. To address these, we introduce the `adr` and `epic` issues types. Unlike the previous types, these exclusively address larger architectural and design efforts.  To elaborate:


**`adr` exists because decisions are the most expensive context to rediscover.** An agent that starts a session and reads "we chose Postgres over MySQL because of X" won't spend half the session re-deriving that decision. Previously, there was literally no place to store this information. Now there's a dedicated folder, with its dedicated data to help answer these decisions quickly without going through half the database.

**`epic` exists to give a sense of scale** Inspired by Jira EPICs, these issues help to signify a larger effort towards a goal. An epic is a group of related entries that represent the shape of a whole initiative. When an agent needs to understand "what is this phase actually about?", the epic gives it a container to look inside.


We also add a separate `doc` type to separate out documentation related issues from the reset of the code. This allows documentation issues to have their own folder separate from any existing code related issues.

We also rename the existing `issue` to `task` to signify that the type is supposed to be used for chores and regular operational efforts.

In the end, We kept `bug` and `feature`, renamed `issue` to `task` and added three more issue types. At the end, we come up with the following schema: 

| Type      | Folder       | Prefix | Purpose                         |
| --------- | ------------ | ------ | ------------------------------- |
| `bug`     | `bugs/`      | BUG    | Defects and unintended behavior |
| `feature` | `features/`  | FEAT   | Capabilities and enhancements   |
| `adr`     | `decisions/` | ADR    | Architectural Decision Records  |
| `task`    | `tasks/`     | TASK   | Chores and operational work     |
| `epic`    | `epics/`     | EPIC   | A group of related entries      |
| `doc`     | `docs/`      | DOC    | Documentation references        |



### Identities that mean something

Previously, an ID was just a number: `001`. This while being simple, does not really give any information at a glance. The solution was to make IDs self-describing: `BUG-001`, `FEAT-023`, `ADR-004`. The prefix tells you the type without opening the file, and the filename (`BUG-001-race-condition-in-auth.md`) tells you the subject. This allows an agent can glance at a directory listing and know what the project contains.


### A more robust schema
With the issue types an ID overhaul, we also strived to add additional information to our schema. To this end, we added a set of triage fields, such as `PRIORITY`, `SEVERITY`, `EFFORT`, `CONFIDENCE`, `OWNER`. These fields help agents gauge the effort and priority of an issue. Moreover, this allows agents to answer "how important is this?", a question that constantly comes up while working on a project.


Similarly, our previous values for the `STATUS` field of `OPEN` and `CLOSED` only give simple information about an issue. With the expansion of new issue types, this is no longer enough. Now, to accommodate this expansion, we expand the possible values of the status field to expand it into a fully expressive one. This allows us to do things we couldn't do before:

- Previously, `OPEN` issues could not distinguish between future and current issues to tackle. The `PROPOSED`, `PLANNED`,and `IN_PROGRESS` values allow for this kind of nuanced distinction between issues.

- `OPEN` issues cannot tell you if they are being currently blocked by any other issue. The `BLOCKED` value can explicitly shell it out.

- `CLOSED` issues cannot tell if an issue if an issue is actually finished, or if its not going to be implemented. The new `DONE` and `CANCELLED` handily solve this issue by taking the ambiguity out of it.

- Finally, the old system has no way to mark duplicate issues. The new `DUPLICATE` value does just that.


Finally, we introduced a new `SCHEMA` field with the value of `2`, reflecting that this is version 2. This acts as a version stamp, so that when the format eventually changed, a tool could detect old entries and migrate them instead of breaking silently.

### Validation, because garbage in means garbage out

With a new schema came a new `validate` command. It checks that required fields exist, that statuses and priorities are real enum values, that relation targets actually exist, that no two files share an ID, and that a `BUG` entry isn't sitting in `features/`. A typo like `STATUS: DONE` (missing the E) is caught instantly instead of polluting the graph for weeks.

## Whats Next 
This new schema provides new information and makes the issue tracker more information dense. However, we are still missing any kind of relationship framework between different issues. To this end, we introduce a new graph based structure. For the sake of keeping the length of the blog manageable, this is going to a 
covered in [the next entry](/blog/project-tracker-v2-graph), where we turn the schema into a graph.
