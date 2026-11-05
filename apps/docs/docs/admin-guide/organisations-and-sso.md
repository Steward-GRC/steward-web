---
sidebar_position: 6
title: Organisations and single sign-on
---

# Organisations and single sign-on

This page shows you how to connect an email domain to your identity provider, so people at your
organisation sign in with the account they already use.

Each **organisation** in Steward is one domain connected to one SAML or OIDC identity provider.

## ➕ Add an organisation

Setting up a connection is a four-step page you can leave and come back to: **1 Details**, **2
Domain verification**, **3 IdP test** and **4 Activate**. A passed step turns green, and
**Activate** stays locked until both gates pass.

1. Select **+ New organization**, then enter the organization's name and domain.
2. Pick your identity provider from the catalog (Google Workspace, Microsoft Entra ID, Okta, or a
   generic SAML/OIDC provider). Picking a provider fixes the protocol and shows a setup checklist
   for that provider; the connection fields are the same underneath regardless of which you pick.
3. Follow the checklist in your identity provider's console, then copy its details back into
   Steward's connection fields (entity ID, sign-on URL and signing certificate for SAML; issuer and
   client ID for OIDC), and select **Add organization**.

## ✅ Verify and test

Before a connection is used for real sign-ins:

1. **Domain verification** — copy the DNS TXT record's **Name** and **Value** into your DNS, then
   select **Verify**. Steward also checks every 10 seconds on its own. **Rotate token** issues a new
   value, which also revokes an earlier verification.
2. **IdP test** — **Run IdP test** opens a sign-in attempt against the connection in a popup, so you
   confirm it works before anyone depends on it. The result comes back to the page.
3. **Activate** — once both gates pass, **Activate** turns the connection on.

**Copy remote test link** hands the test to someone at the other organisation instead. Their link
opens a page there that says whose sign-in it tests and starts the test, then shows whether it
passed. That page needs a public test-link lookup in the gateway that isn't there yet
([steward-gateway#54](https://github.com/Steward-GRC/steward-gateway/issues/54)); until it is,
the page says so.

Once active, the page shows a summary card instead, with **Reconfigure connection** (to see the
steps again) and **Disable**. Changing the protocol resets the connection to the start, so it
asks first. **Delete organization** is only offered once the connection is disabled.

## 🔐 The SP certificate

Organizations ends with the one SAML signing certificate Steward presents to every identity
provider: whether it's active, its serial and expiry, **Copy certificate** and **Copy SP
metadata** for your identity provider's console, and **Force rotate**. Any identity provider that
pins the current certificate needs the new metadata after a rotation.

## 🔄 Just-in-time provisioning

Under **Login options**, each organisation has a **Just-in-time provisioning** switch:

- **On** — the first time someone from that domain signs in, Steward creates their account
  automatically.
- **Off** — only an account that already exists can sign in; an unrecognised sign-in from that
  domain is refused.

## ➡️ What comes next

With your organisations connected, see [Completion](/admin-guide/completion) for acknowledgement
coverage, or read the [audit log](/admin-guide/audit-log) to see who did what.
