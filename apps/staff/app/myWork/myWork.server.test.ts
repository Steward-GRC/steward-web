// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// What My work (U1, U1r) and To acknowledge (U2) read, against a gateway answering each
// operation by name, the way steward-gateway does.
import { identityFromMe } from "@steward-web/auth";
import { afterEach, describe, expect, it, vi } from "vitest";

import { myWorkData, toAcknowledgeData } from "./myWork.server";

const request = new Request("https://staff.steward.example/", {
  headers: { cookie: "steward_sid=s-1" },
});

const person = (permissions: string[]) =>
  identityFromMe({
    email: "bob@example.org",
    firstName: "Bob",
    id: "u-bob",
    lastName: "Author",
    managedGroupIds: [],
    name: "Bob Author",
    permissions,
    roles: [],
    username: "bob",
  });

const category = (id: string, name: string, parentId: null | string = null) => ({
  ackEveryone: false,
  ackEveryoneSet: false,
  ackTriggers: [],
  defaultTemplateId: null,
  defaultTemplateNone: false,
  defaultWorkflowId: null,
  exclusionGroupIds: [],
  id,
  idpGroupIds: [],
  name,
  owners: [],
  parentId,
  reviewCadence: null,
  reviewDate: null,
  slug: name.toLowerCase(),
});

const policy = (
  id: string,
  number: string,
  title: string,
  status: string,
  homeCategoryId: string,
  extra: Record<string, unknown> = {},
) => ({
  ackAudienceOverride: null,
  ackTriggers: null,
  currentDraftVersionId: status === "PUBLISHED" ? null : `${id}-draft`,
  currentPublishedVersionId: status === "PUBLISHED" ? `${id}-v` : null,
  currentVersionNo: "1.0.0",
  currentVersionStatus: status,
  documentType: "POLICY",
  homeCategoryId,
  id,
  number,
  ownerName: "Bob Author",
  ownerUserId: "u-bob",
  retiredAt: null,
  sensitivity: "STANDARD",
  templateId: null,
  templateNone: false,
  title,
  updatedAt: "2026-10-01T00:00:00Z",
  viewerCan: {
    ack: true,
    approve: false,
    canBreakGlass: false,
    contentObfuscated: false,
    edit: true,
    read: true,
    submit: true,
  },
  ...extra,
});

const answers: Record<string, unknown> = {
  CategoryTree: {
    categoryTree: [category("c-work", "Workplace"), category("c-people", "People")],
  },
  MyAckSummary: { myAckSummary: { done: 4, required: 5 } },
  MyDrafts: {
    myDrafts: [
      policy("p-visit", "POL-FACILITIES-000004", "Visitor Sign-in Policy", "DRAFT", "c-work"),
    ],
  },
  MyObligations: {
    myObligations: [
      {
        number: "POL-EXPENSES-000002",
        policyId: "p-exp",
        policyVersionId: "v-exp",
        title: "Expense Claims Policy",
        version: "2.0.0",
      },
    ],
  },
  PendingTasks: {
    pendingTasks: [
      {
        dueAt: "2026-10-06T00:00:00Z",
        policyTitle: "Lost Device Procedure",
        policyVersionId: "p-lost-draft",
        runId: "r-1",
        stageIndex: 0,
        taskId: "t-1",
      },
    ],
  },
  Policies: {
    policies: [
      policy("p-desk", "POL-FACILITIES-000001", "Desk Booking Policy", "PUBLISHED", "c-work"),
      policy("p-lost", "POL-IT-000003", "Lost Device Procedure", "IN_REVIEW", "c-work", {
        sensitivity: "SENSITIVE",
      }),
      policy("p-leave", "POL-PEOPLE-000001", "Leave Policy", "PUBLISHED", "c-people"),
    ],
  },
};

