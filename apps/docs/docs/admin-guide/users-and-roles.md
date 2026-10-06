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
- **See their sessions**: when each was issued and signed in, when it was last used (to within
  a minute or so; a dash for a session not used since it signed in), when it expires and the
  device's IP address.
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

## 🔀 Merging duplicate accounts

When the same person ends up with two accounts (a common SSO-onboarding mishap), **Merge
accounts** on the Users page moves everything the duplicate owns onto the one you want to keep,
then closes the duplicate. Pick the **source** (closed afterward) and the **target** (keeps the
records), then **Preview merge** to see exactly what would move before anything changes. Merging
is irreversible.

## 👪 My groups, for group-managers

A user can be made a **local group-manager** of one or more groups without holding the
site-admin role. A group-manager sees **My groups**, scoped to only the groups they manage, and
can add or remove manual members there. Memberships synced from your identity provider stay
read-only, the same as on the Users page.

:::note
Granting someone the local group-manager role isn't exposed on the Users page yet.
:::

## ➡️ What comes next

With people in place, review your category tree — Steward's admin app calls a category a
**group**. See [Groups](/admin-guide/groups). Reading access for everyone else is managed per
category; see [Who can do what](/concepts/access-model).
