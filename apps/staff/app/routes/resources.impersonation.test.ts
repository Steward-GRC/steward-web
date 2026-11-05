// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { afterEach, describe, expect, it, vi } from "vitest";

import { action } from "./resources.impersonation";

const me = {
  email: "erin@example.org",
  firstName: "Erin",
  lastName: "Reader",
  managedGroupIds: [],
  name: "Erin Reader",
  permissions: ["policy.read"],
  roles: ["reader"],
  scopes: { author: [] },
  userId: "user-erin",
  username: "erin",
};

afterEach(() => vi.unstubAllGlobals());

describe("stopping an impersonation (H9)", () => {
  it("calls stopImpersonation and goes back to the admin console", async () => {
    const operations: string[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn((_url: string, init: RequestInit) => {
        const body = JSON.parse(init.body as string) as { query: string };
        const operation = /^(?:query|mutation) (\w+)/m.exec(body.query)?.[1] ?? "";
        operations.push(operation);
        if (operation === "Me") return Promise.resolve(Response.json({ data: { me } }));
        if (operation === "StopImpersonation") {
          return Promise.resolve(Response.json({ data: { stopImpersonation: true } }));
        }
        return Promise.resolve(Response.json({ errors: [{ message: operation }] }));
      }),
    );
    const form = new FormData();
    form.set("intent", "stop");
    const response = (await action({
      params: {},
      request: new Request("https://staff.steward.example/resources/impersonation", {
        body: form,
        headers: { cookie: "steward_sid=sid-1" },
        method: "POST",
      }),
    } as never)) as Response;
    expect(operations).toContain("StopImpersonation");
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toMatch(/admin/);
  });
});
