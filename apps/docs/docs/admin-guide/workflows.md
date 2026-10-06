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

| Quorum | What it means |
| --- | --- |
| One | Any single approver's approval passes the stage. |
| Majority | More than half of the approvers must approve. |
| All | Every listed approver must approve. |

A workflow is not usable — a group cannot select it as a default — until it has at least one
stage, and every stage has at least one approver.

Open **Workflows** under `/admin` to see every workflow and whether it is usable.

## ➕ Create and edit a workflow

1. Select **New workflow**, give it a name and an optional description.
2. Add a stage, name it, and choose its quorum and approvers. Reorder stages with the up and
   down controls — the order is the approval sequence, so put the earliest reviewer first and
   the final sign-off last.
3. Save. An existing workflow opens the same stage editor to add, remove, reorder or rename
   stages, or change their approvers and quorum.

A group picks its default workflow from this list, under the group's **Defaults & governance**
tab (see [Groups](/admin-guide/groups)).

## 🗑️ Archive a workflow

Archiving removes a workflow from the list a group can pick as its default. It does not change
any group already using it, or any policy already moving through it.
