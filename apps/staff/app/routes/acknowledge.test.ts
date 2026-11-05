// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// My work (U1) at the staff home and To acknowledge (U2) at /acknowledge, through React Router's
// own handler.
import { createStaticHandler, type LoaderFunction } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import * as acknowledge from "./acknowledge";
import * as home from "./home";

const ORIGIN = "https://steward.example";

const erin = {
  email: "erin@example.org",
  firstName: "Erin",
  lastName: "Reader",
  managedGroupIds: [],
  name: "Erin Reader",
  permissions: ["policy.read"],
  roles: [],
  scopes: { author: [] },
  userId: "u-erin",
  username: "erin",
};

const answers: Record<string, unknown> = {
  Me: { me: erin },
  MyAckSummary: { myAckSummary: { done: 3, required: 4 } },
  MyObligations: {
    myObligations: [
      {
        number: "POL-FACILITIES-000004",
        policyId: "p-visit",
        policyVersionId: "v-visit",
        title: "Visitor Sign-in Policy",
        version: "1.1.0",
      },
    ],
  },
};

const gateway = () =>
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url: string, init: RequestInit) => {
      const cookie = new Headers(init.headers).get("cookie") ?? "";
      const body = JSON.parse(String(init.body ?? "{}")) as { query?: string };
      const operation = /^(?:query|mutation) (\w+)/m.exec(body.query ?? "")?.[1] ?? "";
      if (!cookie.includes("steward_sid"))
        return Response.json({
          errors: [{ extensions: { code: "UNAUTHENTICATED" }, message: "x" }],
        });
      return Response.json({ data: answers[operation] ?? null });
    }),
  );

const handler = () =>
  createStaticHandler([
    {
      children: [
        { id: "my-work", index: true, loader: home.loader as LoaderFunction },
        { id: "acknowledge", loader: acknowledge.loader as LoaderFunction, path: "acknowledge" },
      ],
      id: "root",
      path: "/",
    },
  ]);

const open = (path: string, signedIn = true) =>
  handler().query(
    new Request(`${ORIGIN}${path}`, signedIn ? { headers: { cookie: "steward_sid=s-1" } } : {}),
  );

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("the staff home and To acknowledge", () => {
  it("send a signed-out visitor to sign in", async () => {
    gateway();
    for (const path of ["/", "/acknowledge"]) {
      const result = await open(path, false);
      expect(result instanceof Response && result.headers.get("location")).toMatch(/^\/sign-in/);
    }
  });

  it("give a reader My work's acknowledgement parts", async () => {
    gateway();
    const result = await open("/");
    if (result instanceof Response) throw new Error("expected the page");
    expect(result.loaderData["my-work"]).toMatchObject({
      ack: { done: 3, required: 4 },
      approvals: null,
      drafts: null,
      email: "erin@example.org",
      library: null,
    });
  });

  it("list what's left to acknowledge at /acknowledge", async () => {
    gateway();
    const result = await open("/acknowledge");
    if (result instanceof Response) throw new Error("expected the page");
    expect(result.loaderData.acknowledge).toEqual({
      obligations: [
        {
          href: "/policies/POL-FACILITIES-000004",
          number: "POL-FACILITIES-000004",
          title: "Visitor Sign-in Policy",
          version: "1.1.0",
        },
      ],
    });
  });
});
