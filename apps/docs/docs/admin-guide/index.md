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

On a narrower screen the panel is hidden; the rail takes you to each group's first page.

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
