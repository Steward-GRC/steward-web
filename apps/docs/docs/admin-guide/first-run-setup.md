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
sign in because no accounts exist yet. The message checks again every few seconds and switches
to the sign-in screen by itself as soon as you finish the steps below. While Steward can't be
reached at all, the page shows only the Steward loading mark until it can tell.

## 🛠️ Create the first administrator

1. **Open the setup screen.** On a new install, the admin app shows **First-run setup** at
   `/setup`: one card, "Create the root administrator account."
2. **Create the root user.** Fill in a username, email, display name and password, twice. This
   account is the **root** user and has full access to everything.
3. **Enter the setup token.** The operator who installed Steward holds a **setup token**; enter it
   to prove you are allowed to create the first account, then select **Continue**.
4. **Optionally connect single sign-on.** The **Single sign-on** card lets you select **Set up
   SSO now** and connect your organisation's identity provider right away, or **Skip for now**
   and add it later — see [Organisations and single sign-on](/admin-guide/organisations-and-sso).
5. **Done.** "Your root administrator is ready." Without SSO, Steward takes you on to sign in by
   itself. With SSO, it shows the DNS record that finishes enabling it, with **Copy**, then **Go
   to sign in**.

Appliance installs don't show this screen: the root administrator is made in the appliance's own
first-boot setup, and the web app shows "Not set up yet" until then.

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
