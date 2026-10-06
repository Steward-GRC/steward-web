---
sidebar_position: 5
title: Who can do what (access model)
---

# Who can do what (access model)

This page explains how Steward decides what you are allowed to do with a policy or procedure.
Access is controlled per category, so the same person may have different rights in different
parts of the category tree.

## 🔒 The four actions

There are four things you can do with a document. Each one can be allowed or denied for you
individually.

| Action | What it means |
| --- | --- |
| Read | View the document's content |
| Acknowledge | Confirm you have read it |
| Approve | Approve or reject a draft in a workflow |
| Author | Create and edit drafts |

:::note
**Read gates everything else.** If you cannot read a document, you also cannot acknowledge,
approve, or author it — even if those actions would otherwise be allowed.
:::

## 👑 Category owners

Each category can have one or more **owners**. Owners always have full access in their category:
they can read, acknowledge, approve and author. Ownership **flows down the tree** — if you own a
parent category, you automatically own every child category beneath it.

## 📋 The access ruleset

Alongside its owners, every category has an ordered **ruleset** that says who else can do what.
Each rule names a **subject** — everyone, a specific directory group, or a specific user — and a
setting for each of the four actions: allowed, denied, or unset.

Rules inherit down the tree, the same as other category settings. Checking access works like a
firewall: owners always pass; otherwise, for each action, the first rule that says something
about it wins, and anything that reaches the bottom without a match is denied by default. New
categories start with a default rule — everyone can read — which administrators can narrow once
the category is in place.

## 🛡️ Site-wide access

A site administrator can read every document, regardless of what the ruleset says, so oversight
is always possible. Being a site administrator does **not** automatically grant approve or author
rights — those still come from the ruleset or from category ownership, the same as for any other
user.

## 🔐 Sensitive documents

A document can be marked sensitive. Its content can be shown obfuscated to people who would not
otherwise have read access, so oversight does not mean everyone sees restricted wording. Someone
with the right permission can **break glass** — a time-boxed reveal that is recorded, with a
reason, in the audit log.

## ➡️ What comes next

If you cannot access a document you expect to see, contact your administrator — they can check
and adjust the category's rules. Continue to the [User Guide](/user-guide) to put these ideas to
work.
