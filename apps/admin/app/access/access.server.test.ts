// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { AckTrigger, RaciGrant, RaciSubjectKind, ReviewCadence } from "@steward-web/api-client";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  loadCategoryAccess,
  removeOwner,
  saveCategoryRules,
  setAckTrigger,
  simulateAccess,
} from "./access.server";

const me = (permissions: string[], roles: string[] = []) => ({
  email: "alice@example.org",
  managedGroupIds: [],
  name: "Alice",
  permissions,
  roles,
  userId: "mock-user-alice",
  username: "alice",
});

const ALICE = me(["group.manage", "user.manage"], ["site-admin"]);
const TEMPLATE_ADMIN = me(["template.manage"], ["template-admin"]);
const READER = me([]);

const category = (id: string, name: string, parentId: null | string, owners: string[] = []) => ({
  ackEveryone: false,
  ackEveryoneSet: false,
  ackTriggers: AckTrigger.OnChange,
  defaultTemplateId: null,
  defaultTemplateNone: false,
  defaultWorkflowId: null,
  exclusionGroupIds: null,
  id,
  idpGroupIds: null,
  name,
  owners,
  parentId,
  reviewCadence: ReviewCadence.None,
  reviewDate: null,
  slug: id,
});

const FINANCE = category("c-finance", "Finance", null, ["mock-user-grace"]);
const EXPENSES = category("c-expenses", "Expenses", "c-finance", ["mock-user-dave"]);

const rule = (
  subjectKind: RaciSubjectKind,
  subjectRef: string,
  read: RaciGrant,
  ack = RaciGrant.Blank,
) => ({
  ack,
  approve: RaciGrant.Blank,
  author: RaciGrant.Blank,
  read,
  subjectKind,
  subjectRef,
});

const OWN = [
  rule(RaciSubjectKind.Group, "Finance team", RaciGrant.Allow, RaciGrant.Allow),
  rule(RaciSubjectKind.User, "mock-user-erin", RaciGrant.Blank),
];
const FROM_FINANCE = [rule(RaciSubjectKind.Everyone, "", RaciGrant.Allow)];

interface Call {
  operation: string;
  variables: Record<string, unknown>;
}

/** A gateway that answers each operation by name and records what it was sent. */
const gateway = (identity: object, answers: Record<string, (variables: never) => unknown>) => {
  const calls: Call[] = [];
  const fetch = vi.fn(async (_url: string, init: RequestInit) => {
    const body = JSON.parse(init.body as string) as {
      query: string;
      variables: Record<string, unknown>;
    };
    const operation = /(?:query|mutation) (\w+)/.exec(body.query)![1]!;
    calls.push({ operation, variables: body.variables });
    if (operation === "Me") return Response.json({ data: { me: identity } });
    const answer = answers[operation];
    if (!answer) throw new Error(`unexpected ${operation}`);
    return Response.json({ data: answer(body.variables as never) });
  });
  vi.stubGlobal("fetch", fetch);
  return calls;
};

const tree = {
  CategoryChildren: ({ parentId }: { parentId: null | string }) => ({
    categoryChildren: parentId === null ? [FINANCE] : parentId === "c-finance" ? [EXPENSES] : [],
  }),
};

const rulesets = {
  CategoryRuleset: ({ categoryId }: { categoryId: string }) => ({
    categoryRuleset: { categoryId, rules: categoryId === "c-expenses" ? OWN : FROM_FINANCE },
  }),
};

const labels = {
  ResolveUserLabels: ({ ids }: { ids: string[] }) => ({
    resolveUserLabels: ids.map((id) => ({
      email: `${id.replace("mock-user-", "")}@example.org`,
      id,
      name: id.replace("mock-user-", "").replace(/^./, (c) => c.toUpperCase()),
    })),
  }),
};

const people = {
  Users: () => ({
    users: {
      nextPageToken: "",
      users: [
        { email: "bob@example.org", name: "Bob", userId: "mock-user-bob" },
        { email: "erin@example.org", name: "Erin", userId: "mock-user-erin" },
      ],
    },
  }),
};

