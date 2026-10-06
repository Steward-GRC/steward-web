---
sidebar_position: 4
title: Groups
---

# Groups

This page shows you how to build the category tree that organises policies and procedures, and
how to set each category's defaults.

:::note
What this guide's [Concepts](/concepts) section calls a **category**, Steward's admin app calls a
**group** — a naming carryover from the product this app is built on. They are the same thing.
:::

## 🗂️ Groups are the backbone

Every policy and procedure lives in a group, and groups are arranged in a tree up to **three
levels deep**. Open **Groups** under `/admin` to see the tree.

## ➕ Create and manage a group

1. Select **New group**, give it a name, and choose a parent (or leave it at the top level).
2. Open a group to manage it, under three tabs:
   - **Details** — rename it, or edit its **slug** (used to derive its policy-number prefix;
     changing it breaks old category-browse links).
   - **Defaults & governance** — the group's **default template** (or freeform, for no template),
     its **default workflow**, and its **review cadence** (none, annual, every two years, or a
     specific date).
   - **Danger zone** — delete the group. This is blocked while the group or any of its subgroups
     still holds documents.

## 🔀 Move a group

From the **Details** tab, **Move to** re-parents the group — and everything under it — to sit
under a different group. A move that would push any part of the subtree deeper than three levels
is rejected.

:::warning
Moving a group can change which defaults a document inherits, because inherited settings come
from the new parent. Review the moved branch afterward.
:::

## 👑 Owners

Owners are set on **top-level** groups only; every group beneath inherits its top-level group's
owners, shown read-only on their own **Defaults & governance** tab. An owner reviews that group's
documents on its review cadence, and has full read, acknowledge, approve and author access across
it — see [Who can do what](/concepts/access-model).

## ➡️ What comes next

With groups and their defaults in place, see [Who can do what](/concepts/access-model) for how
access is decided within a group, or move on to
[Organisations and single sign-on](/admin-guide/organisations-and-sso).
