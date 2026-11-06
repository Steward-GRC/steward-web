// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// Category access (A5) on the server: one category's owners, its own rules and the rules its
// ancestors pass down, the people the simulator can try, and the three things the page saves.
// Group managers edit; template admins see the same page read-only, as the gateway allows them
// to read a ruleset and run the simulator but not to change either.
import {
  type AckTrigger,
  type Group,
  type RaciDecision,
  RaciGrant,
  type RaciRule,
  type RaciRuleInput,
  RaciSubjectKind,
} from "@steward-web/api-client";
import { can, type Identity, PERMISSIONS } from "@steward-web/auth";
import { requireIdentityFromRequest, requirePermissionFromRequest } from "@steward-web/auth/server";
import edge from "@steward-web/edge.server";
import { redirect } from "react-router";

import { fetchAllGroups } from "../categories/categories.server";

const cookieOf = (request: Request) => request.headers.get("cookie") ?? undefined;

/** Anyone who may read a ruleset: a group manager, or a template admin who only views. */
const requireAccessViewer = async (request: Request): Promise<Identity> => {
  const identity = await requireIdentityFromRequest(request);
  if (!can(identity, PERMISSIONS.GroupManage) && !can(identity, PERMISSIONS.TemplateManage)) {
    throw redirect("/");
  }
  return identity;
};

const requireAccessEditor = (request: Request) =>
  requirePermissionFromRequest(request, PERMISSIONS.GroupManage, "/");

export interface AccessOwner {
  /** The ancestor the ownership comes from, or null for this category's own owner. */
  from: null | string;
  id: string;
  name: string;
}

export interface AccessPerson {
  email: string;
  id: string;
  name: string;
}

export interface AccessView {
  ackTrigger: AckTrigger;
  /** Group managers edit; a template admin sees the page "View only". */
  canEdit: boolean;
  categoryId: string;
  /** The ancestors' rules, nearest first, each tagged with the ancestor it comes from. */
  inherited: { from: string; rules: readonly RaciRule[] }[];
  name: string;
  /** Display names for the user ids the owners and the rules name. */
  names: Record<string, string>;
  /** Direct owners first, then the inherited ones, nearest ancestor first. */
  owners: AccessOwner[];
  /** Root first: "Finance", "Expenses". */
  path: string[];
  /** The people the simulator and "Add rule" offer; empty for someone without the directory. */
  people: AccessPerson[];
  rules: readonly RaciRule[];
}

/** The category and its ancestors, leaf first, out of the flat directory. */
const chainOf = (categories: readonly Group[], categoryId: string): Group[] => {
  const chain: Group[] = [];
  let at = categories.find((c) => c.id === categoryId);
  while (at && chain.length <= categories.length) {
    chain.push(at);
    const parentId = at.parentId;
    at = parentId ? categories.find((c) => c.id === parentId) : undefined;
  }
  return chain;
};

export const loadCategoryAccess = async (
  request: Request,
  categoryId: string,
): Promise<AccessView | null> => {
  const identity = await requireAccessViewer(request);
  const cookie = cookieOf(request);
  const chain = chainOf(await fetchAllGroups(cookie), categoryId);
  const [category, ...ancestors] = chain;
  if (!category) return null;

  const [rulesets, people] = await Promise.all([
    Promise.all(chain.map((c) => edge.categoryRuleset(c.id, cookie))),
    can(identity, PERMISSIONS.UserManage)
      ? edge.users({}, cookie).then(
          (page) =>
            page.users.map((user) => ({ email: user.email, id: user.userId, name: user.name })),
          // The simulator's people are a courtesy: without them it still shows the baseline.
          (): AccessPerson[] => [],
        )
      : Promise.resolve<AccessPerson[]>([]),
  ]);
  const [own = [], ...passedDown] = rulesets;

  const ownerIds = chain.flatMap((c) => c.owners);
  const ruleUsers = rulesets
    .flat()
    .filter((rule) => rule.subjectKind === RaciSubjectKind.User)
    .map((rule) => rule.subjectRef);
  const labels = await edge
    .resolveUserLabels([...new Set([...ownerIds, ...ruleUsers])], cookie)
    .catch(() => []);
  const names: Record<string, string> = Object.fromEntries([
    ...people.map((person) => [person.id, person.name]),
    ...labels.map((label) => [label.id, label.name]),
  ]);

  return {
    ackTrigger: category.ackTriggers,
    canEdit: can(identity, PERMISSIONS.GroupManage),
    categoryId: category.id,
    inherited: ancestors
      .map((ancestor, index) => ({ from: ancestor.name, rules: passedDown[index] ?? [] }))
      .filter((entry) => entry.rules.length > 0),
    name: category.name,
    names,
    owners: chain.flatMap((c, depth) =>
      c.owners.map((id) => ({ from: depth === 0 ? null : c.name, id, name: names[id] ?? id })),
    ),
    path: chain.map((c) => c.name).toReversed(),
    people,
    rules: own,
  };
};

const GRANTS = new Set<string>(Object.values(RaciGrant));
const KINDS = new Set<string>(Object.values(RaciSubjectKind));

/** The editor's rules as they come back in a form field, checked before they reach the gateway. */
const parseRules = (json: string): RaciRuleInput[] => {
  const value: unknown = JSON.parse(json);
  if (!Array.isArray(value)) throw new TypeError("rules must be a list");
  return value.map((entry: Record<string, unknown>) => {
    const { ack, approve, author, read, subjectKind, subjectRef } = entry;
    if (
      typeof subjectKind !== "string" ||
      !KINDS.has(subjectKind) ||
      typeof subjectRef !== "string" ||
      ![ack, approve, author, read].every((grant) => typeof grant === "string" && GRANTS.has(grant))
    ) {
      throw new TypeError("not a rule");
    }
    return {
      ack: ack as RaciGrant,
      approve: approve as RaciGrant,
      author: author as RaciGrant,
      read: read as RaciGrant,
      subjectKind: subjectKind as RaciSubjectKind,
      subjectRef,
    };
  });
};

/** Replaces the category's own rules, top-down as the table shows them. */
export const saveCategoryRules = async (
  request: Request,
  categoryId: string,
  rulesJson: string,
): Promise<readonly RaciRule[]> => {
  await requireAccessEditor(request);
  return edge.setCategoryRuleset(categoryId, parseRules(rulesJson), cookieOf(request));
};

/** The acknowledgement trigger saves as soon as it changes. */
export const setAckTrigger = async (
  request: Request,
  categoryId: string,
  ackTriggers: AckTrigger,
): Promise<void> => {
  await requireAccessEditor(request);
  await edge.updateGroupSettings({ ackTriggers, id: categoryId }, cookieOf(request));
};

/** Takes one person off the category's own owners; inherited owners can't be removed here. */
export const removeOwner = async (
  request: Request,
  categoryId: string,
  userId: string,
): Promise<void> => {
  await requireAccessEditor(request);
  const cookie = cookieOf(request);
  const categories = await fetchAllGroups(cookie);
  const category = categories.find((c) => c.id === categoryId);
  if (!category) throw new Error("category not found");
  await edge.updateGroupSettings(
    { id: categoryId, owners: category.owners.filter((id) => id !== userId) },
    cookie,
  );
};

/** What one person, or everyone (an empty id), may do with the unsaved rules in place. */
export const simulateAccess = async (
  request: Request,
  categoryId: string,
  userId: string,
  rulesJson: null | string,
): Promise<RaciDecision> => {
  await requireAccessViewer(request);
  return edge.simulateCategory(
    categoryId,
    userId,
    rulesJson === null ? null : parseRules(rulesJson),
    cookieOf(request),
  );
};
