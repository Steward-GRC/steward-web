---
sidebar_position: 6
title: Organisations and single sign-on
---

# Organisations and single sign-on

This page shows you how to connect an email domain to your identity provider, so people at your
organisation sign in with the account they already use.

Each **organisation** in Steward is one domain connected to one SAML or OIDC identity provider.

## ➕ Add an organisation

1. Select **New organisation** and enter the domain.
2. Pick your identity provider from the catalog (Google Workspace, Microsoft Entra ID, Okta, or a
   generic SAML/OIDC provider). Picking a provider fixes the protocol and shows a setup checklist
   for that provider; the connection fields are the same underneath regardless of which you pick.
3. Follow the checklist in your identity provider's console, then copy its details back into
   Steward's connection fields (entity ID, sign-on URL and signing certificate for SAML; issuer and
   client ID for OIDC).

## ✅ Verify and test

Before a connection is used for real sign-ins:

1. **Verify the domain** — publish the DNS TXT record Steward shows you, then select **Verify
   domain**.
2. **Run an IdP test** — opens a sign-in attempt against the connection in a popup, so you confirm
   it works before anyone depends on it.

An organisation's **Active** status is separate from verification and testing: Steward tracks all
three so you can confirm a connection end-to-end before people use it.

## 🔄 Just-in-time provisioning

Each organisation has a **JIT provisioning** switch:

- **On** — the first time someone from that domain signs in, Steward creates their account
  automatically.
- **Off** — only an account that already exists can sign in; an unrecognised sign-in from that
  domain is refused.

## ➡️ What comes next

With your organisations connected, see [Completion](/admin-guide/completion) for acknowledgement
coverage, or read the [audit log](/admin-guide/audit-log) to see who did what.
