---
sidebar_position: 4.8
title: Templates
---

# Templates

This page shows you how to keep the document skeletons that new policies start from.

A **template** is a list of sections: their order, their heading level (H1 to H5), whether each is
required, and any boilerplate text. A policy started from a template gets those sections, and a
required section must be filled before the policy can be submitted.

## 🗂️ The Templates list

**Templates** under **Structure** lists each template's ID, name, owning category, how many
versions it has, its latest version and when the template last changed. **+ New template** asks for
a name and, optionally, the top-level category that owns it.

## 🔢 Version numbers

Each template version has a number (v1, v2, v3) and a **semantic version** beside it, such as
`v3 (1.2.0)`. Steward writes the semantic version when you publish, from what changed against the
version before:

| Change against the active version                            | Raises                     |
| ------------------------------------------------------------ | -------------------------- |
| A required section added, removed or made required           | **Major** (1.0.0 to 2.0.0) |
| An optional section added or removed, or changed boilerplate | **Minor** (1.0.0 to 1.1.0) |
| Titles, order or heading level only                          | **Fix** (1.0.0 to 1.0.1)   |

The first published version is always 1.0.0. A draft shows the number a publish would give it now.
If Steward has no semantic version for a version, only its number shows.

The template page shows **Published** (when the active version went live) and **Updated** (the
latest of a rename and any version being created or published). **Version history** dates each
version and says how big its change was.

## ✏️ Change a template

A template changes through a **draft version**, one at a time. Open a template, then **Create
version** to start a draft from the active version. The draft has three steps:

1. **Sections** — drag a row by its grip to reorder it, or focus the grip and use the arrow keys:
   up and down move it, right and left indent and outdent it. The switch makes a section required.
   **Text** opens its boilerplate, and the cross removes it. **+ Add section** adds one at the end.
   **Next: Review** saves the draft.
2. **Review** — lists what the draft changes against the active version: sections added, removed,
   renamed, moved, re-levelled or made required or optional.
3. **Publish** — **Publish version** makes the draft the active version for new policies.

**Discard draft** throws a draft away and keeps the active version. **Version history** lists every
version with its status.

## 🗑️ Retire or delete

The actions menu beside the version line holds **Rename**, **Retire** and **Delete**. Retiring
hides the template from new policies; policies already using it keep their structure. Deleting
removes it and its versions, and is refused while any policy uses it.
