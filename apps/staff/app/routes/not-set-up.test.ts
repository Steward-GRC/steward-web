// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// G1 and G2 in the staff app: sign-in sends visitors here until first-run setup is done.
import { type ActionFunction, createStaticHandler, type LoaderFunction } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import * as notSetUp from "./not-set-up";
import * as status from "./resources.status";
import * as signIn from "./sign-in";

const ORIGIN = "https://steward.example";

/** A gateway whose /setup/state answers `setup`, and that knows nobody. */
const stubGateway = (setup: () => Response) =>
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      if (String(input).endsWith("/setup/state")) return setup();
      if (String(init?.body ?? "").includes("globalSettings")) {
        return Response.json({
          data: {
            globalSettings: {
              announcement: { enabled: false, level: "info", message: "" },
              maintenance: { enabled: true, message: "Back soon." },
            },
          },
        });
      }
      return Response.json({ data: { me: null } });
    }),
  );

const handler = () =>
  createStaticHandler([
    {
      children: [
        {
          action: signIn.action as ActionFunction,
          id: "sign-in",
          loader: signIn.loader as LoaderFunction,
          path: "sign-in",
        },
        { id: "not-set-up", loader: notSetUp.loader as LoaderFunction, path: "not-set-up" },
        { id: "status", loader: status.loader as LoaderFunction, path: "resources/status" },
      ],
      id: "root",
      path: "/",
    },
  ]);

const query = (path: string) => handler().query(new Request(`${ORIGIN}${path}`));
const locationOf = async (path: string) => {
  const result = await query(path);
  if (!(result instanceof Response)) throw new Error("expected a redirect");
  return result.headers.get("location");
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("staff before first-run setup", () => {
  it("is a gate outside the app shell", () => {
    expect(notSetUp.handle).toEqual({ gate: true });
  });

  it("sends sign-in to Not set up yet while the root administrator doesn't exist", async () => {
    stubGateway(() => Response.json({ needsSetup: true }));
    expect(await locationOf("/sign-in?next=%2Fpolicies")).toBe("/not-set-up?next=%2Fpolicies");
  });

  it("shows Not set up yet, or Checking while the gateway can't say", async () => {
    stubGateway(() => Response.json({ needsSetup: true }));
    let result = await query("/not-set-up?next=%2Fpolicies");
    if (result instanceof Response) throw new Error("expected the page");
    expect(result.loaderData["not-set-up"]).toEqual({ instance: "needsSetup", next: "/policies" });

    stubGateway(() => Response.json({ error: "maintenance" }, { status: 503 }));
    result = await query("/not-set-up");
    if (result instanceof Response) throw new Error("expected the page");
    expect(result.loaderData["not-set-up"]).toEqual({ instance: "unknown", next: "/" });
  });

  it("goes on to sign-in once setup is done", async () => {
    stubGateway(() => Response.json({ needsSetup: false }));
    expect(await locationOf("/not-set-up?next=%2Fpolicies")).toBe("/sign-in?next=%2Fpolicies");
  });

  it("answers the instance and maintenance state for the gates that check again", async () => {
    stubGateway(() => Response.json({ needsSetup: true }));
    const result = await query("/resources/status");
    if (result instanceof Response) throw new Error("expected data");
    expect(result.loaderData.status).toEqual({ instance: "needsSetup", maintenance: true });
  });
});
