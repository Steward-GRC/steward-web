// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { afterEach, describe, expect, it, vi } from "vitest";

import { action } from "./drafts.import";

type Handler = (variables: Record<string, unknown>) => unknown;

const routeGateway = (handlers: Record<string, Handler>) => {
  const calls: { operation: string; variables: Record<string, unknown> }[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn((_url: string, init: RequestInit) => {
      const body = JSON.parse(init.body as string) as {
        query: string;
        variables: Record<string, unknown>;
      };
      const operation = /^(?:query|mutation) (\w+)/m.exec(body.query)?.[1] ?? "";
      calls.push({ operation, variables: body.variables });
      const handler = handlers[operation];
      if (!handler) return Promise.resolve(Response.json({ errors: [{ message: operation }] }));
      const result = handler(body.variables) as Record<string, unknown>;
      return Promise.resolve(Response.json("errors" in result ? result : { data: result }));
    }),
  );
  return calls;
};

const me = {
  email: "bob@example.org",
  firstName: "Bob",
  lastName: "Author",
  managedGroupIds: [],
  name: "Bob Author",
  permissions: ["policy.read", "policy.author"],
  roles: ["author"],
  scopes: { author: ["People"] },
  userId: "u-1",
  username: "bob",
};

const category = (id: string, name: string) => ({
  ackEveryone: false,
  ackTriggers: "ON_PUBLISH",
  defaultTemplateId: null,
  defaultTemplateNone: false,
  defaultWorkflowId: null,
  exclusionGroupIds: null,
  id,
  idpGroupIds: null,
  name,
  owners: [],
  parentId: null,
  reviewCadence: "NONE",
  reviewDate: null,
  slug: name.toLowerCase(),
});

const created = (title: string) => ({
  ackAudienceOverride: null,
  ackTriggers: null,
  currentDraftVersionId: "v-1",
  currentPublishedVersionId: null,
  currentVersionNo: null,
  currentVersionStatus: "draft",
  documentType: "POLICY",
  homeCategoryId: "c-people",
  id: `p-${title}`,
  number: "PEO-001",
  ownerName: "Bob",
  ownerUserId: "u-1",
  retiredAt: null,
  sensitivity: "STANDARD",
  templateId: null,
  templateNone: true,
  title,
  updatedAt: "2026-11-05T00:00:00Z",
  viewerCan: {
    ack: false,
    approve: false,
    canBreakGlass: false,
    contentObfuscated: false,
    edit: true,
    read: true,
    submit: true,
  },
});

const row = (line: number, title: string, categoryName: string) => ({
  category: categoryName,
  line,
  sensitivity: "",
  subcategory: "",
  template: "",
  title,
  type: "",
});

const runAction = (rows: unknown[]) => {
  const body = new FormData();
  body.set("rowsJson", JSON.stringify(rows));
  return action({
    params: {},
    request: new Request("https://staff.steward.example/drafts/import", { body, method: "POST" }),
  } as never) as Promise<{ data: unknown }>;
};

afterEach(() => vi.unstubAllGlobals());

describe("importing from CSV (U21)", () => {
  it("creates each ready row, checked again against the author's own categories", async () => {
    const calls = routeGateway({
      CategoryTree: () => ({
        categoryTree: [category("c-people", "People"), category("c-fin", "Finance")],
      }),
      CreatePolicy: (variables) => ({ createPolicy: created(String(variables.title)) }),
      Me: () => ({ me }),
      Templates: () => ({ templates: [] }),
    });

    const result = await runAction([
      row(1, "Leave", "People"),
      // Finance exists, but this author can't write there.
      row(2, "Budgets", "Finance"),
      row(3, "Sick days", "People"),
    ]);

    expect(result.data).toEqual({
      ok: true,
      results: [
        { line: 1, number: "PEO-001", ok: true, policyId: "p-Leave" },
        { line: 3, number: "PEO-001", ok: true, policyId: "p-Sick days" },
      ],
    });
    expect(
      calls.filter((call) => call.operation === "CreatePolicy").map((c) => c.variables.title),
    ).toEqual(["Leave", "Sick days"]);
  });

  it("answers a row the gateway refuses as failed and carries on", async () => {
    routeGateway({
      CategoryTree: () => ({ categoryTree: [category("c-people", "People")] }),
      CreatePolicy: (variables) =>
        variables.title === "Leave"
          ? { errors: [{ extensions: { code: "ALREADY_EXISTS" }, message: "exists" }] }
          : { createPolicy: created(String(variables.title)) },
      Me: () => ({ me }),
      Templates: () => ({ templates: [] }),
    });

    const result = await runAction([row(1, "Leave", "People"), row(2, "Sick days", "People")]);

    expect(result.data).toEqual({
      ok: true,
      results: [
        { line: 1, ok: false },
        { line: 2, number: "PEO-001", ok: true, policyId: "p-Sick days" },
      ],
    });
  });
});
