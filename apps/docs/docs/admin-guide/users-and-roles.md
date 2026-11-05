---
sidebar_position: 3
title: Users and roles
---

# Users and roles

This page shows you how people get accounts and how to grant the site-admin role.

Every person who uses Steward is a **user**. Sign-in is handled by a real identity system; see
[Organisations and single sign-on](/admin-guide/organisations-and-sso) for how accounts are
provisioned.

## 👥 Users & roles

**Users & roles** lists everyone with one status (enabled, disabled, root, deleted, or merged
into someone), their roles, their groups and their policy access: **All policies**, or "All ·"
followed by how many policies an exception takes away or adds. Open a user to see four tabs.

- **Profile**: the username, **Account enabled** (sign-in is blocked while it's off, and nothing
  is deleted), and, for a local account, their name and email. **Generate & reset** sets a new
  random password and shows it to you once; copy it before you close the dialog. **Resend
  welcome email** sends their onboarding email again. A directory (SSO) account's name, email
  and password are managed in the directory.
- **Security**: their second factors. **Rename** gives one a clearer name; **Reset** removes it,
  so they set it up again the next time they sign in. The email code is always there.
- **Roles & access**: everyone enabled is a Reader. Tick **Site admin**, **Template admin** or
  **Compliance admin** to add an elevated role. Under **Policy access**, add an **Allow** or
  **Deny** exception for one policy, or remove one.
- **Advanced**:
  - **Act as this user** shows you exactly what they see, for up to 30 minutes, after you give
    a reason. Everything you do is recorded under your own name. Site admins and the root can't
    be acted as.
  - **Sessions** lists each sign-in with its browser, address and when it was last used. **Log
    out user** signs them out everywhere; they can simply sign in again.
  - **Make this user the root** hands the root administrator role to them. Only the current root
    can do it, and it asks for a code emailed to you.
  - **Delete user** previews what the deletion would affect. Re-assign their policies to someone
    first, clear anything that blocks it, then type their email to confirm.

:::note
The **root** administrator can't be disabled, have its roles changed, or be deleted.
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
is irreversible, so the confirmation shows both accounts and asks you to type the source
account's email before **Merge accounts** turns on.

## 👪 My groups, for group-managers

A user can be made a **local group-manager** of one or more
[platform groups](/admin-guide/groups#-platform-groups-are-something-else) without holding the
site-admin role. A group-manager sees **My groups**, scoped to only the platform groups they
manage (not categories), and can add or remove manual members there. Memberships synced from your identity provider stay
read-only, the same as on the Users page.

:::note
Granting someone the local group-manager role isn't exposed on the Users page yet.
:::

## ➡️ What comes next

With people in place, review your category tree — Steward's admin app calls a category a
**group**. See [Groups](/admin-guide/groups). Reading access for everyone else is managed per
category; see [Who can do what](/concepts/access-model).
