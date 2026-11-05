// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// The admin reader's governance actions (A11) act on the document the page shows: its ids
// and sensitivity come from the server's own read of it, never from the form.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import * as policy from "./policy";
import * as procedure from "./procedure";

const getPolicyDetail = vi.hoisted(() => vi.fn());

vi.mock("@steward-web/ui/domain/server", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  getPolicyDetail,
}));

const me = {
  email: "alice@example.org",
  firstName: "Alice",
  lastName: "Admin",
  managedGroupIds: [],
  name: "Alice Admin",
  permissions: ["policy.read"],
  roles: ["site-admin"],
  userId: "u-alice",
  username: "alice",
};

const calls: { operation: string; variables: Record<string, unknown> }[] = [];

beforeEach(() => {
  calls.length = 0;
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url: string, init: RequestInit) => {
      const { query, variables } = JSON.parse(init.body as string) as {
        query: string;
        variables: Record<string, unknown>;
      };
      const operation = /^(?:query|mutation) (\w+)/m.exec(query)?.[1] ?? "";
      if (operation === "Me") return Response.json({ data: { me } });
      calls.push({ operation, variables });
      if (operation === "RetirePolicy")
        return Response.json({ data: { retirePolicy: { id: "p-1" } } });
      if (operation === "CreateMagicLink") {
        return Response.json({
          data: { createMagicLink: { expiresAt: "2026-12-05T12:00:00Z", token: "7c1e04b2" } },
        });
      }
      return Response.json({ errors: [{ message: `unexpected ${operation}` }] });
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  getPolicyDetail.mockReset();
});

const post = (
  loader: (arguments_: never) => unknown,
  path: string,
  fields: Record<string, string>,
) => {
  const body = new FormData();
  for (const [key, value] of Object.entries(fields)) body.set(key, value);
  return loader({
    params: { number: "SEC-009" },
    request: new Request(`https://steward.example/admin${path}`, {
      body,
      headers: { cookie: "steward_sid=sid-1" },
      method: "POST",
    }),
  } as never) as Promise<{ data: unknown }>;
};

describe.each([
  ["policy", policy.action, "/policies/SEC-009"],
  ["procedure", procedure.action, "/procedures/SEC-009"],
])("the admin %s reader's governance action", (_name, action, path) => {
  it("retires the document the page shows, ignoring any id in the form", async () => {
    getPolicyDetail.mockResolvedValue({
      currentVersionId: "v-3",
      id: "p-1",
      sensitivity: "STANDARD",
    });
    const answer = await post(action, path, { id: "p-other", intent: "retire" });
    expect(answer.data).toEqual({ intent: "retire", ok: true });
    expect(calls).toEqual([{ operation: "RetirePolicy", variables: { id: "p-1" } }]);
  });

  it("issues a sensitive document's link as sensitive, on the staff app", async () => {
    vi.stubEnv("STEWARD_STAFF_URL", "https://policies.example.org/");
    getPolicyDetail.mockResolvedValue({
      currentVersionId: "v-3",
      id: "p-1",
      sensitivity: "SENSITIVE",
    });
    const answer = await post(action, path, { intent: "createMagicLink", sensitive: "false" });
    expect(answer.data).toMatchObject({ url: "https://policies.example.org/share/7c1e04b2" });
    expect(calls[0]?.variables).toEqual({ policyVersionId: "v-3", sensitive: true });
  });

  it("answers 404 when the document is gone", async () => {
    getPolicyDetail.mockResolvedValue(null);
    await expect(post(action, path, { intent: "retire" })).rejects.toMatchObject({
      init: { status: 404 },
    });
  });
});
