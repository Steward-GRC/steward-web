// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// Before the root administrator exists nobody can sign in, so admin's sign-in hands the
// visitor to first-run setup while the gateway reports setup is needed.
import { type ActionFunction, createStaticHandler, type LoaderFunction } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import * as signIn from "./sign-in";

const ORIGIN = "https://steward.example";

/** A gateway whose /setup/state answers `state`, and that knows nobody yet. */
const stubGateway = (state: (() => Promise<Response>) | { needsSetup: boolean }) =>
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL) => {
      if (String(input).endsWith("/setup/state")) {
        return typeof state === "function" ? state() : Response.json(state);
      }
      return Response.json({ data: { me: null } });
    }),
  );

// The admin app's basename, as react-router.config.ts sets it.
const handler = () =>
  createStaticHandler(
    [
      {
        children: [
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
    ],
    { basename: "/admin" },
  );

const open = (path: string) => handler().query(new Request(`${ORIGIN}${path}`));

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("admin sign-in while first-run setup is needed", () => {
  it("sends the visitor to /admin/setup", async () => {
    stubGateway({ needsSetup: true });
    const result = await open("/admin/sign-in?next=%2Fadmin%2F");
    expect(result).toBeInstanceOf(Response);
    expect((result as Response).headers.get("location")).toBe("/admin/setup");
  });

  it("shows the sign-in page once setup is done", async () => {
    stubGateway({ needsSetup: false });
    const result = await open("/admin/sign-in");
    if (result instanceof Response) throw new Error("expected the sign-in page");
    expect(result.loaderData["sign-in"]).toMatchObject({ state: { view: "password" } });
  });

  it("shows the sign-in page when the setup state can't be read", async () => {
    stubGateway(() => Promise.reject(new Error("unreachable")));
    const result = await open("/admin/sign-in");
    if (result instanceof Response) throw new Error("expected the sign-in page");
    expect(result.loaderData["sign-in"]).toMatchObject({ state: { view: "password" } });
  });
});
