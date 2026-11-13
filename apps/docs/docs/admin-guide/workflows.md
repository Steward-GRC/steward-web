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
2. Each stage is a card. Name it, choose **One**, **Quorum** or **All**, and add approvers by
   typing in the stage's approver box (see below); the cross on a chip removes one. A disabled approver shows as "disabled —
   replace". **Veto people** picks who can end the run with a single reject; it offers only that
   stage's approvers, and removing an approver also removes them from the veto people, with a note.
   **Due within** sets how many working days the stage has. It counts whole working days on the site
   calendar (set under **Settings**, **Working days**), skipping weekends and holidays.
   Three settings sit under it:
   - **Reject if the due date passes** rejects the stage when nobody has decided by the due date,
     and the run ends as rejected. It never approves by itself.
   - **Remind approvers every N working days after the due date** reminds each approver who has
     not decided when the stage is due, then every N working days until they decide.
   - **Tell the category owners N working days after the due date** tells the category owners once
     if the stage is still undecided that long after the due date.

   The two day settings are whole working days, from 1 to 365; empty or 0 turns one off. They need
   **Due within**, and they are off while **Reject if the due date passes** is on, because the stage
   is rejected at the due date and there would be nothing left to remind about. Reminders and
   escalation only notify: they never approve a stage and never add an approver.

3. Drag a card by its grip to reorder the stages, or focus the grip and use the up and down arrow
   keys. The order is the approval sequence, so put the earliest reviewer first and the final
   sign-off last. **+ Add stage** adds one at the end.
4. Select **Save workflow**.

## 🔎 Choose approvers

Type a name in a stage's approver box to find a person or a group. Only people who can approve
in the categories that use the workflow are offered, so the site administrator never appears. A
workflow that no category uses yet offers nobody: it says to attach the workflow to a category
first, which you do on the category's **Details & Defaults**. A group is offered when at least one
of its members can approve, and it approves as a group with one of those members needed.

**Duplicate workflow** makes a copy to start from. A category picks its default workflow on its
**Details & Defaults** (see [Groups](/admin-guide/groups)).

## 🗑️ Delete a workflow

**Delete workflow** removes the workflow for good, after a confirmation that names it. You land
back on the workflow list with a note that it was deleted. Deleting is refused in three cases, and
the editor says which:

- **A group uses it.** The button is off while a category uses the workflow as its default, and a
  refusal reads "In use by N groups: change those categories first". Change the default workflow on
  those categories, then delete.
- **It has been used.** Once a policy run or a policy override has used the workflow, it can't be
  deleted: "This workflow has been used by N runs or policy overrides and cannot be deleted. Archive
  it instead." The message carries an **Archive workflow** button. Archiving takes the workflow out
  of every list where one is chosen, keeps its history, and changes no policy already moving through
  it.
- **It is already gone.** If another administrator deleted it first, the editor says "This workflow
  no longer exists" and returns you to the list.
