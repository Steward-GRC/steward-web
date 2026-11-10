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
levels deep**. Choose **Categories** on the rail, then **Directory**: the page is the tree. Each
category is a node that opens its sub-categories, and shows how many owners and sub-categories it
has. Select a name to open its **Details & Defaults**. The **Search categories** box keeps the
matches and the path down to them. The same tree sits in the panel beside the page on a wide
screen.

## ➕ Create and manage a group

1. Select **+ New category**. Give it a name; the **slug** fills in from the name, and you can
   change it. Choose a **parent**, or leave it at "None (new top-level site)", and set its
   defaults now or later. Then select **Create category**.
2. Open a category to manage it. Its path ("Finance › Expenses") sits above its name, and one card
   holds everything you can change, saved together with **Save**:
   - its **name** and **slug**. The slug sets the policy-number prefix (POL-EXPENSES-); renaming
     doesn't renumber existing policies;
   - **Move to**, to re-parent it;
   - its **review cadence** (none, annual, every two years, or a specific date);
   - its **default template** (or "No template (freeform)") and **default workflow**;
   - its **owners**.
3. Below the card, **Acknowledgement audience** says who must acknowledge this category's
   policies: everyone, or specific identity-provider groups, less any excluded groups.
4. The **Danger zone** deletes the category. This is blocked while it or any of its subgroups
   still holds documents. To confirm, type the category's name exactly as shown.

## 🔀 Move a group

Moving re-parents the category — and everything under it — to sit under a different one. A move
that would push any part of the subtree deeper than three levels is rejected. There are three
ways to do it:

- on **Directory**, drag a category onto its new parent, or drop it on the **Drop here to make it
  a top-level category** bar that appears while you drag;
- on **Directory**, select **Move** on a category, choose the **New parent** (only the parents
  that keep the branch within three levels are offered) and confirm. This works from the
  keyboard;
- **Move to** on the category's own page.

:::warning
Moving a group can change which defaults a document inherits, because inherited settings come
from the new parent. Review the moved branch afterward.
:::

## 👑 Owners

Owners are set on **top-level** groups only; every group beneath inherits its top-level group's
owners, shown locked as "Inherited from Finance (read-only)" for a group under Finance. On a top-level group the owners are
chips: the cross removes one and **Add owner…** adds one. An owner reviews that group's documents
on its review cadence, and has full read, acknowledge, approve and author access across it — see
[Who can do what](/concepts/access-model).

## 👥 Platform groups are something else

**Platform groups** are the groups _people_ belong to, kept by Steward's identity service. They
are not categories: a category holds documents, a platform group holds members. Reporting's
officer setting, SSO group mappings and group managers all name a platform group.

Open **Categories**, **Directory**, then **Platform groups** (`/admin/platform-groups`, site administrators only)
to:

1. **Create** one: give it a name and, if it sits under another, a parent.
2. **Copy its id** from its card. Settings that name a platform group take this id, not the name.
3. **Add members** by email, or remove them. Memberships synced from your identity provider show
   as **Synced** and can only change there.

To let people work compliance cases, create a group such as "Privacy Officers", add the
officers to it, and give the group's id to whoever runs the install: the reporting service reads
it from its `REPORTING_OFFICER_GROUPS` setting (several ids separated by commas). A group your
identity provider sends at sign-in can be named there instead, by its name.

## ➡️ What comes next

With groups and their defaults in place, set who can do what in each one on
[Category access](/admin-guide/category-access), or move on to [Libraries](/admin-guide/libraries).