/** A gateway answering each operation from `answers`, minus any the test says fail. */
const gateway = (failing: string[] = []) => {
  const asked: string[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url: string, init: RequestInit) => {
      const body = JSON.parse(String(init.body)) as { query: string };
      const operation = /^(?:query|mutation) (\w+)/m.exec(body.query)?.[1] ?? "";
      asked.push(operation);
      if (failing.includes(operation) || !(operation in answers))
        return Response.json({ errors: [{ extensions: { code: "INTERNAL" }, message: "no" }] });
      return Response.json({ data: answers[operation] });
    }),
  );
  return asked;
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("myWorkData", () => {
  it("gives an author and approver their lists, the library and their compliance (U1)", async () => {
    gateway();
    const data = await myWorkData(
      request,
      person(["policy.read", "policy.author", "policy.approve"]),
    );
    expect(data.email).toBe("bob@example.org");
    expect(data.drafts).toEqual([
      {
        href: "/drafts/POL-FACILITIES-000004",
        number: "POL-FACILITIES-000004",
        title: "Visitor Sign-in Policy",
        version: "1.0.0",
      },
    ]);
    expect(data.approvals).toEqual([
      {
        dueAt: "2026-10-06T00:00:00Z",
        href: "/approvals/POL-IT-000003",
        number: "POL-IT-000003",
        title: "Lost Device Procedure",
        version: "1.0.0",
      },
    ]);
    expect(data.obligations).toEqual([
      {
        href: "/policies/POL-EXPENSES-000002",
        number: "POL-EXPENSES-000002",
        title: "Expense Claims Policy",
        version: "2.0.0",
      },
    ]);
    expect(data.ack).toEqual({ done: 4, required: 5 });
    expect(data.library).toEqual({
      byCategory: [
        { count: 2, name: "Workplace" },
        { count: 1, name: "People" },
      ],
      drafts: 0,
      inReview: 1,
      policies: 3,
      published: 2,
      sensitive: 1,
    });
  });

  it("asks a reader only for the acknowledgement parts (U1r)", async () => {
    const asked = gateway();
    const data = await myWorkData(request, person(["policy.read"]));
    expect(data.drafts).toBeNull();
    expect(data.approvals).toBeNull();
    expect(data.library).toBeNull();
    expect(data.ack).toEqual({ done: 4, required: 5 });
    expect(asked).not.toContain("MyDrafts");
    expect(asked).not.toContain("PendingTasks");
    expect(asked).not.toContain("Policies");
  });

  it("leaves a part out when its read fails, instead of failing the page", async () => {
    gateway(["MyAckSummary", "MyObligations"]);
    const data = await myWorkData(request, person(["policy.read"]));
    expect(data.ack).toBeNull();
    expect(data.obligations).toBeNull();
  });
});

describe("toAcknowledgeData", () => {
  it("lists what the person still has to acknowledge (U2)", async () => {
    gateway();
    expect(await toAcknowledgeData(request)).toEqual({
      obligations: [
        {
          href: "/policies/POL-EXPENSES-000002",
          number: "POL-EXPENSES-000002",
          title: "Expense Claims Policy",
          version: "2.0.0",
        },
      ],
    });
  });

  it("adds each policy's category from the library, for the page's grouping and filter", async () => {
    const original = answers.Policies;
    answers.Policies = {
      policies: [
        ...(original as { policies: unknown[] }).policies,
        policy("p-exp", "POL-EXPENSES-000002", "Expense Claims Policy", "PUBLISHED", "c-work"),
      ],
    };
    try {
      const asked = gateway();
      const data = await toAcknowledgeData(request);
      expect(asked).toContain("Policies");
      expect(data.obligations?.[0]?.category).toBe("Workplace");
    } finally {
      answers.Policies = original;
    }
  });

  it("still lists what to acknowledge when the library can't be read", async () => {
    gateway(["Policies"]);
    const data = await toAcknowledgeData(request);
    expect(data.obligations).toHaveLength(1);
    expect(data.obligations?.[0]?.category).toBeUndefined();
  });
});
