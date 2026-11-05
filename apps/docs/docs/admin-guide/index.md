---
sidebar_position: 1
title: Admin Guide
---

# Admin Guide

This section is for administrators who set up and run Steward.

An administrator manages Steward for everyone else. If that is your job, these pages walk you
through the first setup and the day-to-day work of keeping people and organisations current. You
do this work under the `/admin` part of the site.

## 🗂️ Finding your way around admin

The admin app has a dark header with an orange **Admin** tag, so you always know which app you
are in. **Staff** at the top right takes you back to the staff app.

Down the left is a rail of groups: **Overview**, **Categories**, **Structure**, **Policies**,
**Assurance**, **People** and **System**. **Compliance** joins them when compliance reporting is
turned on. Choose a group and the panel beside it lists its pages:

| Group      | Pages                                                          |
| ---------- | -------------------------------------------------------------- |
| Overview   | Overview                                                       |
| Categories | Directory, Access, and the category tree                       |
| Structure  | Templates, Workflows, Contact library, References, Definitions |
| Policies   | Catalog, Procedures, Magic links                               |
| Assurance  | Completion, Audit log                                          |
| People     | My groups, Users & roles, Organizations                        |
| System     | Settings                                                       |

You only see the pages you can use: a template admin, for example, sees **Access** but not
**Directory**, and a group with nothing for you doesn't appear on the rail at all.

Below 1280 px the panel turns into an overlay: **Pages** at the top of the rail opens it over the
page, and choosing a page or pressing Escape closes it. On a phone the rail goes too, and **Open
menu** in the header lists every group with its pages, with **Staff** and **Docs** at the foot.
Below 1024 px the header's search becomes a search button.

On a phone the lists that are tables on a wider screen (users, organizations, templates, magic
links, completion and its roster, the libraries, the audit log and each platform group's members)
show one card per row instead: the name in bold, the details on one line under it, the status
badges, then the row's actions. A search field above the cards narrows them as you type. The
category access table stays a table, and scrolls sideways inside its own box.

**Skip to main content** is the first thing the Tab key reaches on every page, and after you follow
a link, focus moves to the new page's content.

The **Overview** page counts the policies, those published and those still in progress, the
groups and the templates; select a count to open the list behind it. Beside **Recent activity**,
the **Acknowledgement snapshot** shows how many people have acknowledged the policies that ask
them to, across all of them. The search box in the header (or ⌘K, Ctrl+K on Windows) searches
policies, categories, templates and groups as you type, and starts whatever you may create:
a category, group, template, workflow, organisation or magic link (**Shift+C** opens it on
these).

## 🧭 What you will learn here

- **[First-run setup](/admin-guide/first-run-setup)** — how to create the very first administrator
  on a brand-new install.
- **[Users and roles](/admin-guide/users-and-roles)** — how people get accounts and how to grant
  the site-admin role.
- **[Groups](/admin-guide/groups)** — how to build the category tree and set each category's
  defaults.
- **[Category access](/admin-guide/category-access)** — who can read, acknowledge, approve and
  author in each category, and the simulator that checks it before you save.
- **[Templates](/admin-guide/templates)** — the document skeletons new policies start from,
  changed through a Sections, Review and Publish draft.
- **[Libraries](/admin-guide/libraries)** — the reusable contact blocks, references and
  definitions policy authors attach to a document.
- **[Workflows](/admin-guide/workflows)** — how to build an approval chain and set which
  approvers must sign off.
- **[Organisations and single sign-on](/admin-guide/organisations-and-sso)** — how to connect an
  identity provider and control who is provisioned automatically.
- **[Completion](/admin-guide/completion)** — acknowledgement coverage: who has acknowledged a
  policy, who hasn't, and who is overdue.
- **[Audit log](/admin-guide/audit-log)** — how to read and verify the tamper-evident record of
  administrative actions.
- **[Settings](/admin-guide/settings)** — the cross-app announcement and maintenance banners,
  and the outbound email configuration.

:::note
Some tasks in this section change what other people can see and do. Take your time and check your
work.
:::
