---
sidebar_position: 6
title: Audit log
---

# Audit log

This page shows you how to read the audit log and verify that it has not been tampered with.

Every consequential action — a document published, a user's roles changed, an organisation
connected — is written to the **audit log**. Open **Audit log** under `/admin` to see it.

## 🔎 Find an entry

Filter the log by action (for example `policy.published`), the actor who did it, the subject it
acted on (such as a document number), or the group it happened in.

## 🧾 Verify integrity

The log is **tamper-evident**: each entry is linked to the one before it, so a changed or missing
entry is detectable. Select **Verify integrity** to check the chain across the records currently
shown. A passing check means the record has not been altered, which gives you a trustworthy
history for reviews and audits.

:::tip
Run an integrity check before an external audit or review, so you can show the history is intact.
:::

## ➡️ What comes next

That covers the Admin Guide. For quick definitions of the terms used across this guide, see the
[Reference](/reference) section.