const request = (method = "GET") =>
  new Request("https://admin.steward.example/access/c-expenses", { method });

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("loading a category's access (A5)", () => {
  it("sends someone who can neither manage categories nor templates home", async () => {
    gateway(READER, {});
    const thrown: unknown = await loadCategoryAccess(request(), "c-expenses").catch(
      (error: unknown) => error,
    );
    expect(thrown).toBeInstanceOf(Response);
    expect((thrown as Response).headers.get("location")).toBe("/");
  });

  it("answers null for a category that doesn't exist", async () => {
    gateway(ALICE, { ...tree });
    expect(await loadCategoryAccess(request(), "c-missing")).toBeNull();
  });

  it("gathers the path, the own and inherited rules, the owners and the people", async () => {
    gateway(ALICE, { ...tree, ...rulesets, ...labels, ...people });
    const view = await loadCategoryAccess(request(), "c-expenses");

    expect(view).toMatchObject({
      ackTrigger: AckTrigger.OnChange,
      canEdit: true,
      categoryId: "c-expenses",
      name: "Expenses",
      path: ["Finance", "Expenses"],
      rules: OWN,
    });
    expect(view?.inherited).toEqual([{ from: "Finance", rules: FROM_FINANCE }]);
    expect(view?.owners).toEqual([
      { from: null, id: "mock-user-dave", name: "Dave" },
      { from: "Finance", id: "mock-user-grace", name: "Grace" },
    ]);
    expect(view?.people).toEqual([
      { email: "bob@example.org", id: "mock-user-bob", name: "Bob" },
      { email: "erin@example.org", id: "mock-user-erin", name: "Erin" },
    ]);
    expect(view?.names).toMatchObject({ "mock-user-erin": "Erin" });
  });

  it("gives a template admin the same view, read-only and without the user directory", async () => {
    const calls = gateway(TEMPLATE_ADMIN, { ...tree, ...rulesets, ...labels });
    const view = await loadCategoryAccess(request(), "c-expenses");
    expect(view?.canEdit).toBe(false);
    expect(view?.people).toEqual([]);
    expect(calls.map((call) => call.operation)).not.toContain("Users");
  });
});

describe("saving (A5)", () => {
  it("replaces the category's own rules, in the order given", async () => {
    const calls = gateway(ALICE, {
      SetCategoryRuleset: ({ rules }: { rules: unknown[] }) => ({
        setCategoryRuleset: { categoryId: "c-expenses", rules },
      }),
    });
    const reversed = [OWN[1]!, OWN[0]!];
    const saved = await saveCategoryRules(request("POST"), "c-expenses", JSON.stringify(reversed));
    expect(saved).toEqual(reversed);
    expect(calls.at(-1)?.variables).toEqual({ categoryId: "c-expenses", rules: reversed });
  });

  it("refuses rules that aren't rules", async () => {
    gateway(ALICE, {});
    await expect(
      saveCategoryRules(request("POST"), "c-expenses", '[{"subjectKind":"ROBOT"}]'),
    ).rejects.toThrow();
  });

  it("is refused for a template admin, who only views", async () => {
    gateway(TEMPLATE_ADMIN, {});
    const thrown: unknown = await saveCategoryRules(request("POST"), "c-expenses", "[]").catch(
      (error: unknown) => error,
    );
    expect(thrown).toBeInstanceOf(Response);
  });

  it("saves the acknowledgement trigger without pinning inherited settings", async () => {
    const calls = gateway(ALICE, {
      Category: () => ({ category: EXPENSES }),
      SetCategoryGovernance: () => ({
        setCategoryGovernance: { ...EXPENSES, ackTriggers: AckTrigger.OnPublish },
      }),
    });
    await setAckTrigger(request("POST"), "c-expenses", AckTrigger.OnPublish);
    expect(calls.at(-1)?.variables).toMatchObject({
      ackEveryone: null,
      ackTriggers: AckTrigger.OnPublish,
      id: "c-expenses",
      owners: ["mock-user-dave"],
    });
  });

  it("removes one direct owner", async () => {
    const calls = gateway(ALICE, {
      Category: () => ({ category: EXPENSES }),
      CategoryChildren: ({ parentId }: { parentId: null | string }) => ({
        categoryChildren:
          parentId === null
            ? [{ ...EXPENSES, owners: ["mock-user-dave", "mock-user-bob"], parentId: null }]
            : [],
      }),
      SetCategoryGovernance: () => ({ setCategoryGovernance: EXPENSES }),
    });
    await removeOwner(request("POST"), "c-expenses", "mock-user-bob");
    expect(calls.at(-1)?.variables).toMatchObject({ owners: ["mock-user-dave"] });
  });
});

describe("the simulator (A5)", () => {
  it("runs the unsaved rules for one person", async () => {
    const decision = {
      ack: true,
      ackReason: "rule #1 allow group Finance team",
      approve: false,
      approveReason: "no rule → default deny",
      author: false,
      authorReason: "no rule → default deny",
      read: true,
      readReason: "rule #1 allow group Finance team",
    };
    const calls = gateway(TEMPLATE_ADMIN, {
      SimulateCategory: () => ({ simulateCategory: decision }),
    });
    const result = await simulateAccess(
      request(),
      "c-expenses",
      "mock-user-bob",
      JSON.stringify(OWN),
    );
    expect(result).toEqual(decision);
    expect(calls.at(-1)?.variables).toEqual({
      categoryId: "c-expenses",
      draftRules: OWN,
      userId: "mock-user-bob",
    });
  });

  it("asks for everyone's baseline with an empty person", async () => {
    const calls = gateway(ALICE, { SimulateCategory: () => ({ simulateCategory: {} }) });
    await simulateAccess(request(), "c-expenses", "", null);
    expect(calls.at(-1)?.variables).toEqual({
      categoryId: "c-expenses",
      draftRules: null,
      userId: "",
    });
  });
});
