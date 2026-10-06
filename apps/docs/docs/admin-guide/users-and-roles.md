---
sidebar_position: 3
title: Users and roles
---

# Users and roles

This page shows you how people get accounts and how to grant the site-admin role.

Every person who uses Steward is a **user**. Sign-in is handled by a real identity system; see
[Organisations and single sign-on](/admin-guide/organisations-and-sso) for how accounts are
provisioned.

## 👥 The Users page

The **Users** page lists everyone's status and roles. Open a user to:

- **Enable or disable** their account, which blocks sign-in without deleting anything.
- **Edit their name and email**, for a local account.
- **Grant or remove the site-admin role.** Site-admin is the one global role in this release: it
  gives full access to users, organisations and the audit log.
- **Revoke their active sessions**, signing them out everywhere.
- **Delete the account.** Steward previews what the deletion would affect before you confirm, so
  you can see the impact first.

:::note
The **root** administrator created at first-run setup cannot be disabled, have its roles changed,
or be deleted from this page.
:::

## 🗃️ Deleted and merged accounts

A deleted account is closed, not erased — Steward keeps it so audit history still shows who did
what. The table hides closed accounts until you turn on **Show deleted**. With it on, a closed
account shows a **deleted** or **merged** badge; a merged account links to the account it was
merged into. Closed accounts are read-only and never appear in user pickers, such as when you
choose a group's owner.

## ➡️ What comes next

With people in place, review your category tree — Steward's admin app calls a category a
**group**. See [Groups](/admin-guide/groups). Reading access for everyone else is managed per
category; see [Who can do what](/concepts/access-model).
