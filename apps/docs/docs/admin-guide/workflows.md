---
sidebar_position: 5
title: Workflows
---

# Workflows

This page shows you how to build an approval chain and set which approvers must sign off before
a group's policies are published.

## 🔀 Workflows are approval chains

A **workflow** has ordered **stages**, and a policy moves through them one after another. Each
stage names its **approvers** and a **quorum**:

| Quorum | What it means                             |
| ------ | ----------------------------------------- |
| One    | The first approval moves it on.           |
| Quorum | A majority of the approvers must approve. |
| All    | Every approver must approve.              |

An approver is a person or a group. A group approves **as a group**: it needs as many of its
members as its own quorum asks for, shown as "As a group · 2 of 3".

A stage can also name **veto people**. If any one of them rejects, the run ends as rejected, even when
the stage's quorum would have been met. A veto person must already be one of the stage's approvers,
as a person or as a member of a group on that stage; there are no veto-only seats, and a site
administrator or root does not count unless they are an approver. There is no workflow-wide switch:
a stage with veto people applies them, and a stage with none has no veto.

A workflow is a **Draft**, and a category can't use it, until it has at least one stage and every
stage has at least one approver.

**Workflows** under `/admin` shows each workflow as a card, grouped by the site whose categories
use it, with how many stages it has and how many categories use it. A card warns when an approver's
account is disabled and needs replacing.

## ➕ Create and edit a workflow

1. Select **+ New workflow**, give it a name and an optional description.
2. Each stage is a card. Name it, choose **One**, **Quorum** or **All**, and add approvers with
   **+ Add approver**; the cross on a chip removes one. A disabled approver shows as "disabled —
   replace". **Veto people** picks who can end the run with a single reject; it offers only that
   stage's approvers, and removing an approver also removes them from the veto people, with a note.
   **Due within** sets how many working days the stage has. It counts whole working days on the site
   calendar (set under **Settings**, **Working days**), skipping weekends and holidays.
3. Drag a card by its grip to reorder the stages, or focus the grip and use the up and down arrow
   keys. The order is the approval sequence, so put the earliest reviewer first and the final
   sign-off last. **+ Add stage** adds one at the end.
4. Select **Save workflow**.

**Duplicate workflow** makes a copy to start from. A category picks its default workflow on its
**Details & Defaults** (see [Groups](/admin-guide/groups)).

## 🗑️ Delete a workflow

**Delete workflow** is off while any category uses the workflow. Otherwise it takes the workflow
out of every list where one is chosen. Its history is kept, and no policy already moving through
it changes.
