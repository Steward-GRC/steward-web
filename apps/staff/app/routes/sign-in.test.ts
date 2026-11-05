// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// The round trip from a protected page to sign-in and back, through React Router's own
// handler, so the redirects are the ones a browser would follow.
import { type ActionFunction, createStaticHandler, type LoaderFunction } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import * as policies from "./policies";
import * as signIn from "./sign-in";

const ORIGIN = "https://steward.example";

const signedInMe = {
  email: "bob@example.org",
  firstName: "Bob",
  lastName: "Author",
  managedGroupIds: [],
  name: "Bob Author",
  permissions: [],
  roles: ["reader"],
  userId: "u-bob",
  username: "bob",
};

/** A gateway that signs anyone in and knows the caller only when a session cookie is sent. */
const stubGateway = () =>
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.endsWith("/auth/login")) {
        return Response.json(
          { csrfToken: "csrf" },
          { headers: { "set-cookie": "steward_sid=sid-1; Path=/; HttpOnly" } },
        );
      }
      const cookie = new Headers(init?.headers).get("cookie") ?? "";
      return Response.json({ data: { me: cookie.includes("steward_sid") ? signedInMe : null } });
    }),
  );

const handler = () =>
  createStaticHandler([
    {
      children: [
        { id: "policies", loader: policies.loader as LoaderFunction, path: "policies" },
        {
          action: signIn.action as ActionFunction,
          id: "sign-in",
          loader: signIn.loader as LoaderFunction,
          path: "sign-in",
        },
      ],
      id: "root",
      path: "/",
    },
  ]);

const locationOf = async (request: Request): Promise<null | string> => {
  const result = await handler().query(request);
  if (!(result instanceof Response)) throw new Error("expected a redirect");
  return result.headers.get("location");
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("staff sign-in round trip", () => {
  it("sends a signed-out visitor to sign-in with the page's own path, not its origin", async () => {
    stubGateway();
    expect(await locationOf(new Request(`${ORIGIN}/policies?q=leave`))).toBe(
      "/sign-in?next=%2Fpolicies%3Fq%3Dleave",
    );
  });

  it("lands on the page the visitor came from after the password step", async () => {
    stubGateway();
    const request = new Request(`${ORIGIN}/sign-in?next=%2Fpolicies%3Fq%3Dleave`, {
      body: new URLSearchParams({
        identifier: "bob",
        intent: "login",
        next: "/policies?q=leave",
        password: "any",
      }),
      method: "POST",
    });
    expect(await locationOf(request)).toBe("/policies?q=leave");
  });

  it("sends an already signed-in visitor straight on to that page", async () => {
    stubGateway();
    const request = new Request(`${ORIGIN}/sign-in?next=%2Fpolicies`, {
      headers: { cookie: "steward_sid=sid-1" },
    });
    expect(await locationOf(request)).toBe("/policies");
  });

  it("hands the sign-in form the path inside the app, so it isn't prefixed twice", async () => {
    stubGateway();
    const result = await handler().query(new Request(`${ORIGIN}/sign-in?next=%2Fusers%2Fu-1`));
    if (result instanceof Response) throw new Error("expected the sign-in page");
    expect(result.loaderData["sign-in"]).toMatchObject({ next: "/users/u-1" });
  });

  it("refuses a next that leaves the app", async () => {
    stubGateway();
    const request = new Request(`${ORIGIN}/sign-in?next=%2F%2Felsewhere.example`, {
      headers: { cookie: "steward_sid=sid-1" },
    });
    expect(await locationOf(request)).toBe("/");
  });
});

describe("staff sign-in as a gate", () => {
  it("renders outside the app shell, as the centred gate card", () => {
    expect(signIn.handle).toEqual({ gate: true });
  });

  it("hands the page what the gateway's sign-in offers besides the password", async () => {
    stubGateway();
    const result = await handler().query(new Request(`${ORIGIN}/sign-in`));
    if (result instanceof Response) throw new Error("expected the sign-in page");
    expect(result.loaderData["sign-in"]).toMatchObject({
      capabilities: { passwordReset: true },
      state: { view: "password" },
    });
  });
});
