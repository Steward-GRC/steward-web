// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { afterEach, describe, expect, it, vi } from "vitest";

import { action } from "./users.$userId";

const ALICE = {
  email: "alice@example.org",
  managedGroupIds: [],
  name: "Alice",
  permissions: ["user.manage"],
  roles: ["site-admin"],
  userId: "mock-user-alice",
  username: "alice",
};

const ERIN = {
  deletedAt: null,
  email: "erin@example.org",
  enabled: true,
  firstName: "Erin",
  groupIds: [],
  idpGroups: [],
  isRoot: false,
  lastName: "Reader",
  localAccount: true,
  memberships: [],
  mergedIntoUserId: null,
  name: "Erin",
  policyOverrides: [],
  roles: [],
  userId: "mock-user-erin",
  username: "erin",
};

const answers: Record<string, unknown> = {
  Me: { me: ALICE },
  StartImpersonation: {
    startImpersonation: {
      expiresAt: "2026-11-05T10:30:00Z",
      targetName: "Erin",
      targetUserId: "mock-user-erin",
    },
  },
  TransferRoot: { transferRoot: { ...ERIN, isRoot: true } },
  Users: { users: { nextPageToken: "", users: [ERIN] } },
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("acting as a user (D19)", () => {
  it("starts the session and leaves the admin app for staff", async () => {
    vi.stubEnv("STEWARD_STAFF_URL", "/");
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: string, init: RequestInit) => {
        const { query } = JSON.parse(init.body as string) as { query: string };
        const operation = /(?:query|mutation) (\w+)/.exec(query)![1]!;
        return Response.json({ data: answers[operation] });
      }),
    );
    const form = new FormData();
    form.set("intent", "act-as");
    form.set("reason", "Erin can't see Travel.");
    const response = (await action({
      params: { userId: "mock-user-erin" },
      request: new Request("https://steward.example/admin/users/mock-user-erin", {
        body: form,
        method: "POST",
      }),
    } as never)) as Response;
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("https://steward.example/");
    expect(response.headers.get("X-Remix-Reload-Document")).toBe("true");
  });
});

describe("transferring root (D22)", () => {
  it("passes the picked user and the emailed code to transferRoot", async () => {
    const operations: { operation: string; variables: Record<string, unknown> }[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: string, init: RequestInit) => {
        const { query, variables } = JSON.parse(init.body as string) as {
          query: string;
          variables: Record<string, unknown>;
        };
        const operation = /(?:query|mutation) (\w+)/.exec(query)![1]!;
        operations.push({ operation, variables });
        return Response.json({ data: answers[operation] });
      }),
    );
    const form = new FormData();
    form.set("intent", "make-root");
    form.set("otp", "482113");
    await action({
      params: { userId: "mock-user-erin" },
      request: new Request("https://steward.example/admin/users/mock-user-erin", {
        body: form,
        method: "POST",
      }),
    } as never);
    expect(operations.at(-1)).toEqual({
      operation: "TransferRoot",
      variables: { otp: "482113", userId: "mock-user-erin" },
    });
  });
});
