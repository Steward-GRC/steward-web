---
sidebar_position: 2
title: First-run setup
---

# First-run setup

This page is for the very first time Steward is opened on a brand-new install.

Before anyone can use Steward, it needs a first administrator. On a new install there are no
accounts yet, so Steward gives you a special screen to create one.

## 👀 What staff see before setup

Until setup is done, anyone who visits the site sees a **"Not set up yet"** message. They cannot
sign in because no accounts exist yet. This clears as soon as you finish the steps below.

## 🛠️ Create the first administrator

1. **Open the setup screen.** On a new install, the admin app shows a `/setup` screen.
2. **Enter the setup token.** The operator who installed Steward holds a **setup token**; enter it
   to prove you are allowed to create the first account.
3. **Create the root user.** Fill in a username, email, display name and password. This account is
   the **root** user and has full access to everything.
4. **Optionally connect single sign-on.** You can configure your organisation's identity provider
   right away, during the same setup step, or add it later — see
   [Organisations and single sign-on](/admin-guide/organisations-and-sso).

Once the root user exists, the `/setup` screen goes away. From now on you sign in normally and
manage Steward from `/admin`.

:::danger
You bootstrap Steward only once. The `/setup` screen and the setup token work only until the first
administrator is created. After that, setup is gone for good. Make sure the details you enter are
correct before you finish.
:::

:::warning
The first administrator account has full control. Use a strong password and share the account
only with people you trust.
:::

## ➡️ What comes next

With the root user in place, add your people. See
[Users and roles](/admin-guide/users-and-roles).
