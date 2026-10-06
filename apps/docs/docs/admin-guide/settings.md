---
sidebar_position: 8
title: Settings
---

# Settings

**Settings** under `/admin` holds the cross-app banners and the outbound email configuration.
It needs the site-admin role.

:::note
Whether a module (AI, compliance reporting, ethics reporting) is available at all is decided at
install time, not here. This page has no module on/off switches.
:::

## 📣 Announcement and maintenance

An **announcement** is a short, leveled (info or warning) message shown as a banner across
every app. A **maintenance notice** is a second, separate banner for a planned outage. Both are
off until you turn them on, and both can carry an empty message to simply hide the banner again.

## ✉️ Outbound email

The platform email transport's non-secret configuration (provider, domain, region, from
address) lives here, alongside whether a sending key is currently stored. The key itself is
**write-only**: saving one replaces it, and no query ever reads it back. Leave the key field
blank to keep the stored key unchanged while editing the other fields.
