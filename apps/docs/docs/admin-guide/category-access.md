---
sidebar_position: 4.2
title: Category access
---

# Category access

This page shows you how to decide who can read, acknowledge, approve and author in a category,
and how to check the result before you save it.

## 🧭 Opening a category's access

Choose **Categories** on the rail, then **Access** in the panel, and pick a category from the
tree. From a category's details on **Directory**, **Access** opens the same category's rules.
The page shows the category's path above its title, so you can tell which branch you are in.

Group managers edit the rules. Template admins see the same page marked **View only**, with every
control turned off.

## 👑 Owners and the acknowledgement trigger

**Owners** lists the people who own this category, and, with a lock, the owners it inherits from
the categories above it. Owners can read, approve and author everywhere below them, ahead of any
rule. While you edit, the cross beside a direct owner removes them; inherited owners change on
the category they come from.

**Acknowledgement trigger** decides when this category's policies ask to be acknowledged:
**None**, **On publish** (once, the first time a policy is published) or **On change** (again on
every Major version). It saves as soon as you choose.

## 📋 The rule table

Rules run top-down, and for each action the first rule that says something wins. Anything left
blank everywhere is denied.

1. Choose **Edit rules**.
2. Choose **+ Add rule** to add a rule for **Everyone**, a directory **Group** (by its name in your
   identity provider) or one **Person**. It joins the bottom with every action blank.
3. Click a cell, or press Space on it, to cycle it: blank (·), then **✓ Allow**, then **✗ Deny**.
4. Use the up and down arrows to change a rule's place. A moved rule keeps a coloured edge until
   you save. The cross on a rule removes it.
5. Choose **Save rules**, then **✓ Done**.

Rules from the categories above sit at the bottom of the table with a lock and "from" the category
they come from. They apply after this category's own rules; change them on that category.

## 🔍 The simulator

The simulator beside the table answers "what could this person do here?" for the rules as they
stand in the table, before you save. Pick a person, or keep **Everyone (baseline)**, and it shows
**Read / view**, **Must ack**, **Can approve** and **Can author**, each **✓ Yes** or **✗ No** with
the rule, group membership or ownership that decided it. It runs again whenever you change a rule.

## ➡️ What comes next

See [Who can do what](/concepts/access-model) for the access model behind the table, or move on
to [Libraries](/admin-guide/libraries).
