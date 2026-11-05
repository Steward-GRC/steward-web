---
sidebar_position: 8
title: Settings
---

# Settings

**Settings** under **System** is six cards, each with a status pill that says how it stands
today: the **AI provider token**, **AI features**, **AI retrieval**, **Outbound email**, the
**Global announcement** and the **Maintenance notice**. It needs the site-admin role.

## 🤖 AI

- **AI provider token** shows **Set** or **Not set**. The token is stored securely and can't be
  read back; you can only replace it, or **Clear token**, which asks first because it turns the AI
  integration off for everyone until a new token is set.
- **AI features** turns AI on or off for everyone. Site admins always keep AI available. The card
  names the model in use.
- **AI retrieval** sets how many results AI retrieves per question.

:::note
Whether a module (AI, compliance reporting, ethics reporting) is available at all is decided at
install time, not here. This page has no module on/off switches.
:::

## 📣 Announcement and maintenance

The announcement card shows a live preview of the strip as you type. An **announcement** is a short, leveled (info or warning) message shown as a strip across the
top of every page, in both apps and on sign-in. People can dismiss an info announcement (it stays
hidden for them until the message changes); a warning can't be dismissed. Both are off until you turn them on, and both can carry an empty message to simply
hide the banner again.

**Maintenance** locks Steward down. While it is on, everyone who opens the staff app sees a
calm full-page **"SYSTEM DOWN FOR SCHEDULED MAINTENANCE"** screen with your message (or "The
system is temporarily unavailable for scheduled maintenance." when you leave it empty), and the
page reconnects by itself once maintenance ends. Site admins also get **Go to admin portal →**:
the admin console stays open to them, with the maintenance banner at the top, so they can turn
maintenance off again. Anyone else signed in to the admin console sees the same lockdown
screen.

## ✉️ Outbound email

The card's pill says **On** while email goes through this service, or **SMTP fallback** when it's
off and email goes through the SMTP relay. **Clear key** asks first. The platform email
transport's non-secret configuration (provider, domain, region, from
address) lives here, alongside whether a sending key is currently stored. The key itself is
**write-only**: saving one replaces it, and no query ever reads it back. Leave the key field
blank to keep the stored key unchanged while editing the other fields.
