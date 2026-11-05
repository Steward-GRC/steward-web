---
sidebar_position: 2
title: Signing in and passwords
---

# Signing in and passwords

This page covers how to sign in and what to do if you forget your password. Signing in is the
first thing you do every time you use Steward, so it is worth a minute to learn where each piece
lives.

## 🔑 Sign in

1. Open Steward at your organisation's address. You land on the **sign-in screen**: a single card
   with your organisation's name at the top, then Steward.
2. Enter your **email or username** and your **password**.
3. Select **Sign in**.
4. If your organisation asks for a second factor and you have more than one, choose a method:
   **Authenticator app**, **Email code** or **Use your passkey**. Then enter the 6-digit code in
   the six boxes and select **Verify**. For an email code, **Resend code** sends a new one, and
   **Choose another method** takes you back to the list.
5. The first time, you may be asked to set up an **authenticator app**: scan the QR code with the
   app (or type the secret shown under it), enter the 6-digit code it shows and select
   **Confirm**.

Steward shows **Signing in…** for a moment while it opens your session.

Once you are in, you land on your [home dashboard](/user-guide/your-dashboard). To sign out, open
the account menu at the top right and choose **Sign out**.

If sign-in fails, Steward says why above the fields. **"Incorrect username or password."** almost
always means a typo: try again carefully, watching for **Caps Lock** and stray spaces. **"Too many
attempts. Wait a moment and try again."** means you've tried too often; wait a minute first. If it
still fails, tell your administrator — they can confirm your account.

## 🏢 Sign in with SSO

If your organisation signs you in through its own identity provider, select **Sign in with SSO →**,
enter your email or username and select **Continue**. Steward sends you to your organisation's
sign-in page. If your account doesn't use SSO, you come back to the password card with your name
filled in. Until an organisation has finished setting up SSO, the button is turned off and says
so when you point at it.

## 🔐 Sign in with a passkey

Where your organisation allows it and your browser supports it, **Sign in with a passkey** signs
you in with your device's passkey instead of a password. Your browser shows its own prompt; if
you close it, Steward says **"Passkey sign-in was cancelled."** and you can try again or use your
password.

:::note
Your account comes from your organisation, through single sign-on or an account your
administrator created — there is no self-service "create an account" option on the sign-in
screen. See [Users and roles](/admin-guide/users-and-roles) for how accounts are created.
:::

:::caution
If your organisation has just been installed and no one has signed in yet, you may see a
**"Not set up yet"** message instead of the sign-in fields. That means the first administrator
has not been created. This is expected on a brand-new install and clears once setup is done — see
[First-run setup](/admin-guide/first-run-setup).
:::

## 🔓 Forgot your password

If your organisation signs you in through single sign-on, reset your password with your identity
provider the same way you would for any other application.

If Steward manages your password directly, use **Forgot password?** on the sign-in screen. Enter
your email and select **Send reset code**. Then enter the **verification code** from the email and
a **new password**, and select **Set new password**. Steward always moves on to the code step, so
it never reveals whether an address has an account. Back on the sign-in card, sign in with the new
password. The link appears only where your Steward install can reset passwords.

:::tip
Pick a password you have not used elsewhere, and store it in a password manager if you have one.
Steward never shows your password back to you, so there is no "reveal" to fall back on — a fresh
reset is always the way in.
:::

## ➡️ What comes next

Once you are in, learn what your [home dashboard](/user-guide/your-dashboard) shows you, or jump
straight to [searching for a document](/user-guide/search).
