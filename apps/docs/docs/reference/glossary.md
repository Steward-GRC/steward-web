---
sidebar_position: 2
title: Glossary
---

# Glossary

This page is a short dictionary of the main terms used in this guide, followed by a quick table.

## 📖 Terms

- **Policy** — A written rule that tells people how to do something.
- **Procedure** — A written set of steps for carrying a policy out. Shares the same categories,
  lifecycle and acknowledgement model as a policy.
- **Group (category)** — A topic that holds related policies and procedures together. Groups form
  a tree up to three levels deep, and settings inherit down it. Steward's admin app calls a
  category a group.
- **Template** — A reusable outline of headings and required sections that a new draft can start
  from. A category can be set to freeform instead, so authors write from a blank page.
- **Acknowledgement (ack)** — A user's confirmation that they have read a document. The record
  stands while the user keeps Acknowledge access to that document's category; it is cleared if
  they lose it.
- **Trigger** — When an acknowledgement is required: on publish (once), on change (each new
  version), or none.
- **Owner** — A user who has full access (read, acknowledge, approve, author) in a group and
  everything beneath it. Owners are set on a top-level group and inherit down automatically.
- **Ruleset** — The ordered list of access rules on a category: a subject (everyone, a group, or a
  specific user) and a Read/Acknowledge/Approve/Author setting for each. The first matching rule
  wins per action.
- **Root user** — The first administrator, created at first-run setup, with full access to
  everything. The root account cannot be disabled or deleted.
- **Site-admin** — The one global role in this release. Grants full access to users,
  organisations and the audit log, and the ability to read every document regardless of the
  ruleset.
- **Sensitive document** — A document marked as restricted. Its content can be shown obfuscated to
  people who would not otherwise have read access; reading it in full is a recorded **break
  glass**.
- **Break glass** — A time-boxed reveal of a sensitive document's full content, recorded with a
  reason in the audit log.
- **Organisation** — One email domain connected to one SAML or OIDC identity provider, with its
  own verification, test and just-in-time provisioning settings.
- **Just-in-time (JIT) provisioning** — When on, the first sign-in from a connected domain creates
  that person's account automatically.
- **Workflow and stage** — The ordered path a draft follows before it is published. Each stage
  needs a **quorum** of its approvers — one, a majority, or all of them — before it passes.
- **Compliance case** — A reportable incident worked by a reporting officer, from intake through a
  risk assessment to a recorded outcome. See [Compliance reporting](/user-guide/compliance-reporting).
- **Audit log** — The tamper-evident record of consequential actions. Each entry links to the one
  before it, so a changed or missing entry is detectable; an integrity check verifies the chain.

## 🏷️ Document statuses

| Status | What it means |
| --- | --- |
| Draft | Being written. Not yet submitted. |
| In review | Submitted and moving through the approval workflow. |
| Published | Approved and official. Readers can see it. |
| Rejected | An approver turned the draft down. |
| Withdrawn | A published document was pulled back and is no longer in force. |
| Superseded | A newer version has taken this one's place. |
