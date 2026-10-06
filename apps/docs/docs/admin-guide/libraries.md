---
sidebar_position: 4.5
title: Libraries
---

# Libraries

This page covers the three reusable content libraries under `/admin`: **Contact library**,
**References & standards** and **Definitions**. A policy author attaches entries from these
libraries to a policy instead of retyping the same contact, citation or glossary term on every
document — editing a library entry updates every policy that attaches it.

## 📇 Contact library

Open **Contact library** under `/admin` to manage reusable contact blocks (a name, role,
department, email, phone and hours). A block needs a **label** and at least one of **email** or
**phone**.

## 📚 References & standards

**References & standards** holds three kinds of entry:

- **Standard** — a governing standard or clause (e.g. RFC 2119), with an optional clause and link.
- **Text** — free-standing reference text shown inline on the policy.
- **Link** — an external link to a document or resource.

Every entry needs a **label**; which other field is required depends on the chosen kind.

## 📖 Definitions

**Definitions** is the glossary library: a **term** and its **definition**, scoped to one
**category** (the same tree as [Groups](/admin-guide/groups)). Select a category to see or add
its terms — a definition always belongs to exactly one category.

## 🗑️ Archive, restore and delete

Every library entry can be **archived** (hidden from the active library and the author's attach
picker, while still rendering on any policy that already attaches it) and later **restored**. An
entry attached to nothing can also be **deleted** outright; one still attached to a policy must be
archived instead.

## 👤 Who can curate an entry

A site-admin, template-admin or compliance-admin may create and curate any entry in any of the
three libraries. Anyone else may curate only the entries they created themselves — the same rule
the gateway enforces on the underlying mutation.

## ➡️ What comes next

See [Who can do what](/concepts/access-model) for how curation roles are granted, or move on to
[Organisations and single sign-on](/admin-guide/organisations-and-sso).
